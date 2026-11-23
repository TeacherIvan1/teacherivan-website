import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.resolve(ROOT_DIR, 'client/dist');
const SERVER_PORT = 3001;
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

async function waitForHttp(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function scanDistForForbiddenTokens() {
  console.log('\n[1/7] Scanning client/dist/ for static AudioWorklet & zero blob:/secret leakage...');
  const workletFile = path.join(DIST_DIR, 'worklets/pcm-processor.js');
  assert.ok(fs.existsSync(workletFile), 'client/dist/worklets/pcm-processor.js must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'version.json')), 'client/dist/version.json must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'sw.js')), 'client/dist/sw.js must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'CNAME')), 'client/dist/CNAME must exist');

  const assetsDir = path.join(DIST_DIR, 'assets');
  const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
    assert.ok(
      !content.includes('createAudioWorkletBlobUrl'),
      `Bundle ${file} must not contain createAudioWorkletBlobUrl`
    );
    assert.ok(
      !content.includes('AIzaSy'),
      `Bundle ${file} must not contain any Google API key`
    );
    assert.ok(
      !content.includes('BEGIN PRIVATE KEY'),
      `Bundle ${file} must not contain any private key`
    );
    assert.ok(
      !content.includes('GOCSPX'),
      `Bundle ${file} must not contain any OAuth client secret`
    );
  }
  console.log('  ✔ Static worklet verified, zero blob worklets, zero secrets in client/dist/.');
}

async function runPlaywrightSuite() {
  scanDistForForbiddenTokens();

  console.log('\nStarting compiled server and Vite preview...');
  const serverProc = spawn('node', ['server/dist/index.js'], {
    cwd: ROOT_DIR,
    env: { ...process.env, PORT: String(SERVER_PORT), NODE_ENV: 'development' },
    stdio: 'pipe',
  });

  const viteBin = fs.existsSync(path.resolve(ROOT_DIR, 'node_modules/vite/bin/vite.js'))
    ? path.resolve(ROOT_DIR, 'node_modules/vite/bin/vite.js')
    : path.resolve(ROOT_DIR, 'client/node_modules/vite/bin/vite.js');

  const previewProc = spawn(
    'node',
    [viteBin, 'preview', '--port', String(PREVIEW_PORT), '--host', 'localhost'],
    {
      cwd: path.resolve(ROOT_DIR, 'client'),
      env: { ...process.env },
      stdio: 'pipe',
    }
  );

  let browser;
  try {
    await waitForHttp(`http://localhost:${SERVER_PORT}/api/health`);
    await waitForHttp(PREVIEW_URL);
    console.log('  ✔ Local server (3001) and Vite preview (4173) are live.');

    browser = await chromium.launch({
      headless: true,
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
      ],
    });

    const viewports = [
      { name: 'Desktop (1440×900)', width: 1440, height: 900, isMobile: false },
      { name: 'Mobile (390×844)', width: 390, height: 844, isMobile: true },
    ];
    const themes = ['light', 'dark'];

    for (const vp of viewports) {
      for (const theme of themes) {
        console.log(`\n=== Auditing ${vp.name} | Theme: ${theme.toUpperCase()} ===`);
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          permissions: ['microphone'],
        });
        const page = await context.newPage();

        const consoleErrors = [];
        const pageErrors = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            const text = msg.text();
            // Ignore external Google Identity Services (GIS) origin warning when previewing on localhost:4173
            if (
              !text.includes('accounts.google.com') &&
              !text.includes('[GSI_LOGGER]') &&
              !text.includes('status of 403') &&
              !text.includes('Failed to load resource: the server responded with a status of 401')
            ) {
              consoleErrors.push(text);
            }
          }
        });
        page.on('pageerror', (err) => {
          pageErrors.push(err.message);
        });

        await page.addInitScript((t) => {
          localStorage.setItem('ti_theme', t);
        }, theme);

        await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });

        // 1. Check horizontal overflow (0px drift) & 2-Font compliance on Landing Page
        const layoutAudit = await page.evaluate(() => {
          const docWidth = document.documentElement.clientWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          const footerGrid = document.getElementById('footer-4col-grid');
          const footerStyle = footerGrid ? window.getComputedStyle(footerGrid).gridTemplateColumns : '';
          return {
            overflowPx: Math.max(0, scrollWidth - docWidth),
            footerCols: footerStyle.split(' ').filter(Boolean).length,
          };
        });
        assert.equal(
          layoutAudit.overflowPx,
          0,
          `Expected 0px horizontal overflow on ${vp.name} (${theme}), got ${layoutAudit.overflowPx}px`
        );
        if (!vp.isMobile) {
          assert.equal(layoutAudit.footerCols, 4, 'Desktop footer must have 4 columns at 1440×900');
        } else {
          assert.equal(layoutAudit.footerCols, 1, 'Mobile footer must stack cleanly in 1 column at 390×844');
        }
        console.log(`  ✔ Layout & 4-Column Footer verified (${layoutAudit.footerCols} cols, 0px overflow).`);

        // 2. AudioWorklet & Microphone Smoke Check
        const workletCheck = await page.evaluate(async () => {
          const res = await fetch('/worklets/pcm-processor.js');
          const contentType = res.headers.get('content-type') || '';
          const text = await res.text();
          return {
            status: res.status,
            contentType,
            hasProcessor: text.includes('PcmCaptureProcessor') && text.includes("registerProcessor('pcm-processor'"),
          };
        });
        assert.equal(workletCheck.status, 200, '/worklets/pcm-processor.js must return 200 OK');
        assert.ok(
          workletCheck.contentType.includes('javascript'),
          `Expected JavaScript MIME type for /worklets/pcm-processor.js, got ${workletCheck.contentType}`
        );
        assert.ok(workletCheck.hasProcessor, 'pcm-processor.js must register PcmCaptureProcessor');

        // Also test AudioContext.audioWorklet.addModule('/worklets/pcm-processor.js') directly in the browser!
        const audioWorkletLoadOk = await page.evaluate(async () => {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          const ctx = new Ctx({ sampleRate: 16000 });
          try {
            await ctx.audioWorklet.addModule('/worklets/pcm-processor.js');
            const node = new AudioWorkletNode(ctx, 'pcm-processor');
            node.disconnect();
            await ctx.close();
            return true;
          } catch (e) {
            return String(e);
          }
        });
        assert.equal(
          audioWorkletLoadOk,
          true,
          `AudioContext.audioWorklet.addModule('/worklets/pcm-processor.js') failed: ${audioWorkletLoadOk}`
        );
        console.log('  ✔ AudioWorklet addModule("/worklets/pcm-processor.js") loaded and instantiated with 0 errors.');

        // 3. WhatsApp Pre-Filled URL Check
        const whatsappLinks = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll('a[href*="wa.me"]'));
          return anchors.map((a) => a.getAttribute('href') || '');
        });
        assert.ok(whatsappLinks.length >= 4, 'Expected at least 4 WhatsApp links on landing page');
        for (const href of whatsappLinks) {
          assert.ok(
            href.startsWith('https://wa.me/59172878330?text=') && href.length > 'https://wa.me/59172878330?text='.length,
            `Every WhatsApp link must be pre-filled with ?text=..., got: ${href}`
          );
        }
        console.log(`  ✔ All ${whatsappLinks.length} WhatsApp links match https://wa.me/59172878330?text=...`);

        // 4. Cookie Consent Banner & Conditional GA4 Loading
        const gaBeforeConsent = await page.evaluate(() => {
          return document.querySelectorAll('script[src*="googletagmanager.com"]').length;
        });
        assert.equal(gaBeforeConsent, 0, 'Zero googletagmanager.com scripts may exist before consent');
        await page.waitForSelector('#cookie-consent-banner', { state: 'visible' });

        // Click "Essential Only"
        await page.click('#cookie-essential-only-btn');
        await page.waitForSelector('#cookie-consent-banner', { state: 'hidden' });
        const afterEssential = await page.evaluate(() => {
          const scripts = document.querySelectorAll('script[src*="googletagmanager.com"]').length;
          const stored = JSON.parse(localStorage.getItem('ti_cookie_consent_v1') || 'null');
          return { scripts, stored };
        });
        assert.equal(afterEssential.scripts, 0, 'GA4 script must NOT load after clicking Essential Only');
        assert.equal(afterEssential.stored?.analytics, false, 'Consent analytics must be false');

        // Re-open via Footer "Cookie Settings" -> click "Accept All"
        await page.click('#footer-cookie-settings-btn');
        await page.waitForSelector('#cookie-preferences-modal-card', { state: 'visible' });
        await page.click('#cookie-modal-accept-all-btn');
        await page.waitForSelector('#cookie-preferences-modal-card', { state: 'hidden' });
        const afterAcceptAll = await page.evaluate(() => {
          return JSON.parse(localStorage.getItem('ti_cookie_consent_v1') || 'null');
        });
        assert.equal(afterAcceptAll?.analytics, true, 'Consent analytics must be true after clicking Accept All');
        console.log('  ✔ Cookie Consent Banner & Footer Cookie Settings flow verified.');

        // 5. Registration Modal Scroll Isolation & Legal Links
        // Scroll background page down to 450px first
        await page.evaluate(() => window.scrollTo(0, 450));
        await page.waitForTimeout(150);
        const initialBgScrollY = await page.evaluate(() => window.scrollY);
        assert.ok(initialBgScrollY >= 300, `Expected background scrollY >= 300, got ${initialBgScrollY}`);

        if (vp.isMobile) {
          await page.click('#mobile-hamburger-btn');
          await page.waitForSelector('#mobile-drawer-auth-btn', { state: 'visible' });
          await page.click('#mobile-drawer-auth-btn');
        } else {
          await page.click('#signin-nav-btn');
        }
        await page.waitForSelector('#student-auth-modal-card', { state: 'visible' });

        // Switch to Sign Up tab
        await page.click('#auth-tab-signup');

        // Verify submit/next button is disabled until legal consent checkbox is checked
        const nextBtnDisabledBefore = await page.$eval('#auth-next-step-btn', (el) => el.disabled);
        assert.equal(nextBtnDisabledBefore, true, 'Next button in Sign Up must be disabled until consent checkbox is checked');

        // Scroll inside the registration card and assert background window.scrollY has 0px drift
        await page.evaluate(() => {
          const card = document.getElementById('student-auth-modal-card');
          if (card) {
            card.scrollTop = 250;
            card.dispatchEvent(new WheelEvent('wheel', { deltaY: 300, bubbles: true }));
          }
        });
        await page.waitForTimeout(100);
        const afterModalScrollBgY = await page.evaluate(() => window.scrollY);
        assert.equal(
          afterModalScrollBgY,
          initialBgScrollY,
          `Background window.scrollY drifted from ${initialBgScrollY} to ${afterModalScrollBgY} while scrolling inside AuthModal!`
        );

        // Click Privacy Policy link inside registration modal
        await page.click('#auth-open-privacy-link-step1');
        await page.waitForSelector('#legal-modal-card', { state: 'visible' });
        await page.waitForSelector('#privacy-policy-content', { state: 'visible' });

        // Switch to Cookie Policy tab inside LegalModal
        await page.click('#legal-tab-cookies');
        await page.waitForSelector('#cookie-policy-content', { state: 'visible' });
        await page.click('#close-legal-modal-btn');
        await page.waitForSelector('#legal-modal-card', { state: 'hidden' });
        console.log('  ✔ AuthModal scroll isolation (0px background drift), legal modals, and consent checkbox gate verified.');

        // 6. Cookie Auth & Zero localStorage Tokens (Run full registration + reload + portal module check)
        const uniqueSuffix = `${Date.now().toString().slice(-5)}_${vp.width}_${theme}`;
        await page.fill('#auth-username-input', `student_${uniqueSuffix}`);
        await page.fill('#auth-password-input', 'SecurePass2026!');
        await page.fill('#auth-full-name-input', 'Valeria Mendoza');
        await page.fill('#auth-email-input', `valeria_${uniqueSuffix}@example.com`);
        await page.fill('#auth-phone-input', '+591 70012345');
        await page.fill('#auth-dob-input', '1999-05-14');
        await page.selectOption('#auth-country-select', 'Bolivia');
        await page.check('#auth-legal-consent-checkbox-step1');

        const nextBtnDisabledAfter = await page.$eval('#auth-next-step-btn', (el) => el.disabled);
        assert.equal(nextBtnDisabledAfter, false, 'Next button must enable after checking legal consent');

        await page.click('#auth-next-step-btn');
        await page.waitForSelector('#auth-personal-objective-input', { state: 'visible' });
        await page.fill('#auth-personal-objective-input', 'Pass senior software engineering interviews in English.');

        // Intercept /api/auth/register response to verify Set-Cookie header and zero raw token in JSON
        const [registerRes] = await Promise.all([
          page.waitForResponse((res) => res.url().includes('/api/auth/register') && res.request().method() === 'POST'),
          page.click('#submit-auth-form-btn'),
        ]);
        assert.equal(registerRes.status(), 200, 'POST /api/auth/register must return 200 OK');
        const registerJson = await registerRes.json();
        assert.equal(registerJson.token, undefined, 'POST /api/auth/register must NOT return raw JWT token in response body');

        const cookies = await context.cookies();
        const sessionCookie = cookies.find((c) => c.name === 'ti_session');
        assert.ok(sessionCookie, 'HttpOnly ti_session cookie must be set by server');
        assert.equal(sessionCookie.httpOnly, true, 'ti_session cookie must have httpOnly: true');

        // Verify localStorage & sessionStorage have ZERO auth/JWT tokens
        const storageKeys = await page.evaluate(() => ({
          local: Object.keys(localStorage),
          session: Object.keys(sessionStorage),
        }));
        const forbiddenTokenKeys = ['teacherivan_auth_token', 'ti_token', 'auth_token', 'token', 'jwt', 'access_token'];
        for (const k of forbiddenTokenKeys) {
          assert.ok(!storageKeys.local.includes(k), `localStorage must not contain token key "${k}"`);
          assert.ok(!storageKeys.session.includes(k), `sessionStorage must not contain token key "${k}"`);
        }

        // Reload page and confirm session persists via HttpOnly cookie + /api/auth/me
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForSelector('#student-microlearning-dashboard', { state: 'visible' });

        // Verify Portal Modules (My Path -> Resources & Games -> Schedule)
        if (vp.isMobile) {
          await page.click('#mobile-hamburger-btn');
          await page.waitForSelector('#mobile-navigation-drawer', { state: 'visible' });
          await page.click('#mobile-navigation-drawer button:has-text("Recursos"), #mobile-navigation-drawer button:has-text("Resources")');
        } else {
          await page.click('#nav-tab-resources');
        }
        await page.waitForSelector('#educational-resources-view', { state: 'visible' });

        const portalOverflowPx = await page.evaluate(() => {
          return Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
        });
        assert.equal(portalOverflowPx, 0, `Expected 0px overflow in Portal Resources view, got ${portalOverflowPx}px`);
        console.log('  ✔ HttpOnly ti_session cookie auth, zero localStorage tokens, reload persistence, and Portal views verified.');

        assert.equal(
          consoleErrors.length,
          0,
          `Expected 0 console errors on ${vp.name} (${theme}), got: ${consoleErrors.join(' | ')}`
        );
        assert.equal(
          pageErrors.length,
          0,
          `Expected 0 pageerror exceptions on ${vp.name} (${theme}), got: ${pageErrors.join(' | ')}`
        );

        await context.close();
      }
    }

    console.log('\n======================================================');
    console.log(' ALL PLAYWRIGHT E2E CHECKS PASSED (100% ASSERTIONS, 0 CONSOLE/PAGE ERRORS)');
    console.log('======================================================\n');
  } finally {
    if (browser) await browser.close().catch(() => {});
    serverProc.kill();
    previewProc.kill();
  }
}

runPlaywrightSuite().catch((err) => {
  console.error('\n[PLAYWRIGHT E2E FAILURE]:', err);
  process.exit(1);
});
