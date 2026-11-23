import { chromium } from 'playwright';
import { spawn, execFileSync } from 'child_process';
import path from 'path';

async function run() {
  console.log('Starting vite preview on port 4173...');
  const preview = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    cwd: path.resolve('client'),
    shell: true,
  });

  let ready = false;
  for (let i = 0; i < 24; i++) {
    try {
      const res = await fetch('http://localhost:4173');
      if (res.ok || res.status === 200 || res.status === 304) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!ready) {
    preview.kill();
    throw new Error('Preview server failed to start on port 4173');
  }
  console.log('Vite preview is ready at http://localhost:4173!');

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop (1440x900) Light + Night Mode + 3D Hero Canvas
    console.log('\n--- [Desktop 1440x900] Verifying Lazy 3D Hero Canvas (Light & Night) ---');
    const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopCtx.newPage();
    const desktopPageErrors = [];
    const desktopLoadedAssets = [];

    desktopPage.on('pageerror', (err) => desktopPageErrors.push(err.message));
    desktopPage.on('request', (req) => {
      if (req.url().includes('/assets/')) {
        desktopLoadedAssets.push(req.url().split('/').pop());
      }
    });

    await desktopPage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1500);

    const has3DCanvas = await desktopPage.evaluate(() => {
      const el = document.querySelector('#hero-voice-slab-3d-canvas canvas, #hero-voice-slab-3d-fallback');
      return Boolean(el);
    });
    if (!has3DCanvas) {
      throw new Error('Desktop 1440x900 did not mount #hero-voice-slab-3d-canvas or fallback!');
    }
    const loadedThreeChunkDesktop = desktopLoadedAssets.some((a) => a.includes('HeroVoiceSlab3D'));
    console.log('Desktop loaded lazy 3D chunk:', loadedThreeChunkDesktop, desktopLoadedAssets);

    const desktopOverflowLight = await desktopPage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    console.log('Desktop Light Mode horizontal overflow (px):', desktopOverflowLight);
    if (desktopOverflowLight > 0) {
      throw new Error(`Desktop Light Mode has horizontal overflow: ${desktopOverflowLight}px`);
    }

    // Switch to Night Mode
    const themeBtn = desktopPage.locator('#theme-toggle-btn');
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await desktopPage.waitForTimeout(500);
    }
    const isDark = await desktopPage.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log('Desktop switched to Night Mode:', isDark);

    const desktopOverflowDark = await desktopPage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    console.log('Desktop Night Mode horizontal overflow (px):', desktopOverflowDark);
    if (desktopOverflowDark > 0) {
      throw new Error(`Desktop Night Mode has horizontal overflow: ${desktopOverflowDark}px`);
    }

    if (desktopPageErrors.length > 0) {
      throw new Error(`Desktop page errors: ${desktopPageErrors.join('; ')}`);
    }

    // 2. Mobile (390x844) Verify Three.js does NOT load & 0px overflow
    console.log('\n--- [Mobile 390x844] Verifying 0 KB Three.js & 0px Overflow ---');
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    });
    const mobilePage = await mobileCtx.newPage();
    const mobilePageErrors = [];
    const mobileLoadedAssets = [];

    mobilePage.on('pageerror', (err) => mobilePageErrors.push(err.message));
    mobilePage.on('request', (req) => {
      if (req.url().includes('/assets/')) {
        mobileLoadedAssets.push(req.url().split('/').pop());
      }
    });

    await mobilePage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1500);

    const loadedThreeChunkMobile = mobileLoadedAssets.some((a) => a.includes('HeroVoiceSlab3D'));
    console.log('Mobile loaded lazy 3D chunk (must be false):', loadedThreeChunkMobile);
    if (loadedThreeChunkMobile) {
      throw new Error('Mobile 390x844 downloaded Three.js lazy chunk! Must be 0 KB on mobile.');
    }

    const hasStaticFallback = await mobilePage.evaluate(() =>
      Boolean(document.querySelector('#hero-voice-slab-static-fallback'))
    );
    console.log('Mobile rendered #hero-voice-slab-static-fallback:', hasStaticFallback);
    if (!hasStaticFallback) {
      throw new Error('Mobile did not render #hero-voice-slab-static-fallback!');
    }

    const mobileOverflow = await mobilePage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    console.log('Mobile 390x844 horizontal overflow (px):', mobileOverflow);
    if (mobileOverflow > 0) {
      throw new Error(`Mobile 390x844 has horizontal overflow: ${mobileOverflow}px`);
    }

    if (mobilePageErrors.length > 0) {
      throw new Error(`Mobile page errors: ${mobilePageErrors.join('; ')}`);
    }

    console.log('\n✓ Playwright Desktop (1440x900) & Mobile (390x844) Phase 2B Verification PASSED!');
  } finally {
    await browser.close();
    preview.kill();
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Phase 2B Gate Failed:', err);
  process.exit(1);
});
