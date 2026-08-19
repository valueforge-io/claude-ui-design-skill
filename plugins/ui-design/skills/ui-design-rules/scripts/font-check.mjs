#!/usr/bin/env node
// Asserts that the typography a page DECLARES is the typography it actually RENDERS:
//  - every family used by visible text really loaded (width-probe, not document.fonts.check —
//    which answers "can I render this string somehow", i.e. always yes);
//  - the loaded faces carry the language's critical glyphs (a missing latin-ext subset
//    means ą/ę/ł silently fall back to another font);
//  - every weight/style combination in use has a REAL face behind it — a browser given
//    italic with no italic face will slant the upright one (faux italic), and nobody
//    approved that glyph shape (references/typography.md, "Provisioning").
// The probe TESTS ITSELF first, on a family that must not exist: a gate that can only say
// yes has to be proven able to say no before its yes means anything [PRINCIPLE, SKILL.md].
// Usage (from your project root):
//   node /path/to/font-check.mjs <file.html | http(s)://url> [--glyphs=ąćęłńóśźżĄĆĘŁŃÓŚŹŻ] [--width=1280] [--json=fonts.json]
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
if (!target) { console.error('Usage: node font-check.mjs <file.html|url> [--glyphs=…]'); process.exit(1); }
const url = /^https?:\/\//.test(target) ? target : pathToFileURL(path.resolve(target)).href;
const glyphs = String(flags.glyphs ?? 'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ');

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
await page.evaluate(() => document.fonts.ready).catch(() => {});
await page.waitForTimeout(300);

const data = await page.evaluate((glyphString) => {
  const ctx = document.createElement('canvas').getContext('2d');
  const SAMPLE = 'RGhamburgefontsiv Wąż 0123';
  const width = (stack, text, weight = 400, style = 'normal') => {
    ctx.font = `${style} ${weight} 64px ${stack}`;
    return ctx.measureText(text).width;
  };
  // Loaded = the family changes the metrics against BOTH sentinels. One sentinel can
  // collide by coincidence; two do not.
  const loadedProbe = (family, weight = 400) => {
    const q = `"${family.replace(/"/g, '')}"`;
    return Math.abs(width(`${q}, monospace`, SAMPLE, weight) - width('monospace', SAMPLE, weight)) > 0.5
      && Math.abs(width(`${q}, serif`, SAMPLE, weight) - width('serif', SAMPLE, weight)) > 0.5;
  };
  // Per-glyph coverage: a glyph the family lacks falls through to the sentinel, so its
  // width with [family, sentinel] equals its width with [sentinel] — for both sentinels.
  const missingGlyphs = (family) => {
    const q = `"${family.replace(/"/g, '')}"`;
    return [...glyphString].filter(g =>
      Math.abs(width(`${q}, monospace`, g) - width('monospace', g)) < 0.25
      && Math.abs(width(`${q}, serif`, g) - width('serif', g)) < 0.25);
  };

  // ── The probe proves it can say no ──
  const FAKE = 'VF Nonexistent Probe X7Q';
  const selfTest = { fakeReportedLoaded: loadedProbe(FAKE), fontsCheckSaysYes: false };
  try { selfTest.fontsCheckSaysYes = document.fonts.check(`16px "${FAKE}"`); } catch { /* older engines */ }

  // ── Families and weight/style combos actually used by visible text ──
  const GENERIC = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
    'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded', 'math', 'emoji', '-apple-system']);
  const used = new Map(); // family → { combos:Set("700|italic"), sample }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.nodeValue.trim(); if (t.length < 2) continue;
    const el = n.parentElement; if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const fam = (cs.fontFamily.split(',')[0] || '').trim().replace(/^["']|["']$/g, '');
    if (!fam || GENERIC.has(fam.toLowerCase())) continue;
    const weight = parseInt(cs.fontWeight, 10) || (cs.fontWeight === 'bold' ? 700 : 400);
    const style = cs.fontStyle.startsWith('italic') || cs.fontStyle.startsWith('oblique') ? 'italic' : 'normal';
    const rec = used.get(fam) ?? { combos: new Set(), sample: t.slice(0, 30) };
    rec.combos.add(`${weight}|${style}`);
    used.set(fam, rec);
  }

  // ── Declared faces (self-hosted / webfont @font-face) per family ──
  const faces = new Map();
  for (const f of document.fonts) {
    const fam = String(f.family).replace(/^["']|["']$/g, '');
    const list = faces.get(fam) ?? [];
    const w = String(f.weight); const parts = w.split(/\s+/).map(x => x === 'normal' ? 400 : x === 'bold' ? 700 : parseInt(x, 10) || 400);
    list.push({ min: Math.min(...parts), max: Math.max(...parts), style: String(f.style), status: f.status });
    faces.set(fam, list);
  }

  const families = [];
  for (const [fam, rec] of used) {
    const combos = [...rec.combos].map(c => { const [w, s] = c.split('|'); return { weight: +w, style: s }; });
    const loaded = loadedProbe(fam, combos[0]?.weight ?? 400);
    const fs = faces.get(fam) ?? null;
    const synth = [];
    if (fs && fs.length) {
      for (const c of combos) {
        const styleOk = fs.some(f => (c.style === 'italic') === /italic|oblique/i.test(f.style) && c.weight >= f.min - 50 && c.weight <= f.max + 50);
        if (!styleOk) {
          const styleExists = fs.some(f => (c.style === 'italic') === /italic|oblique/i.test(f.style));
          synth.push({ ...c, kind: styleExists ? 'faux weight' : (c.style === 'italic' ? 'faux italic' : 'faux weight') });
        }
      }
    }
    families.push({
      family: fam, sample: rec.sample, combos, loaded,
      missing: loaded ? missingGlyphs(fam) : [],
      declaredFaces: fs ? fs.map(f => `${f.min === f.max ? f.min : `${f.min}–${f.max}`} ${/italic|oblique/i.test(f.style) ? 'italic' : 'normal'}`) : null,
      synth,
    });
  }
  return { selfTest, families };
}, glyphs);
await browser.close();

// ── Verdict ─────────────────────────────────────────────────────────────────
if (data.selfTest.fakeReportedLoaded) {
  console.error('PROBE BROKEN: the width probe reported a deliberately nonexistent family as loaded.');
  console.error('Do not trust any result from this run — fix the probe first. A gate that cannot say no is not a gate.');
  process.exit(3);
}
console.log(`Probe self-test: fake family correctly reported as not loaded${data.selfTest.fontsCheckSaysYes ? ' (document.fonts.check() said yes to it — which is why this script does not use document.fonts.check)' : ''}.\n`);

const findings = [];
for (const f of data.families) {
  const combos = f.combos.map(c => `${c.weight}${c.style === 'italic' ? ' italic' : ''}`).join(', ');
  console.log(`${f.loaded ? '✓' : '✗'} ${f.family} — used at ${combos}${f.declaredFaces ? `; declared faces: ${f.declaredFaces.join(', ')}` : '; no @font-face (system font)'}`);
  if (!f.loaded) findings.push(`"${f.family}" never loaded — text like "${f.sample}" renders in a fallback nobody chose. Check the family name, the file paths, and the @font-face declarations.`);
  if (f.missing.length) findings.push(`"${f.family}" lacks ${f.missing.length} of the language's glyphs (${f.missing.join(' ')}) — they fall back mid-word to another font. Ship the latin-ext subset (typography.md).`);
  for (const s of f.synth) findings.push(`"${f.family}" used at ${s.weight}${s.style === 'italic' ? ' italic' : ''} with no matching face — the browser will synthesize it (${s.kind}). Provision the real face, or stop using the style; set font-synthesis: none so this fails visibly instead of silently (typography.md).`);
}
if (flags.json) { writeFileSync(path.resolve(String(flags.json)), JSON.stringify(data, null, 2)); console.log(`\nwrote ${flags.json}`); }

if (findings.length) {
  console.log(`\nFINDINGS (${findings.length}):`);
  for (const x of findings) console.log(`  ✗ ${x}`);
  process.exit(1);
}
console.log(`\nOK: every family used on the page is really loaded, carries the language's glyphs, and every weight/style in use has a real face.`);
