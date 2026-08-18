#!/usr/bin/env node
// Measures the contrast of text that sits over IMAGERY — photos, gradients, video, canvas —
// where the backdrop is not a single colour and contrast-check can only warn.
// Rules: references/components.md ("Imagery"). Run alongside contrast-check on any page
// with a hero image, a full-bleed background, or text over a product shot.
//
// Usage (from your project root):
//   node /path/to/scrim-check.mjs <file.html | http(s)://url> [--width=1280] [--scrim=auto] [--json=scrim.json]
//
// Method: screenshot each candidate's box twice — once with the text visible, once with it
// hidden — and diff. The pixels that changed ARE the glyphs, so the backdrop is sampled only
// where letters actually fall, instead of averaging in the empty corners of the box. Then the
// worst pixel decides, because legibility fails wherever the letter is thinnest and the photo
// brightest, not on average.
// Requires playwright in the project: npm i -D playwright && npx playwright install chromium
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const positional = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; })
);
const target = positional[0];
if (!target) { console.error('Usage: node scrim-check.mjs <file.html|url> [--width=1280] [--scrim=auto]'); process.exit(1); }
const url = /^https?:\/\//.test(target) ? target : pathToFileURL(path.resolve(target)).href;

async function importFrom(pkg) {
  const anchors = [path.join(process.cwd(), '__resolve__.mjs'), import.meta.url];
  for (const anchor of anchors) {
    try { const entry = createRequire(anchor).resolve(pkg); return await import(pathToFileURL(entry).href); } catch { /* next */ }
  }
  try { return await import(pkg); } catch { return null; }
}
const pw = await importFrom('playwright');
const chromium = pw?.chromium ?? pw?.default?.chromium;
if (!chromium) {
  console.error('No renderer found. Install from the project root: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}

const lum = (r, g, b) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [hi, lo] = a > b ? [a, b] : [b, a]; return (hi + 0.05) / (lo + 0.05); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(flags.width ?? 1280), height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url, { waitUntil: 'load' }));
await page.evaluate(() => document.fonts?.ready).catch(() => {});
await page.waitForTimeout(400);

// Candidates: text whose backdrop is not a flat fill. Anything with an image-ish ancestor, or
// with an <img>/<video>/<canvas>/<svg> painted underneath it, gets measured for real.
const candidates = await page.evaluate(() => {
  const out = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const text = n.nodeValue.trim();
    if (text.length < 2) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;

    let imagey = false;
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.backgroundImage && s.backgroundImage !== 'none') { imagey = true; break; }
      if (s.backdropFilter && s.backdropFilter !== 'none') { imagey = true; break; }
    }
    if (!imagey) {
      const cx = r.left + r.width / 2, cy = r.top + Math.min(r.height / 2, 20);
      for (const under of document.elementsFromPoint(cx, cy)) {
        if (under === el || el.contains(under)) continue;
        if (['IMG', 'VIDEO', 'CANVAS', 'SVG', 'PICTURE'].includes(under.tagName)) { imagey = true; break; }
        const s = getComputedStyle(under);
        if (s.backgroundImage && s.backgroundImage !== 'none') { imagey = true; break; }
      }
    }
    if (!imagey) continue;

    seen.add(el);
    el.setAttribute('data-scrim-id', String(out.length));
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    out.push({
      id: out.length, text: text.slice(0, 60), color: cs.color,
      size: Math.round(size), weight,
      // WCAG "large text": ≥24px, or ≥18.66px when bold.
      need: size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5,
      box: { x: Math.floor(r.left + window.scrollX), y: Math.floor(r.top + window.scrollY), w: Math.ceil(r.width), h: Math.ceil(r.height) },
    });
  }
  return out;
});

if (!candidates.length) {
  await browser.close();
  console.log('No text found over imagery, gradients, or video — nothing here that contrast-check cannot already measure.');
  process.exit(0);
}

const parseColor = async (css) => page.evaluate((c) => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}, css);

const results = [];
for (const c of candidates) {
  const sel = `[data-scrim-id="${c.id}"]`;
  const clip = { x: c.box.x, y: c.box.y, width: Math.max(1, c.box.w), height: Math.max(1, c.box.h) };
  let shown, hidden;
  try {
    shown = (await page.screenshot({ clip, animations: 'disabled' })).toString('base64');
    await page.evaluate(s => { document.querySelector(s).style.setProperty('visibility', 'hidden', 'important'); }, sel);
    hidden = (await page.screenshot({ clip, animations: 'disabled' })).toString('base64');
    await page.evaluate(s => { document.querySelector(s).style.removeProperty('visibility'); }, sel);
  } catch { continue; }

  // Diff in-page: the changed pixels are the glyphs; sample the backdrop only there.
  const sample = await page.evaluate(async ([a, b]) => {
    const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${src}`; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const cv = document.createElement('canvas'); cv.width = ia.width; cv.height = ia.height;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(ia, 0, 0); const A = ctx.getImageData(0, 0, cv.width, cv.height).data;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(ib, 0, 0); const B = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const px = [];
    for (let i = 0; i < A.length; i += 4) {
      // 60 keeps the antialiased halo out: edge pixels are already a blend of ink and
      // backdrop, so counting them would measure the blend instead of what is behind it.
      const d = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
      if (d > 60) px.push([B[i], B[i + 1], B[i + 2]]);
    }
    return px;
  }, [shown, hidden]);

  if (!sample.length) continue;
  const [tr, tg, tb] = await parseColor(c.color);
  const tl = lum(tr, tg, tb);
  const ratios = sample.map(([r, g, b]) => ratio(tl, lum(r, g, b)));
  const worst = Math.min(...ratios);
  const failing = ratios.filter(r => r < c.need).length;
  results.push({ ...c, rgb: [tr, tg, tb], worst: +worst.toFixed(2), failingPct: +(failing / ratios.length * 100).toFixed(1), sample, tl });
}

// Minimum scrim that would close the gap. Binary search on alpha: for every glyph pixel the
// composite is a·overlay + (1−a)·backdrop, so the worst pixel decides the answer.
const scrimFor = (r) => {
  const overlay = flags.scrim && flags.scrim !== 'auto'
    ? null // caller supplied a colour; resolved below
    : (r.tl > 0.4 ? [0, 0, 0] : [255, 255, 255]);
  const o = overlay ?? [0, 0, 0];
  let lo = 0, hi = 1;
  const worstAt = a => Math.min(...r.sample.map(([R, G, B]) =>
    ratio(r.tl, lum(a * o[0] + (1 - a) * R, a * o[1] + (1 - a) * G, a * o[2] + (1 - a) * B))));
  if (worstAt(1) < r.need) return null;          // even a solid overlay cannot save it
  for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (worstAt(mid) >= r.need) hi = mid; else lo = mid; }
  return { rgb: o, alpha: Math.ceil(hi * 100) / 100 };
};

await browser.close();

const failures = results.filter(r => r.worst < r.need);
console.log(`Measured ${results.length} text node(s) sitting over imagery.\n`);
for (const r of results) {
  const ok = r.worst >= r.need;
  console.log(`${ok ? '✓' : '✗'} "${r.text}"  ${r.size}px${r.weight >= 700 ? ' bold' : ''} — worst ${r.worst}:1 (needs ${r.need}:1)`);
  if (!ok) {
    console.log(`    ${r.failingPct}% of the glyph pixels fall below the minimum`);
    const s = scrimFor(r);
    console.log(s
      ? `    → a scrim of rgba(${s.rgb.join(', ')}, ${s.alpha}) over the image closes it; or move the text to a quiet region`
      : `    → no overlay can fix this at this text colour — change the colour, or stop putting text here`);
  }
}
if (flags.json) { writeFileSync(path.resolve(String(flags.json)), JSON.stringify(results.map(({ sample, ...r }) => r), null, 2)); console.log(`\nwrote ${flags.json}`); }

if (failures.length) {
  console.log(`\n${failures.length} of ${results.length} fail. Contrast rules do not relax because the backdrop is a photograph:`);
  console.log(`either place the text on a genuinely quiet region of the image, or lay a scrim at the opacity that`);
  console.log(`actually achieves the ratio — and measure the result rather than assuming it (components.md, "Imagery").`);
  process.exit(1);
}
console.log('\nOK: every text node over imagery meets its minimum at its worst pixel.');
