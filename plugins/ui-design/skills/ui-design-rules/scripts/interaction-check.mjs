#!/usr/bin/env node
// Keyboard & focus audit of a rendered page: Tab-walk reachability, focus-indicator
// visibility (style diffing), positive tabindex, fake buttons, and sub-24px targets.
// Rules: references/interaction.md and references/accessibility.md.
// Usage (from your project root): node /path/to/interaction-check.mjs <file.html|url> [--width=1280] [--max-tabs=300]
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
if (!target) { console.error('Usage: node interaction-check.mjs <file.html|url> [--width=1280] [--max-tabs=300]'); process.exit(1); }
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

// Phase 1: static scan. Tag EVERY element that could take focus (not only the ones we
// classify as "interactive") — an untagged focus stop used to abort the whole Tab walk.
const scan = await page.evaluate(() => {
  // Natively focusable tags, including the ones people forget: SUMMARY, AUDIO/VIDEO with controls,
  // IFRAME, contenteditable, and [href] anchors.
  const NATIVE_FOCUSABLE = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, iframe, object, embed, audio[controls], video[controls], [contenteditable=""], [contenteditable="true"], [tabindex]';
  const ROLES = new Set(['button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'tab', 'checkbox', 'radio', 'switch', 'combobox', 'option', 'slider', 'spinbutton', 'searchbox', 'textbox']);
  const snapStyle = el => {
    const cs = getComputedStyle(el);
    return [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.backgroundColor, cs.borderColor, cs.textDecorationLine].join('|');
  };
  const items = []; let id = 0;
  const seen = new Set();
  const consider = el => {
    if (seen.has(el)) return; seen.add(el);
    const tag = el.tagName;
    const role = el.getAttribute('role');
    const hasOnclick = el.hasAttribute('onclick');
    const tabAttr = el.getAttribute('tabindex');
    const nativelyFocusable = el.matches(NATIVE_FOCUSABLE) && !el.hasAttribute('disabled');
    const claimsInteractive = (role && ROLES.has(role)) || hasOnclick;
    if (!nativelyFocusable && !claimsInteractive) return;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const visible = r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
    const key = 'ic' + (++id);
    el.setAttribute('data-icheck', key);
    const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const inlineProseLink = tag === 'A' && cs.display.startsWith('inline') && (el.parentElement?.textContent || '').trim().length > (label.length + 10);
    const nativeSmallControl = tag === 'INPUT' && ['checkbox', 'radio'].includes(el.type);
    // A control's effective hit area can come from a padded parent (label/li wrapper).
    const parentBox = el.parentElement?.getBoundingClientRect();
    const effW = Math.max(r.width, nativeSmallControl && parentBox ? Math.min(parentBox.width, 48) : 0);
    const effH = Math.max(r.height, parentBox && parentBox.height <= r.height + 24 ? parentBox.height : 0);
    items.push({
      key, tag, role, label,
      tabAttr: tabAttr === null ? null : Number(tabAttr),
      hasOnclick, visible,
      w: Math.round(r.width), h: Math.round(r.height),
      effW: Math.round(effW), effH: Math.round(effH),
      nativelyFocusable, inlineProseLink, nativeSmallControl,
      restStyle: snapStyle(el),
    });
  };
  document.querySelectorAll(NATIVE_FOCUSABLE).forEach(consider);
  document.querySelectorAll('[role], [onclick]').forEach(consider);
  return items;
});

// Phase 2: Tab walk. Never abort on an unknown stop — record it and keep walking.
// Terminate on a real cycle (first key revisited) or when focus leaves the document twice in a row.
const maxTabs = Number(flags['max-tabs'] ?? 300);
const order = []; const visited = new Set(); const noVisibleFocus = []; const unknownStops = [];
let firstKey = null, escapes = 0;
await page.evaluate(() => (document.activeElement && document.activeElement.blur?.(), document.body.setAttribute('tabindex', '-1'), document.body.focus()));
for (let i = 0; i < maxTabs; i++) {
  await page.keyboard.press('Tab');
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body || el === document.documentElement) return { escaped: true };
    const cs = getComputedStyle(el);
    return {
      key: el.getAttribute('data-icheck'),
      tag: el.tagName,
      label: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30),
      focusStyle: [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.backgroundColor, cs.borderColor, cs.textDecorationLine].join('|'),
    };
  });
  if (info.escaped) { escapes++; if (escapes >= 2 && visited.size > 0) break; continue; }
  escapes = 0;
  if (!info.key) { unknownStops.push(`<${info.tag.toLowerCase()}> "${info.label}"`); continue; } // keep walking
  if (info.key === firstKey) break;               // completed the cycle
  if (firstKey === null) firstKey = info.key;
  if (!visited.has(info.key)) {
    visited.add(info.key); order.push(info.key);
    const item = scan.find(s => s.key === info.key);
    if (item && info.focusStyle === item.restStyle) noVisibleFocus.push(item);
  }
}
await browser.close();

const findings = [];
const fmt = i => `<${i.tag.toLowerCase()}${i.role ? ` role=${i.role}` : ''}> "${i.label || '(no label)'}"`;

const positiveTab = scan.filter(i => i.tabAttr !== null && i.tabAttr > 0);
if (positiveTab.length) findings.push(`positive tabindex on ${positiveTab.length} element(s) — forks tab order from reading order: ${positiveTab.slice(0, 3).map(fmt).join('; ')}`);

const fakeButtons = scan.filter(i => (i.hasOnclick || ['button', 'link'].includes(i.role || '')) && !i.nativelyFocusable && (i.tabAttr === null || i.tabAttr < 0) && i.visible);
if (fakeButtons.length) findings.push(`${fakeButtons.length} clickable element(s) unreachable by keyboard (onclick/role without native element or tabindex): ${fakeButtons.slice(0, 3).map(fmt).join('; ')}`);

// Target size: judge the effective hit area, exempt inline prose links (WCAG 2.2 exception).
const small = scan.filter(i => i.visible && !i.inlineProseLink && (i.tabAttr === null || i.tabAttr >= 0) && i.effW > 0 && i.effH > 0 && (i.effW < 24 || i.effH < 24));
if (small.length) findings.push(`${small.length} target(s) below the 24×24px floor (WCAG 2.2): ${small.slice(0, 3).map(i => `${fmt(i)} ${i.effW}×${i.effH}px`).join('; ')}`);

if (noVisibleFocus.length) findings.push(`${noVisibleFocus.length} element(s) show NO visible change when focused: ${noVisibleFocus.slice(0, 3).map(fmt).join('; ')} — restore a focus indicator (ring or outline)`);

const expectedReachable = scan.filter(i => i.visible && (i.nativelyFocusable || (i.tabAttr !== null && i.tabAttr >= 0)));
const unreached = expectedReachable.filter(i => !visited.has(i.key));
if (visited.size > 0 && unreached.length) findings.push(`${unreached.length} focusable element(s) never reached in the ${visited.size}-stop Tab walk (order break, hidden trap, or off-screen?): ${unreached.slice(0, 3).map(fmt).join('; ')}`);

console.log(`Scanned ${scan.length} interactive element(s); Tab walk visited ${visited.size} stop(s).`);
if (unknownStops.length) console.log(`  (${unknownStops.length} focus stop(s) outside the scanned set — e.g. ${unknownStops.slice(0, 2).join(', ')})`);
if (findings.length) {
  console.log('\nFINDINGS:');
  findings.forEach(f => console.log('  ✗ ' + f));
  console.log('\nManual half still applies: Escape closes layers and returns focus; arrows work inside composites (interaction.md).');
  process.exit(1);
}
console.log('OK: keyboard reachability, focus visibility, tab order, and target sizes hold.');
