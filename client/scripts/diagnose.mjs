import { chromium } from 'playwright';

async function diagnose(url, name, viewport) {
  console.log(`\n======================================================`);
  console.log(`Diagnosing ${name} (${url}) at ${viewport.width}x${viewport.height}`);
  console.log(`======================================================`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.stack || err.message);
  });

  page.on('requestfailed', (req) => {
    failedRequests.push(`FAILED: ${req.method()} ${req.url()} - ${req.failure()?.errorText || 'Unknown'}`);
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedRequests.push(`HTTP ${res.status()}: ${res.request().method()} ${res.url()}`);
    }
  });

  try {
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`Navigation status: ${res ? res.status() : 'null'}`);
  } catch (err) {
    console.error(`Navigation error: ${err.message}`);
  }

  // Check DOM state
  const rootHtml = await page.evaluate(() => {
    const el = document.querySelector('#root');
    return {
      exists: Boolean(el),
      innerHTML: el ? el.innerHTML.slice(0, 500) : '',
      length: el ? el.innerHTML.length : 0,
      childrenCount: el ? el.children.length : 0,
    };
  });

  // Check Service Workers
  const swInfo = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { supported: false, count: 0 };
    const regs = await navigator.serviceWorker.getRegistrations();
    return {
      supported: true,
      count: regs.length,
      scopes: regs.map((r) => r.scope),
      activeScripts: regs.map((r) => r.active?.scriptURL || 'none'),
    };
  });

  // Check Title & Headings
  const title = await page.title();
  const h1Text = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1 ? { text: h1.textContent, offsetHeight: h1.offsetHeight } : null;
  });

  console.log(`Title: ${title}`);
  console.log(`#root: exists=${rootHtml.exists}, len=${rootHtml.length}, children=${rootHtml.childrenCount}`);
  console.log(`H1: ${JSON.stringify(h1Text)}`);
  console.log(`Service Workers: ${JSON.stringify(swInfo)}`);

  if (consoleLogs.length > 0) {
    console.log(`\n--- Console Logs (${consoleLogs.length}) ---`);
    consoleLogs.forEach((l) => console.log(l));
  } else {
    console.log(`Console Logs: 0 warnings/errors`);
  }

  if (pageErrors.length > 0) {
    console.log(`\n--- Page Errors (${pageErrors.length}) ---`);
    pageErrors.forEach((e) => console.log(e));
  } else {
    console.log(`Page Errors: 0`);
  }

  if (failedRequests.length > 0) {
    console.log(`\n--- Failed Requests (${failedRequests.length}) ---`);
    failedRequests.forEach((r) => console.log(r));
  } else {
    console.log(`Failed Requests: 0`);
  }

  await browser.close();
}

async function main() {
  const desktop = { width: 1440, height: 900 };
  const mobile = { width: 390, height: 844 };

  // 1. Production Site
  await diagnose('https://teacherivan.com', 'PROD (Desktop)', desktop);
  await diagnose('https://teacherivan.com', 'PROD (Mobile)', mobile);
}

main().catch(console.error);
