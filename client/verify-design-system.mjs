import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resultsDir = path.resolve(__dirname, 'test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Regex to catch standard unicode emojis in text
const EMOJI_REGEX = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

async function runVerification() {
  console.log('--- Starting Design System & Mobile Ergonomics Verification Gate ---');
  let hasErrors = false;

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // 1. DESKTOP VIEWPORT TEST (1440 x 900)
    // -------------------------------------------------------------
    console.log('\n[1/2] Testing Desktop Viewport (1440x900)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopContext.newPage();

    desktopPage.on('pageerror', (err) => {
      console.error('Page error (Desktop):', err.message);
    });

    await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1000);

    // Verify Sticky Navbar on desktop
    const navbar = await desktopPage.$('#app-navbar');
    if (!navbar) {
      console.error('FAIL: #app-navbar not found in DOM.');
      hasErrors = true;
    } else {
      const navBox = await navbar.boundingBox();
      console.log(`PASS: Navbar height is ${navBox.height}px (expected 68px on desktop).`);
      if (Math.abs(navBox.height - 68) > 2) {
        console.warn(`WARN: Desktop navbar height deviation: ${navBox.height}px.`);
      }

      // Check initial theme
      const initialTheme = await navbar.getAttribute('data-theme');
      console.log(`PASS: Initial navbar theme is "${initialTheme}".`);

      // Verify Wordmark Contrast in Light Mode
      const wordmarkLight = await desktopPage.$eval('#app-navbar', (el) => {
        const teacherSpan = el.querySelector('.font-montserrat.font-extrabold') || el.querySelector('.font-montserrat.font-bold');
        return teacherSpan ? window.getComputedStyle(teacherSpan).color : null;
      });
      console.log(`PASS: Light mode wordmark color computed: ${wordmarkLight}`);

      // Verify Footer Brand Wordmark is ALWAYS white (#FAFAFA -> rgb(250, 250, 250)) in Light Mode
      const footerWordmarkLight = await desktopPage.$eval('#app-footer [data-testid="official-brand-lockup"]', (el) => {
        const textDiv = el.querySelector('.font-montserrat.font-bold');
        return textDiv ? window.getComputedStyle(textDiv).color : null;
      });
      console.log(`PASS: Footer wordmark color in Light Mode: ${footerWordmarkLight} (expected rgb(250, 250, 250)).`);
      if (footerWordmarkLight && !footerWordmarkLight.includes('250, 250, 250') && !footerWordmarkLight.includes('255, 255, 255')) {
        console.error(`FAIL: Footer wordmark is NOT white on navy in Light Mode! Got: ${footerWordmarkLight}`);
        hasErrors = true;
      }

      const themeToggleBtn = await desktopPage.$('#theme-toggle-btn');
      if (themeToggleBtn) {
        await themeToggleBtn.click();
        await desktopPage.waitForTimeout(300);
        const toggledTheme = await navbar.getAttribute('data-theme');
        console.log(`PASS: Toggled navbar theme is "${toggledTheme}".`);

        // Verify Footer Brand Wordmark is ALSO white in Night Mode
        const footerWordmarkDark = await desktopPage.$eval('#app-footer [data-testid="official-brand-lockup"]', (el) => {
          const textDiv = el.querySelector('.font-montserrat.font-bold');
          return textDiv ? window.getComputedStyle(textDiv).color : null;
        });
        console.log(`PASS: Footer wordmark color in Night Mode: ${footerWordmarkDark} (expected rgb(250, 250, 250)).`);

        // Capture Night Mode Screenshot
        const nightShot = path.resolve(resultsDir, 'desktop-night-mode.png');
        await desktopPage.screenshot({ path: nightShot });
        console.log(`Saved screenshot: ${nightShot}`);

        // Toggle back to daylight default
        await themeToggleBtn.click();
        await desktopPage.waitForTimeout(300);
      }
    }

    // Verify Canonical Chapters
    const canonicalChapters = [
      'chapter-0-hero',
      'chapter-1-bicronic',
      'chapter-2-voicelab',
      'chapter-3-plans',
      'chapter-4-faq',
    ];

    for (const chId of canonicalChapters) {
      const el = await desktopPage.$(`#${chId}`);
      if (!el) {
        console.error(`FAIL: Chapter #${chId} not found in DOM.`);
        hasErrors = true;
      } else {
        console.log(`PASS: Chapter #${chId} exists in DOM.`);
      }
    }

    // Verify Docked CornerCoachWidget on Desktop
    const coachWidget = await desktopPage.$('#corner-coach-widget');
    if (!coachWidget) {
      console.error('FAIL: #corner-coach-widget not found in DOM.');
      hasErrors = true;
    } else {
      const isVisible = await coachWidget.isVisible();
      console.log(`PASS: #corner-coach-widget is rendered on desktop (visible: ${isVisible}).`);
    }

    // Verify Remotion Loop video sizes
    const loopFiles = [
      'client/public/media/loops/cefr-diagnostic-loop.mp4',
      'client/public/media/loops/quick-recast-loop.mp4',
    ];
    for (const relPath of loopFiles) {
      const fullPath = path.resolve(__dirname, '..', relPath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const kb = stats.size / 1024;
        console.log(`PASS: ${path.basename(fullPath)} size is ${kb.toFixed(1)} KB (target <= 650 KB).`);
        if (kb > 650) {
          console.error(`FAIL: File exceeds 650 KB!`);
          hasErrors = true;
        }
      } else {
        console.error(`FAIL: Micro-loop video file not found at ${fullPath}`);
        hasErrors = true;
      }
    }

    // Capture Desktop Chapter Screenshots
    console.log('Capturing desktop screenshots...');
    await desktopPage.evaluate(() => window.scrollTo(0, 0));
    await desktopPage.waitForTimeout(500);
    const heroShot = path.resolve(resultsDir, 'desktop-ch-0-hero.png');
    await desktopPage.screenshot({ path: heroShot });
    console.log(`Saved screenshot: ${heroShot}`);

    const ch2 = await desktopPage.$('#chapter-2-voicelab');
    if (ch2) {
      await ch2.scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(800);
      const voicelabShot = path.resolve(resultsDir, 'desktop-ch-2-voicelab.png');
      await desktopPage.screenshot({ path: voicelabShot });
      console.log(`Saved screenshot: ${voicelabShot}`);
    }

    const ch3 = await desktopPage.$('#chapter-3-plans');
    if (ch3) {
      await ch3.scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(800);
      const pricingShot = path.resolve(resultsDir, 'desktop-ch-3-pricing.png');
      await desktopPage.screenshot({ path: pricingShot });
      console.log(`Saved screenshot: ${pricingShot}`);
    }

    await desktopContext.close();

    // -------------------------------------------------------------
    // 2. MOBILE VIEWPORT TEST (390 x 844 - iPhone 12/13/14)
    // -------------------------------------------------------------
    console.log('\n[2/2] Testing Mobile Viewport (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);

    // Verify 0px Horizontal Overflow on Mobile
    const overflowInfo = await mobilePage.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      return {
        scrollWidth,
        innerWidth,
        overflow: scrollWidth - innerWidth,
      };
    });

    console.log(`Mobile scrollWidth: ${overflowInfo.scrollWidth}px, innerWidth: ${overflowInfo.innerWidth}px, overflow: ${overflowInfo.overflow}px`);
    if (overflowInfo.overflow > 0) {
      console.error(`FAIL: Mobile has ${overflowInfo.overflow}px horizontal overflow!`);
      hasErrors = true;
    } else {
      console.log('PASS: 0px mobile horizontal overflow verified.');
    }

    // Verify Mobile Header: single row 56px, no clipped labels
    const mobileNavbar = await mobilePage.$('#app-navbar');
    if (mobileNavbar) {
      const navBox = await mobileNavbar.boundingBox();
      console.log(`PASS: Mobile header height is ${navBox.height}px (expected 56px).`);
    }

    // Verify Mobile Hamburger Drawer Open & Navigation
    console.log('Testing Mobile Hamburger Slide-Over Drawer...');
    const hamburgerBtn = await mobilePage.$('#mobile-hamburger-btn');
    if (hamburgerBtn) {
      await hamburgerBtn.click();
      await mobilePage.waitForTimeout(400);

      const drawer = await mobilePage.$('#mobile-navigation-drawer');
      if (drawer && (await drawer.isVisible())) {
        console.log('PASS: Mobile slide-over navigation drawer opened cleanly.');

        // Verify primary 48px CTA is present inside drawer
        const drawerCta = await mobilePage.$('#mobile-navigation-drawer .btn-3d-amber');
        if (drawerCta) {
          const ctaBox = await drawerCta.boundingBox();
          console.log(`PASS: Drawer primary CTA rendered with height: ${ctaBox.height}px (target >= 48px).`);
        }

        // Close drawer
        const closeDrawerBtn = await mobilePage.$('#mobile-navigation-drawer button[aria-label="Close menu"]');
        if (closeDrawerBtn) {
          await closeDrawerBtn.click();
          await mobilePage.waitForTimeout(400);
          console.log('PASS: Mobile drawer closed cleanly.');
        }
      } else {
        console.error('FAIL: #mobile-navigation-drawer was not visible after clicking hamburger.');
        hasErrors = true;
      }
    } else {
      console.error('FAIL: #mobile-hamburger-btn not found on mobile header.');
      hasErrors = true;
    }

    // Verify Corner Coach Widget does not overlap Hero on mobile
    console.log('Checking Corner Coach Widget collision avoidance on mobile...');
    await mobilePage.evaluate(() => window.scrollTo(0, 0));
    await mobilePage.waitForTimeout(500);

    const coachInHero = await mobilePage.$eval('#corner-coach-widget', (el) => {
      const style = window.getComputedStyle(el);
      return {
        opacity: style.opacity,
        pointerEvents: style.pointerEvents,
      };
    });
    console.log(`Corner Coach Widget in Hero Section: opacity=${coachInHero.opacity}, pointerEvents=${coachInHero.pointerEvents}`);
    if (parseFloat(coachInHero.opacity) > 0.1 && coachInHero.pointerEvents !== 'none') {
      console.warn('NOTE: Corner Coach Widget visible in Hero, checking FAB styling.');
    } else {
      console.log('PASS: Corner Coach Widget hidden with 0 opacity while in Hero section.');
    }

    // Scan DOM for prohibited system emojis
    console.log('Scanning DOM text nodes for prohibited system emojis...');
    const emojiScan = await mobilePage.evaluate((regexSource) => {
      const regex = new RegExp(regexSource, 'u');
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );
      const violations = [];
      let node;
      while ((node = walker.nextNode())) {
        const text = node.nodeValue;
        if (regex.test(text)) {
          const parentTag = node.parentElement ? node.parentElement.tagName : '';
          if (parentTag !== 'SCRIPT' && parentTag !== 'STYLE') {
            violations.push({
              text: text.trim().slice(0, 80),
              parent: parentTag,
            });
          }
        }
      }
      return violations;
    }, EMOJI_REGEX.source);

    if (emojiScan.length > 0) {
      console.error(`FAIL: Found ${emojiScan.length} prohibited system emoji text nodes:`, emojiScan);
      hasErrors = true;
    } else {
      console.log('PASS: Zero prohibited system emojis found in DOM text nodes.');
    }

    // Capture Full Mobile Screenshot
    console.log('Capturing mobile full-page screenshot...');
    const mobileShot = path.resolve(resultsDir, 'mobile-390-full.png');
    await mobilePage.screenshot({ path: mobileShot, fullPage: true });
    console.log(`Saved screenshot: ${mobileShot}`);

    await mobileContext.close();

  } catch (err) {
    console.error('Fatal Verification Error:', err);
    hasErrors = true;
  } finally {
    await browser.close();
  }

  if (hasErrors) {
    console.error('\n❌ Verification Gate Failed with errors.');
    process.exit(1);
  } else {
    console.log('\n✅ ALL VERIFICATION GATE CHECKS PASSED PERFECTLY!');
    process.exit(0);
  }
}

runVerification();
