import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import http from 'node:http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const BRAND_DIR = path.resolve(ROOT_DIR, 'brand-exploration');
const PREVIEWS_DIR = path.resolve(BRAND_DIR, 'previews');

if (!fs.existsSync(PREVIEWS_DIR)) {
  fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
}

// Simple static file server for brand-exploration directory
function createStaticServer(port = 5211) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    const filePath = path.join(BRAND_DIR, reqPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found: ' + reqPath);
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      console.log(`[Brand Audit] Server running at http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

async function runAudit() {
  const server = await createStaticServer(5211);
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    console.log('[Brand Audit] Navigating to http://127.0.0.1:5211 ...');
    await page.goto('http://127.0.0.1:5211', { waitUntil: 'networkidle' });

    // Wait for fonts and objects to load
    await page.waitForTimeout(1500);

    // 1. Verify Page Title & Header
    const title = await page.title();
    console.log('[Brand Audit] Page Title:', title);

    // 2. Verify all 4 direction sections exist
    const directions = ['a', 'b', 'c', 'd'];
    for (const d of directions) {
      const exists = await page.locator(`#dir-${d}`).isVisible();
      console.log(`[Brand Audit] Direction ${d.toUpperCase()} section visible:`, exists);
    }

    // 3. Verify all SVG objects loaded without 404
    const objectCount = await page.locator('object').count();
    console.log('[Brand Audit] Total embedded SVG object elements:', objectCount);

    // 4. Capture Overview Screenshot (Desktop 1440x900)
    await page.screenshot({
      path: path.join(PREVIEWS_DIR, '01-brand-dashboard-overview.png'),
      fullPage: false,
    });
    console.log('[Brand Audit] Saved 01-brand-dashboard-overview.png');

    // 5. Capture each direction's card
    for (const d of directions) {
      const card = page.locator(`#dir-${d}`);
      await card.screenshot({
        path: path.join(PREVIEWS_DIR, `direction-${d}-card.png`),
      });
      console.log(`[Brand Audit] Saved direction-${d}-card.png`);
    }

    // 6. Test Context Switcher: switch Direction A to Light Mode and Favicon Mode
    console.log('[Brand Audit] Testing Context Switcher on Direction A...');
    await page.locator('#dir-a .tab-btn:has-text("Light Paper")').click();
    await page.waitForTimeout(300);
    await page.locator('#stage-a').screenshot({
      path: path.join(PREVIEWS_DIR, 'direction-a-light-mode.png'),
    });
    console.log('[Brand Audit] Saved direction-a-light-mode.png');

    await page.locator('#dir-a .tab-btn:has-text("Live Website Header")').click();
    await page.waitForTimeout(300);
    await page.locator('#stage-a').screenshot({
      path: path.join(PREVIEWS_DIR, 'direction-a-navbar-mode.png'),
    });
    console.log('[Brand Audit] Saved direction-a-navbar-mode.png');

    await page.locator('#dir-a .tab-btn:has-text("Favicon Stress Test")').click();
    await page.waitForTimeout(300);
    await page.locator('#stage-a').screenshot({
      path: path.join(PREVIEWS_DIR, 'direction-a-favicon-stress.png'),
    });
    console.log('[Brand Audit] Saved direction-a-favicon-stress.png');

    await page.locator('#dir-a .tab-btn:has-text("Print Monochrome")').click();
    await page.waitForTimeout(300);
    await page.locator('#stage-a').screenshot({
      path: path.join(PREVIEWS_DIR, 'direction-a-print-worksheet.png'),
    });
    console.log('[Brand Audit] Saved direction-a-print-worksheet.png');

    // Reset Direction A to Dark
    await page.locator('#dir-a .tab-btn:has-text("Dark Studio")').click();

    // 7. Test Animation trigger on Direction A
    console.log('[Brand Audit] Testing Motionmaxxing Intro Sting button...');
    await page.locator('#dir-a .btn-anim').click();
    await page.waitForTimeout(200);
    const hasAnim = await page.locator('#stage-a').evaluate((el) => el.classList.contains('anim-active'));
    console.log('[Brand Audit] Animation class applied:', hasAnim);

    // 8. Capture Master Specifications Section
    await page.locator('#master-specs').screenshot({
      path: path.join(PREVIEWS_DIR, 'master-design-tokens-specs.png'),
    });
    console.log('[Brand Audit] Saved master-design-tokens-specs.png');

    console.log('[Brand Audit] Total Page Errors:', errors.length);
    if (errors.length > 0) {
      console.warn('[Brand Audit] Page Errors:', errors);
    } else {
      console.log('[Brand Audit] SUCCESS: Zero errors detected!');
    }
  } finally {
    await browser.close();
    server.close();
  }
}

runAudit().catch((err) => {
  console.error('[Brand Audit] Fatal Error:', err);
  process.exit(1);
});
