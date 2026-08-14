#!/usr/bin/env node
// Color-harmony audit of a RENDERED page: samples real computed colors, clusters
// hue families, classifies pairwise relationships, flags clash pairs and chroma outliers.
// Rules and thresholds: references/color.md, section "Hue Discipline (Harmony)".
// Usage (from your project root): node /path/to/palette-check.mjs <file.html|url> [--width=1280]
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
if (!target) { console.error('Usage: node palette-check.mjs <file.html|url> [--width=1280]'); process.exit(1); }
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
  console.error('No renderer found in this project. Install one from the project root:');
  console.error('  npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: Number(flags.width ?? 1280), height: 900 });
await page.goto(url);
await new Promise(r => setTimeout(r, 1500));
const samples = await page.evaluate(() => {
  const acc = new Map();
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    // background dominates perception; text and borders weigh less per px
    for (const [prop, div] of [['backgroundColor', 1], ['color', 8], ['borderTopColor', 40]]) {
      const v = cs[prop];
      if (!v || v === 'transparent' || v === 'rgba(0, 0, 0, 0)') continue;
      const w = Math.min(r.width * r.height, 400000) / div;
      acc.set(v, (acc.get(v) || 0) + w);
    }
  }
  return [...acc.entries()];
});
await browser.close();

const parse = c => {
  const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  const a = m[4] === undefined ? 1 : Number(m[4]);
  return a < 0.15 ? null : [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
};
const hueOf = ([r, g, b]) => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return 0;
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return h * 60;
};
const circ = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

const chromatic = []; const neutrals = [];
for (const [css, w] of samples) {
  const rgb = parse(css);
  if (!rgb) continue;
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max > 0.985 && min > 0.95) continue;              // whites
  if (max < 0.06) continue;                              // blacks
  const chroma = max - min;
  const item = { css, hue: hueOf(rgb), chroma, max, min, w };
  (chroma < 0.16 ? neutrals : chromatic).push(item);
}

// cluster chromatic hues (single-link, 24° — tint→shade steps of one scale drift up to ~22°)
const clusters = [];
for (const s of chromatic.sort((a, b) => b.w - a.w)) {
  const hit = clusters.find(c => circ(c.hue, s.hue) <= 24);
  if (hit) { hit.w += s.w; hit.members.push(s); hit.hue = hit.members.reduce((t, m) => t + m.hue * m.w, 0) / hit.w; }
  else clusters.push({ hue: s.hue, w: s.w, members: [s] });
}
clusters.sort((a, b) => b.w - a.w);
const totalW = clusters.reduce((t, c) => t + c.w, 0) || 1;
const families = clusters.filter(c => c.w / totalW > 0.02); // ignore trace colors

const rel = d =>
  d <= 15 ? 'monochrome' :
  d <= 60 ? 'analogous' :
  d >= 160 && d <= 200 ? 'complementary' :
  d >= 105 && d <= 135 ? 'triadic' :
  'CLASH-ZONE (60–150°)';

const findings = [];
console.log(`Sampled ${samples.length} distinct colors → ${families.length} hue famil${families.length === 1 ? 'y' : 'ies'} (+${neutrals.length} neutrals)\n`);
families.forEach((c, i) => {
  const share = Math.round((c.w / totalW) * 100);
  // a family's chroma = its fullest expression (max), not its palest tint
  c.repChroma = Math.max(...c.members.map(m => m.chroma));
  console.log(`  F${i + 1}: hue ${Math.round(c.hue)}°  share ${share}%  chroma ${c.repChroma.toFixed(2)}  e.g. ${c.members[0].css}`);
});
if (families.length > 3) findings.push(`${families.length} hue families — maximum is 3; demote extras to illustration or drop them`);
for (let i = 0; i < families.length; i++) {
  for (let j = i + 1; j < families.length; j++) {
    const d = circ(families[i].hue, families[j].hue);
    const r = rel(d);
    console.log(`  F${i + 1}↔F${j + 1}: ${Math.round(d)}° → ${r}`);
    if (r.startsWith('CLASH')) findings.push(`F${i + 1} (${Math.round(families[i].hue)}°) vs F${j + 1} (${Math.round(families[j].hue)}°): ${Math.round(d)}° apart — clash zone; if F${j + 1} is not a semantic status color, move it to an analogous/complementary/triadic position or drop it`);
  }
}
const chromas = families.map(f => f.repChroma);
if (chromas.length > 1 && Math.max(...chromas) - Math.min(...chromas) > 0.35)
  findings.push(`chroma spread ${(Math.max(...chromas) - Math.min(...chromas)).toFixed(2)} > 0.35 — palette mixes vivid and washed-out colors; pull them into one band`);
// tint is imperceptible at lightness extremes — only mid-lightness neutrals can look "dirty"
const tinted = neutrals.filter(n => n.chroma >= 0.09 && n.max > 0.25 && n.min < 0.9 && families[0] && circ(n.hue, families[0].hue) > 60 && n.w / totalW > 0.05);
if (tinted.length) findings.push(`tinted neutral(s) whose hue drifts far from the primary (e.g. ${tinted[0].css}) — hue-match the neutral to the primary or desaturate`);

console.log('');
if (findings.length) {
  console.log('FINDINGS:');
  findings.forEach(f => console.log('  ✗ ' + f));
  console.log('\nNote: status colors doing real status work are legitimate extra families — confirm on the screenshot before "fixing".');
  process.exit(1);
} else {
  console.log('OK: hue discipline holds (families, relationships, chroma band).');
}
