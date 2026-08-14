#!/usr/bin/env node
// Render a page and screenshot it so the model can SEE its own output.
// Usage: node screenshot.mjs <file.html | http(s)://url> [out.png] [--width=1280] [--height=800] [--full]
// Needs playwright (or puppeteer) in the project: npm i -D playwright && npx playwright install chromium
import { pathToFileURL } from 'node:url';

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
const url = /^https?:\/\//.test(target) ? target : pathToFileURL(target).href;
const out = positional[1] ?? 'screenshot.png';
const width = Number(flags.width ?? 1280);
const height = Number(flags.height ?? 800);

async function launch() {
  try { const { chromium } = await import('playwright'); return chromium.launch(); } catch {}
  try { const p = await import('puppeteer'); return p.default.launch(); } catch {}
  console.error('No renderer found. Install one: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}

const browser = await launch();
const page = await browser.newPage();
if (page.setViewportSize) await page.setViewportSize({ width, height }); // playwright
else await page.setViewport({ width, height });                          // puppeteer
await page.goto(url);
await new Promise(r => setTimeout(r, 1200)); // let fonts, JS, and runtime CSS settle
await page.screenshot({ path: out, fullPage: Boolean(flags.full) });
await browser.close();
console.log(`saved ${out} (${width}x${height}${flags.full ? ', full page' : ''})`);
