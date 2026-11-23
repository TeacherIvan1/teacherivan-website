import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.resolve(ROOT_DIR, 'client/dist');
const SCREENSHOT_DIR = path.resolve(ROOT_DIR, 'media-pipeline/output/qa-3d-planet');
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
  console.log('\n[1/7] Scanning client/dist/ for 3D avatars, promoted editorial logo, static AudioWorklet, motivation WebPs & zero secrets...');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'worklets/pcm-processor.js')), 'client/dist/worklets/pcm-processor.js must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'version.json')), 'client/dist/version.json must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'sw.js')), 'client/dist/sw.js must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'CNAME')), 'client/dist/CNAME must exist');

  // Phase 4: Promoted editorial logo & PWA icons exist; temporary preview/candidates deleted
  for (const brandFile of [
    'favicon.svg',
    'icon-192.png',
    'icon-512.png',
    'apple-touch-icon.png',
    'assets/logo.svg',
    'assets/logo-icon-mark.svg',
    'assets/logo-horizontal-light.svg',
    'assets/logo-horizontal-dark.svg',
    'assets/logo-print-monochrome.svg',
  ]) {
    assert.ok(fs.existsSync(path.join(DIST_DIR, brandFile)), `Missing promoted brand asset: ${brandFile}`);
  }
  assert.equal(fs.existsSync(path.join(DIST_DIR, 'logo-preview.html')), false, 'Temporary logo-preview.html must be removed');
  assert.equal(fs.existsSync(path.join(DIST_DIR, 'assets/logo-candidates')), false, 'Temporary logo-candidates/ must be removed');

  // Phase 1: 3D Reference Avatar WebP + PNG cutouts (< 180 KB WebP)
  for (const avatar of ['teacherivan-3d.webp', 'emma-3d.webp', 'teacherivan-3d.png', 'emma-3d.png']) {
    const p = path.join(DIST_DIR, 'assets/avatars', avatar);
    assert.ok(fs.existsSync(p), `Missing 3D avatar asset: assets/avatars/${avatar}`);
    if (avatar.endsWith('.webp')) {
      const size = fs.statSync(p).size;
      assert.ok(size < 180 * 1024, `${avatar} must be < 180 KB, got ${size} B`);
    }
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
  console.log('  ✔ 3D avatars (<180KB WebP), promoted editorial logo, static worklet, 5 motivation WebPs, and 0 secrets verified.');
}

async function runPlaywrightSuite() {
  scanDistForForbiddenTokens();
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  // Isolated temporary data dir + DISABLE_GOOGLE_SHEETS_SYNC=true so E2E NEVER touches live Sheets or server/data/users.json
  const isolatedDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'teacherivan-e2e-'));

  console.log('\nStarting compiled server (Google Sheets sync DISABLED) and Vite preview...');
  const serverProc = spawn('node', ['server/dist/index.js'], {
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      PORT: String(SERVER_PORT),
      NODE_ENV: 'development',
      DISABLE_GOOGLE_SHEETS_SYNC: 'true',
      USER_DATA_DIR: isolatedDataDir,
    },
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

    // Confirm live server reports Google Sheets disabled during E2E
    const healthJson = await (await fetch(`http://localhost:${SERVER_PORT}/api/health`)).json();
    assert.equal(healthJson.googleDbStatus, 'not_configured', `Expected Google Sheets disabled during E2E, got ${healthJson.googleDbStatus}`);
    console.log('  ✔ Local server (3001, Sheets isolated) and Vite preview (4173) are live.');

    browser = await chromium.launch({
      headless: true,
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
      ],
    });

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
        await page.waitForTimeout(350);

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

        // 2. Zero Argentine Voseo, Zero "Recasting" Jargon & Zero Forbidden Voice-Gender/Descriptor Pills
        const copyAudit = await page.evaluate(() => {
          const text = document.body.innerText || '';
          const voseoRe = /(?<![a-zA-ZáéíóúÁÉÍÓÚñÑ])(vos|sos|hablá|hablás|probá|probás|probalo|descubrí|descubrís|tenés|estudiás|bloqueás|congelás|agendá|agendás|podés|elegí|elegís|entrá|conocé|empezá|comenzá|practicá|practicás|deslizá|asegurá|reservá|escribime|escribile|decime|contame|querés|necesitás|sabés|dejá|aprendé|guardá|compartilo|hacelo|hacé|creá|recibí|recibís|combiná|activá|conversá|completá|generá|cancelá|cambiá)(?![a-zA-ZáéíóúÁÉÍÓÚñÑ])/gi;
          const recastRe = /\brecast(ing|s)?\b/gi;
          const forbiddenLabels = [
            'Voz Masculina',
            'Voz Femenina',
            'Male Voice',
            'Female Voice',
            'Mentor Pedagógico Empático y Estructurado',
          ].filter((lbl) => text.includes(lbl));
          return {
            voseo: text.match(voseoRe) || [],
            recast: text.match(recastRe) || [],
            forbiddenLabels,
          };
        });
        assert.equal(copyAudit.voseo.length, 0, `Found Argentine voseo: ${copyAudit.voseo.join(', ')}`);
        assert.equal(copyAudit.recast.length, 0, `Found student-facing "recast/recasting" jargon: ${copyAudit.recast.join(', ')}`);
        assert.equal(copyAudit.forbiddenLabels.length, 0, `Found removed simulator labels: ${copyAudit.forbiddenLabels.join(', ')}`);

        // 3. Desktop vs Mobile Specific Architecture Checks
        if (!vp.isMobile) {
          // 3A. Hero Column 2 "T." Monogram Clearance Audit
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(150);

          if (vp.slug === 'desktop' && theme === 'light') {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'planet-doorway-top.png'), fullPage: false });
          }

          const heroMonogramAudit = await page.evaluate(() => {
            const tEl = document.getElementById('hero-monogram-t');
            const copyEl = document.getElementById('hero-monogram-copy');
            if (!tEl || !copyEl) return null;
            const tBox = tEl.getBoundingClientRect();
            const textBox = copyEl.getBoundingClientRect();
            return {
              tRight: tBox.right,
              textLeft: textBox.left,
              gapPx: textBox.left - tBox.right,
            };
          });
          assert.ok(heroMonogramAudit, 'Hero Column 2 #hero-monogram-t and #hero-monogram-copy must exist');
          assert.ok(
            heroMonogramAudit.tRight + 10 <= heroMonogramAudit.textLeft,
            `Hero "T." overlaps adjacent text! tBox.right=${heroMonogramAudit.tRight}, textBox.left=${heroMonogramAudit.textLeft}, gap=${heroMonogramAudit.gapPx}px`
          );

          // 3B. Discoverable Planet Portal Animation (0% -> 70% -> 100%)
          const planetCheck = await page.evaluate(() => {
            const stage = document.getElementById('portal-world-fixed-stage');
            const themeAttr = stage?.getAttribute('data-world-theme');
            const cityElems = document.querySelectorAll('.ti-city-beacon, [data-world-theme="metropolis"]').length;
            return { themeAttr, cityElems };
          });
          assert.equal(planetCheck.themeAttr, 'discoverable-planet', `Expected data-world-theme="discoverable-planet", got ${planetCheck.themeAttr}`);
          assert.equal(planetCheck.cityElems, 0, `Expected 0 legacy cityscape elements, got ${planetCheck.cityElems}`);

          const topTransform = await page.$eval('#portal-archway-zoom-layer', (el) => el.style.transform);
          assert.ok(topTransform.includes('scale(1)'), `Expected portal scale(1) at top, got ${topTransform}`);

          // Scroll to 70% through portal intro track -> planet world revealed
          await page.evaluate(() => {
            const intro = document.getElementById('portal-intro-track');
            const denom = intro ? Math.max(1, intro.offsetHeight - window.innerHeight) : window.innerHeight * 0.6;
            window.scrollTo(0, Math.round(denom * 0.72));
          });
          await page.waitForTimeout(200);
          if (vp.slug === 'desktop' && theme === 'dark') {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'planet-world-revealed.png'), fullPage: false });
          }

          await page.evaluate(() => {
            const intro = document.getElementById('portal-intro-track');
            window.scrollTo(0, intro ? intro.offsetHeight : window.innerHeight * 1.6);
          });
          await page.waitForTimeout(200);
          const endPortal = await page.$eval('#portal-archway-zoom-layer', (el) => el.style.transform);
          const endWorld = await page.$eval('#portal-world-parallax-layer', (el) => el.style.transform);
          assert.ok(endPortal.includes('scale(7.5)'), `Expected portal scale(7.5), got ${endPortal}`);
          assert.ok(endWorld.includes('scale(1.18)'), `Expected world scale(1.18), got ${endWorld}`);

          // 3C. Desktop Voice Simulator + Animated 3D Avatars (Ivan & Emma)
          await page.evaluate(() => {
            const sim = document.getElementById('flagship-simulator-section');
            if (sim) sim.scrollIntoView({ behavior: 'instant', block: 'start' });
          });
          await page.waitForTimeout(250);

          const simAvatarAudit = await page.evaluate(() => {
            const stage = document.getElementById('tutor-avatar-stage');
            const imgs = stage ? Array.from(stage.querySelectorAll('img')) : [];
            const avatar3d = stage ? stage.querySelector('[data-testid="tutor-avatar-3d"]') : null;
            const svgRigImgs = imgs.filter((i) => (i.currentSrc || i.getAttribute('src') || '').includes('-rig.svg'));
            return {
              hasStage: Boolean(stage),
              hasAvatar3D: Boolean(avatar3d),
              persona: avatar3d?.getAttribute('data-character'),
              loadedImgs: imgs.filter((i) => i.complete && i.naturalWidth > 0).map((i) => i.currentSrc || i.getAttribute('src')),
              svgRigCount: svgRigImgs.length,
              stageText: stage?.innerText || '',
            };
          });
          assert.equal(simAvatarAudit.hasStage, true, 'Desktop Voice Simulator stage must render');
          assert.equal(simAvatarAudit.hasAvatar3D, true, 'Desktop Voice Simulator must mount <TutorAvatar3D />');
          assert.equal(simAvatarAudit.svgRigCount, 0, 'Voice Simulator must NOT mount legacy -rig.svg images');
          assert.ok(
            simAvatarAudit.loadedImgs.some((s) => s && (s.includes('teacherivan-3d.webp') || s.includes('emma-3d.webp'))),
            `Expected loaded 3D WebP avatar in simulator, got ${JSON.stringify(simAvatarAudit.loadedImgs)}`
          );

          if (vp.slug === 'desktop') {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, `desktop-${theme}-simulator.png`), fullPage: false });
          }

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

          console.log(`  ✔ Desktop Hero "T." gap (+${Math.round(heroMonogramAudit.gapPx)}px), Discoverable Planet Portal, 3D Avatar (${simAvatarAudit.persona}) & Showcase verified.`);
        } else {
          // Mobile: Single-Screen 100dvh Zero-Scroll Landing + 3D Avatar + Mobile Voice Cockpit
          assert.ok(
            layoutAudit.verticalOverflowPx <= 2,
            `Mobile landing must fit on 100dvh with zero vertical scroll, got +${layoutAudit.verticalOverflowPx}px`
          );

          const mobileAvatarAudit = await page.evaluate(() => {
            const hero = document.getElementById('mobile-hero-section');
            const avatar3d = hero ? hero.querySelector('[data-testid="tutor-avatar-3d"]') : null;
            const img = hero ? hero.querySelector('[data-testid="tutor-avatar-3d"] img') : null;
            const planetStage = document.getElementById('mobile-planet-stage');
            return {
              hasAvatar3D: Boolean(avatar3d),
              src: img?.currentSrc || img?.getAttribute('src') || '',
              loaded: Boolean(img && img.complete && img.naturalWidth > 0),
              worldTheme: planetStage?.getAttribute('data-world-theme') || '',
            };
          });
          assert.equal(mobileAvatarAudit.hasAvatar3D, true, 'Mobile Hero must render <TutorAvatar3D />');
          assert.equal(mobileAvatarAudit.loaded, true, `Mobile Hero 3D avatar failed to load: ${mobileAvatarAudit.src}`);
          assert.ok(
            mobileAvatarAudit.src.includes('emma-3d.webp') || mobileAvatarAudit.src.includes('teacherivan-3d.webp'),
            `Expected 3D WebP avatar in mobile hero, got ${mobileAvatarAudit.src}`
          );
          assert.equal(mobileAvatarAudit.worldTheme, 'discoverable-planet', 'Mobile Hero backdrop must use discoverable-planet theme');

          if (vp.slug === 'mobile') {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, `mobile-${theme}-landing.png`), fullPage: false });
          }

          // Dismiss cookie banner if visible before clicking CTA
          const cookieBtn = await page.$('#cookie-essential-only-btn');
          if (cookieBtn) await cookieBtn.click();

          // Click primary CTA -> launches single-screen zero-scroll MobileVoiceCockpit
          await page.click('#hero-primary-cta-btn');
          await page.waitForSelector('#mobile-voice-cockpit', { state: 'visible' });
          await page.waitForTimeout(250);

          const cockpitAudit = await page.evaluate(() => {
            const vOverflow = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const hOverflow = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
            const fab = document.getElementById('mobile-dock-mic-fab');
            const fabRect = fab ? fab.getBoundingClientRect() : { width: 0, height: 0 };
            const hasTutor = Boolean(document.getElementById('mobile-pill-tutor'));
            const hasLevel = Boolean(document.getElementById('mobile-pill-level'));
            const hasScenario = Boolean(document.getElementById('mobile-pill-scenario'));
            const avatarImg = document.querySelector('#mobile-voice-cockpit [data-testid="tutor-avatar-3d"] img');
            return {
              vOverflow,
              hOverflow,
              fabW: fabRect.width,
              fabH: fabRect.height,
              hasTutor,
              hasLevel,
              hasScenario,
              avatarLoaded: Boolean(avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0),
              avatarSrc: avatarImg?.currentSrc || avatarImg?.getAttribute('src') || '',
            };
          });
          assert.ok(cockpitAudit.vOverflow <= 2, `Mobile Voice Cockpit must fit 100dvh (0 scroll), got +${cockpitAudit.vOverflow}px`);
          assert.equal(cockpitAudit.hOverflow, 0, 'Mobile Voice Cockpit must have 0px horizontal overflow');
          assert.ok(cockpitAudit.fabW >= 56 && cockpitAudit.fabH >= 56, 'Mobile Mic FAB must be ~60x60px');
          assert.ok(cockpitAudit.hasTutor && cockpitAudit.hasLevel && cockpitAudit.hasScenario, 'Mobile Cockpit must render 3-pill config strip');
          assert.equal(cockpitAudit.avatarLoaded, true, `Mobile Cockpit 3D avatar failed to load: ${cockpitAudit.avatarSrc}`);

          if (vp.slug === 'mobile') {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, `mobile-${theme}-cockpit.png`), fullPage: false });
          }

          // Return to Mobile Home
          await page.click('#mobile-cockpit-back-btn');
          await page.waitForSelector('#mobile-hero-section', { state: 'visible' });
          console.log(`  ✔ Mobile Single-Screen 100dvh Landing & 3D Voice Cockpit verified (0px scroll, FAB ${Math.round(cockpitAudit.fabW)}x${Math.round(cockpitAudit.fabH)}px).`);
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

        // 5. AuthModal + HttpOnly Cookie Registration (Isolated local temp store; ZERO Google Sheets writes)
        if (vp.runFullAuth) {
          const cookieBtn = await page.$('#cookie-essential-only-btn');
          if (cookieBtn) await cookieBtn.click();

          if (vp.isMobile) {
            await page.click('#mobile-hamburger-btn');
            await page.waitForSelector('#mobile-drawer-auth-btn', { state: 'visible' });
            await page.click('#mobile-drawer-auth-btn');
          } else {
            await page.evaluate(() => window.scrollTo(0, 0));
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

          // Ensure zero auth tokens stored in localStorage
          const lsAuthLeak = await page.evaluate(() => {
            return Object.keys(localStorage).filter((k) => /token|jwt|ti_session/i.test(k));
          });
          assert.equal(lsAuthLeak.length, 0, `Found auth token leak in localStorage: ${lsAuthLeak.join(', ')}`);

          await page.reload({ waitUntil: 'networkidle' });
          await page.waitForSelector('#student-microlearning-dashboard', { state: 'visible' });
          console.log('  ✔ AuthModal & HttpOnly ti_session persistence verified (0 Sheets writes, 0 localStorage tokens).');
        }

        assert.equal(consoleErrors.length, 0, `Console errors on ${vp.name} (${theme}): ${consoleErrors.join(' | ')}`);
        assert.equal(pageErrors.length, 0, `Page errors on ${vp.name} (${theme}): ${pageErrors.join(' | ')}`);

        await context.close();
      }
    }

    console.log('\n==============================================================');
    console.log(' ALL PHASE 1-6 PLAYWRIGHT 3D, PLANET, LOGO, MOBILE & AUTH CHECKS PASSED!');
    console.log('==============================================================\n');
  } finally {
    if (browser) await browser.close().catch(() => {});
    serverProc.kill();
    previewProc.kill();
    try {
      fs.rmSync(isolatedDataDir, { recursive: true, force: true });
    } catch {}
  }
}

runPlaywrightSuite().catch((err) => {
  console.error('\n[PLAYWRIGHT E2E FAILURE]:', err);
  process.exit(1);
});
