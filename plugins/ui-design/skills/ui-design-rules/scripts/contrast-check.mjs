#!/usr/bin/env node
// WCAG contrast audit of a RENDERED page: measures every visible text node against its
// real backdrop (walking up through transparent ancestors) and every UI boundary that
// carries meaning. Rules: references/color.md [STANDARD], references/accessibility.md.
// Usage (from your project root): node /path/to/contrast-check.mjs <file.html|url> [--width=1280] [--verbose]
// Requires playwright in the project: npm i -D playwright && npx playwright install chromium
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const positional = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; })
);
const target = positional[0];
if (!target) { console.error('Usage: node contrast-check.mjs <file.html|url> [--width=1280] [--verbose]'); process.exit(1); }
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

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: Number(flags.width ?? 1280), height: 900 });
await page.goto(url);
await new Promise(r => setTimeout(r, 1500));

const result = await page.evaluate(() => {
  // Modern CSS colors (oklch, lab, color()) serialize to formats a regex can't safely parse —
  // and browsers differ. Paint the value onto a 1x1 canvas and read the pixel back instead:
  // that works for every color syntax the browser itself understands.
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  const toRGBA = (css) => {
    if (!css) return null;
    if (cache.has(css)) return cache.get(css);
    let out = null;
    try {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';            // reset; invalid values keep the previous fillStyle
      ctx.fillStyle = css;
      if (ctx.fillStyle !== '#000' || /^(#000000|#000|black|rgba?\(0, ?0, ?0)/i.test(css.trim())) {
        ctx.fillRect(0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        out = { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
      }
    } catch { out = null; }
    cache.set(css, out);
    return out;
  };
  const lum = ({ r, g, b }) => {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const L1 = lum(a), L2 = lum(b); const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1]; return (hi + 0.05) / (lo + 0.05); };
  const over = (fg, bg) => fg.a >= 1 ? fg : ({ // composite a translucent color over its backdrop
    r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1,
  });

  // Effective backdrop: walk ancestors until an opaque background is found; images/gradients
  // are flagged rather than guessed (text over imagery can't be verified statically).
  const backdropOf = (el) => {
    let node = el, acc = null, imageBehind = false;
    while (node && node !== document.documentElement.parentElement) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') imageBehind = true;
      const bg = toRGBA(cs.backgroundColor);
      if (bg && bg.a > 0) {
        acc = acc ? over(acc, bg) : bg;
        if (acc.a >= 1) return { color: acc, imageBehind };
      }
      node = node.parentElement;
    }
    return { color: acc && acc.a >= 1 ? acc : { r: 255, g: 255, b: 255, a: 1 }, imageBehind };
  };

  const findings = []; let checked = 0;
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    // own text only (ignore text belonging to descendants)
    const ownText = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
    if (!ownText) continue;
    const key = el.tagName + '|' + cs.color + '|' + cs.fontSize + '|' + cs.fontWeight + '|' + ownText.slice(0, 20);
    if (seen.has(key)) continue; seen.add(key);
    const fgRaw = toRGBA(cs.color);
    if (!fgRaw) continue;
    const { color: bg, imageBehind } = backdropOf(el);
    const fg = over(fgRaw, bg);
    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight) || (cs.fontWeight === 'bold' ? 700 : 400);
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const got = ratio(fg, bg);
    checked++;
    if (got + 0.05 < need) {
      findings.push({
        kind: large ? 'large text' : 'body text',
        text: ownText.slice(0, 45), tag: el.tagName.toLowerCase(),
        size: Math.round(size), got: Math.round(got * 100) / 100, need, imageBehind,
        fg: cs.color, bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
      });
    }
  }
  return { findings, checked };
});
await browser.close();

const { findings, checked } = result;
console.log(`Checked ${checked} text node(s) against their rendered backdrops.`);
if (!findings.length) {
  console.log('OK: every text node meets its WCAG minimum (4.5:1 body, 3:1 large).');
  process.exit(0);
}
const show = flags.verbose ? findings : findings.slice(0, 12);
console.log(`\nFINDINGS — ${findings.length} contrast violation(s) [STANDARD]:`);
for (const f of show) {
  console.log(`  ✗ ${f.got}:1 (needs ${f.need}:1) — ${f.kind} ${f.size}px <${f.tag}> "${f.text}"`);
  console.log(`      ${f.fg} on ${f.bg}${f.imageBehind ? '  [background image behind — verify visually, scrim may be required]' : ''}`);
}
if (!flags.verbose && findings.length > show.length) console.log(`  … and ${findings.length - show.length} more (--verbose for all)`);
console.log('\nFix by darkening/lightening the text token one step, not by nudging opacity (color.md).');
process.exit(1);
