#!/usr/bin/env node
// Renders a SPECIMEN page: palette and type-pairing candidates side by side, on the
// project's real content, each with its WCAG contrast computed and badged. The user picks
// from pixels instead of adjectives. Part of Kickoff mode (references/kickoff.md).
//
// Usage (from your project root):
//   node /path/to/specimen.mjs candidates.json [--out=specimen.html] [--width=1280] [--no-webfonts]
//
// candidates.json:
// {
//   "content": { "eyebrow": "...", "headline": "...", "lede": "...", "body": "...",
//                "cta": "Buy the book", "secondary": "Read a sample" },
//   "palettes": [{ "name": "Dossier Noir", "note": "one line: how it reads",
//                  "canvas": "oklch(...)", "surface": "oklch(...)", "textPrimary": "...",
//                  "textSecondary": "...", "signal": "...", "actionBg": "...", "actionFg": "..." }],
//   "typePairs": [{ "name": "Newsroom", "display": "Newsreader", "ui": "Geist",
//                   "note": "one line: character", "displayWeight": 600 }]
// }
// Fonts are loaded from Google Fonts by family name; use --no-webfonts offline (system fallbacks).
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
const specPath = positional[0];
if (!specPath) { console.error('Usage: node specimen.mjs candidates.json [--out=specimen.html] [--width=1280] [--no-webfonts]'); process.exit(1); }

let spec;
try { spec = JSON.parse(readFileSync(specPath, 'utf8')); }
catch (e) { console.error(`Cannot read ${specPath}: ${e.message}`); process.exit(1); }

const c = spec.content ?? {};
const content = {
  eyebrow: c.eyebrow ?? 'SECTION LABEL',
  headline: c.headline ?? 'A headline of realistic length',
  lede: c.lede ?? 'A lede paragraph that runs long enough to show how the type behaves across a couple of lines of real copy.',
  body: c.body ?? 'Body copy at the size it will actually ship. Long enough to judge measure, leading, and how comfortably the eye travels from line to line.',
  cta: c.cta ?? 'Primary action',
  secondary: c.secondary ?? 'Secondary',
};
const palettes = spec.palettes ?? [];
const typePairs = spec.typePairs ?? [];
if (!palettes.length && !typePairs.length) { console.error('candidates.json must contain "palettes" and/or "typePairs".'); process.exit(1); }

const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const useWebfonts = !flags['no-webfonts'];
const families = [...new Set(typePairs.flatMap(t => [t.display, t.ui]).filter(Boolean))];
const fontLink = useWebfonts && families.length
  ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${families.map(f => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700`).join('&')}&display=swap">`
  : '';

const paletteCard = (p, i) => `
<article class="card" data-kind="palette" data-name="${esc(p.name)}" style="--canvas:${p.canvas};--surface:${p.surface ?? p.canvas};--tp:${p.textPrimary};--ts:${p.textSecondary ?? p.textPrimary};--sig:${p.signal ?? p.textPrimary};--abg:${p.actionBg ?? p.signal};--afg:${p.actionFg ?? p.canvas}">
  <header class="cardhead"><span class="idx">${i + 1}</span><h2>${esc(p.name)}</h2>${p.note ? `<p class="note">${esc(p.note)}</p>` : ''}${p.reads ? `<p class="reads">reads as: ${esc(p.reads)}</p>` : ''}</header>
  <div class="preview" style="background:var(--canvas);color:var(--tp)">
    <p class="eyebrow" data-pair="signal-on-canvas" style="color:var(--sig)">${esc(content.eyebrow)}</p>
    <h3 data-pair="title-on-canvas" style="color:var(--tp)">${esc(content.headline)}</h3>
    <p class="lede" data-pair="lede-on-canvas" style="color:var(--ts)">${esc(content.lede)}</p>
    <div class="actions">
      <button data-pair="action-label-on-fill" style="background:var(--abg);color:var(--afg)">${esc(content.cta)}</button>
      <button class="ghost" data-pair="secondary-on-canvas" style="color:var(--tp);border-color:color-mix(in oklab, var(--tp) 35%, transparent)">${esc(content.secondary)}</button>
    </div>
    <div class="surfacebox" style="background:var(--surface)">
      <p data-pair="body-on-surface" style="color:var(--ts)">${esc(content.body)}</p>
    </div>
  </div>
  <ul class="checks"></ul>
</article>`;

const typeCard = (t, i, base) => `
<article class="card" data-kind="type" data-name="${esc(t.name)}" style="--canvas:${base.canvas};--tp:${base.textPrimary};--ts:${base.textSecondary ?? base.textPrimary};--sig:${base.signal ?? base.textPrimary};--abg:${base.actionBg ?? base.signal};--afg:${base.actionFg ?? base.canvas}">
  <header class="cardhead"><span class="idx">${String.fromCharCode(65 + i)}</span><h2>${esc(t.name)}</h2>
    <p class="note">${esc(t.display)} + ${esc(t.ui)}${t.note ? ` — ${esc(t.note)}` : ''}</p>${t.reads ? `<p class="reads">reads as: ${esc(t.reads)}</p>` : ''}</header>
  <div class="preview" style="background:var(--canvas);color:var(--tp);font-family:'${esc(t.ui)}',system-ui,sans-serif">
    <p class="eyebrow" style="color:var(--sig)">${esc(content.eyebrow)}</p>
    <h3 style="font-family:'${esc(t.display)}',Georgia,serif;font-weight:${t.displayWeight ?? 600};color:var(--tp)">${esc(content.headline)}</h3>
    <p class="lede" style="color:var(--ts)">${esc(content.lede)}</p>
    <p class="diacritics" style="color:var(--ts)">Zażółć gęślą jaźń — ĄĆĘŁŃÓŚŹŻ · 0123456789</p>
    <div class="stress" style="font-family:'${esc(t.display)}',Georgia,serif;font-weight:${t.displayWeight ?? 600};color:var(--tp)"
         data-display="${esc(t.display)}" data-weight="${t.displayWeight ?? 600}">ZAŻÓŁĆ GĘŚLĄ<br>JAŹŃ ĘĄŚĆ</div>
    <div class="actions"><button style="background:var(--abg);color:var(--afg)">${esc(content.cta)}</button></div>
  </div>
  <ul class="checks"></ul>
</article>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Specimen</title>${fontLink}
<style>
  :root{--ui:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
  *{box-sizing:border-box} body{margin:0;padding:32px;background:#f6f6f7;color:#18181b;font-family:var(--ui)}
  h1{font-size:22px;margin:0 0 4px} .sub{margin:0 0 28px;color:#52525b;font-size:14px;max-width:70ch}
  h4.sec{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin:32px 0 12px}
  .grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(360px,1fr))}
  .card{background:#fff;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
  .cardhead{padding:14px 16px;border-bottom:1px solid #f1f1f3;display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:baseline}
  .idx{display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center;border-radius:6px;background:#18181b;color:#fff;font-size:12px;font-weight:600}
  .cardhead h2{font-size:15px;margin:0} .note{grid-column:2;margin:2px 0 0;font-size:13px;color:#52525b}
  .reads{grid-column:2;margin:1px 0 0;font-size:12px;font-style:italic;color:#8a6d1a}
  .preview{padding:28px 24px;flex:1}
  .eyebrow{font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 10px}
  .preview h3{font-size:30px;line-height:1.1;margin:0 0 12px;letter-spacing:-.01em}
  .lede{font-size:15px;line-height:1.6;margin:0 0 18px;max-width:46ch}
  .diacritics{font-size:14px;margin:0 0 14px;opacity:.9}
  /* line-height:1 deliberately — this is exactly the setting that clips descending
     diacritics (Ą, Ę) in uppercase. If the two lines touch here, they touch in the build. */
  .stress{font-size:38px;line-height:1;margin:0 0 18px;text-transform:uppercase}
  .actions{display:flex;gap:10px;flex-wrap:wrap}
  .preview button{font:inherit;font-size:14px;font-weight:500;padding:10px 18px;border:0;border-radius:9px;cursor:pointer}
  .preview button.ghost{background:transparent;border:1px solid}
  .surfacebox{margin-top:20px;padding:16px;border-radius:10px} .surfacebox p{margin:0;font-size:14px;line-height:1.6}
  .checks{list-style:none;margin:0;padding:12px 16px;border-top:1px solid #f1f1f3;background:#fafafa;font-size:12px;display:grid;gap:4px}
  .checks li{display:flex;gap:8px;align-items:baseline} .ok{color:#15803d} .bad{color:#b91c1c;font-weight:600}
  .verdict{margin-left:auto;font-weight:600}
</style></head><body>
<h1>Specimen — pick from pixels, not adjectives</h1>
<p class="sub">Every candidate is rendered on the project's real copy. Palette cards carry computed WCAG ratios: a candidate marked FAIL cannot be chosen as-is — its values need a step adjustment first (color.md).</p>
${palettes.length ? `<h4 class="sec">Palettes — ${palettes.length} candidates</h4><div class="grid">${palettes.map(paletteCard).join('')}</div>` : ''}
${typePairs.length ? `<h4 class="sec">Type pairings — ${typePairs.length} candidates${palettes.length ? ` (shown in palette 1: ${esc(palettes[0].name)})` : ''}</h4><div class="grid">${typePairs.map((t, i) => typeCard(t, i, palettes[0] ?? { canvas: '#fff', textPrimary: '#18181b', textSecondary: '#52525b', signal: '#b91c1c', actionBg: '#18181b', actionFg: '#fff' })).join('')}</div>` : ''}
</body></html>`;

const outPath = path.resolve(String(flags.out ?? 'specimen.html'));
writeFileSync(outPath, html, 'utf8');

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
  console.log(`Wrote ${outPath} (no renderer found — open it in a browser to review).`);
  console.log('For badged contrast + screenshot: npm i -D playwright && npx playwright install chromium');
  process.exit(0);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: Number(flags.width ?? 1280), height: 1000 });
await page.goto(pathToFileURL(outPath).href);
await new Promise(r => setTimeout(r, useWebfonts ? 2500 : 1000));

// Compute contrast per palette card in-page (canvas parsing handles oklch/lab/color()).
const audit = await page.evaluate(() => {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const toRGB = css => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data; return { r: d[0], g: d[1], b: d[2] }; };
  const lum = ({ r, g, b }) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
  const out = [];
  for (const card of document.querySelectorAll('.card[data-kind="palette"]')) {
    const cs = getComputedStyle(card);
    const v = n => cs.getPropertyValue(n).trim();
    const canvas = toRGB(v('--canvas')), surface = toRGB(v('--surface'));
    const tp = toRGB(v('--tp')), ts = toRGB(v('--ts')), sig = toRGB(v('--sig')), abg = toRGB(v('--abg'));
    const pairs = [
      // WCAG minimums — legal requirements
      ['title on canvas', tp, canvas, 3, 'wcag'],               // large display text
      ['body on canvas', ts, canvas, 4.5, 'wcag'],
      ['signal on canvas', sig, canvas, 4.5, 'wcag'],
      ['body on surface', ts, surface, 4.5, 'wcag'],
      ['signal on surface', sig, surface, 4.5, 'wcag'],         // eyebrows/rules live on cards too
      ['action label on fill', toRGB(v('--afg')), abg, 4.5, 'wcag'],
      ['action fill on canvas', abg, canvas, 3, 'wcag'],
      // System checks — the skill's own rules; a palette can be WCAG-legal and still broken
      ['surface visible on canvas', surface, canvas, 1.15, 'note'], // advisory: below this, cards need a border/shadow token to read as separate
      ['action fill vs title', abg, tp, 1.2, 'sys'],                 // CTA must not equal the headline value
      ['signal vs body (grayscale)', sig, ts, 1.2, 'sys'],           // accent must not vanish without hue
    ].map(([label, fg, bg, need, kind]) => { const got = Math.round(ratio(fg, bg) * 100) / 100; return { label, got, need, kind, pass: got + 0.005 >= need }; });
    const ul = card.querySelector('.checks');
    const failed = pairs.filter(p => !p.pass && p.kind !== 'note');
    const notes = pairs.filter(p => !p.pass && p.kind === 'note');
    ul.innerHTML = pairs.map(p => `<li class="${p.pass ? 'ok' : 'bad'}"><span>${p.pass ? '✓' : '✗'}</span><span>${p.label}${p.kind === 'sys' ? ' <em style="opacity:.6">(system)</em>' : ''}</span><span class="verdict">${p.got}:1 ${p.pass ? '' : `(needs ${p.need})`}</span></li>`).join('')
      + `<li class="${failed.length ? 'bad' : 'ok'}" style="margin-top:4px"><span>${failed.length ? '✗' : '✓'}</span><span><strong>${failed.length ? `${failed.length} check(s) fail — adjust before choosing` : 'all hard checks pass (WCAG + system)'}</strong></span></li>`
      + (notes.length ? `<li style="color:#a16207"><span>!</span><span>${notes.map(n => n.label).join(', ')} — allowed, but then cards need a border or shadow token</span></li>` : '');
    out.push({ name: card.dataset.name, pairs, failed: failed.length, notes: notes.map(n => `${n.label} ${n.got}:1`) });
  }
  return out;
});

// Type pairings get measured too: a family that silently fell back, and the leading floor that
// uppercase diacritics impose. Both were caught by hand in the field before they were caught here.
const typeAudit = await page.evaluate(() => {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const STRESS = 'ZAŻÓŁĆ GĘŚLĄ JAŹŃ';
  const out = [];
  for (const card of document.querySelectorAll('.card[data-kind="type"]')) {
    const el = card.querySelector('.stress');
    const family = el.dataset.display, weight = el.dataset.weight;
    // Loaded, or silently swapped for a fallback? Same string, same size, family vs bare sentinel:
    // identical advance widths mean the family never arrived and you are judging the fallback.
    ctx.font = `${weight} 64px monospace`;
    const bare = ctx.measureText(STRESS).width;
    ctx.font = `${weight} 64px "${family}", monospace`;
    const withFamily = ctx.measureText(STRESS).width;
    const loaded = Math.abs(bare - withFamily) > 0.5;
    // Ink height of uppercase-with-ogonki at 100px = the multiplier at which consecutive
    // lines just touch. Anything tighter clips; +0.04 is breathing room, not decoration.
    ctx.font = `${weight} 100px "${family}", Georgia, serif`;
    const m = ctx.measureText(STRESS);
    const ink = (m.actualBoundingBoxAscent ?? 70) + (m.actualBoundingBoxDescent ?? 20);
    const floor = Math.ceil((ink / 100 + 0.04) * 100) / 100;
    const checks = [
      { label: `${family} actually loaded`, pass: loaded, verdict: loaded ? 'yes' : 'NO — fallback' },
      { label: 'leading floor, uppercase + ogonki', pass: true, verdict: `≥ ${floor}` },
    ];
    card.querySelector('.checks').innerHTML = checks.map(c =>
      `<li class="${c.pass ? 'ok' : 'bad'}"><span>${c.pass ? '✓' : '✗'}</span><span>${c.label}</span><span class="verdict">${c.verdict}</span></li>`).join('');
    out.push({ name: card.dataset.name, family, loaded, floor });
  }
  return out;
});
const finalHtml = await page.content();
writeFileSync(outPath, finalHtml, 'utf8');
const shot = outPath.replace(/\.html?$/i, '') + '.png';
await page.screenshot({ path: shot, fullPage: true });
await browser.close();

console.log(`Specimen: ${palettes.length} palette(s), ${typePairs.length} type pairing(s)`);
for (const t of typeAudit) {
  if (!t.loaded) console.log(`  ✗ ${t.name}: "${t.family}" never loaded — you would be picking a fallback. Check the family name and its subsets.`);
  else console.log(`  · ${t.name}: display leading floor ${t.floor} (uppercase with ogonki) — set the token to at least this, never leading-none`);
}
console.log(`  page  → ${outPath}`);
console.log(`  image → ${shot}`);

// Open it on the user's screen. A specimen the user never sees is worth nothing:
// they will answer from the option list instead of from the pixels.
if (flags.open !== 'false') {
  const { spawn } = await import('node:child_process');
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  try {
    spawn(opener, [shot], { detached: true, stdio: 'ignore', shell: process.platform === 'win32' }).unref();
    console.log(`  opened in the default viewer — ask for the pick only after this is on screen`);
  } catch {
    console.log(`  could not auto-open — tell the user to open ${shot} themselves, and wait for their reply`);
  }
}
if (audit.length) {
  console.log('\nContrast audit:');
  for (const a of audit) {
    console.log(`  ${a.failed ? '✗' : '✓'} ${a.name}${a.failed ? ` — ${a.failed} failing check(s): ${a.pairs.filter(p => !p.pass && p.kind !== 'note').map(p => `${p.label} ${p.got}:1<${p.need}`).join(', ')}` : ' — all hard checks pass'}`);
    if (a.notes.length) console.log(`      note: ${a.notes.join('; ')} — legal, but cards will need a border/shadow token to separate`);
  }
  if (audit.some(a => a.failed)) {
    console.log('\nA failing candidate is not a choice yet. WCAG failures are legal violations; system failures (elevation, CTA-vs-title, accent-in-grayscale) mean the palette is legal but structurally broken. Adjust and re-run before showing anything.');
    process.exit(1);
  }
}
