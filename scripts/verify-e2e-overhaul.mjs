import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.resolve(ROOT_DIR, 'client/dist');
const SCREENSHOT_DIR = path.resolve(ROOT_DIR, 'media-pipeline/output/qa-mascots');
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
  console.log('\n[1/7] Scanning client/dist/ for rigged animal SVG mascots, editorial logo, static AudioWorklet, motivation WebPs & zero secrets...');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'worklets/pcm-processor.js')), 'client/dist/worklets/pcm-processor.js must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'version.json')), 'client/dist/version.json must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'sw.js')), 'client/dist/sw.js must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'CNAME')), 'client/dist/CNAME must exist');

  // Promoted editorial logo & PWA icons exist; temporary preview/candidates deleted
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

  // Phase 1: High-Detail Animated SVG Animal Mascots (Golden Retriever Ivan & Tabby Kitten Emma)
  const requiredRigIds = [
    'bg-aura',
    'ground-shadow',
    'tail-group',
    'character-body',
    'torso-uniform',
    'left-paw',
    'right-paw',
    'head-group',
    'ear-left',
    'ear-right',
    'face-base',
    'eyebrows-left',
    'eyebrows-right',
    'eyes-open',
    'eye-left-iris',
    'eye-right-iris',
    'eyes-blink',
    'eyes-happy',
    'mouth-visemes',
    'mouth-rest',
    'mouth-parted',
    'mouth-open-sm',
    'mouth-open-md',
    'mouth-open-lg',
    'mouth-smile',
  ];

  for (const rig of ['teacher-ivan-rig.svg', 'emma-rig.svg']) {
    const p = path.join(DIST_DIR, 'assets', rig);
    assert.ok(fs.existsSync(p), `Missing rigged mascot SVG: assets/${rig}`);
    const content = fs.readFileSync(p, 'utf8');
    assert.ok(content.includes('viewBox="0 0 600 600"'), `${rig} must use viewBox="0 0 600 600"`);
    for (const id of requiredRigIds) {
      assert.ok(content.includes(`id="${id}"`), `${rig} missing required rig bone id="${id}"`);
    }
    if (rig === 'emma-rig.svg') {
      assert.ok(content.includes('id="whiskers-left"'), 'emma-rig.svg missing #whiskers-left');
      assert.ok(content.includes('id="whiskers-right"'), 'emma-rig.svg missing #whiskers-right');
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
  console.log('  ✔ Rigged Golden Retriever & Tabby SVGs, editorial logo, static worklet, 5 motivation WebPs, and 0 secrets verified.');
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
      { name: 'Mobile SE (375×812)', slug: 'mobile-se', width: 375, height: 812, isMobile: true, runFullAuth: true },
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

        // Dismiss cookie banner early so visual QA screenshots show unobstructed UI
        const cookieBtn = await page.$('#cookie-essential-only-btn');
        if (cookieBtn) await cookieBtn.click();
        await page.waitForTimeout(150);

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
        assert.equal(layoutAudit.h1Count, 1, `Expected exactly 1 <h1> on landing view, got ${layoutAudit.h1Count}`);

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

        // 3. Desktop vs Mobile Landing Checks
        if (!vp.isMobile) {
          // Hero Column 2 "T." Monogram Clearance Audit
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(120);

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
          assert.ok(heroMonogramAudit && heroMonogramAudit.tRight + 10 <= heroMonogramAudit.textLeft, 'Hero "T." overlaps adjacent text');

          // Discoverable Planet Portal untouched
          const planetAttr = await page.$eval('#portal-world-fixed-stage', (el) => el.getAttribute('data-world-theme'));
          assert.equal(planetAttr, 'discoverable-planet');

          // Desktop Voice Simulator + Animated SVG Animal Mascot (Golden Retriever Ivan)
          await page.evaluate(() => {
            const sim = document.getElementById('flagship-simulator-section');
            if (sim) sim.scrollIntoView({ behavior: 'instant', block: 'start' });
          });
          await page.waitForTimeout(450);

          const simMascotAudit = await page.evaluate(() => {
            const stage = document.getElementById('tutor-avatar-stage');
            const avatar = stage ? stage.querySelector('[data-testid="tutor-avatar-svg"]') : null;
            const svg = avatar ? avatar.querySelector('svg') : null;
            const tail = svg ? svg.querySelector('#tail-group') : null;
            const head = svg ? svg.querySelector('#head-group') : null;
            const mouth = svg ? svg.querySelector('#mouth-visemes') : null;
            const rasterImgs = stage ? Array.from(stage.querySelectorAll('img')).filter((i) => (i.currentSrc || i.src).includes('-3d.webp')) : [];
            return {
              hasStage: Boolean(stage),
              hasAvatarSvg: Boolean(avatar && svg),
              character: avatar?.getAttribute('data-character'),
              tailTransform: tail?.getAttribute('transform') || '',
              headTransform: head?.getAttribute('transform') || '',
              hasMouth: Boolean(mouth),
              raster3dCount: rasterImgs.length,
            };
          });
          assert.equal(simMascotAudit.hasAvatarSvg, true, 'Desktop Voice Simulator must render inline animated SVG mascot');
          assert.equal(simMascotAudit.hasMouth, true, 'Desktop mascot must include #mouth-visemes');
          assert.ok(simMascotAudit.tailTransform.includes('rotate('), `Expected live native SVG tail transform, got "${simMascotAudit.tailTransform}"`);
          assert.equal(simMascotAudit.raster3dCount, 0, 'Desktop Voice Simulator must not mount old 3D raster cutouts');

          if (vp.slug === 'desktop') {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, `desktop-${theme}-simulator.png`), fullPage: false });
          }

          console.log(`  ✔ Desktop Landing + Animated SVG Mascot (${simMascotAudit.character}, tail="${simMascotAudit.tailTransform}") verified.`);
        } else {
          // Mobile Landing: 100dvh Zero-Scroll + Animated Tabby Kitten Emma SVG
          assert.ok(
            layoutAudit.verticalOverflowPx <= 2,
            `Mobile landing must fit on 100dvh with zero vertical scroll, got +${layoutAudit.verticalOverflowPx}px`
          );

          const mobileHeroAudit = await page.evaluate(() => {
            const hero = document.getElementById('mobile-hero-section');
            const avatar = hero ? hero.querySelector('[data-testid="tutor-avatar-svg"]') : null;
            const svg = avatar ? avatar.querySelector('svg') : null;
            const tail = svg ? svg.querySelector('#tail-group') : null;
            const whiskers = svg ? svg.querySelector('#whiskers-left') : null;
            return {
              hasAvatarSvg: Boolean(avatar && svg),
              character: avatar?.getAttribute('data-character'),
              tailTransform: tail?.getAttribute('transform') || '',
              hasWhiskers: Boolean(whiskers),
            };
          });
          assert.equal(mobileHeroAudit.hasAvatarSvg, true, 'Mobile Landing Hero must render inline animated SVG mascot');
          assert.equal(mobileHeroAudit.character, 'emma', 'Mobile Landing Hero defaults to Emma');
          assert.equal(mobileHeroAudit.hasWhiskers, true, 'Emma SVG must render #whiskers-left');

          if (vp.slug === 'mobile') {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, `mobile-${theme}-landing.png`), fullPage: false });
          }
          console.log(`  ✔ Mobile Landing 100dvh + Animated Emma Kitten SVG verified (0px scroll).`);
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

        // 5. AuthModal + HttpOnly Cookie Registration + FULL 4-TAB MOBILE PORTAL ZERO-SCROLL AUDIT
        if (vp.runFullAuth) {
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

          const lsAuthLeak = await page.evaluate(() =>
            Object.keys(localStorage).filter((k) => /token|jwt|ti_session/i.test(k))
          );
          assert.equal(lsAuthLeak.length, 0, `Found auth token leak in localStorage: ${lsAuthLeak.join(', ')}`);

          await page.reload({ waitUntil: 'networkidle' });
          await page.waitForSelector('#student-microlearning-dashboard', { state: 'visible' });

          // =========================================================================
          // PHASE 2 & 3: AUTHENTICATED MOBILE PORTAL ZERO-SCROLL 100dvh AUDIT
          // =========================================================================
          if (vp.isMobile) {
            const assertMobileZeroScroll = async (tabLabel) => {
              await page.waitForTimeout(220);
              const metrics = await page.evaluate(() => {
                const vOverflow = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                const hOverflow = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
                const footer = document.querySelector('footer');
                const footerVisible = Boolean(footer && footer.getBoundingClientRect().height > 0);
                const bottomNav = document.getElementById('mobile-portal-bottom-tabs');
                const bottomNavRect = bottomNav ? bottomNav.getBoundingClientRect() : null;
                const text = document.body.innerText || '';
                const forbidden = [
                  'Límite: 1 clase activa',
                  'disponible arriba',
                  'Voz Masculina',
                  'Voz Femenina',
                  'Inmersión Asincrónica 24/7 Activa',
                ].filter((s) => text.includes(s));
                return {
                  vOverflow,
                  hOverflow,
                  footerVisible,
                  bottomNavTop: bottomNavRect ? bottomNavRect.top : 0,
                  forbidden,
                };
              });
              assert.ok(metrics.vOverflow <= 1, `[${vp.name} ${theme}] ${tabLabel} must have ZERO vertical scroll (100dvh), got +${metrics.vOverflow}px`);
              assert.equal(metrics.hOverflow, 0, `[${vp.name} ${theme}] ${tabLabel} must have 0px horizontal overflow, got ${metrics.hOverflow}px`);
              assert.equal(metrics.footerVisible, false, `[${vp.name} ${theme}] Public <Footer /> must NOT be visible inside authenticated mobile portal (${tabLabel})`);
              assert.equal(metrics.forbidden.length, 0, `[${vp.name} ${theme}] ${tabLabel} contains audited bug string(s): ${metrics.forbidden.join(', ')}`);
              return metrics;
            };

            // TAB 1: MI RUTA
            await assertMobileZeroScroll('Mi Ruta');
            if (vp.slug === 'mobile') {
              await page.screenshot({ path: path.join(SCREENSHOT_DIR, `portal-${theme}-mi-ruta.png`), fullPage: false });
            }
            // Open & close Day Activity Sheet cleanly
            await page.click('#mobile-open-day-activity-btn');
            await page.waitForSelector('#mobile-day-activity-sheet', { state: 'visible' });
            await page.click('#mobile-close-day-activity-btn');

            // TAB 2: SIMULADOR (Animated Dog Ivan / Cat Emma Cockpit)
            await page.click('#mobile-tab-simulator');
            await page.waitForSelector('#mobile-voice-cockpit', { state: 'visible' });
            await assertMobileZeroScroll('Simulador');
            const simSvgOk = await page.evaluate(() => {
              const svg = document.querySelector('#mobile-voice-cockpit [data-testid="tutor-avatar-svg"] svg');
              return Boolean(svg && svg.querySelector('#tail-group') && svg.querySelector('#mouth-visemes'));
            });
            assert.equal(simSvgOk, true, 'Authenticated Mobile Simulator must render animated SVG animal mascot');
            if (vp.slug === 'mobile') {
              await page.screenshot({ path: path.join(SCREENSHOT_DIR, `portal-${theme}-simulador.png`), fullPage: false });
            }

            // TAB 3A: RECURSOS -> GENERADOR IA
            await page.click('#mobile-tab-resources');
            await page.waitForSelector('#mobile-resources-generator-view', { state: 'visible' });
            await assertMobileZeroScroll('Recursos (Generador IA)');
            const genCheck = await page.evaluate(() => {
              const input = document.getElementById('mobile-custom-resource-input');
              const fontSize = input ? parseFloat(getComputedStyle(input).fontSize) : 0;
              const promoCard = document.getElementById('quick-book-class-card');
              const promoVisible = Boolean(promoCard && promoCard.getBoundingClientRect().height > 0);
              return { fontSize, promoVisible };
            });
            assert.ok(genCheck.fontSize >= 16, `Mobile Generator input font must be >= 16px (iOS anti-zoom), got ${genCheck.fontSize}px`);
            assert.equal(genCheck.promoVisible, false, 'Misplaced 1-on-1 Class promo card must NOT be visible on mobile Recursos');
            if (vp.slug === 'mobile') {
              await page.screenshot({ path: path.join(SCREENSHOT_DIR, `portal-${theme}-recursos-gen.png`), fullPage: false });
            }

            // TAB 3B: RECURSOS -> MICRO-JUEGOS
            await page.click('#mobile-resources-tab-games');
            await page.waitForSelector('#mobile-microgames-view', { state: 'visible' });
            await assertMobileZeroScroll('Recursos (Micro-Juegos)');
            if (vp.slug === 'mobile') {
              await page.screenshot({ path: path.join(SCREENSHOT_DIR, `portal-${theme}-recursos-juegos.png`), fullPage: false });
            }
            // Launch & dismiss game sheet cleanly
            await page.click('#mobile-play-game-recast');
            await page.waitForSelector('#mobile-game-play-sheet', { state: 'visible' });
            await page.click('#mobile-close-game-sheet-btn');

            // TAB 4: CLASES (1-on-1 Scheduler)
            await page.click('#mobile-tab-schedule');
            await page.waitForSelector('#mobile-classes-view', { state: 'visible' });
            const classesMetrics = await assertMobileZeroScroll('Clases');
            const scheduleAudit = await page.evaluate((bottomNavTop) => {
              const dayPills = Array.from(document.querySelectorAll('#mobile-scheduler-day-pills button'));
              const slots = Array.from(document.querySelectorAll('#mobile-scheduler-slots-grid > *'));
              const allSlotsAboveNav = slots.every((el) => el.getBoundingClientRect().bottom <= bottomNavTop + 1);
              return {
                dayCount: dayPills.length,
                slotCount: slots.length,
                allSlotsAboveNav,
              };
            }, classesMetrics.bottomNavTop);
            assert.equal(scheduleAudit.dayCount, 5, 'Mobile Clases must show all 5 Mon–Fri day pills');
            assert.equal(scheduleAudit.slotCount, 6, 'Mobile Clases must show all 6 time slots (14:00–19:00 BOT) in 2x3 grid');
            assert.equal(scheduleAudit.allSlotsAboveNav, true, 'All 6 time slots must sit cleanly above the bottom app navigation bar');
            if (vp.slug === 'mobile') {
              await page.screenshot({ path: path.join(SCREENSHOT_DIR, `portal-${theme}-clases.png`), fullPage: false });
            }

            console.log(`  ✔ All 4 Authenticated Mobile Portal tabs (Simulador, Mi Ruta, Recursos [Gen+Juegos], Clases) verified 0px scroll inside 100dvh!`);
          } else {
            console.log('  ✔ Desktop AuthModal & HttpOnly ti_session persistence verified.');
          }
        }

        assert.equal(consoleErrors.length, 0, `Console errors on ${vp.name} (${theme}): ${consoleErrors.join(' | ')}`);
        assert.equal(pageErrors.length, 0, `Page errors on ${vp.name} (${theme}): ${pageErrors.join(' | ')}`);

        await context.close();
      }
    }

    console.log('\n=============================================================================');
    console.log(' ALL PHASE 1-4 RIGGED ANIMAL MASCOTS & ZERO-SCROLL MOBILE PORTAL CHECKS PASSED!');
    console.log('=============================================================================\n');
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
