#!/usr/bin/env node
/**
 * ==============================================================================
 * Teacher Ivan & Coach Emma - Remotion Video Renderer
 * Media Pipeline Script: render-remotion.mjs
 * ==============================================================================
 * Bridges any reel directory (with palabras.json, voz.mp3, tomas/t1.mp4) or
 * storyboard JSON to Remotion's 9:16 split-screen React engine at 1080x1920 @ 60fps.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PIPELINE_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PIPELINE_DIR, 'public');
const OUTPUT_DIR = path.join(PIPELINE_DIR, 'output');

/**
 * Measure duration of audio/video using ffmpeg-static
 */
function getMediaDuration(filePath) {
  try {
    execFileSync(ffmpegPath, ['-i', filePath], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err) {
    const output = (err.stdout || '') + (err.stderr || '');
    const m = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (m) {
      return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
    }
  }
  return 30.0;
}

/**
 * Main Remotion Reel Renderer
 */
export async function renderReelWithRemotion(options = {}) {
  const {
    reelDir,
    outputPath: customOutputPath,
    persona = 'ivan',
    fps = 60,
    quickTest = false,
    storyboardId = null,
  } = options;

  if (!reelDir && !storyboardId) {
    throw new Error('Debe proveer reelDir o storyboardId');
  }

  // Resolve target directory
  let targetDir = reelDir;
  if (!targetDir && storyboardId) {
    targetDir = path.join(PIPELINE_DIR, 'storyboards');
  }

  const reelName = targetDir ? path.basename(targetDir) : (storyboardId || 'reel');
  const publicReelDir = path.join(PUBLIC_DIR, 'reels', reelName);
  fs.mkdirSync(publicReelDir, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 1. Process Words & Timestamps from palabras.json
  let words = [];
  const palabrasPath = path.join(targetDir, 'palabras.json');
  if (fs.existsSync(palabrasPath)) {
    try {
      words = JSON.parse(fs.readFileSync(palabrasPath, 'utf8'));
    } catch {
      words = [];
    }
  }

  // 2. Process Voiceover Audio (voz.mp3)
  let audioRelPath = null;
  let durationInSeconds = 30.0;
  const vozPath = path.join(targetDir, 'voz.mp3');
  if (fs.existsSync(vozPath)) {
    const targetVoz = path.join(publicReelDir, 'voz.mp3');
    fs.copyFileSync(vozPath, targetVoz);
    audioRelPath = `reels/${reelName}/voz.mp3`;
    durationInSeconds = getMediaDuration(vozPath);
  } else if (words.length > 0) {
    durationInSeconds = Math.max(words[words.length - 1].e + 2.5, 12.0);
  }

  // 3. Process Background Music (musica/)
  let musicRelPath = null;
  const musicaDir = path.join(targetDir, 'musica');
  if (fs.existsSync(musicaDir)) {
    const files = fs.readdirSync(musicaDir).filter((f) => f.endsWith('.mp3'));
    if (files.length > 0) {
      const srcMusic = path.join(musicaDir, files[0]);
      const targetMusic = path.join(publicReelDir, 'musica.mp3');
      fs.copyFileSync(srcMusic, targetMusic);
      musicRelPath = `reels/${reelName}/musica.mp3`;
    }
  }

  // 4. Process Optional Video B-roll (tomas/t1.mp4)
  let videoRelPath = null;
  const tomasDir = path.join(targetDir, 'tomas');
  if (fs.existsSync(tomasDir)) {
    const videoFiles = fs.readdirSync(tomasDir).filter((f) => f.endsWith('.mp4') || f.endsWith('.webm'));
    if (videoFiles.length > 0) {
      const srcVideo = path.join(tomasDir, videoFiles[0]);
      const targetVideo = path.join(publicReelDir, 't1.mp4');
      fs.copyFileSync(srcVideo, targetVideo);
      videoRelPath = `reels/${reelName}/t1.mp4`;
    }
  }

  // 5. Extract Title & CTA
  let title = '¿SABÍAS QUE EN CLASES\nSÓLO HABLAS UN 30%?';
  let ctaText = 'TEACHERIVAN.COM — TEST GRATIS';

  const guionPath = path.join(targetDir, 'guion.md');
  if (fs.existsSync(guionPath)) {
    const content = fs.readFileSync(guionPath, 'utf8');
    const titleMatch = content.match(/^#\s*Guion:\s*([^\r\n]+)/m);
    if (titleMatch) title = titleMatch[1].trim();

    const ctaMatch = content.match(/- \*\*CTA:\*\*\s*"([^"]+)"/);
    if (ctaMatch) ctaText = ctaMatch[1].trim();
  }

  // 6. Build Remotion Props JSON
  const remotionProps = {
    title,
    subtitle: 'DIAGNÓSTICO REAL',
    character: persona === 'emma' ? 'emma' : 'ivan',
    words,
    audioSrc: audioRelPath,
    musicSrc: musicRelPath,
    videoSrc: videoRelPath,
    ctaText,
    durationInSeconds,
    activeScenes: ['counter', 'pills', 'phoneComparison', 'bichronous', 'cta'],
  };

  const propsFilePath = path.join(publicReelDir, 'props.json');
  fs.writeFileSync(propsFilePath, JSON.stringify(remotionProps, null, 2), 'utf8');

  // 7. Output paths
  const finalMp4Path = customOutputPath || path.join(targetDir, 'final.mp4');
  const posterPath = path.join(
    path.dirname(finalMp4Path),
    `${path.basename(finalMp4Path, '.mp4')}-poster.png`
  );

  console.log(`[Remotion Engine] Renderizando Reel 9:16 (1080x1920 @ ${fps}fps)`);
  console.log(`  - Entrada:  remotion/index.ts (TeacherIvanReel)`);
  console.log(`  - Destino:  ${finalMp4Path}`);
  console.log(`  - Duración: ${durationInSeconds.toFixed(1)}s (${words.length} palabras sincronizadas)`);

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const relPropsPath = path.relative(PIPELINE_DIR, propsFilePath).replace(/\\/g, '/');
  const relOutputPath = path.relative(PIPELINE_DIR, finalMp4Path).replace(/\\/g, '/');
  const relPosterPath = path.relative(PIPELINE_DIR, posterPath).replace(/\\/g, '/');

  // 8. Headless Render command
  const renderArgs = [
    'remotion',
    'render',
    'remotion/index.ts',
    'TeacherIvanReel',
    `"${relOutputPath}"`,
    `"--props=${relPropsPath}"`,
    '--overwrite',
  ];

  if (quickTest) {
    renderArgs.push('--frames=0-180'); // Rapid 3-second smoke test
  }

  execFileSync(npxCmd, renderArgs, {
    cwd: PIPELINE_DIR,
    stdio: 'inherit',
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  // 9. Generate Hero Poster Still
  try {
    const posterArgs = [
      'remotion',
      'still',
      'remotion/index.ts',
      'TeacherIvanReel',
      `"${relPosterPath}"`,
      `"--props=${relPropsPath}"`,
      '--frame=60',
      '--overwrite',
    ];
    execFileSync(npxCmd, posterArgs, {
      cwd: PIPELINE_DIR,
      stdio: 'pipe',
      encoding: 'utf8',
      shell: process.platform === 'win32',
    });
  } catch (err) {
    console.warn('[Remotion Engine] Advertencia generando póster:', err.message);
  }

  const stat = fs.existsSync(finalMp4Path) ? fs.statSync(finalMp4Path) : { size: 0 };

  return {
    finalMp4: finalMp4Path,
    posterPath: fs.existsSync(posterPath) ? posterPath : null,
    sizeBytes: stat.size,
    durationSeconds: quickTest ? 3.0 : durationInSeconds,
    renderer: 'Remotion React 9:16 Engine (@remotion/cli)',
    wordsCount: words.length,
    character: remotionProps.character,
  };
}
