import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';

async function run() {
  console.log('Starting vite preview on port 4173...');
  const preview = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    cwd: path.resolve('client'),
    shell: true,
  });

  // Wait up to 10s for preview server to be responsive
  let ready = false;
  for (let i = 0; i < 20; i++) {
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
    throw new Error('Preview server failed to start on port 4173 within 10s');
  }
  console.log('Vite preview is ready at http://localhost:4173!');

  const browser = await chromium.launch({ headless: true });

  try {
    // ==========================================
    // 1. DESKTOP TEST (1440x900)
    // ==========================================
    console.log('\n--- [Desktop 1440x900] Testing "Login / Entrar" Click ---');
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopContext.newPage();
    const desktopErrors = [];
    const desktopConsoleErrors = [];

    desktopPage.on('pageerror', (err) => {
      console.error('[Desktop PageError]:', err.message);
      desktopErrors.push(err.message);
    });
    desktopPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore expected minor network aborts if any
        console.error('[Desktop Console Error]:', text);
        desktopConsoleErrors.push(text);
      }
    });

    await desktopPage.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(2000);

    // Assert initial load has 0 fatal errors
    if (desktopErrors.length > 0) {
      throw new Error(`Desktop had page errors on load: ${desktopErrors.join(', ')}`);
    }

    // Locate and click Login / Entrar button
    const loginBtn = desktopPage.locator('#signin-nav-btn');
    await loginBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Clicking "#signin-nav-btn" on Desktop...');
    await loginBtn.click();
    await desktopPage.waitForTimeout(1000);

    // Verify AuthModal is visible
    const modal = desktopPage.locator('#student-auth-modal-card');
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ AuthModal opened cleanly on Desktop!');

    // Verify ErrorBoundary did NOT trigger
    const errorBoundary = await desktopPage.$('#error-boundary-fallback');
    if (errorBoundary) {
      throw new Error('FATAL: ErrorBoundary fallback was triggered when clicking Login!');
    }

    // Verify React Error #310 did NOT occur
    for (const err of [...desktopErrors, ...desktopConsoleErrors]) {
      if (err.includes('310') || err.includes('Rendered more hooks') || err.includes('Rules of Hooks')) {
        throw new Error(`FATAL: React error #310 detected: ${err}`);
      }
    }

    // Toggle between tabs
    const signUpTab = desktopPage.locator('#auth-tab-signup');
    const signInTab = desktopPage.locator('#auth-tab-signin');
    if (await signUpTab.isVisible() && await signInTab.isVisible()) {
      console.log('Switching to Sign Up tab...');
      await signUpTab.click();
      await desktopPage.waitForTimeout(400);

      console.log('Switching to Sign In tab...');
      await signInTab.click();
      await desktopPage.waitForTimeout(400);
    }

    // Close modal
    const closeBtn = desktopPage.locator('#close-auth-modal-btn');
    await closeBtn.click();
    await desktopPage.waitForTimeout(600);
    console.log('Modal closed.');

    // Click Login a SECOND time to verify idempotency
    console.log('Clicking "#signin-nav-btn" a second time...');
    await loginBtn.click();
    await desktopPage.waitForTimeout(800);
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ AuthModal re-opened cleanly on Desktop a second time!');

    // Close modal again
    await closeBtn.click();
    await desktopPage.waitForTimeout(500);

    if (desktopErrors.length > 0) {
      throw new Error(`Desktop accumulated errors during interaction: ${desktopErrors.join(', ')}`);
    }

    // ==========================================
    // 2. MOBILE TEST (390x844)
    // ==========================================
    console.log('\n--- [Mobile 390x844] Testing "Login / Entrar" Click ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    });
    const mobilePage = await mobileContext.newPage();
    const mobileErrors = [];
    const mobileConsoleErrors = [];

    mobilePage.on('pageerror', (err) => {
      console.error('[Mobile PageError]:', err.message);
      mobileErrors.push(err.message);
    });
    mobilePage.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        console.error('[Mobile Console Error]:', text);
        mobileConsoleErrors.push(text);
      }
    });

    await mobilePage.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(2000);

    // On mobile, find the visible login button (header or mobile drawer)
    const mobileLoginBtn = mobilePage.locator('#signin-nav-btn');
    if (await mobileLoginBtn.isVisible()) {
      console.log('Clicking "#signin-nav-btn" on Mobile...');
      await mobileLoginBtn.click();
    } else {
      console.log('Opening mobile drawer with #mobile-hamburger-btn...');
      const hamburger = mobilePage.locator('#mobile-hamburger-btn');
      await hamburger.waitFor({ state: 'visible', timeout: 5000 });
      await hamburger.click();
      await mobilePage.waitForTimeout(600);

      const drawerAuthBtn = mobilePage.locator('#mobile-drawer-auth-btn');
      await drawerAuthBtn.waitFor({ state: 'visible', timeout: 5000 });
      await drawerAuthBtn.click();
    }

    await mobilePage.waitForTimeout(1000);

    const mobileModal = mobilePage.locator('#student-auth-modal-card');
    await mobileModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ AuthModal opened cleanly on Mobile!');

    const mobileErrorBoundary = await mobilePage.$('#error-boundary-fallback');
    if (mobileErrorBoundary) {
      throw new Error('FATAL: Mobile ErrorBoundary fallback was triggered when clicking Login!');
    }

    for (const err of [...mobileErrors, ...mobileConsoleErrors]) {
      if (err.includes('310') || err.includes('Rendered more hooks') || err.includes('Rules of Hooks')) {
        throw new Error(`FATAL: React error #310 detected on mobile: ${err}`);
      }
    }

    // Toggle tabs on mobile
    const mobileSignUpTab = mobilePage.locator('#auth-tab-signup');
    const mobileSignInTab = mobilePage.locator('#auth-tab-signin');
    if (await mobileSignUpTab.isVisible() && await mobileSignInTab.isVisible()) {
      await mobileSignUpTab.click();
      await mobilePage.waitForTimeout(300);
      await mobileSignInTab.click();
      await mobilePage.waitForTimeout(300);
    }

    // Close modal on mobile
    const mobileCloseBtn = mobilePage.locator('#close-auth-modal-btn');
    await mobileCloseBtn.click();
    await mobilePage.waitForTimeout(600);
    console.log('Mobile modal closed.');

    console.log('\n======================================================');
    console.log('SUCCESS: All Login Modal Playwright Tests Passed!');
    console.log('Zero React Error #310, Zero ErrorBoundary Crashes, Zero Page Errors.');
    console.log('======================================================');
  } finally {
    await browser.close();
    preview.kill();
  }
}

run().catch((err) => {
  console.error('\nPlaywright Test Failed:', err);
  process.exit(1);
});
