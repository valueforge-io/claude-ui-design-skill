#!/usr/bin/env node
// Measures a palette OUT of an existing asset (cover art, logo, product shot) instead of
// inventing one: samples the image, clusters colors in OKLCH, separates the neutral ground
// from the chromatic signal, and reports what the asset can and cannot carry.
// Rules: references/color.md ("Palette from an asset"). Part of Kickoff Stage 0/2.
//
// Usage (from your project root):
//   node /path/to/extract-palette.mjs cover.png [--json=palette.json] [--bands=4]
//
// Output: dominant neutral (hue + chroma), the chromatic candidates ranked by presence,
// lightness range, and a verdict on whether the signal hue can carry text or only marks.
// The numbers are inputs to the palette recipe — never final token values (see color.md).
// Requires playwright in the project: npm i -D playwright && npx playwright install chromium
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const positional = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; })
);
const imgPath = positional[0];
if (!imgPath) { console.error('Usage: node extract-palette.mjs <image> [--json=palette.json] [--bands=4]'); process.exit(1); }

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

// Inline the image as a data URI: file:// pages cannot always read local images into a canvas.
const ext = path.extname(imgPath).slice(1).toLowerCase() || 'png';
const mime = ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext;
const dataUri = `data:image/${mime};base64,${readFileSync(imgPath).toString('base64')}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<img id="i" src="${dataUri}">`);
await page.waitForFunction(() => { const i = document.getElementById('i'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 15000 })
  .catch(() => { console.error(`Could not decode ${imgPath} — is it a valid image?`); process.exit(1); });

const bandCount = Math.max(1, Number(flags.bands ?? 4));
const data = await page.evaluate((bandCount) => {
  const im = document.getElementById('i');
  const W = im.naturalWidth, H = im.naturalHeight;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(im, 0, 0);
  const d = ctx.getImageData(0, 0, W, H).data;

  // sRGB → OKLCH. Perceptual space is the point: equal lightness steps look equal,
  // and hue stays stable while lightness moves — which is what a token scale needs.
  const toOklch = (r, g, b) => {
    const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const R = f(r), G = f(g), B = f(b);
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    const C = Math.hypot(A, Bb);
    let Hh = Math.atan2(Bb, A) * 180 / Math.PI; if (Hh < 0) Hh += 360;
    return { L, C, H: Hh };
  };
  const lum = (r, g, b) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };

  const step = Math.max(1, Math.floor(Math.sqrt(W * H) / 700)); // dense: a brand accent may be <0.1% of the image
  const px = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    const i = (y * W + x) * 4;
    if (d[i + 3] < 128) continue; // ignore transparency
    px.push({ r: d[i], g: d[i + 1], b: d[i + 2], y, ...toOklch(d[i], d[i + 1], d[i + 2]) });
  }
  if (!px.length) return { error: 'image is fully transparent' };

  const NEUTRAL_C = 0.045;  // below this the eye reads no hue at all
  const neutrals = px.filter(p => p.C < NEUTRAL_C);
  const chromatic = px.filter(p => p.C >= NEUTRAL_C);

  // Cluster chromatic pixels by hue (24° buckets), weighted by presence AND chroma:
  // a small vivid area matters more to identity than a large washed one.
  const buckets = new Map();
  for (const p of chromatic) {
    const k = Math.floor(p.H / 24);
    const b = buckets.get(k) ?? { n: 0, sumH: 0, sumC: 0, sumL: 0, weight: 0, best: p };
    b.n++; b.sumH += p.H; b.sumC += p.C; b.sumL += p.L; b.weight += p.C;
    if (p.C > b.best.C) b.best = p;
    buckets.set(k, b);
  }
  const families = [...buckets.values()]
    .map(b => ({
      hue: Math.round(b.sumH / b.n), chroma: +(b.sumC / b.n).toFixed(3),
      lightness: +(b.sumL / b.n).toFixed(3),
      share: +(b.n / px.length * 100).toFixed(3),  // 3 places: a 0.05% accent must survive rounding
      peak: { hue: Math.round(b.best.H), chroma: +b.best.C.toFixed(3), lightness: +b.best.L.toFixed(3), rgb: [b.best.r, b.best.g, b.best.b] },
      weight: b.weight,
    }))
    // Judge a family by its PEAK chroma, not its average: a brand accent is identified by
    // its most saturated pixel, and averaging drags it under the threshold. In a near-neutral
    // asset the accent may cover a fraction of a percent and still carry the whole identity —
    // rarity decides whether a hue is a signal or a ground, it is never a reason to discard it.
    .filter(f => f.peak.chroma > 0.08 && f.share > 0.004)
    .sort((a, b) => b.peak.chroma * Math.log1p(b.share * 100) - a.peak.chroma * Math.log1p(a.share * 100));

  const avg = arr => arr.reduce((t, p) => t + p, 0) / (arr.length || 1);
  const groundHue = neutrals.length ? Math.round(avg(neutrals.filter(p => p.C > 0.005).map(p => p.H)) || 0) : null;
  const Ls = px.map(p => p.L).sort((a, b) => a - b);

  return {
    size: { w: W, h: H, sampled: px.length },
    ground: {
      neutralShare: +(neutrals.length / px.length * 100).toFixed(1),
      hue: groundHue,
      chroma: +avg(neutrals.map(p => p.C)).toFixed(4),
      lightness: +avg(neutrals.map(p => p.L)).toFixed(3),
    },
    families: families.slice(0, 4),
    range: { darkest: +Ls[Math.floor(Ls.length * 0.02)].toFixed(3), median: +Ls[Math.floor(Ls.length * 0.5)].toFixed(3), lightest: +Ls[Math.floor(Ls.length * 0.98)].toFixed(3) },
    // relative luminance of the peak of the strongest family — decides text vs marks
    signalLum: families[0] ? lum(families[0].peak.rgb[0], families[0].peak.rgb[1], families[0].peak.rgb[2]) : null,
  };
}, bandCount);
await browser.close();

if (data.error) { console.error(data.error); process.exit(1); }

const ratio = (l1, l2) => { const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); };
const onWhite = data.signalLum === null ? null : ratio(data.signalLum, 1);
const onBlack = data.signalLum === null ? null : ratio(data.signalLum, 0);

console.log(`Asset: ${path.basename(imgPath)} — ${data.size.w}×${data.size.h}, ${data.size.sampled} samples\n`);
console.log(`Ground (neutral, ${data.ground.neutralShare}% of the image)`);
console.log(`  hue ${data.ground.hue ?? '—'}°  chroma ${data.ground.chroma}  lightness ${data.ground.lightness}`);
console.log(`  → the page's neutrals should carry this hue at low chroma, so the asset sits on the page instead of on top of it.\n`);
console.log(`Lightness range: ${data.range.darkest} … ${data.range.median} … ${data.range.lightest}`);
console.log(`  → an asset this ${data.range.median < 0.45 ? 'dark reads best on a dark canvas (a light page would frame it like a stamp)' : data.range.median > 0.7 ? 'light reads best on a light canvas' : 'mid-toned works either way — let the intent decide'}\n`);

if (!data.families.length) {
  console.log('Chromatic families: none — the asset is essentially achromatic.');
  console.log('  → the brand hue is a free choice; pick it from intent and psychology (color.md), then keep it rare so the asset stays the loudest thing on screen.');
} else {
  console.log(`Chromatic families (${data.families.length}), strongest first:`);
  for (const [i, f] of data.families.entries()) {
    console.log(`  ${i + 1}. hue ${f.hue}°  chroma ${f.chroma}  lightness ${f.lightness}  share ${f.share}%`);
    console.log(`     peak: hue ${f.peak.hue}° chroma ${f.peak.chroma} L ${f.peak.lightness}  rgb(${f.peak.rgb.join(', ')})`);
  }
  const top = data.families[0];
  const role = top.share < 3 ? 'signal (rare and vivid — it marks, it does not fill)' : top.share < 15 ? 'accent (present but not dominant)' : 'ground colour (covers the asset — the page should not repeat it at strength)';
  console.log(`\nSignal candidate: hue ${top.peak.hue}° at ${top.share}% of the image → treat as ${role}.`);
  console.log(`  as text on white: ${onWhite.toFixed(2)}:1 · on near-black: ${onBlack.toFixed(2)}:1`);
  const canText = onWhite >= 4.5 || onBlack >= 4.5;
  if (canText) {
    console.log(`  → usable as text on a ${onWhite >= 4.5 ? 'light' : 'dark'} canvas at this lightness; still verify the exact step with contrast-check.`);
  } else {
    console.log(`  → NOT usable as text at this lightness (fails 4.5:1 both ways). Keep the hue, move the lightness: build the token scale in OKLCH from this H, and use the raw value only for marks, rules and fills — never for text (color.md).`);
  }
}
console.log(`\nThese are INPUTS, not tokens. The asset gives you hue and character; the values come from the palette recipe`);
console.log(`in color.md, and every pair still has to pass specimen.mjs before a human sees it.`);

if (flags.json) {
  writeFileSync(path.resolve(String(flags.json)), JSON.stringify(data, null, 2));
  console.log(`\nwrote ${flags.json}`);
}
