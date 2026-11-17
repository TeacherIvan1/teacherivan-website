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
  console.log('[Audit Full Rollout] Starting Vite server...');
  const server = await createServer({
    root: CLIENT_DIR,
    server: { port: 5225, host: '127.0.0.1' },
  });
  await server.listen();
  console.log('[Audit Full Rollout] Vite running at http://127.0.0.1:5225');

  const browser = await chromium.launch({ headless: true });
  const failedRequests = [];
  const pageErrors = [];

  try {
    // 1. Desktop Audit (1440x900)
    console.log('[Audit Full Rollout] Testing Desktop 1440x900...');
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    desktopPage.on('requestfailed', (req) => {
      // Ignore websocket or backend api polling (when server is offline)
      if (!req.url().includes('ws://') && !req.url().includes('wss://') && !req.url().includes(':3001') && !req.url().includes('/api/')) {
        console.error(`[Desktop Failed Request] ${req.url()}: ${req.failure()?.errorText}`);
        failedRequests.push(req.url());
      }
    });

    desktopPage.on('pageerror', (err) => {
      console.error('[Desktop Page Error]', err.message);
      pageErrors.push(err.message);
    });

    await desktopPage.goto('http://127.0.0.1:5225', { waitUntil: 'networkidle' });

    // Check horizontal overflow
    const desktopOverflow = await desktopPage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`[Audit Full Rollout] Desktop Horizontal Overflow: ${desktopOverflow} (scrollWidth: ${await desktopPage.evaluate(() => document.documentElement.scrollWidth)}, innerWidth: 1440)`);

    // Verify brand lockup
    const brandLockup = await desktopPage.waitForSelector('[data-testid="official-brand-lockup"]', { timeout: 8000 });
    console.log('[Audit Full Rollout] Official brand lockup found:', !!brandLockup);

    // Verify logo image
    const logoImg = await desktopPage.$('[data-testid="official-brand-lockup"] img');
    const logoSrc = await logoImg.evaluate((el) => el.src);
    const logoNaturalWidth = await logoImg.evaluate((el) => el.naturalWidth);
    console.log(`[Audit Full Rollout] Logo src: ${logoSrc}, naturalWidth: ${logoNaturalWidth}`);

    // Take screenshot
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-rollout-verified.png') });
    console.log('[Audit Full Rollout] Saved: desktop-rollout-verified.png');
    await desktopPage.close();

    // 2. Mobile Audit (390x844 - iPhone 12/13/14)
    console.log('[Audit Full Rollout] Testing Mobile 390x844...');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });

    mobilePage.on('requestfailed', (req) => {
      if (!req.url().includes('ws://') && !req.url().includes('wss://') && !req.url().includes(':3001') && !req.url().includes('/api/')) {
        console.error(`[Mobile Failed Request] ${req.url()}: ${req.failure()?.errorText}`);
        failedRequests.push(req.url());
      }
    });

    mobilePage.on('pageerror', (err) => {
      console.error('[Mobile Page Error]', err.message);
      pageErrors.push(err.message);
    });

    await mobilePage.goto('http://127.0.0.1:5225', { waitUntil: 'networkidle' });

    // Check mobile horizontal overflow
    const mobileOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    console.log(`[Audit Full Rollout] Mobile Horizontal Overflow: ${mobileOverflow} (scrollWidth: ${scrollWidth}, innerWidth: 390)`);

    // Mobile Brand Lockup
    const mobileLockup = await mobilePage.waitForSelector('[data-testid="official-brand-lockup"]', { timeout: 8000 });
    console.log('[Audit Full Rollout] Mobile brand lockup found:', !!mobileLockup);

    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-rollout-verified.png') });
    console.log('[Audit Full Rollout] Saved: mobile-rollout-verified.png');
    await mobilePage.close();

    console.log(`[Audit Full Rollout] Complete. Failed Requests: ${failedRequests.length}, Page Errors: ${pageErrors.length}, Overflows: ${desktopOverflow || mobileOverflow}`);

    if (failedRequests.length > 0 || pageErrors.length > 0 || desktopOverflow || mobileOverflow) {
      console.error('[Audit Full Rollout] FAILED VERIFICATION');
      process.exit(1);
    }

    console.log('[Audit Full Rollout] PASSED ALL GATES WITH 0 DEFECTS!');
  } finally {
    await browser.close();
    await server.close();
  }
}

run().catch((err) => {
  console.error('[Audit Full Rollout] Error:', err);
  process.exit(1);
});