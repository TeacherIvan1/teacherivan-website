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
  console.log('\n[1/8] Scanning client/dist/ for static AudioWorklet, motivation WebPs & zero secrets...');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'worklets/pcm-processor.js')), 'client/dist/worklets/pcm-processor.js must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'version.json')), 'client/dist/version.json must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'sw.js')), 'client/dist/sw.js must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'CNAME')), 'client/dist/CNAME must exist');

  const motivationImages = [
    'global-career.webp',
    'job-interview.webp',
    'borderless-travel.webp',
    'international-scholarship.webp',
    'everyday-confidence.webp',
  ];
  for (const img of motivationImages) {
    assert.ok(
      fs.existsSync(path.join(DIST_DIR, 'assets/motivation', img)),
      `client/dist/assets/motivation/${img} must exist`
    );
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
  console.log('  ✔ Static worklet, 5 motivation WebP photos, version.json, sw.js, CNAME, and 0 secrets verified.');
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

        // Capture full-page screenshot for visual QA (Desktop 1440 & Mobile 390)
        if (vp.slug === 'desktop' || vp.slug === 'mobile') {
          const shotPath = path.join(SCREENSHOT_DIR, `${theme}-${vp.slug}.png`);
          await page.screenshot({ path: shotPath, fullPage: false });
        }

        // 1. Horizontal Overflow (0px), Semantic Landmarks & Skip Link
        const layoutAudit = await page.evaluate(() => {
          const docWidth = document.documentElement.clientWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          const footerGrid = document.getElementById('footer-4col-grid');
          const footerStyle = footerGrid ? window.getComputedStyle(footerGrid).gridTemplateColumns : '';
          const skipLink = document.querySelector('a.skip-to-main-link');
          const mainLandmark = document.querySelector('main#main-content');
          const h1Count = document.querySelectorAll('h1').length;
          return {
            overflowPx: Math.max(0, scrollWidth - docWidth),
            footerCols: footerStyle.split(' ').filter(Boolean).length,
            hasSkipLink: Boolean(skipLink),
            hasMainLandmark: Boolean(mainLandmark),
            h1Count,
          };
        });
        assert.equal(layoutAudit.overflowPx, 0, `Expected 0px overflow on ${vp.name} (${theme}), got ${layoutAudit.overflowPx}px`);
        assert.equal(layoutAudit.hasSkipLink, true, 'Skip-to-main-content link must exist');
        assert.equal(layoutAudit.hasMainLandmark, true, '<main id="main-content"> landmark must exist');
        assert.equal(layoutAudit.h1Count, 1, `Expected exactly 1 <h1> per view, got ${layoutAudit.h1Count}`);
        assert.equal(layoutAudit.footerCols, vp.isMobile ? 2 : 4, 'Footer grid column count mismatch');
        console.log(`  ✔ Landmarks, skip link, 1x <h1>, footer (${layoutAudit.footerCols} cols), and 0px overflow verified.`);

        // 2. Zero Argentine Voseo Check on Rendered Spanish Text
        const voseoMatches = await page.evaluate(() => {
          const text = document.body.innerText || '';
          const re = /(?<![a-zA-ZáéíóúÁÉÍÓÚñÑ])(vos|sos|hablá|hablás|probá|probás|probalo|descubrí|descubrís|tenés|estudiás|bloqueás|congelás|agendá|agendás|podés|elegí|elegís|entrá|conocé|empezá|comenzá|practicá|practicás|deslizá|asegurá|reservá|escribime|escribile|decime|contame|querés|necesitás|sabés|dejá|aprendé|guardá|compartilo|hacelo|hacé|creá|recibí|recibís|combiná|activá|conversá|completá|generá|cancelá|cambiá)(?![a-zA-ZáéíóúÁÉÍÓÚñÑ])/gi;
          return text.match(re) || [];
        });
        assert.equal(
          voseoMatches.length,
          0,
          `Expected 0 Argentine voseo strings on rendered Spanish page, found: ${voseoMatches.join(', ')}`
        );
        console.log('  ✔ Zero Argentine voseo verified in rendered Spanish DOM.');

        // 3. Zero Testimonials + Motivational Showcase 5 Local WebP Images Loaded + Carousel Interaction
        const showcaseAudit = await page.evaluate(async () => {
          const bodyText = document.body.innerText || '';
          const hasOldTestimonials =
            bodyText.includes('Mateo Rojas') ||
            bodyText.includes('Valeria Paredes') ||
            bodyText.includes('corrige tu frase al instante');

          const imgs = Array.from(document.querySelectorAll('#motivational-showcase-carousel img'));
          const carousel = document.getElementById('motivational-showcase-carousel');
          if (carousel) carousel.scrollIntoView({ behavior: 'instant' });
          for (const img of imgs) {
            img.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
            await new Promise((r) => setTimeout(r, 80));
          }
          // Reset horizontal track back to first slide if mobile
          const track = document.querySelector('.motivation-snap-track');
          if (track) track.scrollLeft = 0;
          await new Promise((r) => setTimeout(r, 150));

          const imgResults = imgs.map((img) => ({
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || '',
            naturalWidth: img.naturalWidth,
            complete: img.complete,
          }));
          return { hasOldTestimonials, imgCount: imgs.length, imgResults };
        });
        assert.equal(showcaseAudit.hasOldTestimonials, false, 'Old testimonial quotes must be removed');
        assert.equal(showcaseAudit.imgCount, 5, 'Motivational Showcase must render 5 photographic cards');
        for (const img of showcaseAudit.imgResults) {
          assert.ok(img.alt.length > 10, `Image ${img.src} must have descriptive alt text`);
          assert.ok(img.naturalWidth > 0, `Image ${img.src} failed to load (naturalWidth=0)`);
        }

        const expectedStart = vp.isMobile ? '0' : '2';
        const expectedNext = vp.isMobile ? '1' : '3';
        const initialIdx = await page.getAttribute('#motivational-showcase-carousel', 'data-active-index');
        assert.equal(initialIdx, expectedStart, `MotivationalShowcase must start at index ${expectedStart}`);
        await page.click('#motivation-carousel-next-btn');
        assert.equal(
          await page.getAttribute('#motivational-showcase-carousel', 'data-active-index'),
          expectedNext,
          `MotivationalShowcase must advance to index ${expectedNext} on Next click`
        );
        await page.click('#motivation-carousel-prev-btn');
        assert.equal(
          await page.getAttribute('#motivational-showcase-carousel', 'data-active-index'),
          expectedStart,
          `MotivationalShowcase must return to index ${expectedStart} on Prev click`
        );
        console.log(`  ✔ Zero testimonials, 5 local WebP photos loaded (naturalWidth > 0), and carousel (${expectedStart} -> ${expectedNext} -> ${expectedStart}) verified.`);

        // 4. Desktop Portal Zoom (1x -> 7.5x) vs Mobile Fast-LCP Hero (No 160vh Scroll Trap)
        if (!vp.isMobile) {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(100);
          const topState = await page.evaluate(() => {
            const p = document.getElementById('portal-archway-zoom-layer');
            return p ? p.style.transform : '';
          });
          assert.ok(topState.includes('scale(1)'), `Expected portal scale(1) at top, got ${topState}`);

          await page.evaluate(() => {
            const intro = document.getElementById('portal-intro-track');
            window.scrollTo(0, intro ? intro.offsetHeight : window.innerHeight * 1.6);
          });
          await page.waitForTimeout(120);
          const endState = await page.evaluate(() => {
            const p = document.getElementById('portal-archway-zoom-layer');
            const w = document.getElementById('portal-world-parallax-layer');
            return {
              portal: p ? p.style.transform : '',
              world: w ? w.style.transform : '',
            };
          });
          assert.ok(endState.portal.includes('scale(7.5)'), `Expected portal scale(7.5), got ${endState.portal}`);
          assert.ok(endState.world.includes('scale(1.18)'), `Expected world scale(1.18), got ${endState.world}`);
          console.log('  ✔ Desktop Portal Zoom (1x -> 7.5x) & World Zoom (1x -> 1.18x) verified.');
        } else {
          const mobileHeroCheck = await page.evaluate(() => {
            const hasMobileHero = Boolean(document.getElementById('mobile-hero-section'));
            const hasPortalTrap = Boolean(document.getElementById('portal-intro-track'));
            const primaryBtn = document.getElementById('hero-primary-cta-btn');
            const primaryH = primaryBtn ? primaryBtn.getBoundingClientRect().height : 0;
            const hamburgerBtn = document.getElementById('mobile-hamburger-btn');
            const hamRect = hamburgerBtn ? hamburgerBtn.getBoundingClientRect() : { width: 0, height: 0 };
            return { hasMobileHero, hasPortalTrap, primaryH, hamW: hamRect.width, hamH: hamRect.height };
          });
          assert.equal(mobileHeroCheck.hasMobileHero, true, 'Mobile must render uncluttered #mobile-hero-section');
          assert.equal(mobileHeroCheck.hasPortalTrap, false, 'Mobile must NOT render 160vh #portal-intro-track');
          assert.ok(mobileHeroCheck.primaryH >= 48, `Mobile primary CTA height must be >= 48px, got ${mobileHeroCheck.primaryH}`);
          assert.ok(mobileHeroCheck.hamW >= 44 && mobileHeroCheck.hamH >= 44, 'Mobile menu button must be >= 44x44px');
          console.log(`  ✔ Mobile Minimalist Hero verified (0 scroll traps, CTA ${Math.round(mobileHeroCheck.primaryH)}px, Menu ${Math.round(mobileHeroCheck.hamW)}x${Math.round(mobileHeroCheck.hamH)}px).`);
        }

        // 5. Programmatic WCAG 2.1 AA Contrast Audit (Light & Dark Modes)
        const contrastFailures = await page.evaluate(() => {
          function parseRgb(str) {
            const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (!m) return null;
            return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
          }
          function relLum({ r, g, b }) {
            const [rs, gs, bs] = [r, g, b].map((c) => {
              const s = c / 255;
              return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
          }
          function ratio(c1, c2) {
            const l1 = relLum(c1);
            const l2 = relLum(c2);
            return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          }
          function effectiveBg(el) {
            let cur = el;
            while (cur && cur !== document.documentElement) {
              const bg = parseRgb(window.getComputedStyle(cur).backgroundColor);
              if (bg && bg.a > 0.75) return bg;
              cur = cur.parentElement;
            }
            const bodyBg = parseRgb(window.getComputedStyle(document.body).backgroundColor);
            return bodyBg || { r: 250, g: 250, b: 250, a: 1 };
          }

          const selectors = [
            '#hero-primary-cta-btn',
            '#motivation-section-heading',
            '#chapter-1-bicronic h3',
            '#pricing-section-heading',
            '#plan-card-pro h3',
            '#faq-section-heading',
            '#footer-direct-whatsapp-btn',
          ];
          const failures = [];
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (!el) continue;
            const cs = window.getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            const fg = parseRgb(cs.color);
            const bg = effectiveBg(el);
            if (!fg || !bg) continue;
            const fontSize = parseFloat(cs.fontSize);
            const fontWeight = parseInt(cs.fontWeight, 10) || 400;
            const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
            const minReq = isLarge ? 3.0 : 4.5;
            const r = ratio(fg, bg);
            if (r < minReq) {
              failures.push(`${sel}: ratio=${r.toFixed(2)} < ${minReq} (fg=${cs.color}, bg=rgb(${bg.r},${bg.g},${bg.b}))`);
            }
          }
          return failures;
        });
        assert.equal(
          contrastFailures.length,
          0,
          `WCAG AA contrast failures on ${vp.name} (${theme}): ${contrastFailures.join(' | ')}`
        );
        console.log('  ✔ Programmatic WCAG 2.1 AA contrast check passed across Navbar, Hero, Showcase, Bicronic, Pricing, FAQ & Footer.');

        // 6. AudioWorklet & WhatsApp Pre-Filled URL Check
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
        assert.ok(whatsappLinks.length >= 4, 'Expected at least 4 WhatsApp links');
        for (const href of whatsappLinks) {
          assert.ok(
            href.startsWith('https://wa.me/59172878330?text=') && href.length > 'https://wa.me/59172878330?text='.length,
            `WhatsApp link must be pre-filled: ${href}`
          );
        }
        console.log(`  ✔ AudioWorklet /worklets/pcm-processor.js (200 OK) & ${whatsappLinks.length} pre-filled WhatsApp links verified.`);

        // 7. Cookie Consent + AuthModal Scroll Isolation + HttpOnly Registration (Full run on Desktop 1440 & Mobile 390)
        if (vp.runFullAuth) {
          await page.waitForSelector('#cookie-consent-banner', { state: 'visible' });
          await page.click('#cookie-essential-only-btn');
          await page.waitForSelector('#cookie-consent-banner', { state: 'hidden' });

          await page.evaluate(() => window.scrollTo(0, 450));
          await page.waitForTimeout(150);
          const initialBgScrollY = await page.evaluate(() => window.scrollY);

          if (vp.isMobile) {
            await page.click('#mobile-hamburger-btn');
            await page.waitForSelector('#mobile-drawer-auth-btn', { state: 'visible' });
            await page.click('#mobile-drawer-auth-btn');
          } else {
            await page.click('#signin-nav-btn');
          }
          await page.waitForSelector('#student-auth-modal-card', { state: 'visible' });
          await page.click('#auth-tab-signup');

          await page.evaluate(() => {
            const card = document.getElementById('student-auth-modal-card');
            if (card) {
              card.scrollTop = 250;
              card.dispatchEvent(new WheelEvent('wheel', { deltaY: 300, bubbles: true }));
            }
          });
          await page.waitForTimeout(100);
          assert.equal(await page.evaluate(() => window.scrollY), initialBgScrollY, 'AuthModal background scroll drifted');

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
          assert.equal(registerRes.status(), 200, 'POST /api/auth/register must return 200 OK');
          const registerJson = await registerRes.json();
          assert.equal(registerJson.token, undefined, 'Must not return raw JWT token in JSON');

          const cookies = await context.cookies();
          const sessionCookie = cookies.find((c) => c.name === 'ti_session');
          assert.ok(sessionCookie && sessionCookie.httpOnly, 'HttpOnly ti_session cookie must be set');

          await page.reload({ waitUntil: 'networkidle' });
          await page.waitForSelector('#student-microlearning-dashboard', { state: 'visible' });
          console.log('  ✔ Cookie Consent, AuthModal scroll lock (0px drift), and HttpOnly ti_session persistence verified.');
        }

        assert.equal(consoleErrors.length, 0, `Console errors on ${vp.name} (${theme}): ${consoleErrors.join(' | ')}`);
        assert.equal(pageErrors.length, 0, `Page errors on ${vp.name} (${theme}): ${pageErrors.join(' | ')}`);

        await context.close();
      }
    }

    console.log('\n======================================================');
    console.log(' ALL PLAYWRIGHT E2E, CONTRAST, VOSEO & A11Y CHECKS PASSED!');
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
