import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { createServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIR = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.resolve(CLIENT_DIR, 'test-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('[Logo Audit] Starting Vite dev server...');
  const server = await createServer({
    root: CLIENT_DIR,
    server: { port: 5220, host: '127.0.0.1' },
  });
  await server.listen();
  console.log('[Logo Audit] Server running at http://127.0.0.1:5220');

  const browser = await chromium.launch({ headless: true });
  const pageErrors = [];

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (err) => {
      console.error('[Browser Error]', err.message);
      pageErrors.push(err.message);
    });

    await page.goto('http://127.0.0.1:5220', { waitUntil: 'networkidle' });

    // Verify brand lockup exists
    const brandLockup = await page.waitForSelector('[data-testid="official-brand-lockup"]', { timeout: 8000 });
    console.log('[Logo Audit] Official Brand Lockup visible:', !!brandLockup);

    // Verify logo image rendered with natural dimensions
    const logoImg = await page.$('[data-testid="official-brand-lockup"] img');
    const isLoaded = await logoImg.evaluate((img) => img.complete && img.naturalWidth > 0);
    const naturalWidth = await logoImg.evaluate((img) => img.naturalWidth);
    const naturalHeight = await logoImg.evaluate((img) => img.naturalHeight);
    const src = await logoImg.evaluate((img) => img.src);
    console.log(`[Logo Audit] Logo loaded: ${isLoaded}, src: ${src}, natural size: ${naturalWidth}x${naturalHeight}`);

    // Take screenshot of header brand lockup
    await brandLockup.screenshot({ path: path.join(SCREENSHOT_DIR, 'brand-lockup-navbar.png') });
    console.log('[Logo Audit] Saved brand-lockup-navbar.png');

    // Take overview screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live-client-header.png') });
    console.log('[Logo Audit] Saved live-client-header.png');

    // Test mobile viewport
    const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await pageMobile.goto('http://127.0.0.1:5220', { waitUntil: 'networkidle' });
    const mobileLockup = await pageMobile.waitForSelector('[data-testid="official-brand-lockup"]', { timeout: 8000 });
    await mobileLockup.screenshot({ path: path.join(SCREENSHOT_DIR, 'brand-lockup-mobile.png') });
    console.log('[Logo Audit] Saved brand-lockup-mobile.png');
    await pageMobile.close();

    console.log(`[Logo Audit] Audit completed with ${pageErrors.length} errors.`);
    if (pageErrors.length > 0) {
      process.exit(1);
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

run().catch((err) => {
  console.error('[Logo Audit] Failed:', err);
  process.exit(1);
});