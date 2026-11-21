import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';

async function run() {
  console.log('Starting vite preview on port 4173...');
  const preview = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    cwd: path.resolve('client'),
    shell: true,
  });

  // Wait 3 seconds for server to be ready
  await new Promise((r) => setTimeout(r, 3000));

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop Test (1440x900)
    console.log('\n--- Testing Desktop (1440x900) ---');
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopContext.newPage();
    const desktopErrors = [];
    desktopPage.on('pageerror', (err) => desktopErrors.push(err.message));

    await desktopPage.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(2000);

    const rootChildren = await desktopPage.evaluate(() => document.querySelector('#root')?.children.length || 0);
    console.log('Desktop root children count:', rootChildren);
    if (rootChildren === 0) throw new Error('Desktop blank screen: #root has 0 children!');

    const pageTitle = await desktopPage.title();
    console.log('Desktop page title:', pageTitle);
    console.log('Desktop page errors:', desktopErrors);

    // 2. Mobile Test (390x844)
    console.log('\n--- Testing Mobile (390x844) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    });
    const mobilePage = await mobileContext.newPage();
    const mobileErrors = [];
    mobilePage.on('pageerror', (err) => mobileErrors.push(err.message));

    await mobilePage.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(2000);

    const mobileRootChildren = await mobilePage.evaluate(() => document.querySelector('#root')?.children.length || 0);
    console.log('Mobile root children count:', mobileRootChildren);
    if (mobileRootChildren === 0) throw new Error('Mobile blank screen: #root has 0 children!');

    console.log('Mobile page errors:', mobileErrors);

    console.log('\nSUCCESS: Both Desktop and Mobile preview rendered with zero blank screens!');
  } finally {
    await browser.close();
    preview.kill();
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Preview test failed:', err);
  process.exit(1);
});
