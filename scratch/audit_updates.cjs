const { chromium } = require('playwright');
const assert = require('assert');

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  console.log('=== STARTING AUTOMATED VALIDATION SUITE ===\n');

  try {
    // -------------------------------------------------------------------------
    // TEST 1: 360x800 Viewport Audit (Mobile Header, Zero Overflow, Auth Modal)
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: 360x800 Viewport Audit ---');
    const context360 = await browser.newContext({ viewport: { width: 360, height: 800 } });
    const page360 = await context360.newPage();
    await page360.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page360.waitForTimeout(1000);

    // 1.1 Check 360px horizontal overflow
    const overflow360 = await page360.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;
      return { docW, scrollW, hasOverflow: scrollW > docW };
    });
    console.log('360px Page overflow status:', overflow360);
    assert.strictEqual(overflow360.hasOverflow, false, '360px viewport must have zero horizontal overflow');

    // 1.2 Check header elements visibility on 360px
    const headerInfo = await page360.evaluate(() => {
      const header = document.getElementById('app-header');
      const signinBtn = document.getElementById('signin-nav-btn');
      const langToggle = document.getElementById('header-lang-toggle');
      const rect = signinBtn?.getBoundingClientRect();
      const docW = document.documentElement.clientWidth;

      return {
        headerVisible: !!header,
        signinBtnText: signinBtn?.innerText?.trim(),
        signinBtnVisible: !!signinBtn && rect && rect.right <= docW && rect.left >= 0,
        signinBtnRight: rect ? Math.round(rect.right) : null,
        docWidth: docW,
        langToggleVisible: !!langToggle,
      };
    });
    console.log('360px Header audit:', headerInfo);
    assert.ok(headerInfo.signinBtnVisible, 'Sign In / Entrar button must be fully visible within 360px width without clipping');

    // 1.3 Check Auth Modal (Sign In tab: ONLY username and password)
    await page360.click('#signin-nav-btn');
    await page360.waitForTimeout(500);

    const signinModalInfo = await page360.evaluate(() => {
      const modal = document.getElementById('student-auth-modal-dialog');
      const usernameInput = document.getElementById('auth-signin-username-input');
      const passwordInput = document.getElementById('auth-signin-password-input');
      const emailInput = document.getElementById('auth-signin-email-input');
      const forgotLink = document.getElementById('auth-forgot-password-link');
      const submitBtn = document.getElementById('auth-signin-submit-btn');

      return {
        modalVisible: !!modal,
        hasUsernameInput: !!usernameInput,
        hasPasswordInput: !!passwordInput,
        hasEmailInput: !!emailInput, // Must be FALSE in Sign In tab
        hasForgotLink: !!forgotLink,
        submitBtnText: submitBtn?.innerText?.trim(),
      };
    });
    console.log('Sign In Tab inputs:', signinModalInfo);
    assert.ok(signinModalInfo.hasUsernameInput, 'Sign In tab must have Username input');
    assert.ok(signinModalInfo.hasPasswordInput, 'Sign In tab must have Password input');
    assert.strictEqual(signinModalInfo.hasEmailInput, false, 'Sign In tab must NOT display email input (ONLY username + password)');
    assert.ok(signinModalInfo.hasForgotLink, 'Sign In tab must have Forgot Password link');

    // 1.4 Check Forgot Password / Password Recovery Flow
    await page360.click('#auth-forgot-password-link');
    await page360.waitForTimeout(500);

    const recoverModalInfo = await page360.evaluate(() => {
      const userInput = document.getElementById('auth-recover-username-input');
      const contactInput = document.getElementById('auth-recover-contact-input');
      const newPassInput = document.getElementById('auth-recover-newpassword-input');
      const submitBtn = document.getElementById('auth-recover-submit-btn');
      const whatsappLink = document.getElementById('auth-recover-whatsapp-link');

      return {
        hasUserInput: !!userInput,
        hasContactInput: !!contactInput,
        hasNewPassInput: !!newPassInput,
        submitText: submitBtn?.innerText?.trim(),
        hasWhatsappLink: !!whatsappLink && whatsappLink.getAttribute('href').includes('59172878330'),
      };
    });
    console.log('Recover Password Form:', recoverModalInfo);
    assert.ok(recoverModalInfo.hasUserInput, 'Recover view must have username input');
    assert.ok(recoverModalInfo.hasContactInput, 'Recover view must have registered contact input');
    assert.ok(recoverModalInfo.hasNewPassInput, 'Recover view must have new password input');
    assert.ok(recoverModalInfo.hasWhatsappLink, 'Recover view must include WhatsApp direct assistance link');

    // Switch back to Sign In and log in as ivan
    await page360.click('#auth-recover-back-btn');
    await page360.waitForTimeout(300);

    await page360.fill('#auth-signin-username-input', 'ivan');
    await page360.fill('#auth-signin-password-input', 'IvanAdmin2026!');
    await page360.click('#auth-signin-submit-btn');
    await page360.waitForTimeout(1000);

    // Verify logged-in state on 360px header: @ivan badge, Dev toggle, and Sign Out button
    const loggedInHeaderInfo = await page360.evaluate(() => {
      const userBadge = document.getElementById('student-profile-badge');
      const signOutBtn = document.getElementById('sign-out-btn');
      const devToggleBtn = document.getElementById('admin-dev-toggle-btn');
      const docW = document.documentElement.clientWidth;
      const signOutRect = signOutBtn?.getBoundingClientRect();

      return {
        userBadgeText: userBadge?.innerText?.trim(),
        hasDevToggle: !!devToggleBtn,
        devToggleText: devToggleBtn?.innerText?.trim(),
        signOutVisible: !!signOutBtn && signOutRect && signOutRect.right <= docW,
        signOutRight: signOutRect ? Math.round(signOutRect.right) : null,
        docWidth: docW,
      };
    });
    console.log('Logged-in 360px Header:', loggedInHeaderInfo);
    assert.ok(loggedInHeaderInfo.userBadgeText.includes('ivan'), 'Badge must display username @ivan');
    assert.ok(loggedInHeaderInfo.hasDevToggle, 'Admin user must have compact Dev toggle');
    assert.ok(loggedInHeaderInfo.signOutVisible, 'Sign out button must fit completely within 360px viewport without clipping');
    assert.strictEqual(loggedInHeaderInfo.devToggleText.includes('🛠️'), false, 'Dev toggle must have NO emoji');

    await context360.close();

    // -------------------------------------------------------------------------
    // TEST 2: 390x844 Viewport Audit
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: 390x844 Viewport Audit ---');
    const context390 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page390 = await context390.newPage();
    await page390.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page390.waitForTimeout(1000);

    const overflow390 = await page390.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;
      return { docW, scrollW, hasOverflow: scrollW > docW };
    });
    console.log('390px Page overflow status:', overflow390);
    assert.strictEqual(overflow390.hasOverflow, false, '390px viewport must have zero horizontal overflow');
    await context390.close();

    // -------------------------------------------------------------------------
    // TEST 3: Tutor Selector (No Emojis) & Emma 2D Avatar Stage SVG Rig
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Tutor Persona Selector & 2D Avatar Stage Rig ---');
    const contextDesktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await contextDesktop.newPage();
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Scroll to Voice Simulator
    await page.evaluate(() => {
      document.getElementById('flagship-simulator-section')?.scrollIntoView();
    });
    await page.waitForTimeout(600);

    // Check tutor buttons text (must be strictly Teacher Ivan and Emma, NO emojis)
    const tutorButtons = await page.evaluate(() => {
      const ivanBtn = document.getElementById('tutor-persona-ivan-btn');
      const emmaBtn = document.getElementById('tutor-persona-emma-btn');
      return {
        ivanText: ivanBtn?.innerText?.trim(),
        emmaText: emmaBtn?.innerText?.trim(),
        ivanHasEmoji: ivanBtn?.innerText?.includes('👨') || ivanBtn?.innerText?.includes('🏫'),
        emmaHasEmoji: emmaBtn?.innerText?.includes('👩') || emmaBtn?.innerText?.includes('🏫'),
      };
    });
    console.log('Tutor selector buttons:', tutorButtons);
    assert.strictEqual(tutorButtons.ivanHasEmoji, false, 'Teacher Ivan button must not contain emojis');
    assert.strictEqual(tutorButtons.emmaHasEmoji, false, 'Emma button must not contain emojis');
    assert.ok(tutorButtons.ivanText.includes('Teacher Ivan'));
    assert.ok(tutorButtons.emmaText.includes('Emma'));

    // Check initial SVG in TutorAvatarStage (Teacher Ivan)
    const initialSvg = await page.evaluate(() => {
      const stage = document.getElementById('tutor-avatar-stage');
      const svg = stage?.querySelector('svg');
      return {
        hasSvg: !!svg,
        avatarAria: stage?.querySelector('.rig-character-wrapper')?.getAttribute('aria-label'),
      };
    });
    console.log('Initial stage avatar:', initialSvg);
    assert.ok(initialSvg.hasSvg, 'Stage must contain SVG markup');
    assert.ok(initialSvg.avatarAria.includes('Teacher Ivan'), 'Initial avatar must be Teacher Ivan');

    // Click Emma button and verify immediate switch to Emma's SVG rig
    await page.click('#tutor-persona-emma-btn');
    await page.waitForTimeout(600);

    const emmaSvg = await page.evaluate(() => {
      const stage = document.getElementById('tutor-avatar-stage');
      const svg = stage?.querySelector('svg');
      const aria = stage?.querySelector('.rig-character-wrapper')?.getAttribute('aria-label');
      // Verify Emma specific layers or attributes
      return {
        hasSvg: !!svg,
        avatarAria: aria,
      };
    });
    console.log('Switched to Emma stage avatar:', emmaSvg);
    assert.ok(emmaSvg.avatarAria.includes('Emma'), 'Switched avatar must be Coach Emma');

    // -------------------------------------------------------------------------
    // TEST 4: Interactive Games Chibi SVG
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Interactive Games Chibi Mascot SVG ---');
    // Login to access games view
    await page.evaluate(() => {
      window.localStorage.setItem('teacher_ivan_auth_token', 'demo-token');
    });
    // Or navigate directly by dispatching store or clicking Sign In
    await page.click('#signin-nav-btn');
    await page.waitForTimeout(300);
    await page.fill('#auth-signin-username-input', 'ivan');
    await page.fill('#auth-signin-password-input', 'IvanAdmin2026!');
    await page.click('#auth-signin-submit-btn');
    await page.waitForTimeout(1000);

    // Click Resources & Games tab
    await page.click('#nav-tab-resources');
    await page.waitForTimeout(600);

    // Verify Chibi SVG in Games
    const gameChibiInfo = await page.evaluate(() => {
      const recastImg = document.querySelector('#interactive-games-view img');
      return {
        hasImg: !!recastImg,
        src: recastImg?.getAttribute('src'),
        alt: recastImg?.getAttribute('alt'),
        classes: recastImg?.getAttribute('class'),
      };
    });
    console.log('Interactive Games Chibi Image:', gameChibiInfo);
    assert.ok(gameChibiInfo.hasImg, 'Games view must render chibi avatar image');
    assert.ok(gameChibiInfo.src.includes('rig.svg'), 'Image src must point to .svg rig');
    assert.ok(gameChibiInfo.classes.includes('rounded-full'), 'Image must have rounded-full styling');

    // -------------------------------------------------------------------------
    // TEST 5: Mobile App Section & Download Modals
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Mobile App Download Section & Modals ---');
    // Return to Landing Page
    await page.click('#sign-out-btn');
    await page.waitForTimeout(500);

    const mobileAppSection = await page.evaluate(() => {
      const sec = document.getElementById('download-mobile-app-section');
      const androidBtn = document.getElementById('app-download-android-btn');
      const iosBtn = document.getElementById('app-download-ios-btn');
      return {
        hasSection: !!sec,
        hasAndroidBtn: !!androidBtn,
        hasIosBtn: !!iosBtn,
      };
    });
    console.log('Mobile App Download Section:', mobileAppSection);
    assert.ok(mobileAppSection.hasSection, 'Landing page must have download mobile app section');
    assert.ok(mobileAppSection.hasAndroidBtn, 'Section must have Android download button');
    assert.ok(mobileAppSection.hasIosBtn, 'Section must have iOS download button');

    // Click iOS Download and check modal
    await page.click('#app-download-ios-btn');
    await page.waitForTimeout(400);

    const iosModal = await page.evaluate(() => {
      const overlay = document.getElementById('ios-install-modal-overlay');
      const downloadLink = overlay?.querySelector('a[href*="teacher-ivan-ios.mobileconfig"]');
      return {
        modalVisible: !!overlay,
        hasConfigDownloadLink: !!downloadLink,
      };
    });
    console.log('iOS Download Modal:', iosModal);
    assert.ok(iosModal.modalVisible, 'Clicking iOS button must open iOS install guidance modal');
    assert.ok(iosModal.hasConfigDownloadLink, 'Modal must offer direct .mobileconfig download');

    console.log('\n=== ALL AUTOMATED VALIDATION CHECKS PASSED PERFECTLY ===\n');
    await contextDesktop.close();
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runAudit();
