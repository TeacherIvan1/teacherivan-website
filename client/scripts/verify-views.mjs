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
  console.log('Starting Vite server...');
  const server = await createServer({
    root: CLIENT_DIR,
    server: { port: 5199, host: '127.0.0.1' },
  });
  await server.listen();
  console.log('Vite server running at http://127.0.0.1:5199');

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop Viewport (1440x900)
    console.log('Testing Desktop 1440x900...');
    const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pageDesktop.goto('http://127.0.0.1:5199', { waitUntil: 'networkidle' });

    // Dismiss welcome assessment modal if open
    const modalCloseBtn = await pageDesktop.$('#spoken-assessment-modal-backdrop button');
    if (modalCloseBtn) {
      await modalCloseBtn.click();
      await pageDesktop.waitForTimeout(300);
    }

    // Capture Overview
    await pageDesktop.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-01-overview.png'), fullPage: false });
    console.log('Saved desktop-01-overview.png');

    // Click Resources
    await pageDesktop.click('#nav-tab-resources');
    await pageDesktop.waitForTimeout(400);
    await pageDesktop.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-02-resources.png'), fullPage: false });
    console.log('Saved desktop-02-resources.png');

    // Click Games
    await pageDesktop.click('#nav-tab-games');
    await pageDesktop.waitForTimeout(400);
    await pageDesktop.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-03-games.png'), fullPage: false });
    console.log('Saved desktop-03-games.png');

    // Click Weekly Report Modal Button
    await pageDesktop.click('#dashboard-open-report-btn');
    await pageDesktop.waitForTimeout(400);
    await pageDesktop.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-04-weekly-report-modal.png'), fullPage: false });
    console.log('Saved desktop-04-weekly-report-modal.png');

    // Close Modal
    await pageDesktop.click('#weekly-report-modal-backdrop button');
    await pageDesktop.waitForTimeout(300);

    // Click Methodology
    await pageDesktop.click('#nav-tab-methodology');
    await pageDesktop.waitForTimeout(400);
    await pageDesktop.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-05-methodology.png'), fullPage: false });
    console.log('Saved desktop-05-methodology.png');

    await pageDesktop.close();

    // 2. Mobile Viewport (375x812 - iPhone X/12 Mini)
    console.log('Testing Mobile 375x812...');
    const pageMobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await pageMobile.goto('http://127.0.0.1:5199', { waitUntil: 'networkidle' });

    // Dismiss welcome assessment modal if open
    const mobileCloseBtn = await pageMobile.$('#spoken-assessment-modal-backdrop button');
    if (mobileCloseBtn) {
      await mobileCloseBtn.click();
      await pageMobile.waitForTimeout(300);
    }

    // Capture Mobile Header & Overview
    await pageMobile.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-01-overview.png'), fullPage: false });
    console.log('Saved mobile-01-overview.png');

    // Tap Mobile Resources Tab
    await pageMobile.click('#mobile-nav-tab-resources');
    await pageMobile.waitForTimeout(400);
    await pageMobile.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-02-resources.png'), fullPage: false });
    console.log('Saved mobile-02-resources.png');

    // Tap Mobile Games Tab
    await pageMobile.click('#mobile-nav-tab-games');
    await pageMobile.waitForTimeout(400);
    await pageMobile.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-03-games.png'), fullPage: false });
    console.log('Saved mobile-03-games.png');

    await pageMobile.close();
    console.log('All visual verification screenshots captured successfully!');
  } finally {
    await browser.close();
    await server.close();
  }
}

run().catch((err) => {
  console.error('Visual verification failed:', err);
  process.exit(1);
});
