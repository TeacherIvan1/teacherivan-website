import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, '..');
const publicDir = path.resolve(clientRoot, 'public');

// Read Master Logo SVG
const logoSvgPath = path.join(publicDir, 'assets', 'branding', 'logo-icon-mark.svg');
const logoSvg = fs.readFileSync(logoSvgPath, 'utf8').replace(/<\?xml[\s\S]*?\?>/g, '').trim();

const logoDarkPath = path.join(publicDir, 'assets', 'branding', 'logo-primary-dark.svg');
const logoDarkSvg = fs.readFileSync(logoDarkPath, 'utf8').replace(/<\?xml[\s\S]*?\?>/g, '').trim();

async function generatePwaAndOg() {
  console.log('[PWA/OG] Launching Playwright browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 2 });

  // 1. Apple Touch Icon (180x180)
  const icon180Page = await context.newPage();
  await icon180Page.setViewportSize({ width: 180, height: 180 });
  await icon180Page.setContent(`<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 180px;
      height: 180px;
      background: #1A3153;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 40px;
    }
    .wrap {
      width: 140px;
      height: 140px;
    }
  </style>
</head>
<body>
  <div class="wrap">${logoSvg}</div>
</body>
</html>`);
  await icon180Page.screenshot({ path: path.join(publicDir, 'apple-touch-icon.png') });
  console.log('[PWA/OG] Generated: apple-touch-icon.png');
  await icon180Page.close();

  // 2. Icon 192 (192x192)
  const icon192Page = await context.newPage();
  await icon192Page.setViewportSize({ width: 192, height: 192 });
  await icon192Page.setContent(`<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 192px;
      height: 192px;
      background: #1A3153;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 44px;
    }
    .wrap {
      width: 150px;
      height: 150px;
    }
  </style>
</head>
<body>
  <div class="wrap">${logoSvg}</div>
</body>
</html>`);
  await icon192Page.screenshot({ path: path.join(publicDir, 'icon-192.png') });
  console.log('[PWA/OG] Generated: icon-192.png');
  await icon192Page.close();

  // 3. Icon 512 (512x512)
  const icon512Page = await context.newPage();
  await icon512Page.setViewportSize({ width: 512, height: 512 });
  await icon512Page.setContent(`<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 512px;
      height: 512px;
      background: #1A3153;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 110px;
    }
    .wrap {
      width: 400px;
      height: 400px;
    }
  </style>
</head>
<body>
  <div class="wrap">${logoSvg}</div>
</body>
</html>`);
  await icon512Page.screenshot({ path: path.join(publicDir, 'icon-512.png') });
  console.log('[PWA/OG] Generated: icon-512.png');
  await icon512Page.close();

  // 4. OpenGraph Social Card (1200x630)
  const ogPage = await context.newPage();
  await ogPage.setViewportSize({ width: 1200, height: 630 });
  await ogPage.setContent(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Inter:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      background: radial-gradient(circle at 65% 30%, #1e3960 0%, #1A3153 50%, #091326 100%);
      font-family: 'Montserrat', sans-serif;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 70px 80px;
      color: #FAFAFA;
    }
    .bg-grid {
      position: absolute;
      inset: 0;
      opacity: 0.08;
      background-image: 
        linear-gradient(to right, rgba(167, 199, 231, 0.25) 1.5px, transparent 1.5px),
        linear-gradient(to bottom, rgba(167, 199, 231, 0.25) 1.5px, transparent 1.5px);
      background-size: 70px 70px;
      pointer-events: none;
    }
    .ambient-glow {
      position: absolute;
      top: -100px;
      right: -100px;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(224, 155, 48, 0.28) 0%, transparent 65%);
      filter: blur(60px);
      pointer-events: none;
    }
    .content-left {
      width: 660px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      z-index: 10;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(250, 250, 250, 0.08);
      border: 1.5px solid #A7C7E7;
      border-radius: 9999px;
      padding: 6px 20px;
      width: fit-content;
    }
    .badge-pill .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #E09B30;
      box-shadow: 0 0 8px #E09B30;
    }
    .badge-pill span {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.16em;
      color: #FAFAFA;
      text-transform: uppercase;
    }
    .main-title {
      font-size: 54px;
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: #FAFAFA;
    }
    .main-title span {
      color: #E09B30;
    }
    .subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: #A7C7E7;
      line-height: 1.4;
    }
    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #E09B30;
      color: #091326;
      padding: 14px 34px;
      border-radius: 9999px;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.05em;
      width: fit-content;
      box-shadow: 0 10px 30px rgba(224, 155, 48, 0.4);
      margin-top: 8px;
    }
    .card-right {
      width: 360px;
      height: 360px;
      border-radius: 56px;
      background: linear-gradient(145deg, #1E3960, #12223A);
      border: 3px solid rgba(167, 199, 231, 0.35);
      box-shadow: 
        0 24px 0 #091326,
        0 40px 80px rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      padding: 30px;
    }
    .card-right svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 15px 30px rgba(0,0,0,0.5));
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="ambient-glow"></div>

  <div class="content-left">
    <div class="badge-pill">
      <div class="dot"></div>
      <span>MÉTODO BICRÓNICO • CLASES EN VIVO + IA</span>
    </div>

    <h1 class="main-title">
      HABLA INGLÉS SIN BLOQUEOS CON <span>TEACHER IVAN</span>
    </h1>

    <p class="subtitle">
      Clases 1-a-1 de alta intensidad + Tutor de Voz IA disponible 24/7. Diagnóstico hablado en 90 segundos.
    </p>

    <div class="cta-button">
      PROBAR MI NIVEL EN 90S GRATIS →
    </div>
  </div>

  <div class="card-right">
    ${logoSvg}
  </div>
</body>
</html>`);
  await ogPage.screenshot({ path: path.join(publicDir, 'og-preview-1200x630.png') });
  console.log('[PWA/OG] Generated: og-preview-1200x630.png');
  await ogPage.close();

  await browser.close();
  console.log('[PWA/OG] All client PWA & OpenGraph assets generated successfully!');
}

generatePwaAndOg().catch((err) => {
  console.error('[PWA/OG] Error:', err);
  process.exit(1);
});