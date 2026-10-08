// Render one HTML file in headless Chromium: print console output and page errors,
// optionally save a screenshot. Usage: node render.mjs page.html out.png|- WIDTHxHEIGHT
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const [, , file, shot, size = '720x360'] = process.argv;
const [width, height] = size.split('x').map(Number);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  // Browser chatter that would only repeat what the page reports itself (see the guide's note).
  const noise = /React DevTools|in-browser Babel transformer|react-devtools|Failed to load resource|^Refused to execute/;
  page.on('console', (m) => {
    if (noise.test(m.text())) return;
    console.log((m.type() === 'log' ? '' : `[${m.type()}] `) + m.text());
  });
  page.on('pageerror', (e) => console.log(`[page error] ${e.message}`));
  await page.goto('file://' + file, { waitUntil: 'load' });
  // A page may set window.__ready = false and later true when async work is finished.
  await page.waitForFunction(() => window.__ready !== false, null, { timeout: 15000 });
  await page.waitForTimeout(150);
  if (shot && shot !== '-') await page.screenshot({ path: shot });
} finally {
  await browser.close();
}
