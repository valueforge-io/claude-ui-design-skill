#!/usr/bin/env node
// Reflow audit: WCAG 2.x Reflow requires content to work at 320 CSS px wide with no
// two-dimensional scrolling. Checks 320px (and any extra widths), names the elements that
// overflow, and flags fixed-width culprits. Rules: references/accessibility.md [STANDARD].
// Usage (from your project root): node /path/to/reflow-check.mjs <file.html|url> [--widths=320,390,768]
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
if (!target) { console.error('Usage: node reflow-check.mjs <file.html|url> [--widths=320,390,768]'); process.exit(1); }
const url = /^https?:\/\//.test(target) ? target : pathToFileURL(path.resolve(target)).href;
const widths = String(flags.widths ?? '320,390').split(',').map(Number).filter(Boolean);

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
const report = [];

for (const w of widths) {
  await page.setViewportSize({ width: w, height: 800 });
  await page.goto(url);
  await new Promise(r => setTimeout(r, 1200));
  const res = await page.evaluate((vw) => {
    const docW = document.documentElement.scrollWidth;
    const offenders = [];
    if (docW > vw + 1) {
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        const right = r.left + r.width;
        if (right <= vw + 1) continue;
        // Blame the outermost element that overflows: skip if an ancestor already overflows
        // by roughly the same amount, and skip elements inside a legitimate scroll container.
        let scrollableAncestor = false, node = el.parentElement;
        while (node) {
          const pcs = getComputedStyle(node);
          if (['auto', 'scroll'].includes(pcs.overflowX)) { scrollableAncestor = true; break; }
          const pr = node.getBoundingClientRect();
          if (pr.left + pr.width > vw + 1 && Math.abs((pr.left + pr.width) - right) < 4) { scrollableAncestor = true; break; }
          node = node.parentElement;
        }
        if (scrollableAncestor) continue;
        const label = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
        const cause =
          /px$/.test(cs.width) && parseFloat(cs.width) > vw ? `fixed width ${cs.width}` :
          /px$/.test(cs.minWidth) && parseFloat(cs.minWidth) > vw ? `min-width ${cs.minWidth}` :
          cs.whiteSpace === 'nowrap' ? 'white-space: nowrap' :
          el.tagName === 'TABLE' ? 'table wider than viewport (wrap in an overflow-x container or stack rows)' :
          cs.position === 'fixed' || cs.position === 'absolute' ? `${cs.position} element positioned past the edge` :
          'content wider than its container';
        offenders.push({ tag: el.tagName.toLowerCase(), cls: (el.getAttribute('class') || '').slice(0, 50), label, right: Math.round(right), cause });
        if (offenders.length >= 8) break;
      }
    }
    // A page whose text is clipped rather than reflowed also fails; sample a few blocks.
    const clipped = [...document.querySelectorAll('p, h1, h2, h3, li, td')].filter(el => {
      const cs = getComputedStyle(el);
      return cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 2 && cs.whiteSpace === 'nowrap';
    }).length;
    return { docW, offenders, clipped };
  }, w);
  report.push({ w, ...res });
}
await browser.close();

let failed = false;
for (const r of report) {
  const overflow = r.docW - r.w;
  if (overflow > 1) {
    failed = true;
    console.log(`✗ ${r.w}px: content is ${r.docW}px wide — ${overflow}px of horizontal scrolling [STANDARD: reflow at 320px]`);
    for (const o of r.offenders) {
      console.log(`    <${o.tag}${o.cls ? ` class="${o.cls}…"` : ''}> "${o.label}" reaches ${o.right}px — ${o.cause}`);
    }
  } else {
    console.log(`✓ ${r.w}px: no horizontal scrolling (content ${r.docW}px)`);
  }
  if (r.clipped) console.log(`    note: ${r.clipped} text element(s) truncated with ellipsis at this width — truncation is not reflow; verify the full text is reachable`);
}
if (failed) {
  console.log('\nUsual fixes: replace fixed widths with max-w-* + w-full, allow wrapping (remove nowrap), wrap wide tables in an overflow-x container or stack them into cards on narrow screens (components.md).');
  process.exit(1);
}
console.log('\nOK: reflow holds at every tested width.');
