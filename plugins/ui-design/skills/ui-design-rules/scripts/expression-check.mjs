#!/usr/bin/env node
// Measures what the floor-checks cannot: whether the page spends any energy, or merely
// avoids being wrong. Every other script here detects a way to be broken; a page can pass
// all of them and still be the modal AI page — dark hero, uniform white slabs, one teal
// button, no imagery. This script is the one that says so, with numbers.
// Rules: references/spacing-layout.md ("Rhythm") and references/design-intent.md (sliders).
//
// Usage (from your project root):
//   node /path/to/expression-check.mjs <file.html | http(s)://url>
//        [--expression=quiet|mid|high] [--width=1280] [--json=expression.json]
//
// Without --expression it reports and advises. With it, the brief's slider becomes a
// contract: a "high" page that spends nothing FAILS, the same way a contrast violation
// fails. Quiet pages have no minimums — quiet is a legitimate choice, made on the brief.
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
if (!target) { console.error('Usage: node expression-check.mjs <file.html|url> [--expression=quiet|mid|high]'); process.exit(1); }
const url = /^https?:\/\//.test(target) ? target : pathToFileURL(path.resolve(target)).href;
const level = flags.expression ?? null;
if (level && !['quiet', 'mid', 'high'].includes(level)) { console.error('--expression must be quiet, mid or high'); process.exit(1); }

// Budgets per declared expression. [HEURISTIC] — calibrated on field pages, not scripture:
// ratio      display/body font-size actually rendered (a poster voice vs a memo voice)
// chromaPct  share of rendered pixels carrying visible chroma (OKLCH C > 0.045) — accents
//            confined to buttons land near zero; one tinted band lifts it past 2%
// moments    textured or image-bearing surfaces (photos, illustration, grain, gradients)
const BUDGET = {
  high: { ratio: 3.0, chromaPct: 2.0, moments: 1 },
  mid: { ratio: 2.2, chromaPct: 0.5, moments: 0 },
  quiet: { ratio: 0, chromaPct: 0, moments: 0 },
};

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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(flags.width ?? 1280), height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url, { waitUntil: 'load' }));
await page.evaluate(() => document.fonts?.ready).catch(() => {});
await page.waitForTimeout(300);

const dom = await page.evaluate(() => {
  const toOklchC = (r, g, b) => {
    const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const R = f(r), G = f(g), B = f(b);
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    return Math.hypot(1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
  };
  const lum = (r, g, b) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const parse = css => { const m = css.match(/\d+(\.\d+)?/g); return m ? m.slice(0, 4).map(Number) : [255, 255, 255, 1]; };
  const effBg = el => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if ((c[3] ?? 1) >= 0.9) return c;
    }
    return [255, 255, 255, 1];
  };

  // Top-level sections: <section> not nested in another section; fallback to tall direct
  // children of <main>/<body>. The unit of rhythm is the band the reader scrolls through.
  let secs = [...document.querySelectorAll('section')].filter(s => !s.parentElement?.closest('section'));
  if (secs.length < 2) {
    const root = document.querySelector('main') ?? document.body;
    secs = [...root.children].filter(c => c.getBoundingClientRect().height > 160);
  }
  const sections = secs.map(s => {
    const r = s.getBoundingClientRect();
    const chars = (s.innerText || '').replace(/\s+/g, ' ').trim().length;
    const [br, bg2, bb] = effBg(s);
    const L = lum(br, bg2, bb);
    // querySelectorAll misses the section itself — and grain or a full-bleed photo usually
    // sits on the section, not on a child. Check the host element too.
    const media = s.querySelectorAll('img, video, canvas, picture').length
      + [s, ...s.querySelectorAll('*')].filter(e => { const bi = getComputedStyle(e).backgroundImage; return bi && bi !== 'none' && e.getBoundingClientRect().width * e.getBoundingClientRect().height > 40000; }).length;
    // The loudest text in the band: a section whose type towers is spending its height on
    // the voice — air around a 96px headline is a frame, not an empty slab.
    let maxPx = 0;
    for (const e of [s, ...s.querySelectorAll('h1,h2,h3,p,span,a,div')]) {
      if (!(e.innerText || '').trim()) continue;
      const px = parseFloat(getComputedStyle(e).fontSize);
      if (px > maxPx) maxPx = px;
    }
    return {
      maxPx: Math.round(maxPx),
      label: (s.id || s.querySelector('h1,h2,h3')?.innerText?.slice(0, 24) || s.tagName).replace(/\s+/g, ' '),
      h: Math.round(r.height), chars,
      density: +(chars / Math.max(1, r.width * r.height / 10000)).toFixed(2), // chars per 100×100px cell
      tone: L < 0.22 ? 'dark' : L > 0.55 ? 'light' : 'mid',
      chroma: +toOklchC(br, bg2, bb).toFixed(3),
      media,
    };
  });

  // Type voice: the body size is the length-weighted mode; the display is the largest
  // size carrying real words. Ratio below ~2 is a memo, above ~3 a poster.
  const byPx = new Map();
  let display = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.nodeValue.trim(); if (t.length < 3) continue;
    const el = n.parentElement; if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const px = Math.round(parseFloat(cs.fontSize));
    byPx.set(px, (byPx.get(px) ?? 0) + t.length);
    if (px > display) display = px;
  }
  let body = 16, best = 0;
  for (const [px, len] of byPx) if (px >= 12 && px <= 22 && len > best) { best = len; body = px; }

  const imagery = document.querySelectorAll('img, video, picture, canvas').length;
  return { sections, display, body, imagery };
});

// Chroma area: screenshot the whole page, downscale, count pixels with visible chroma.
// Measured off the rendered composite, so tinted bands, imagery and gradients all count —
// exactly the things an accent-on-buttons-only page does not have.
const shot = (await page.screenshot({ fullPage: true })).toString('base64');
const chromaPct = await page.evaluate(async (b64) => {
  const im = await new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${b64}`; });
  const w = 320, h = Math.round(im.height * w / im.width);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(im, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const toC = (r, g, b) => {
    const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const R = f(r), G = f(g), B = f(b);
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    return Math.hypot(1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
  };
  let chromatic = 0, total = 0;
  for (let i = 0; i < d.length; i += 4) { total++; if (toC(d[i], d[i + 1], d[i + 2]) > 0.045) chromatic++; }
  return +(chromatic / total * 100).toFixed(2);
}, shot);
await browser.close();

// ── Findings ─────────────────────────────────────────────────────────────────
const S = dom.sections;
const findings = [];
const notes = [];

if (S.length >= 4) {
  const hs = S.map(s => s.h);
  const mean = hs.reduce((a, b) => a + b, 0) / hs.length;
  const cv = Math.sqrt(hs.reduce((a, b) => a + (b - mean) ** 2, 0) / hs.length) / mean;
  // CV < 0.22: every band the same height — the scroll has no rhythm, only repetition.
  if (cv < 0.22) findings.push(`uniform slabs: ${S.length} sections within ±${Math.round(cv * 100)}% of the same height — vertical rhythm is repetition, not composition (spacing-layout.md, "Rhythm")`);
}
for (const s of S) {
  // Exempt display moments: when the band's type is ≥2.5× body, the height is the voice.
  if (s.h > 700 && s.chars < 400 && s.media === 0 && s.maxPx < dom.body * 2.5) {
    findings.push(`empty slab: "${s.label}" is ${s.h}px tall carrying ${s.chars} chars, no media, largest type ${s.maxPx}px — whitespace frames something or it is filler`);
  }
}
{
  const seq = S.map(s => s.tone);
  let run = 1, worst = 1, at = 0;
  for (let i = 1; i < seq.length; i++) { run = seq[i] === seq[i - 1] ? run + 1 : 1; if (run > worst) { worst = run; at = i; } }
  notes.push(`tone sequence: ${seq.join(' → ') || '—'}`);
  if (worst >= 3) findings.push(`${worst} consecutive ${seq[at]} sections — the temperature never changes; break the run with a tint, a texture, a compression or an inversion`);
}

const ratio = +(dom.display / Math.max(1, dom.body)).toFixed(2);
notes.push(`type voice: display ${dom.display}px / body ${dom.body}px = ${ratio} · chroma area ${chromaPct}% · image/texture moments ${dom.imagery + S.reduce((t, s) => t + s.media, 0) > 0 ? S.reduce((t, s) => t + s.media, 0) + dom.imagery : 0}`);

const budget = level ? BUDGET[level] : null;
if (budget) {
  if (ratio < budget.ratio) findings.push(`declared expression "${level}" but display/body is ${ratio} (needs ≥${budget.ratio}) — the voice of a memo, not the one the brief asked for`);
  if (chromaPct < budget.chromaPct) findings.push(`declared expression "${level}" but only ${chromaPct}% of rendered pixels carry chroma (needs ≥${budget.chromaPct}%) — the accent exists in the tokens and does nothing on the page; spend it as a surface, a band, a tinted section`);
  const moments = dom.imagery + S.reduce((t, s) => t + s.media, 0);
  if (moments < budget.moments) findings.push(`declared expression "${level}" with zero image or texture moments — flat surfaces everywhere is the cheapest tell of a generated page; even grain at 4% opacity breaks it`);
}

// ── Report ───────────────────────────────────────────────────────────────────
console.log(`Sections (${S.length}):`);
for (const s of S) console.log(`  ${String(s.h).padStart(5)}px  ${s.tone.padEnd(5)} chroma ${String(s.chroma).padEnd(5)} density ${String(s.density).padEnd(6)} media ${s.media}  ${s.label}`);
console.log();
for (const n2 of notes) console.log(`· ${n2}`);
if (flags.json) { writeFileSync(path.resolve(String(flags.json)), JSON.stringify({ sections: S, display: dom.display, body: dom.body, ratio, chromaPct, findings }, null, 2)); console.log(`wrote ${flags.json}`); }

if (findings.length) {
  console.log(`\nFINDINGS (${findings.length}):`);
  for (const f of findings) console.log(`  ✗ ${f}`);
  if (budget) {
    console.log(`\nThe page passes floors and fails the brief: it avoids being wrong without being anything.`);
    console.log(`Fixes are cheap and structural — vary section heights with their job, give the accent one surface,`);
    console.log(`let the display size actually tower, add one textured or image-bearing moment.`);
    process.exit(1);
  }
  console.log(`\nAdvisory (no --expression declared). To make these binding, pass the brief's slider: --expression=high|mid|quiet.`);
  process.exit(0);
}
console.log(`\nOK: rhythm varies, the budget is spent${level ? ` for "${level}"` : ''} — the page does something on purpose.`);
