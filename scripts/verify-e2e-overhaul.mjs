import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.resolve(ROOT_DIR, 'client/dist');
const SCREENSHOT_DIR = path.resolve(ROOT_DIR, 'media-pipeline/output/qa-screenshots');
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
  console.log('\n[1/8] Scanning client/dist/ for static AudioWorklet, editorial SVG rigs, 4 logo options, motivation WebPs & zero secrets...');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'worklets/pcm-processor.js')), 'client/dist/worklets/pcm-processor.js must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'version.json')), 'client/dist/version.json must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'sw.js')), 'client/dist/sw.js must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'CNAME')), 'client/dist/CNAME must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'logo-preview.html')), 'client/dist/logo-preview.html must exist');

  // Verify new Live2D hierarchical SVG rigging contract in both Emma & Teacher Ivan rigs
  for (const rig of ['emma-rig.svg', 'teacher-ivan-rig.svg']) {
    const rigPath = path.join(DIST_DIR, 'assets', rig);
    assert.ok(fs.existsSync(rigPath), `${rig} must exist in client/dist/assets/`);
    const content = fs.readFileSync(rigPath, 'utf8');
    for (const id of ['#avatar-root', '#hair-back', '#torso-group', '#head-group', '#eye-left-iris', '#mouth-visemes', '#hair-front-bangs']) {
      const cleanId = id.slice(1);
      assert.ok(content.includes(`id="${cleanId}"`), `${rig} missing required Live2D rig layer id="${cleanId}"`);
    }
  }

  // Verify 4 logo candidates (full + icon)
  for (const logo of [
    'logo-opt-1-portal.svg', 'logo-opt-1-portal-icon.svg',
    'logo-opt-2-editorial.svg', 'logo-opt-2-editorial-icon.svg',
    'logo-opt-3-bicronic.svg', 'logo-opt-3-bicronic-icon.svg',
    'logo-opt-4-skyline.svg', 'logo-opt-4-skyline-icon.svg',
  ]) {
    assert.ok(fs.existsSync(path.join(DIST_DIR, 'assets/logo-candidates', logo)), `Missing logo candidate ${logo}`);
  }

  // Verify 5 motivation WebP photos
  for (const img of [
    'global-career.webp',
    'job-interview.webp',
    'borderless-travel.webp',
    'international-scholarship.webp',
    'everyday-confidence.webp',
  ]) {
    assert.ok(fs.existsSync(path.join(DIST_DIR, 'assets/motivation', img)), `Missing motivation/${img}`);
  }

  const assetsDir = path.join(DIST_DIR, 'assets');
  const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
    assert.ok(!content.includes('createAudioWorkletBlobUrl'), `Bundle ${file} must not contain createAudioWorkletBlobUrl`);
    assert.ok(!content.includes('AIzaSy'), `Bundle ${file} must not contain any Google API key`);
    assert.ok(!content.includes('BEGIN PRIVATE KEY'), `Bundle ${file} must not contain any private key`);
    assert.ok(!content.includes('GOCSPX'), `Bundle ${file} must not contain any OAuth client secret`);
  }
  console.log('  ✔ Static worklet, Live2D SVG rigs, 4 logo candidates, logo-preview.html, 5 WebP photos, and 0 secrets verified.');
}

async function runPlaywrightSuite() {
  scanDistForForbiddenTokens();
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

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

    // Verify /logo-preview.html interactive gallery
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(`${PREVIEW_URL}/logo-preview.html`, { waitUntil: 'networkidle' });
      const logoImgCount = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('#logo-grid img'));
        return { total: imgs.length, loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length };
      });
      assert.ok(logoImgCount.total >= 20 && logoImgCount.loaded === logoImgCount.total, `Expected all logo preview SVGs to load, got ${logoImgCount.loaded}/${logoImgCount.total}`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'logo-preview.png'), fullPage: false });
      await ctx.close();
      console.log(`  ✔ /logo-preview.html verified (${logoImgCount.loaded}/${logoImgCount.total} SVGs loaded + screenshot captured).`);
    }

    const viewports = [
      { name: 'Desktop (1440×900)', slug: 'desktop', width: 1440, height: 900, isMobile: false, runFullAuth: true },
      { name: 'Mobile (390×844)', slug: 'mobile', width: 390, height: 844, isMobile: true, runFullAuth: true },
      { name: 'Mobile SE (375×812)', slug: 'mobile-se', width: 375, height: 812, isMobile: true, runFullAuth: false },
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
          localStorage.setItem('teacherivan_lang', 'es');
        }, theme);

        await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(250);

        // Capture landing screenshot
        if (vp.slug === 'desktop' || vp.slug === 'mobile') {
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${theme}-${vp.slug}.png`), fullPage: false });
        }

        // 1. Landmarks, Skip Link, 1x <h1>, and Zero Horizontal Overflow
        const layoutAudit = await page.evaluate(() => {
          const docWidth = document.documentElement.clientWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          const scrollHeight = document.documentElement.scrollHeight;
          const innerHeight = window.innerHeight;
          const skipLink = document.querySelector('a.skip-to-main-link');
          const mainLandmark = document.querySelector('main#main-content');
          const h1Count = document.querySelectorAll('h1').length;
          return {
            overflowPx: Math.max(0, scrollWidth - docWidth),
            verticalOverflowPx: Math.max(0, scrollHeight - innerHeight),
            hasSkipLink: Boolean(skipLink),
            hasMainLandmark: Boolean(mainLandmark),
            h1Count,
          };
        });
        assert.equal(layoutAudit.overflowPx, 0, `Expected 0px horizontal overflow on ${vp.name} (${theme}), got ${layoutAudit.overflowPx}px`);
        assert.equal(layoutAudit.hasSkipLink, true, 'Skip-to-main-content link must exist');
        assert.equal(layoutAudit.hasMainLandmark, true, '<main id="main-content"> landmark must exist');
        assert.equal(layoutAudit.h1Count, 1, `Expected exactly 1 <h1> per view, got ${layoutAudit.h1Count}`);

        // 2. Zero Argentine Voseo Check
        const voseoMatches = await page.evaluate(() => {
          const text = document.body.innerText || '';
          const re = /(?<![a-zA-ZáéíóúÁÉÍÓÚñÑ])(vos|sos|hablá|hablás|probá|probás|probalo|descubrí|descubrís|tenés|estudiás|bloqueás|congelás|agendá|agendás|podés|elegí|elegís|entrá|conocé|empezá|comenzá|practicá|practicás|deslizá|asegurá|reservá|escribime|escribile|decime|contame|querés|necesitás|sabés|dejá|aprendé|guardá|compartilo|hacelo|hacé|creá|recibí|recibís|combiná|activá|conversá|completá|generá|cancelá|cambiá)(?![a-zA-ZáéíóúÁÉÍÓÚñÑ])/gi;
          return text.match(re) || [];
        });
        assert.equal(voseoMatches.length, 0, `Found Argentine voseo: ${voseoMatches.join(', ')}`);

        // 3. Desktop vs Mobile Specific Architecture Checks
        if (!vp.isMobile) {
          // Desktop: Luminous Metropolis Portal Zoom (1x -> 7.5x) & Motivational Showcase
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(100);
          const topTransform = await page.$eval('#portal-archway-zoom-layer', (el) => el.style.transform);
          assert.ok(topTransform.includes('scale(1)'), `Expected portal scale(1) at top, got ${topTransform}`);

          await page.evaluate(() => {
            const intro = document.getElementById('portal-intro-track');
            window.scrollTo(0, intro ? intro.offsetHeight : window.innerHeight * 1.6);
          });
          await page.waitForTimeout(150);
          const endPortal = await page.$eval('#portal-archway-zoom-layer', (el) => el.style.transform);
          const endWorld = await page.$eval('#portal-world-parallax-layer', (el) => el.style.transform);
          assert.ok(endPortal.includes('scale(7.5)'), `Expected portal scale(7.5), got ${endPortal}`);
          assert.ok(endWorld.includes('scale(1.18)'), `Expected world scale(1.18), got ${endWorld}`);

          // Verify 5 Motivational Showcase images & carousel (2 -> 3 -> 2)
          const showcaseImgs = await page.evaluate(async () => {
            const el = document.getElementById('motivational-showcase-carousel');
            if (el) el.scrollIntoView({ behavior: 'instant' });
            await new Promise((r) => setTimeout(r, 200));
            return Array.from(document.querySelectorAll('#motivational-showcase-carousel img')).map((i) => ({
              src: i.getAttribute('src'),
              w: i.naturalWidth,
            }));
          });
          assert.equal(showcaseImgs.length, 5, 'Desktop Motivational Showcase must have 5 images');
          for (const img of showcaseImgs) assert.ok(img.w > 0, `${img.src} failed to load`);
          await page.click('#motivation-carousel-next-btn');
          assert.equal(await page.getAttribute('#motivational-showcase-carousel', 'data-active-index'), '3');
          await page.click('#motivation-carousel-prev-btn');
          assert.equal(await page.getAttribute('#motivational-showcase-carousel', 'data-active-index'), '2');
          console.log('  ✔ Desktop Luminous Metropolis Portal Zoom (1x -> 7.5x) & Motivational Showcase verified.');
        } else {
          // Mobile: Single-Screen 100dvh Zero-Scroll Landing + Mobile Voice Cockpit!
          assert.ok(
            layoutAudit.verticalOverflowPx <= 2,
            `Mobile landing must fit on 100dvh with zero vertical scroll, got +${layoutAudit.verticalOverflowPx}px`
          );
          const hasRigLayers = await page.evaluate(() => {
            return Boolean(document.querySelector('#mobile-hero-section #head-group') && document.querySelector('#mobile-hero-section #mouth-visemes'));
          });
          assert.equal(hasRigLayers, true, 'Mobile Hero must render the new editorial Live2D SVG rig');

          // Dismiss cookie banner if visible before clicking CTA
          const cookieBtn = await page.$('#cookie-essential-only-btn');
          if (cookieBtn) await cookieBtn.click();

          // Click primary CTA -> launches single-screen zero-scroll MobileVoiceCockpit
          await page.click('#hero-primary-cta-btn');
          await page.waitForSelector('#mobile-voice-cockpit', { state: 'visible' });
          await page.waitForTimeout(200);

          const cockpitAudit = await page.evaluate(() => {
            const vOverflow = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const hOverflow = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
            const fab = document.getElementById('mobile-dock-mic-fab');
            const fabRect = fab ? fab.getBoundingClientRect() : { width: 0, height: 0 };
            const hasTutor = Boolean(document.getElementById('mobile-pill-tutor'));
            const hasLevel = Boolean(document.getElementById('mobile-pill-level'));
            const hasScenario = Boolean(document.getElementById('mobile-pill-scenario'));
            return { vOverflow, hOverflow, fabW: fabRect.width, fabH: fabRect.height, hasTutor, hasLevel, hasScenario };
          });
          assert.ok(cockpitAudit.vOverflow <= 2, `Mobile Voice Cockpit must fit 100dvh (0 scroll), got +${cockpitAudit.vOverflow}px`);
          assert.equal(cockpitAudit.hOverflow, 0, 'Mobile Voice Cockpit must have 0px horizontal overflow');
          assert.ok(cockpitAudit.fabW >= 56 && cockpitAudit.fabH >= 56, 'Mobile Mic FAB must be ~60x60px');
          assert.ok(cockpitAudit.hasTutor && cockpitAudit.hasLevel && cockpitAudit.hasScenario, 'Mobile Cockpit must render 3-pill config strip');

          if (vp.slug === 'mobile' && theme === 'dark') {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-cockpit-dark.png'), fullPage: false });
          }

          // Return to Mobile Home
          await page.click('#mobile-cockpit-back-btn');
          await page.waitForSelector('#mobile-hero-section', { state: 'visible' });
          console.log(`  ✔ Mobile Single-Screen 100dvh Landing & Zero-Scroll Voice Cockpit verified (0px scroll, FAB ${Math.round(cockpitAudit.fabW)}x${Math.round(cockpitAudit.fabH)}px).`);
        }

        // 4. AudioWorklet & Pre-Filled WhatsApp Links
        const workletOk = await page.evaluate(async () => {
          const res = await fetch('/worklets/pcm-processor.js');
          if (res.status !== 200) return `status ${res.status}`;
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
        assert.equal(workletOk, true, `AudioWorklet load failed: ${workletOk}`);

        const whatsappLinks = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a[href*="wa.me"]')).map((a) => a.getAttribute('href') || '')
        );
        assert.ok(whatsappLinks.length >= 1, 'Expected pre-filled WhatsApp link(s)');
        for (const href of whatsappLinks) {
          assert.ok(href.startsWith('https://wa.me/59172878330?text='), `WhatsApp link must be pre-filled: ${href}`);
        }

        // 5. AuthModal + HttpOnly Cookie Registration (Desktop 1440 & Mobile 390)
        if (vp.runFullAuth) {
          const cookieBtn = await page.$('#cookie-essential-only-btn');
          if (cookieBtn) await cookieBtn.click();

          if (vp.isMobile) {
            await page.click('#mobile-hamburger-btn');
            await page.waitForSelector('#mobile-drawer-auth-btn', { state: 'visible' });
            await page.click('#mobile-drawer-auth-btn');
          } else {
            await page.click('#signin-nav-btn');
          }
          await page.waitForSelector('#student-auth-modal-card', { state: 'visible' });
          await page.click('#auth-tab-signup');

          const uniqueSuffix = `${Date.now().toString().slice(-5)}_${vp.width}_${theme}`;
          await page.fill('#auth-username-input', `student_${uniqueSuffix}`);
          await page.fill('#auth-password-input', 'SecurePass2026!');
          await page.fill('#auth-full-name-input', 'Valeria Mendoza');
          await page.fill('#auth-email-input', `valeria_${uniqueSuffix}@example.com`);
          await page.fill('#auth-phone-input', '+591 70012345');
          await page.fill('#auth-dob-input', '1999-05-14');
          await page.selectOption('#auth-country-select', 'Bolivia');
          await page.check('#auth-legal-consent-checkbox-step1');
          await page.click('#auth-next-step-btn');
          await page.waitForSelector('#auth-personal-objective-input', { state: 'visible' });
          await page.fill('#auth-personal-objective-input', 'Pass senior engineering interviews in English.');

          const [registerRes] = await Promise.all([
            page.waitForResponse((res) => res.url().includes('/api/auth/register') && res.request().method() === 'POST'),
            page.click('#submit-auth-form-btn'),
          ]);
          assert.equal(registerRes.status(), 200);
          const registerJson = await registerRes.json();
          assert.equal(registerJson.token, undefined);

          const cookies = await context.cookies();
          const sessionCookie = cookies.find((c) => c.name === 'ti_session');
          assert.ok(sessionCookie && sessionCookie.httpOnly, 'HttpOnly ti_session cookie must be set');

          await page.reload({ waitUntil: 'networkidle' });
          await page.waitForSelector('#student-microlearning-dashboard', { state: 'visible' });
          console.log('  ✔ AuthModal & HttpOnly ti_session persistence verified.');
        }

        assert.equal(consoleErrors.length, 0, `Console errors on ${vp.name} (${theme}): ${consoleErrors.join(' | ')}`);
        assert.equal(pageErrors.length, 0, `Page errors on ${vp.name} (${theme}): ${pageErrors.join(' | ')}`);

        await context.close();
      }
    }

    console.log('\n======================================================');
    console.log(' ALL PHASE 1-5 PLAYWRIGHT VISUAL, RIG, MOBILE & A11Y CHECKS PASSED!');
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
