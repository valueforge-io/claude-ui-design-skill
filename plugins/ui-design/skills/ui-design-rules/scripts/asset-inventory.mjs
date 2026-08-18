#!/usr/bin/env node
// Inventories the images a project actually has, and checks them against the slots the arc
// declares. Answers the question "which picture goes where" with a table the user approves
// instead of a decision the agent makes silently at build time.
// Rules: references/kickoff.md (Stage 0) and references/components.md ("Imagery").
//
// Usage (from your project root):
//   node /path/to/asset-inventory.mjs <dir-or-file…> [--arc=arc.json] [--json=assets.json]
//
// The division of labour is deliberate:
//   the script MEASURES  — dimensions, orientation, ratio, transparency, light or dark
//   the model DESCRIBES  — what the picture shows (open it; you can see it)
//   the user APPROVES    — the finished table, next to the mockup, before anything is built
// Requires playwright in the project: npm i -D playwright && npx playwright install chromium
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const positional = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; })
);
if (!positional.length) { console.error('Usage: node asset-inventory.mjs <dir-or-file…> [--arc=arc.json]'); process.exit(1); }

const EXT = /\.(png|jpe?g|webp|avif|gif|svg)$/i;
const SKIP = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.data', 'out']);
const files = [];
const walk = (p) => {
  const st = statSync(p);
  if (st.isFile()) { if (EXT.test(p)) files.push(p); return; }
  for (const e of readdirSync(p)) { if (SKIP.has(e) || e.startsWith('.')) continue; walk(path.join(p, e)); }
};
for (const p of positional) { try { walk(p); } catch { console.error(`Cannot read ${p}`); } }
if (!files.length) { console.log('No images found. If the project has none, every media slot is a placeholder and belongs in the shopping list.'); process.exit(0); }

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
await page.setContent('<canvas id="c"></canvas>');

const assets = [];
for (const f of files) {
  const ext = path.extname(f).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext;
  let uri;
  try { uri = `data:image/${mime};base64,${readFileSync(f).toString('base64')}`; } catch { continue; }
  const bytes = statSync(f).size;
  const m = await page.evaluate(async (src) => {
    const im = await new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
    if (!im || !im.naturalWidth) return null;
    const W = im.naturalWidth, H = im.naturalHeight;
    const c = document.getElementById('c'); c.width = Math.min(W, 300); c.height = Math.round(Math.min(W, 300) * H / W);
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(im, 0, 0, c.width, c.height);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let alpha = false, sum = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 250) alpha = true;
      const f2 = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      sum += 0.2126 * f2(d[i]) + 0.7152 * f2(d[i + 1]) + 0.0722 * f2(d[i + 2]); n++;
    }
    return { W, H, alpha, lum: sum / n };
  }, uri);
  if (!m) { assets.push({ file: f, error: 'nie udało się zdekodować' }); continue; }
  const ratio = m.W / m.H;
  assets.push({
    file: f, w: m.W, h: m.H, ratio: +ratio.toFixed(3), bytes,
    orient: ratio > 1.15 ? 'poziomy' : ratio < 0.87 ? 'pionowy' : 'kwadrat',
    alpha: m.alpha, tone: m.lum > 0.6 ? 'jasny' : m.lum < 0.25 ? 'ciemny' : 'średni',
  });
}
await browser.close();

const kb = b => b > 1024 * 1024 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} kB`;

// ── The table the user approves ─────────────────────────────────────────────
// "co przedstawia" stays in brackets on purpose: the script cannot see the picture,
// and a column filled with a guess is worse than a column visibly waiting to be filled.
console.log(`Assety: ${assets.length}\n`);
console.log('| plik | wymiary | proporcja | orientacja | ton | alfa | waga | co przedstawia | slot |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const a of assets) {
  if (a.error) { console.log(`| ${a.file} | — | — | — | — | — | — | ${a.error} | — |`); continue; }
  console.log(`| ${a.file} | ${a.w}×${a.h} | ${a.ratio} | ${a.orient} | ${a.tone} | ${a.alpha ? 'tak' : 'nie'} | ${kb(a.bytes)} | [opisz po otwarciu] | [numer slotu] |`);
}

// ── Mapping check against the arc ───────────────────────────────────────────
const problems = [];
if (flags.arc) {
  let arc;
  try { arc = JSON.parse(readFileSync(String(flags.arc), 'utf8')); } catch (e) { console.error(`\nCannot read ${flags.arc}: ${e.message}`); process.exit(1); }
  const slots = [];
  (arc.sections ?? []).forEach((s, si) => {
    let n = 0;
    const take = b => { n++; if (b?.type === 'media') slots.push({ addr: `${si + 1}.${n}`, section: s.name, ...b }); };
    (s.blocks ?? []).forEach(take);
    if (s.aside) take(s.aside);
  });
  const parseRatio = r => { const m = String(r ?? '3 / 4').split('/').map(x => parseFloat(x)); return m.length === 2 && m[1] ? m[0] / m[1] : parseFloat(r) || null; };
  const byPath = new Map(assets.map(a => [path.resolve(a.file), a]));
  const used = new Set();

  console.log(`\nSloty na obrazy w ${flags.arc}: ${slots.length}`);
  for (const s of slots) {
    if (!s.file) { problems.push(`slot ${s.addr} (${s.section}) nie ma przypisanego pliku — placeholder, wchodzi na listę zakupów`); continue; }
    const key = path.resolve(s.file);
    const a = byPath.get(key) ?? assets.find(x => path.basename(x.file) === path.basename(s.file));
    if (!a) { problems.push(`slot ${s.addr}: plik ${s.file} nie istnieje`); continue; }
    used.add(a.file);
    const want = parseRatio(s.ratio);
    // 4% tolerance: below that the eye reads it as the same shape; above it, cover-cropping
    // silently eats a side of the picture and nobody notices until the page is built.
    if (want && Math.abs(a.ratio - want) / want > 0.04) {
      problems.push(`slot ${s.addr}: proporcja slotu ${s.ratio} (${want.toFixed(3)}) vs plik ${a.ratio} — obraz zostanie przycięty; wyrównaj slot albo przekadruj plik`);
    }
    const min = Number(s.minWidth ?? 800);
    if (a.w < min) problems.push(`slot ${s.addr}: ${a.file} ma ${a.w} px szerokości, a slot potrzebuje ≥ ${min} — będzie miękki na ekranie 2×`);
  }
  for (const a of assets) if (!used.has(a.file) && !a.error) problems.push(`${a.file} nie jest przypisany do żadnego slotu — użyj go albo usuń z katalogu, żeby nie ciążył`);
}

if (flags.json) { writeFileSync(path.resolve(String(flags.json)), JSON.stringify(assets, null, 2)); console.log(`\nwrote ${flags.json}`); }

if (problems.length) {
  console.log(`\nZnaleziska (${problems.length}):`);
  for (const p of problems) console.log(`  ✗ ${p}`);
}
console.log(`\nOtwórz każdy plik i uzupełnij kolumnę "co przedstawia" — tego skrypt nie zmierzy, a Ty to widzisz.`);
console.log(`Potem pokaż tabelę razem z makietą: przypisanie obraz→slot zatwierdza użytkownik, nie agent.`);
if (problems.length) process.exit(1);
