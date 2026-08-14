#!/usr/bin/env node
// Render a page and screenshot it so the model can SEE its own output.
// Usage (run from your PROJECT ROOT, calling this script by its full path):
//   node /path/to/screenshot.mjs <file.html | http(s)://url> [out.png] [--width=1280] [--height=800] [--full]
// Requires playwright (or puppeteer) installed in the project:
//   npm i -D playwright && npx playwright install chromium
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const positional = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; })
);
const target = positional[0];
if (!target) {
  console.error('Usage: node screenshot.mjs <file.html|url> [out.png] [--width=1280] [--height=800] [--full]');
  process.exit(1);
}
const url = /^https?:\/\//.test(target) ? target : pathToFileURL(path.resolve(target)).href;
const out = positional[1] ?? 'screenshot.png';
const width = Number(flags.width ?? 1280);
const height = Number(flags.height ?? 800);

// Resolve renderer modules relative to the user's project (cwd) FIRST, then
// relative to this script, then from global paths. The script usually lives in
// the plugin/skill directory while the dependency lives in the project — a bare
// import() would only look next to the script and miss the project's node_modules.
async function importFrom(pkg) {
  const anchors = [path.join(process.cwd(), '__resolve__.mjs'), import.meta.url];
  for (const anchor of anchors) {
    try {
      const entry = createRequire(anchor).resolve(pkg);
      return await import(pathToFileURL(entry).href);
    } catch { /* try next anchor */ }
  }
  try { return await import(pkg); } catch { return null; }
}

let browser;
const pw = await importFrom('playwright');
const chromium = pw?.chromium ?? pw?.default?.chromium;
if (chromium) {
  try {
    browser = await chromium.launch();
  } catch (err) {
    console.error('Playwright is installed, but the browser failed to launch');
    console.error('(usually a missing or version-mismatched Chromium build).');
    console.error('Fix: npx playwright install chromium');
    console.error('---');
    console.error(String(err?.message ?? err).split('\n').slice(0, 6).join('\n'));
    process.exit(3);
  }
} else {
  const pp = await importFrom('puppeteer');
  const puppeteer = pp?.default ?? pp;
  if (puppeteer?.launch) {
    browser = await puppeteer.launch();
  } else {
    console.error('No renderer found in this project. Install one from the project root:');
    console.error('  npm i -D playwright && npx playwright install chromium');
    process.exit(2);
  }
}

const page = await browser.newPage();
if (page.setViewportSize) await page.setViewportSize({ width, height }); // playwright
else await page.setViewport({ width, height });                          // puppeteer
await page.goto(url);
await new Promise(r => setTimeout(r, 1200)); // let fonts, JS, and runtime CSS settle
await page.screenshot({ path: out, fullPage: Boolean(flags.full) });
await browser.close();
console.log(`saved ${out} (${width}x${height}${flags.full ? ', full page' : ''})`);
