#!/usr/bin/env node
// Renders the section arc as a NEUTRAL MOCKUP — what goes where inside each section —
// so structure is agreed on pixels instead of on a markdown table nobody reads.
// Two viewports: web and mobile. Rules: references/kickoff.md (Stage 2 — Arc).
//
// Usage (from your project root):
//   node /path/to/wireframe.mjs arc.json [--out=wireframe] [--content=content/site.ts]
//                               [--web=1280] [--mobile=390] [--open=false]
//
// This is a MOCKUP, not a preview: greyscale, one system typeface, every slot dashed.
// The bracket rule is enforced, not encouraged — any user-visible string outside
// [square brackets] fails validation and nothing renders. A mockup that looks finished
// gets approved as a design, and then the user has agreed to a look they never chose.
// Requires playwright only for the screenshots: npm i -D playwright && npx playwright install chromium
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

const positional = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; })
);
const arcPath = positional[0];
if (!arcPath) {
  console.error('Usage: node wireframe.mjs arc.json [--out=wireframe] [--content=content/site.ts] [--web=1280] [--mobile=390]');
  process.exit(1);
}
const arc = JSON.parse(readFileSync(arcPath, 'utf8'));
const sections = arc.sections ?? [];
if (!sections.length) { console.error('arc.json has no sections'); process.exit(1); }

// ─── The bracket rule ───────────────────────────────────────────────────────────
// Strip everything inside brackets; whatever remains must carry no letters or digits.
// Separators, glyphs and punctuation are free — "[papier · e-book] · [wysyłka 24 h]" passes,
// "Kup teraz" does not. Section names and goals are exempt: they are labels on the mockup,
// not copy on the page.
const bare = s => String(s).replace(/\[[^\]]*\]/g, '');
const unbracketed = s => /[\p{L}\p{N}]/u.test(bare(s));

const problems = [];
const walk = (blocks, where) => {
  for (const [i, b] of (blocks ?? []).entries()) {
    const at = `${where} block ${i + 1} (${b.type})`;
    for (const key of ['text', 'source', 'name', 'label']) {
      if (b[key] && unbracketed(b[key])) problems.push(`${at}: ${key} — ${JSON.stringify(b[key])}`);
    }
    for (const [j, item] of (b.items ?? []).entries()) {
      if (typeof item === 'string') { if (unbracketed(item)) problems.push(`${at} item ${j + 1}: ${JSON.stringify(item)}`); }
      else { if (item.title && unbracketed(item.title)) problems.push(`${at} item ${j + 1}: title — ${JSON.stringify(item.title)}`); walk(item.blocks, `${at} item ${j + 1}`); }
    }
  }
};
sections.forEach((s, i) => { walk(s.blocks, `section ${i + 1} "${s.name ?? ''}"`); if (s.aside) walk([s.aside], `section ${i + 1} aside`); });

if (problems.length) {
  console.error(`Unbracketed copy in ${problems.length} slot(s) — a mockup must not contain finished words:\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error(`\nEvery user-visible string belongs in [brackets] describing what goes there and how long it is:`);
  console.error(`  "Kup teraz — 49 zł"  →  "[Kup teraz — 00,00 zł]"`);
  console.error(`Brackets are the shopping list: whatever is still bracketed after the build is still owed.`);
  process.exit(1);
}

// ─── Render ─────────────────────────────────────────────────────────────────────
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const num = n => String(n).padStart(2, '0');

// Every slot carries its address (3.2 = section 3, slot 2) so edits are unambiguous:
// "3.2 wytnij" beats "ten drugi tekst w premisie". Cards are ONE slot — the row is a
// pattern, and you edit the pattern, not its third repetition.
const slot = (addr, cls, inner) => `<div class="slot ${cls}"><span class="addr">${addr}</span>${inner}</div>`;

function block(b, addr) {
  const t = esc(b.text);
  switch (b.type) {
    case 'eyebrow': return slot(addr, 'eyebrow', t);
    case 'heading': return slot(addr, `h${b.level === 1 ? '1' : '2'}`, t);
    case 'text': return slot(addr, 'text', t);
    case 'meta': return slot(addr, 'meta', t);
    case 'price': return slot(addr, 'price', t);
    case 'list': return slot(addr, 'list', (b.items ?? []).map(i => `<div class="li">${esc(i)}</div>`).join(''));
    case 'action': return slot(addr, 'act', `<span class="btn ${b.variant === 'secondary' ? 'ghost' : 'solid'}">${t}</span>`);
    case 'actions': return slot(addr, 'act', (b.items ?? []).map((i, k) =>
      `<span class="btn ${k === 0 ? 'solid' : 'ghost'}">${esc(typeof i === 'string' ? i : i.text)}</span>`).join(''));
    case 'field': return slot(addr, 'act', `<span class="input">${t}</span>${b.action ? `<span class="btn solid">${esc(b.action)}</span>` : ''}`);
    case 'quote': return slot(addr, 'quote', `<div class="q">${t}</div>${b.source ? `<div class="src">${esc(b.source)}</div>` : ''}`);
    case 'rating': return slot(addr, 'rating', `<span class="stars">★★★★★</span>${t}`);
    case 'person': return slot(addr, 'person', `<span class="avatar">${esc(b.label ?? '[foto]')}</span><span class="pbody"><b>${esc(b.name ?? '[Imię i nazwisko]')}</b>${t}</span>`);
    // The assigned file is printed in the slot, so "which picture goes where" is approved
    // with the structure instead of being decided quietly at build time.
    case 'media': return slot(addr, 'media', `<span class="frame" style="aspect-ratio:${b.ratio ?? '3 / 4'}">${t}${b.file ? `<em class="fileref">${esc(b.file)}</em>` : '<em class="fileref none">brak pliku — do dostarczenia</em>'}</span>`);
    case 'logos': return slot(addr, 'logos', Array.from({ length: b.count ?? 3 }, () => `<span class="logo">${t || '[logo]'}</span>`).join(''));
    case 'disclosure': return slot(addr, 'disc', (b.items ?? []).map(i => `<div class="drow">${esc(i)}<span>⌄</span></div>`).join(''));
    case 'cards': return slot(addr, 'cards', `<div class="cardrow">${(b.items ?? []).map((c, k) =>
      `<div class="card${b.highlight === k + 1 ? ' hi' : ''}">${b.highlight === k + 1 && b.highlightLabel ? `<span class="tag">${esc(b.highlightLabel)}</span>` : ''}${c.title ? `<div class="ctitle">${esc(c.title)}</div>` : ''}${(c.blocks ?? []).map(x => block(x, '')).join('')}</div>`).join('')}</div>`);
    default: return slot(addr, 'text', t || `[nieznany blok: ${esc(b.type)}]`);
  }
}

function section(s, i) {
  let n = 0;
  const body = (s.blocks ?? []).map(b => block(b, `${i + 1}.${++n}`)).join('');
  const aside = s.aside ? `<div class="aside">${block(s.aside, `${i + 1}.${++n}`)}</div>` : '';
  return `<section class="sec">
  <header><span class="secno">${num(i + 1)} · ${esc(s.name ?? '')}</span>${s.goal ? `<span class="goal">Cel: ${esc(s.goal)}</span>` : ''}</header>
  <div class="body${aside ? ' split' : ''}${s.asideMobile === 'last' ? ' aside-last' : ''}"><div class="main">${body}</div>${aside}</div>
</section>`;
}

const CSS = `
*{box-sizing:border-box;margin:0}
body{background:#101010;color:#e8e8e8;font:15px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:24px}
.doc{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.lead{color:#8a8a8a;font-size:13px;line-height:1.6;border-left:2px solid #333;padding-left:12px}
.lead b{color:#c9c9c9;font-weight:600}
.sec{border:1px solid #2a2a2a;border-radius:12px;padding:20px 22px;background:#161616}
.sec>header{display:flex;justify-content:space-between;gap:16px;align-items:baseline;margin-bottom:16px;flex-wrap:wrap}
.secno{font-weight:600;font-size:15px;letter-spacing:.01em}
.goal{color:#7e7e7e;font-size:13px;text-align:right}
/* align-items:flex-start keeps the aside from stretching to the section's height —
   a media slot that fills the column would imply a proportion this mockup does not claim. */
.body{display:flex;gap:28px;align-items:flex-start}
.body.split .main{flex:1 1 62%}
.aside{flex:0 0 30%}
.main{flex:1 1 auto;display:flex;flex-direction:column;gap:10px;min-width:0}
.slot{position:relative;padding:6px 8px 6px 40px;border:1px dashed #333;border-radius:6px;color:#b4b4b4;min-height:34px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.addr{position:absolute;left:6px;top:6px;font-size:10px;color:#5c5c5c;font-variant-numeric:tabular-nums;letter-spacing:.02em}
.slot.eyebrow{color:#8a8a8a;font-size:12px;text-transform:none;letter-spacing:.04em}
.slot.h1{font-size:26px;font-weight:700;color:#f2f2f2;line-height:1.2}
.slot.h2{font-size:19px;font-weight:600;color:#ececec}
.slot.meta,.slot.price{color:#818181;font-size:12.5px}
.slot.list{display:block;padding-top:8px}
.li{color:#a8a8a8;font-size:13.5px;padding:2px 0}
.btn{display:inline-block;border:1px dashed #4a4a4a;border-radius:7px;padding:7px 14px;font-size:13px;color:#d8d8d8}
.btn.solid{border-style:solid;border-color:#6a6a6a;background:#242424}
.input{flex:1 1 200px;min-width:140px;border:1px dashed #3a3a3a;border-radius:7px;padding:8px 12px;font-size:13px;color:#7d7d7d}
.slot.quote{display:block}
.q{font-style:italic;color:#c4c4c4;font-size:14px}
.src{color:#6f6f6f;font-size:12px;margin-top:4px}
.stars{color:#6f6f6f;margin-right:6px}
.avatar{flex:0 0 56px;height:56px;border:1px dashed #3a3a3a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10.5px;color:#6a6a6a}
.pbody{flex:1;min-width:0;font-size:13.5px;color:#a9a9a9}
.pbody b{display:block;color:#e0e0e0;font-weight:600;margin-bottom:3px}
.frame{flex:1 1 auto;width:100%;border:1px dashed #3a3a3a;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#6f6f6f;font-size:12.5px;text-align:center;padding:12px;min-height:100px}
.frame{flex-direction:column;gap:8px}
.fileref{font-style:normal;font-size:11.5px;color:#7d7d7d;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all}
.fileref.none{color:#6a6a6a;font-family:inherit}
.logo{border:1px dashed #333;border-radius:6px;padding:8px 18px;font-size:11.5px;color:#6a6a6a}
.slot.disc{display:block;padding-top:8px;padding-bottom:8px}
.drow{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #262626;color:#b6b6b6;font-size:13.5px}
.drow:last-child{border-bottom:0}
.slot.cards{display:block;padding-top:10px}
.cardrow{display:flex;gap:12px;align-items:flex-start}
.card{flex:1;min-width:0;border:1px solid #2c2c2c;border-radius:9px;padding:12px;display:flex;flex-direction:column;gap:8px}
.card.hi{border-color:#585858;border-width:2px}
.card .slot{border-color:#2f2f2f;padding-left:8px}
.card .addr{display:none}
.ctitle{font-weight:600;color:#e6e6e6;font-size:14px}
.tag{align-self:flex-start;border:1px dashed #4d4d4d;border-radius:99px;padding:3px 9px;font-size:11px;color:#9a9a9a}
@media (max-width:600px){
  body{padding:14px}
  .sec{padding:16px 14px}
  .sec>header{flex-direction:column;gap:4px}
  .goal{text-align:left}
  .body,.body.split{flex-direction:column;gap:14px}
  /* Where the side slot lands on a narrow screen is a structural decision, not a
     rendering detail — so it is a knob ("asideMobile": "last"), not a silent default. */
  .aside{flex:1 1 auto;order:-1}
  .body.aside-last .aside{order:1}
  .aside .frame{max-height:300px}
  .cardrow{flex-direction:column}
  .slot.h1{font-size:22px}
}
`;

const lead = `<div class="lead"><b>Makieta, nie projekt.</b> Pokazuje, co i gdzie stoi w każdej sekcji — kolejność, sloty i to, czego treścią trzeba dopiero wypełnić. Kolor, krój i proporcje ustalamy w następnym kroku, na specimenie.<br>Adresy: <b>${num(1)}</b> to sekcja, <b>1.2</b> to slot w niej. Tnij, przestawiaj i dopisuj po numerach. Wszystko w <b>[nawiasach]</b> jest do napisania — to lista zakupów.</div>`;

const html = `<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Makieta — ${esc(arc.project ?? 'arc')}</title><style>${CSS}</style>
<body><div class="doc">${lead}${sections.map(section).join('')}</div></body></html>`;

const outBase = path.resolve(String(flags.out ?? 'wireframe'));
const htmlPath = `${outBase}.html`;
writeFileSync(htmlPath, html);

// ─── Content scaffold ───────────────────────────────────────────────────────────
// The mockup is not a document to approve, it is the input to the build: every bracket
// becomes a key. After the build, the shopping list is a query — the keys still holding
// bracketed text — instead of a summary someone has to remember to write.
if (flags.content) {
  const camel = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/gi, 'l')
    .replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^(.)/, m => m.toLowerCase()) || 'section';
  const keyFor = (b, used) => {
    const base = b.type === 'heading' ? 'heading' : b.type === 'text' ? 'body' : b.type;
    let k = base, i = 2; while (used.has(k)) k = base + i++; used.add(k); return k;
  };
  const val = s => JSON.stringify(String(s ?? ''));
  const lines = ['// Generated from arc.json by wireframe.mjs — do not add strings to components.',
    '// TODO: every value still in [brackets] is owed. That list IS the content shopping list.',
    'export const content = {'];
  for (const s of sections) {
    const used = new Set();
    lines.push(`  ${camel(s.name ?? 'section')}: {`);
    const emit = (b, indent = '    ') => {
      const k = keyFor(b, used);
      if (b.type === 'cards' || b.type === 'disclosure' || b.type === 'list') {
        const items = (b.items ?? []).map(i => typeof i === 'string' ? val(i)
          : `{ ${[i.title ? `title: ${val(i.title)}` : null, ...(i.blocks ?? []).map((x, n) => `${x.type}${n || ''}: ${val(x.text)}`)].filter(Boolean).join(', ')} }`);
        lines.push(`${indent}${k}: [${items.join(', ')}],`);
      } else if (b.type === 'actions') {
        lines.push(`${indent}${k}: [${(b.items ?? []).map(i => val(typeof i === 'string' ? i : i.text)).join(', ')}],`);
      } else if (b.type === 'person') {
        lines.push(`${indent}${k}: { name: ${val(b.name)}, bio: ${val(b.text)} },`);
      } else if (b.type === 'quote') {
        lines.push(`${indent}${k}: { text: ${val(b.text)}, source: ${val(b.source)} },`);
      } else {
        lines.push(`${indent}${k}: ${val(b.text)},`);
      }
    };
    (s.blocks ?? []).forEach(b => emit(b));
    if (s.aside) emit(s.aside);
    lines.push('  },');
  }
  lines.push('} as const;', '');
  const cp = path.resolve(String(flags.content));
  mkdirSync(path.dirname(cp), { recursive: true });
  writeFileSync(cp, lines.join('\n'));
  console.log(`Wrote ${flags.content} — ${sections.length} sections, every bracket a key.`);
}

// ─── Screenshots ────────────────────────────────────────────────────────────────
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
  console.log(`Wrote ${htmlPath} — no renderer found, so open it in a browser and review it there.`);
  console.log(`For screenshots: npm i -D playwright && npx playwright install chromium`);
  process.exit(0);
}

const browser = await chromium.launch();
const shots = [];
for (const [label, width] of [['web', Number(flags.web ?? 1280)], ['mobile', Number(flags.mobile ?? 390)]]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  const out = `${outBase}-${label}.png`;
  await page.screenshot({ path: out, fullPage: true });
  shots.push(out);
  await page.close();
}
await browser.close();

const secs = sections.length;
const slots = sections.reduce((t, s) => t + (s.blocks?.length ?? 0) + (s.aside ? 1 : 0), 0);
console.log(`Makieta: ${secs} sekcji, ${slots} slotów — ${shots.map(s => path.basename(s)).join(' + ')}`);
if (flags.open !== 'false') {
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  try {
    for (const s of shots) spawn(opener, [s], { detached: true, stdio: 'ignore', shell: process.platform === 'win32' }).unref();
    console.log(`  opened in the default viewer — ask for cuts and reorders only after these are on screen`);
  } catch {
    console.log(`  could not auto-open — tell the user to open both files themselves, and wait for their reply`);
  }
}
console.log(`\nThis is a structural gate: stop your turn here and wait for numbers, pasted copy, or "ok".`);
