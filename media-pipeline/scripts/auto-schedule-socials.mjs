#!/usr/bin/env node
/**
 * ==============================================================================
 * Teacher Ivan - Zero-API-Key Playwright Multi-Platform Auto-Scheduler
 * Script: auto-schedule-socials.mjs
 * ==============================================================================
 * Uses a persistent Chromium profile (.browser-profile) so Teacher Ivan logs into
 * TikTok Studio, Meta Business Suite (IG + FB), and YouTube Studio once.
 *
 * Rules:
 * - Rule #5: "Nada se publica solo" — stages/attaches video + caption and holds
 *   on the final confirmation button for user approval.
 * - Frame 0 Cover Bake: Prepends cover-thumbnail.png for 0.15s (frame 0) into each
 *   .mp4 via FFmpeg so YouTube Shorts (which selects frame 0) displays the crisp hook.
 * - Robust contenteditable typing: Uses click, Select All, Backspace, and
 *   page.keyboard.insertText() to populate Lexical, DraftEditor, and YouTube editors.
 * - Injected Floating Helper Badge: Injects a 1-click clipboard / auto-fill helper
 *   badge into each open tab for instant recovery if platform DOMs shift.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import readline from 'readline';
import { execFileSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaPipelineRoot = path.resolve(__dirname, '..');
const defaultCampaignDir = path.resolve(
  mediaPipelineRoot,
  'output',
  'november-campaign',
  'Phase1-Week1-Nov02-06'
);
const browserProfileDir = path.resolve(mediaPipelineRoot, '.browser-profile');

if (!fs.existsSync(browserProfileDir)) {
  fs.mkdirSync(browserProfileDir, { recursive: true });
}

const PLATFORM_URLS = {
  tiktok: 'https://www.tiktok.com/tiktokstudio/upload',
  tiktokFallback: 'https://www.tiktok.com/creator-center/upload?from=webapp',
  meta: 'https://business.facebook.com/latest/reels_composer',
  metaFallback: 'https://business.facebook.com/latest/composer',
  youtube: 'https://studio.youtube.com/channel/UC/videos/upload?d=ud',
};

function askConfirmation(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    });
  });
}

/**
 * Prepend cover-thumbnail.png for 0.15s (frame 0) into .mp4 via FFmpeg.
 * This guarantees YouTube Shorts, Meta, and TikTok display the high-res hook card.
 */
export function ensureCoverBake(videoPath, coverPath) {
  if (!coverPath || !fs.existsSync(coverPath) || !fs.existsSync(videoPath)) {
    return videoPath;
  }
  const markerPath = `${videoPath}.cover-baked`;
  if (fs.existsSync(markerPath)) {
    console.log(`  ℹ️ Portada ya horneada en frame 0 (${path.basename(videoPath)})`);
    return videoPath;
  }

  console.log(`  🎬 Horneando portada en frame 0 (0.15s) de ${path.basename(videoPath)} para YouTube Shorts / Meta / TikTok...`);
  const tempOut = `${videoPath}.tmp-cover.mp4`;

  try {
    const args = [
      '-y',
      '-loop', '1',
      '-framerate', '60',
      '-t', '0.15',
      '-i', coverPath,
      '-f', 'lavfi',
      '-t', '0.15',
      '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
      '-i', videoPath,
      '-filter_complex', '[0:v]scale=1080:1920,setsar=1,fps=60[v0]; [v0][1:a][2:v][2:a]concat=n=2:v=1:a=1[v][a]',
      '-map', '[v]',
      '-map', '[a]',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      tempOut
    ];

    execFileSync(ffmpegPath, args, { stdio: 'ignore' });

    if (fs.existsSync(tempOut) && fs.statSync(tempOut).size > 1000000) {
      fs.copyFileSync(tempOut, videoPath);
      fs.unlinkSync(tempOut);
      fs.writeFileSync(markerPath, new Date().toISOString(), 'utf8');
      console.log(`  ✓ Portada horneada exitosamente en frame 0 de ${path.basename(videoPath)}`);
    } else {
      if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
    }
  } catch (err) {
    console.warn(`  ⚠️ Aviso horneando portada en video: ${err.message}`);
    if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
  }

  return videoPath;
}

/**
 * Injects a floating helper badge into any page so Teacher Ivan can
 * copy or auto-fill fields with 1 click if a platform changes its DOM.
 */
export async function injectFloatingHelperBadge(page, { platform, title, description }) {
  try {
    await page.evaluate(({ platform, title, description }) => {
      if (document.getElementById('ti-social-helper-badge')) return;

      const container = document.createElement('div');
      container.id = 'ti-social-helper-badge';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        background: #1A3153;
        color: #FAFAFA;
        border: 2px solid #E09B30;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.55);
        padding: 14px 18px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        max-width: 360px;
        line-height: 1.4;
      `;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-weight:700; color:#E09B30; font-size:13px;">⚡ Teacher Ivan · ${platform}</span>
          <button id="ti-helper-close" style="background:transparent; border:none; color:#A7C7E7; cursor:pointer; font-size:16px;">✕</button>
        </div>
        <div style="font-size:11px; color:#A7C7E7; margin-bottom:8px;">
          Si algún campo no se llenó por actualización de la plataforma, usa estos botones:
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <button id="ti-btn-copy-title" style="background:#24426B; color:#FAFAFA; border:1px solid #3B629B; border-radius:6px; padding:7px 10px; cursor:pointer; font-weight:600; text-align:left; font-size:12px;">
            📋 Copiar Título
          </button>
          <button id="ti-btn-copy-desc" style="background:#24426B; color:#FAFAFA; border:1px solid #3B629B; border-radius:6px; padding:7px 10px; cursor:pointer; font-weight:600; text-align:left; font-size:12px;">
            📋 Copiar Descripción + Hashtags
          </button>
          <button id="ti-btn-autofill" style="background:#E09B30; color:#1A3153; border:none; border-radius:6px; padding:8px 10px; cursor:pointer; font-weight:700; text-align:center; font-size:12px; margin-top:2px;">
            ⚡ Auto-Fill Fields Now
          </button>
        </div>
        <div id="ti-status-msg" style="margin-top:8px; font-size:11px; color:#5cdbb5; display:none; text-align:center;"></div>
      `;

      document.body.appendChild(container);

      const statusEl = document.getElementById('ti-status-msg');
      const showToast = (msg) => {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.style.display = 'block';
        setTimeout(() => { if (statusEl) statusEl.style.display = 'none'; }, 2500);
      };

      document.getElementById('ti-helper-close')?.addEventListener('click', () => {
        container.remove();
      });

      document.getElementById('ti-btn-copy-title')?.addEventListener('click', () => {
        navigator.clipboard.writeText(title || '');
        showToast('✓ Título copiado al portapapeles');
      });

      document.getElementById('ti-btn-copy-desc')?.addEventListener('click', () => {
        navigator.clipboard.writeText(description || '');
        showToast('✓ Descripción y hashtags copiados');
      });

      document.getElementById('ti-btn-autofill')?.addEventListener('click', () => {
        const active = document.activeElement;
        const target = (active && (active.isContentEditable || active.tagName === 'TEXTAREA' || active.tagName === 'INPUT'))
          ? active
          : document.querySelector('[contenteditable="true"], textarea, input[type="text"]');

        if (target) {
          if (target.isContentEditable) {
            target.focus();
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, description || title || '');
          } else {
            target.value = description || title || '';
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
          }
          showToast('✓ Campo rellenado exitosamente');
        } else {
          navigator.clipboard.writeText(description || title || '');
          showToast('ℹ Haz click en el cuadro y presiona Ctrl+V');
        }
      });
    }, { platform, title, description });
  } catch (err) {
    // Non-fatal if page navigation occurs
  }
}

/**
 * 1. Mode: socials:login
 * Opens persistent Chromium with tabs for TikTok, Meta Business Suite, and YouTube Studio.
 */
async function runLoginMode() {
  console.log('======================================================================');
  console.log('Teacher Ivan - Social Media Persistent Login Session');
  console.log('======================================================================');
  console.log('Iniciando Chromium persistente en:', browserProfileDir);
  console.log('1. Inicia sesión en tus 3 cuentas:');
  console.log('   - TikTok Studio (Subir video)');
  console.log('   - Meta Business Suite (Instagram & Facebook Reels Composer)');
  console.log('   - YouTube Studio (Upload Shorts)');
  console.log('2. Todas las sesiones y cookies se guardarán localmente para no repetir login.');
  console.log('======================================================================\n');

  const context = await chromium.launchPersistentContext(browserProfileDir, {
    headless: false,
    viewport: { width: 1366, height: 860 },
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const pageTiktok = context.pages()[0] || (await context.newPage());
  await pageTiktok.goto(PLATFORM_URLS.tiktok);

  const pageMeta = await context.newPage();
  await pageMeta.goto(PLATFORM_URLS.meta);

  const pageYoutube = await context.newPage();
  await pageYoutube.goto(PLATFORM_URLS.youtube);

  console.log('✓ Las 3 plataformas están abiertas.');
  console.log('Por favor, inicia sesión en cada una. Cuando hayas terminado, presiona Enter en esta terminal.');
  await askConfirmation('\nPresiona [ENTER] cuando hayas iniciado sesión en todas las cuentas para cerrar... ');

  await context.close();
  console.log('\n✓ Sesión guardada con éxito en .browser-profile. ¡Listo para programar!');
}

/**
 * Locate days inside the target campaign directory
 */
function getCampaignDays(targetDir) {
  if (!fs.existsSync(targetDir)) {
    console.error('Error: No se encontró el directorio de campaña en:', targetDir);
    return [];
  }

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const dayDirs = entries
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => path.join(targetDir, e.name));

  return dayDirs;
}

/**
 * Parses captions and media from a packaged folder
 */
function parseDayPackage(dayDir) {
  const files = fs.readdirSync(dayDir);
  const mp4File = files.find((f) => f.endsWith('.mp4') && !f.endsWith('.tmp-cover.mp4'));
  const coverFile = files.find((f) => f.includes('cover') && f.endsWith('.png'));
  const captionsFile = files.find((f) => f.endsWith('.md'));

  if (!mp4File) {
    throw new Error(`No se encontró video .mp4 en ${dayDir}`);
  }

  const videoPath = path.join(dayDir, mp4File);
  const coverPath = coverFile ? path.join(dayDir, coverFile) : null;
  let content = '';
  if (captionsFile) {
    content = fs.readFileSync(path.join(dayDir, captionsFile), 'utf8');
  }

  // Extract TikTok caption
  const ttMatch = content.match(/### 🎵 TikTok[\s\S]*?```[\w]*[\r\n]+([\s\S]*?)```/i);
  const ttCaption = ttMatch ? ttMatch[1].trim() : '';

  // Extract Instagram caption
  const igMatch = content.match(/### 📸 Instagram Reels[\s\S]*?```[\w]*[\r\n]+([\s\S]*?)```/i);
  const igCaption = igMatch ? igMatch[1].trim() : '';

  // Extract YouTube title and description
  const ytTitleMatch = content.match(/\*\*Título:\*\*\s*([^\r\n]+)/i);
  const ytMatch = content.match(/### ▶️ YouTube Shorts[\s\S]*?```[\w]*[\r\n]+([\s\S]*?)```/i);
  const ytTitle = ytTitleMatch ? ytTitleMatch[1].trim() : path.basename(mp4File, '.mp4');
  const ytDescription = ytMatch ? ytMatch[1].trim() : '';

  // Scheduled date info
  const dateMatch = content.match(/\*\*Fecha programada:\*\*\s*([^\r\n]+)/i);
  const dateStr = dateMatch ? dateMatch[1].trim() : 'Noviembre 2026';

  return {
    dayName: path.basename(dayDir),
    videoPath,
    coverPath,
    dateStr,
    scheduledTime: '19:30 BOT',
    ttCaption,
    igCaption,
    ytTitle,
    ytDescription,
  };
}

/**
 * 2. Mode: schedule (Phase 1 or custom campaign folder)
 */
async function runScheduleMode(customDir) {
  const targetDir = customDir || defaultCampaignDir;

  console.log('======================================================================');
  console.log('Teacher Ivan - November Campaign Playwright Auto-Scheduler');
  console.log('======================================================================');
  console.log('Directorio activo:', targetDir);
  console.log('Horario de programación: Mon/Wed/Fri 19:30 BOT (GMT-4)');
  console.log('Regla #5: "Nada se publica solo" — El bot adjunta video, thumbnail y caption,');
  console.log('y espera tu confirmación visual en el botón final.\n');

  const days = getCampaignDays(targetDir);
  if (days.length === 0) {
    console.error('No se encontraron carpetas empaquetadas en:', targetDir);
    process.exit(1);
  }

  console.log(`Encontrados ${days.length} días de campaña:`);
  days.forEach((d) => console.log('  -', path.basename(d)));

  const context = await chromium.launchPersistentContext(browserProfileDir, {
    headless: false,
    viewport: { width: 1366, height: 860 },
    args: ['--disable-blink-features=AutomationControlled'],
  });

  for (let i = 0; i < days.length; i++) {
    const dayDir = days[i];
    const pkg = parseDayPackage(dayDir);

    console.log('\n----------------------------------------------------------------------');
    console.log(`[Reel ${i + 1}/${days.length}] Procesando: ${pkg.dayName} (${pkg.dateStr})`);
    console.log(`  - Video:      ${path.basename(pkg.videoPath)}`);
    console.log(`  - Thumbnail:  ${pkg.coverPath ? path.basename(pkg.coverPath) : 'Ninguno'}`);
    console.log(`  - Horario:    ${pkg.scheduledTime}`);
    console.log('----------------------------------------------------------------------');

    // Bake cover thumbnail into frame 0 of .mp4 (so YouTube Shorts displays the hook card)
    ensureCoverBake(pkg.videoPath, pkg.coverPath);

    // 1. YouTube Shorts Tab
    try {
      console.log('-> [1/3] Abriendo YouTube Studio...');
      const pageYT = await context.newPage();
      await pageYT.goto(PLATFORM_URLS.youtube, { waitUntil: 'domcontentloaded' });
      await pageYT.waitForTimeout(2000);

      // Locate video file input
      const fileInput = pageYT.locator('input[type="file"]').first();
      await fileInput.waitFor({ state: 'attached', timeout: 30000 });
      await fileInput.setInputFiles(pkg.videoPath);
      console.log('  ✓ Video adjuntado en YouTube Studio.');

      // YouTube Studio Title (contenteditable="true")
      try {
        const titleBox = pageYT.locator('#title-textarea #textbox[contenteditable="true"]').first();
        await titleBox.waitFor({ state: 'visible', timeout: 45000 });
        await titleBox.click();
        await pageYT.keyboard.press('Control+A');
        await pageYT.keyboard.press('Backspace');
        await pageYT.keyboard.insertText(pkg.ytTitle);
        console.log(`  ✓ Título insertado: "${pkg.ytTitle}"`);
      } catch (e) {
        console.warn('  ⚠️ Aviso título YouTube:', e.message);
      }

      // YouTube Studio Description + Hashtags (contenteditable="true")
      try {
        const descBox = pageYT.locator('#description-textarea #textbox[contenteditable="true"]').first();
        if (await descBox.isVisible({ timeout: 10000 }).catch(() => false)) {
          await descBox.click();
          await pageYT.keyboard.press('Control+A');
          await pageYT.keyboard.press('Backspace');
          await pageYT.keyboard.insertText(pkg.ytDescription);
          console.log('  ✓ Descripción y hashtags insertados en YouTube Studio.');
        }
      } catch (e) {
        console.warn('  ⚠️ Aviso descripción YouTube:', e.message);
      }

      // YouTube Studio Thumbnail (if platform permits)
      if (pkg.coverPath && fs.existsSync(pkg.coverPath)) {
        try {
          const thumbInput = pageYT.locator('input#file-loader[type="file"], input[type="file"][accept*="image"]').first();
          if (await thumbInput.count() > 0) {
            await thumbInput.setInputFiles(pkg.coverPath).catch(() => {});
            console.log('  ✓ Cover thumbnail subido en YouTube Studio (si disponible).');
          }
        } catch (_) {}
      }

      // Inject floating helper badge on YouTube Studio page
      await injectFloatingHelperBadge(pageYT, {
        platform: 'YouTube Shorts',
        title: pkg.ytTitle,
        description: pkg.ytDescription,
      });

    } catch (err) {
      console.warn('  Aviso YouTube Studio:', err.message);
    }

    // 2. TikTok Studio Tab
    try {
      console.log('-> [2/3] Abriendo TikTok Studio...');
      const pageTT = await context.newPage();
      try {
        await pageTT.goto(PLATFORM_URLS.tiktok, { waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch {
        await pageTT.goto(PLATFORM_URLS.tiktokFallback, { waitUntil: 'domcontentloaded' });
      }
      await pageTT.waitForTimeout(2000);

      // Locate video file input
      const ttInput = pageTT.locator('input[type="file"][accept*="video"], input[type="file"]').first();
      await ttInput.waitFor({ state: 'attached', timeout: 30000 });
      await ttInput.setInputFiles(pkg.videoPath);
      console.log('  ✓ Video adjuntado en TikTok Studio.');

      // Wait until the caption editor appears after video upload begins
      try {
        const captionEditor = pageTT.locator(
          'div.public-DraftEditor-content[contenteditable="true"], div[contenteditable="true"][role="combobox"], .caption-editor [contenteditable="true"], div[contenteditable="true"]'
        ).first();
        await captionEditor.waitFor({ state: 'visible', timeout: 60000 });
        await captionEditor.click();
        await pageTT.keyboard.press('Control+A');
        await pageTT.keyboard.press('Backspace');
        await pageTT.keyboard.insertText(pkg.ttCaption);
        await pageTT.keyboard.press('Space');
        console.log('  ✓ Caption y hashtags asignados en TikTok Studio.');
      } catch (e) {
        console.warn('  ⚠️ Aviso caption TikTok:', e.message);
      }

      // Inject floating helper badge on TikTok Studio page
      await injectFloatingHelperBadge(pageTT, {
        platform: 'TikTok Studio',
        title: pkg.dayName,
        description: pkg.ttCaption,
      });

    } catch (err) {
      console.warn('  Aviso TikTok Studio:', err.message);
    }

    // 3. Meta Business Suite Tab (IG + FB Reels)
    try {
      console.log('-> [3/3] Abriendo Meta Business Suite (Instagram + Facebook Reels)...');
      const pageMeta = await context.newPage();
      try {
        await pageMeta.goto(PLATFORM_URLS.meta, { waitUntil: 'domcontentloaded', timeout: 35000 });
      } catch {
        await pageMeta.goto(PLATFORM_URLS.metaFallback, { waitUntil: 'domcontentloaded' });
      }
      await pageMeta.waitForTimeout(2500);

      // Click "Crear reel" if present on generic composer
      try {
        const createReelBtn = pageMeta.locator(
          'div[role="button"]:has-text("Crear reel"), div[role="tab"]:has-text("Reel"), button:has-text("Crear reel"), button:has-text("Create reel")'
        ).first();
        if (await createReelBtn.isVisible({ timeout: 5000 })) {
          await createReelBtn.click();
          await pageMeta.waitForTimeout(1500);
        }
      } catch (_) {}

      // Attach video
      try {
        const metaInput = pageMeta.locator('input[type="file"][accept*="video"], input[type="file"]').first();
        await metaInput.waitFor({ state: 'attached', timeout: 45000 });
        await metaInput.setInputFiles(pkg.videoPath);
        console.log('  ✓ Video adjuntado en Meta Business Suite.');
      } catch (e) {
        console.warn('  ⚠️ Aviso selector de video Meta:', e.message);
      }

      // Focus Meta's Lexical description editor
      try {
        const metaBox = pageMeta.locator('div[role="textbox"][contenteditable="true"], div[contenteditable="true"]').first();
        await metaBox.waitFor({ state: 'visible', timeout: 60000 });
        await metaBox.click();
        await pageMeta.keyboard.press('Control+A');
        await pageMeta.keyboard.press('Backspace');
        await pageMeta.keyboard.insertText(pkg.igCaption);
        console.log('  ✓ Descripción y hashtags insertados en Meta Business Suite.');
      } catch (e) {
        console.warn('  ⚠️ Aviso descripción Meta:', e.message);
      }

      // Inject floating helper badge on Meta page
      await injectFloatingHelperBadge(pageMeta, {
        platform: 'Meta Business Suite',
        title: pkg.dayName,
        description: pkg.igCaption,
      });

    } catch (err) {
      console.warn('  Aviso Meta Business Suite:', err.message);
    }

    console.log(`\n⏸️ [REGLA #5: NADA SE PUBLICA SOLO]`);
    console.log(`Revisa las ventanas abiertas de YouTube Shorts, TikTok Studio y Meta Business Suite.`);
    console.log(`Verifica título, descripción y hora programada (${pkg.scheduledTime}).`);
    await askConfirmation(`Presiona [ENTER] cuando hayas confirmado y programado este reel para pasar al siguiente... `);
  }

  console.log('\n🎉 ¡Todos los reels fueron revisados y programados exitosamente!');
  await context.close();
}

// CLI Routing: Only execute when run directly from command line
const isDirectCli = process.argv[1] && (
  path.resolve(process.argv[1]) === path.resolve(__filename) ||
  process.argv[1].endsWith('auto-schedule-socials.mjs')
);

if (isDirectCli) {
  const mode = process.argv[2] || 'schedule';
  const customDir = process.argv[3] || null;

  if (mode === 'login') {
    runLoginMode().catch(console.error);
  } else {
    runScheduleMode(customDir).catch(console.error);
  }
}
