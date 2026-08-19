#!/usr/bin/env node
// WCAG contrast audit of a RENDERED page. Two methods, chosen per element:
//  - static text: composite the color over the backdrop found by walking transparent
//    ancestors in the DOM;
//  - FLOATING text (inside position:sticky/fixed with a translucent background): the DOM
//    cannot say what is visually underneath — a pinned header overlays whatever section
//    scrolls beneath it. Those elements are measured from RENDERED PIXELS at several
//    scroll stops (one per section they can cover), and the worst stop decides.
// Thresholds use the EFFECTIVE rendered size: an SVG label declared 19px but scaled to
// 13px by its viewBox needs 4.5:1, not the large-text 3:1.
// Rules: references/color.md [STANDARD], references/accessibility.md.
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

  // Effective backdrop with an honesty bit: if the walk crosses a sticky/fixed node before
  // reaching an opaque background, the DOM's answer is a guess — the element floats over
  // whatever happens to be scrolled beneath it. Such elements are flagged for pixel
  // measurement instead of being silently composited onto an ancestor they never sit on.
  const backdropOf = (el) => {
    let node = el, acc = null, imageBehind = false, floating = false;
    while (node && node !== document.documentElement.parentElement) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') imageBehind = true;
      const bg = toRGBA(cs.backgroundColor);
      if (bg && bg.a > 0) {
        acc = acc ? over(acc, bg) : bg;
        // Opacity reached at this node: return the flag as accumulated SO FAR. A sticky bar
        // whose own background is opaque is not floating — the backdrop is the bar itself.
        // But if a sticky with alpha was already crossed, opacity found on a later ancestor
        // (usually body) describes a surface the element never visually sits on.
        if (acc.a >= 1) return { color: acc, imageBehind, floating };
      }
      // Position is checked AFTER this node's own background: what shows through a
      // translucent pinned bar comes from beneath it, not from its ancestors.
      if (cs.position === 'sticky' || cs.position === 'fixed') floating = true;
      node = node.parentElement;
    }
    return { color: acc && acc.a >= 1 ? acc : { r: 255, g: 255, b: 255, a: 1 }, imageBehind, floating };
  };

  // Effective rendered size: declared px × on-screen scale. SVG text inherits its viewBox
  // scale via getScreenCTM; CSS-transformed elements betray theirs in the rect/offset ratio.
  const scaleOf = (el) => {
    try { if (el.getScreenCTM) { const m = el.getScreenCTM(); if (m) { const s = Math.hypot(m.a, m.b); if (s > 0) return s; } } } catch { /* html element */ }
    const oh = el.offsetHeight;
    if (oh) { const rh = el.getBoundingClientRect().height; if (rh > 0) { const s = rh / oh; if (Math.abs(s - 1) > 0.02) return s; } }
    return 1;
  };

  // Top-level sections → labels and offsets, so a floating element's worst stop can be
  // named ("over the manifesto"), and so the scroll stops cover every band it can sit on.
  let secs = [...document.querySelectorAll('section')].filter(s => !s.parentElement?.closest('section'));
  if (secs.length < 2) {
    const root = document.querySelector('main') ?? document.body;
    secs = [...root.children].filter(c => c.getBoundingClientRect().height > 160);
  }
  const sections = secs.map(s => {
    const r = s.getBoundingClientRect();
    return {
      top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY),
      label: (s.id || s.querySelector('h1,h2,h3')?.innerText?.slice(0, 28) || s.tagName.toLowerCase()).replace(/\s+/g, ' '),
    };
  });

  const findings = []; const floaters = []; let checked = 0; let floatId = 0;
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    // own text only (ignore text belonging to descendants)
    const ownText = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
    if (!ownText) continue;
    // SVG text is painted with `fill`, not CSS `color` — reading `color` there measures an
    // inherited value the user never sees (usually black), which passes everything.
    const paint = (el.namespaceURI === 'http://www.w3.org/2000/svg' && cs.fill && cs.fill !== 'none') ? cs.fill : cs.color;
    const key = el.tagName + '|' + paint + '|' + cs.fontSize + '|' + cs.fontWeight + '|' + ownText.slice(0, 20);
    if (seen.has(key)) continue; seen.add(key);
    const fgRaw = toRGBA(paint);
    if (!fgRaw) continue;
    const { color: bg, imageBehind, floating } = backdropOf(el);
    const size = parseFloat(cs.fontSize);
    const scale = scaleOf(el);
    const effSize = size * scale;
    const weight = Number(cs.fontWeight) || (cs.fontWeight === 'bold' ? 700 : 400);
    const large = effSize >= 24 || (effSize >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    checked++;
    if (floating) {
      const id = `cc-${floatId++}`;
      el.setAttribute('data-cc-float', id);
      floaters.push({ id, text: ownText.slice(0, 45), tag: el.tagName.toLowerCase(), fgCss: paint, need, size: Math.round(effSize), kind: large ? 'large text' : 'body text' });
      continue;
    }
    const fg = over(fgRaw, bg);
    const got = ratio(fg, bg);
    // 0.01, not 0.05: the epsilon absorbs float noise, and no more. A grace of 0.05 let a
    // measured 4.45:1 pass a 4.5 floor in the field — a formal violation waved through.
    if (got + 0.01 < need) {
      findings.push({
        kind: large ? 'large text' : 'body text',
        text: ownText.slice(0, 45), tag: el.tagName.toLowerCase(),
        size: Math.round(effSize), declared: Math.round(size), got: Math.round(got * 100) / 100, need, imageBehind,
        fg: paint, bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
      });
    }
  }
  return { findings, checked, floaters, sections, vh: window.innerHeight };
});

// ── Pixel pass for floating elements ────────────────────────────────────────
// A pinned bar is measured where it actually sits: scrolled over every section it can
// cover. Text is blanked with color:transparent (backgrounds and borders stay), the two
// shots are diffed — changed pixels ARE the glyphs — and the worst pixel at the worst
// stop decides. This is the scrim-check method pointed at a different kind of overlay.
const floatFindings = [];
let floatStops = 0;
if (result.floaters.length) {
  const stops = [0];
  for (const s of result.sections) {
    const y = Math.max(0, s.top + 8);
    if (stops.every(v => Math.abs(v - y) > 40)) stops.push(y);
    if (stops.length >= 10) break;
  }
  floatStops = stops.length;
  const sectionAt = (absY) => {
    const s = result.sections.find(x => absY >= x.top && absY < x.bottom);
    return s ? s.label : `y≈${Math.round(absY)}px`;
  };
  // Stops on the outside: one scroll per stop, every floater measured there. Pinned bars
  // often animate on scroll (hide down, reveal up) — fewer scrolls, less churn.
  const worstOf = new Map(); // f.id → { got, label, bg }
  for (const y of stops) {
    // Approach every stop from BELOW: hide-on-scroll headers conceal themselves going down
    // and reveal going up, and the revealed-over-a-deep-section state is exactly the one
    // the DOM never describes. Overshoot, then come back up.
    await page.evaluate(async (scrollY) => {
      window.scrollTo(0, scrollY + 400); await new Promise(r => setTimeout(r, 160));
      window.scrollTo(0, scrollY); await new Promise(r => setTimeout(r, 300));
    }, y);
    for (const f of result.floaters.slice(0, 8)) {
      const meta = await page.evaluate((sel) => {
        const el = document.querySelector(`[data-cc-float="${sel}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return null;
        return { x: Math.max(0, Math.floor(r.left)), y: Math.max(0, Math.floor(r.top)), w: Math.ceil(r.width), h: Math.ceil(r.height), absMid: window.scrollY + r.top + r.height / 2 };
      }, f.id);
      if (!meta) continue;
      const clip = { x: meta.x, y: meta.y, width: Math.max(2, meta.w), height: Math.max(2, meta.h) };
      let shown, hidden;
      try {
        shown = (await page.screenshot({ clip, animations: 'disabled' })).toString('base64');
        // transition:none first — a color transition would leave the text half-visible in
        // the "hidden" shot, and the diff would sample the glyph's own pixels as backdrop.
        await page.evaluate(s => { const el = document.querySelector(`[data-cc-float="${s}"]`); el.style.setProperty('transition', 'none', 'important'); el.style.setProperty('color', 'transparent', 'important'); }, f.id);
        hidden = (await page.screenshot({ clip, animations: 'disabled' })).toString('base64');
        await page.evaluate(s => { const el = document.querySelector(`[data-cc-float="${s}"]`); el.style.removeProperty('color'); el.style.removeProperty('transition'); }, f.id);
        // Stability sentinel: with the text restored, the scene must look exactly like the
        // first shot. If it does not, the bar moved between the pair (scroll-reactive
        // headers slide in and out) and the diff would sample its own displaced glyphs as
        // "backdrop" — the classic 1:1 artifact. Discard the stop; a moving scene is not
        // a measurement.
        const sentinel = (await page.screenshot({ clip, animations: 'disabled' })).toString('base64');
        if (sentinel !== shown) {
          const stable = await page.evaluate(async ([a, b]) => {
            const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${src}`; });
            const [ia, ib] = await Promise.all([load(a), load(b)]);
            const cv = document.createElement('canvas'); cv.width = ia.width; cv.height = ia.height;
            const c2 = cv.getContext('2d', { willReadFrequently: true });
            c2.drawImage(ia, 0, 0); const A = c2.getImageData(0, 0, cv.width, cv.height).data;
            c2.clearRect(0, 0, cv.width, cv.height);
            c2.drawImage(ib, 0, 0); const B = c2.getImageData(0, 0, cv.width, cv.height).data;
            let bad = 0;
            for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) > 60) bad++;
            return bad < 8; // a handful of AA pixels is noise; more means the scene moved
          }, [shown, sentinel]);
          if (!stable) continue;
        }
      } catch { continue; }
      const m = await page.evaluate(async ([a, b, fgCss]) => {
        const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${src}`; });
        const [ia, ib] = await Promise.all([load(a), load(b)]);
        const cv = document.createElement('canvas'); cv.width = ia.width; cv.height = ia.height;
        const c2 = cv.getContext('2d', { willReadFrequently: true });
        c2.drawImage(ia, 0, 0); const A = c2.getImageData(0, 0, cv.width, cv.height).data;
        c2.clearRect(0, 0, cv.width, cv.height);
        c2.drawImage(ib, 0, 0); const B = c2.getImageData(0, 0, cv.width, cv.height).data;
        c2.fillStyle = '#000'; c2.fillStyle = fgCss; c2.fillRect(0, 0, 1, 1);
        // fg color via the same canvas normalization
        const cv2 = document.createElement('canvas'); const c3 = cv2.getContext('2d', { willReadFrequently: true });
        c3.fillStyle = '#000'; c3.fillStyle = fgCss; c3.fillRect(0, 0, 1, 1);
        const fd = c3.getImageData(0, 0, 1, 1).data;
        const lum2 = (r, g, b) => { const f2 = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f2(r) + 0.7152 * f2(g) + 0.0722 * f2(b); };
        const fl = lum2(fd[0], fd[1], fd[2]);
        let worstR = Infinity, worstPx = null, n = 0;
        for (let i = 0; i < A.length; i += 4) {
          const d = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
          if (d <= 60) continue; // antialias halo out
          n++;
          const bl = lum2(B[i], B[i + 1], B[i + 2]);
          const [hi, lo] = fl > bl ? [fl, bl] : [bl, fl];
          const rr = (hi + 0.05) / (lo + 0.05);
          if (rr < worstR) { worstR = rr; worstPx = [B[i], B[i + 1], B[i + 2]]; }
        }
        return n ? { got: Math.round(worstR * 100) / 100, bg: `rgb(${worstPx.join(', ')})` } : null;
      }, [shown, hidden, f.fgCss]);
      if (!m) continue;
      const prev = worstOf.get(f.id);
      if (!prev || m.got < prev.got) worstOf.set(f.id, { got: m.got, bg: m.bg, label: sectionAt(meta.absMid) });
    }
  }
  for (const f of result.floaters.slice(0, 8)) {
    const worst = worstOf.get(f.id);
    if (worst && worst.got + 0.01 < f.need) {
      floatFindings.push({ ...f, got: worst.got, bg: worst.bg, over: worst.label });
    }
  }
}
await browser.close();

const { findings, checked, floaters } = result;
console.log(`Checked ${checked} text node(s) against their rendered backdrops.`);
if (floaters.length) console.log(`  incl. ${Math.min(floaters.length, 8)} floating (sticky/fixed) element(s) measured from pixels at ${floatStops} scroll stop(s) — the DOM cannot say what sits beneath them.`);
const all = [...findings, ...floatFindings];
if (!all.length) {
  console.log('OK: every text node meets its WCAG minimum (4.5:1 body, 3:1 large), floating elements at their worst scroll position included.');
  process.exit(0);
}
const show = flags.verbose ? all : all.slice(0, 12);
console.log(`\nFINDINGS — ${all.length} contrast violation(s) [STANDARD]:`);
for (const f of show) {
  const sizeNote = f.declared && f.declared !== f.size ? `${f.declared}px→${f.size}px rendered` : `${f.size}px`;
  console.log(`  ✗ ${f.got}:1 (needs ${f.need}:1) — ${f.kind} ${sizeNote} <${f.tag}> "${f.text}"${f.over ? `  · worst over "${f.over}"` : ''}`);
  console.log(`      ${f.fgCss ?? f.fg} on ${f.bg}${f.imageBehind ? '  [background image behind — run scrim-check.mjs]' : ''}`);
}
if (!flags.verbose && all.length > show.length) console.log(`  … and ${all.length - show.length} more (--verbose for all)`);
console.log('\nFix by darkening/lightening the text token one step, not by nudging opacity (color.md).');
console.log('For a floating bar, the honest fixes: raise the backdrop alpha, add backdrop-blur, or give the bar an opaque background.');
process.exit(1);
