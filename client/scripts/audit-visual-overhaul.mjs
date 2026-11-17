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

async function audit() {
  console.log('[Audit] Starting Vite test server...');
  const server = await createServer({
    root: CLIENT_DIR,
    server: { port: 5188, host: '127.0.0.1' },
  });
  await server.listen();
  console.log('[Audit] Vite running on http://127.0.0.1:5188');

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop Audit (1440x900)
    console.log('[Audit] Testing Desktop Viewport (1440x900)...');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://127.0.0.1:5188', { waitUntil: 'networkidle' });

    // Verify Hero H1
    const h1Text = await page.locator('#hero-section h1').innerText();
    console.log('[Audit] Hero H1 Text:', h1Text);

    // Verify 3 Floating Depth Badges in Hero Stage
    const badgeTalk = await page.getByText('>75% HABLA ACTIVA').first().isVisible();
    const badgeVoice = await page.getByText('VOICE LAB 24/7').first().isVisible();
    const badgeRecast = await page.getByText('RECASTING EN VIVO').first().isVisible();
    console.log('[Audit] Hero 3D Badges visible:', { badgeTalk, badgeVoice, badgeRecast });

    // Verify 3D Bento Slabs in Ch. 1
    const ch1Slabs = await page.locator('#chapter-1-model .slab-3d-dark, #chapter-1-model .slab-3d-light').count();
    console.log('[Audit] Ch. 1 3D Bento Slabs count:', ch1Slabs);

    // Verify Ch. 2 Simulator Slab
    const ch2Slab = await page.locator('#chapter-2-lab .slab-3d-dark').count();
    console.log('[Audit] Ch. 2 Simulator 3D Slabs count:', ch2Slab);

    // Verify Ch. 3 Pricing Plans
    const ch3Slabs = await page.locator('#chapter-3-plans .slab-3d-dark').count();
    console.log('[Audit] Ch. 3 Pricing Plan Slabs count:', ch3Slabs);

    // Verify Horizontal Overflow on Desktop
    const desktopOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log('[Audit] Desktop Horizontal Overflow (>1440px):', desktopOverflow);

    // Verify Emoji scan on rendered text
    const emojiScan = await page.evaluate(() => {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      const text = document.body.innerText;
      const matches = text.split('\n').filter((l) => emojiRegex.test(l));
      return matches;
    });
    console.log('[Audit] Rendered DOM Emoji Matches count:', emojiScan.length);
    if (emojiScan.length > 0) {
      console.log('[Audit] Sample emoji lines:', emojiScan.slice(0, 5));
    }

    // Take Desktop Screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-landing-3d.png'), fullPage: false });
    console.log('[Audit] Saved desktop-landing-3d.png');

    await page.close();

    // 2. Mobile Audit (390x844 - iPhone 14/15/16)
    console.log('[Audit] Testing Mobile Viewport (390x844)...');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto('http://127.0.0.1:5188', { waitUntil: 'networkidle' });

    // Verify Mobile Horizontal Overflow
    const mobileOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log('[Audit] Mobile Horizontal Overflow (>390px):', mobileOverflow);

    // Take Mobile Screenshot
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-landing-3d.png'), fullPage: false });
    console.log('[Audit] Saved mobile-landing-3d.png');

    await mobilePage.close();

    console.log('[Audit] Visual Audit Completed Successfully!');
  } finally {
    await browser.close();
    await server.close();
  }
}

audit().catch((err) => {
  console.error('[Audit] Error:', err);
  process.exit(1);
});
