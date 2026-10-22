const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);

  // Screenshot logged-out header
  await page.screenshot({ path: 'scratch/header_logged_out_360.png', clip: { x: 0, y: 0, width: 360, height: 60 } });

  // Open login and log in as ivan
  await page.click('#signin-nav-btn');
  await page.waitForTimeout(400);
  await page.fill('#auth-signin-username-input', 'ivan');
  await page.fill('#auth-signin-password-input', 'IvanAdmin2026!');
  await page.click('#auth-signin-submit-btn');
  await page.waitForTimeout(1000);

  // Screenshot logged-in header
  await page.screenshot({ path: 'scratch/header_logged_in_360.png', clip: { x: 0, y: 0, width: 360, height: 60 } });

  console.log('Mobile screenshots captured successfully.');
  await browser.close();
})();
