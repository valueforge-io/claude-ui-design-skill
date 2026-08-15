#!/usr/bin/env node
// Keyboard & focus audit of a rendered page: Tab-walk reachability, focus-indicator
// visibility (style diffing), positive tabindex, fake buttons, and sub-24px targets.
// Rules: references/interaction.md and references/accessibility.md.
// Usage (from your project root): node /path/to/interaction-check.mjs <file.html|url> [--width=1280] [--max-tabs=150]
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
if (!target) { console.error('Usage: node interaction-check.mjs <file.html|url> [--width=1280] [--max-tabs=150]'); process.exit(1); }
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

// Phase 1: static scan — tag elements, snapshot styles, collect static findings
const scan = await page.evaluate(() => {
  const FOCUSABLE_TAGS = new Set(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'DETAILS', 'DIALOG']);
  const ROLES = new Set(['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio', 'switch', 'combobox', 'option', 'slider']);
  const all = [...document.querySelectorAll('*')];
  const items = []; let id = 0;
  const snapStyle = el => {
    const cs = getComputedStyle(el);
    return [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.backgroundColor, cs.borderColor].join('|');
  };
  for (const el of all) {
    const tag = el.tagName;
    const role = el.getAttribute('role');
    const hasOnclick = el.hasAttribute('onclick');
    const tabAttr = el.getAttribute('tabindex');
    const interactive =
      (tag === 'A' && el.hasAttribute('href')) ||
      (FOCUSABLE_TAGS.has(tag) && tag !== 'A' && el.getAttribute('type') !== 'hidden') ||
      (role && ROLES.has(role)) || hasOnclick || tabAttr !== null;
    if (!interactive) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const visible = r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
    const key = 'ic' + (++id);
    el.setAttribute('data-icheck', key);
    const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || '').trim().slice(0, 40);
    const inlineProseLink = tag === 'A' && cs.display === 'inline' && (el.parentElement?.textContent || '').trim().length > (label.length + 10);
    const nativeSmallControl = tag === 'INPUT' && ['checkbox', 'radio'].includes(el.type);
    items.push({
      key, tag, role, label,
      tabAttr: tabAttr === null ? null : Number(tabAttr),
      hasOnclick, visible,
      w: Math.round(r.width), h: Math.round(r.height),
      nativelyFocusable: FOCUSABLE_TAGS.has(tag) || (tag === 'A' && el.hasAttribute('href')),
      inlineProseLink, nativeSmallControl,
      restStyle: snapStyle(el),
    });
  }
  return items;
});

// Phase 2: Tab walk — visit order + focus-visibility diff
const maxTabs = Number(flags['max-tabs'] ?? 150);
const visited = new Set(); const noVisibleFocus = [];
await page.evaluate(() => document.body.focus());
for (let i = 0; i < maxTabs; i++) {
  await page.keyboard.press('Tab');
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { key: null };
    const cs = getComputedStyle(el);
    return {
      key: el.getAttribute('data-icheck'),
      focusStyle: [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.backgroundColor, cs.borderColor].join('|'),
    };
  });
  if (!info.key) { if (visited.size > 0) break; else continue; } // wrapped to browser chrome / body
  if (visited.has(info.key)) break; // full cycle
  visited.add(info.key);
  const item = scan.find(s => s.key === info.key);
  if (item && info.focusStyle === item.restStyle) noVisibleFocus.push(item);
}
await browser.close();

const findings = [];
const fmt = i => `<${i.tag.toLowerCase()}${i.role ? ` role=${i.role}` : ''}> "${i.label || '(no label)'}"`;

const positiveTab = scan.filter(i => i.tabAttr !== null && i.tabAttr > 0);
if (positiveTab.length) findings.push(`positive tabindex on ${positiveTab.length} element(s) — forks tab order from reading order: ${positiveTab.slice(0, 3).map(fmt).join('; ')}`);

const fakeButtons = scan.filter(i => (i.hasOnclick || ['button', 'link'].includes(i.role || '')) && !i.nativelyFocusable && (i.tabAttr === null || i.tabAttr < 0) && i.visible);
if (fakeButtons.length) findings.push(`${fakeButtons.length} clickable element(s) unreachable by keyboard (onclick/role without native element or tabindex): ${fakeButtons.slice(0, 3).map(fmt).join('; ')}`);

const small = scan.filter(i => i.visible && !i.inlineProseLink && !i.nativeSmallControl && (i.tabAttr === null || i.tabAttr >= 0) && (i.w < 24 || i.h < 24) && (i.w > 0 && i.h > 0));
if (small.length) findings.push(`${small.length} target(s) below the 24×24px floor (WCAG 2.2): ${small.slice(0, 3).map(i => `${fmt(i)} ${i.w}×${i.h}px`).join('; ')}`);

if (noVisibleFocus.length) findings.push(`${noVisibleFocus.length} element(s) show NO visible change when focused: ${noVisibleFocus.slice(0, 3).map(fmt).join('; ')} — restore a focus indicator (ring or outline)`);

const expectedReachable = scan.filter(i => i.visible && (i.nativelyFocusable || (i.tabAttr !== null && i.tabAttr >= 0)));
const unreached = expectedReachable.filter(i => !visited.has(i.key));
if (visited.size > 0 && unreached.length) findings.push(`${unreached.length} focusable element(s) never reached in ${visited.size}-stop Tab walk (order break or hidden trap?): ${unreached.slice(0, 3).map(fmt).join('; ')}`);

console.log(`Scanned ${scan.length} interactive element(s); Tab walk visited ${visited.size}.`);
if (findings.length) {
  console.log('\nFINDINGS:');
  findings.forEach(f => console.log('  ✗ ' + f));
  console.log('\nManual half still applies: Escape closes layers and returns focus; arrows work inside composites (interaction.md).');
  process.exit(1);
}
console.log('OK: keyboard reachability, focus visibility, tab order, and target sizes hold.');
