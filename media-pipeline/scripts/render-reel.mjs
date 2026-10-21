#!/usr/bin/env node
/**
 * ==============================================================================
 * Teacher Ivan & Coach Emma - 9:16 Split-Screen Reel Video Renderer
 * Media Pipeline Script: render-reel.mjs
 * ==============================================================================
 * Renders any 9:16 Split-Screen Storyboard JSON via Playwright Chromium into
 * a 1080x1920 video (.webm / .mp4) and hero poster screenshot (.png) inside
 * `./media-pipeline/output/`.
 *
 * Capabilities:
 *   1. Exports FilmCraft (.fcproj) and EffectCraft (.ecproj) project manifests.
 *   2. Headless Playwright Chromium capture at 1080x1920 @ 60fps.
 *   3. Transcodes to industry-standard H.264/AAC .mp4 via FFmpeg.
 *   4. Supports both 'chibi-avatar' and 'live-video' protagonist modes.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import ffmpegPath from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const PIPELINE_DIR = path.resolve(__dirname, '..');
const STORYBOARDS_DIR = path.join(PIPELINE_DIR, 'storyboards');
const OUTPUT_DIR = path.join(PIPELINE_DIR, 'output');

// Strict Brand Palette Reference
const BRAND_PALETTE = {
  NAVY: '#1A3153',
  AMBER: '#E09B30',
  DENIM: '#A7C7E7',
  SLATE: '#4A5568',
  WHITE: '#FAFAFA',
};

/**
 * Manifest Exporter: Generates FilmCraft (.fcproj) and EffectCraft (.ecproj) manifests
 */
export function exportManifests(storyboardData) {
  const storyboardId = storyboardData.id || 'reel';
  const duration = storyboardData.durationSeconds || 12.0;
  const fps = storyboardData.fps || 60;

  // 1. FilmCraft Project Schema v13
  const fcproj = {
    format: 'filmcraft.project',
    schema_version: 13,
    generator: 'FilmCraft 0.1.0 (Teacher Ivan Pipeline)',
    project: {
      name: storyboardData.title || storyboardId,
      settings: {
        renderer: 'FilmCraft GPU Acceleration (wgpu)',
        video_display: 'Timecode',
        audio_display_samples: true,
        canvas_width: 1080,
        canvas_height: 1920,
        aspect_ratio: '9:16',
        frame_rate: fps,
        duration_seconds: duration,
      },
      brand_tokens: BRAND_PALETTE,
      root: {
        id: 0,
        name: storyboardData.title || storyboardId,
        children: [
          { Bin: { id: 1, name: 'Motion Graphics Scenes', children: [] } },
          { Bin: { id: 2, name: 'Character Poses', children: [] } },
          { Bin: { id: 3, name: 'Audio Voiceovers', children: [] } },
        ],
      },
      sequences: [
        {
          id: 10,
          name: '9:16 Split-Screen Reel',
          width: 1080,
          height: 1920,
          fps: fps,
          tracks: [
            {
              name: 'V1_TopHalf_MotionGraphics',
              type: 'video',
              items: (storyboardData.scenes || []).map((s, idx) => ({
                id: 100 + idx,
                type: s.type,
                start_time: s.startTime,
                end_time: s.endTime,
                background: s.background,
                config: s.config,
              })),
            },
            {
              name: 'V2_CenterSeam_Subtitles',
              type: 'video',
              items: (storyboardData.subtitles || []).map((sub, idx) => ({
                id: 200 + idx,
                start_time: sub.startTime,
                end_time: sub.endTime,
                text: sub.text,
                word_count: (sub.words || []).length,
              })),
            },
            {
              name: 'V3_BottomHalf_Protagonist',
              type: 'video',
              items: [
                {
                  id: 301,
                  mode: storyboardData.bottomMode || 'chibi-avatar',
                  character: storyboardData.character?.name || 'Teacher Ivan',
                  folder: storyboardData.character?.folder || 'ivan',
                  start_time: 0,
                  end_time: duration,
                },
              ],
            },
          ],
        },
      ],
      next_id: 500,
    },
    view: {
      open_sequences: [10],
      active_sequence: 10,
    },
  };

  // 2. EffectCraft Motion Graphics Project
  const ecproj = {
    format: 'effectcraft.project',
    schema_version: 1,
    generator: 'EffectCraft 0.1.0 (Teacher Ivan Pipeline)',
    composition: {
      name: `Reel - ${storyboardData.title || storyboardId}`,
      width: 1080,
      height: 1920,
      fps: fps,
      duration_seconds: duration,
      brand_palette: BRAND_PALETTE,
      layers: [
        {
          id: 'layer_top_half',
          name: 'Top Half - Motion Graphics Canvas',
          type: 'graphics_group',
          bounds: { x: 0, y: 0, width: 1080, height: 960 },
          scenes: storyboardData.scenes || [],
        },
        {
          id: 'layer_center_seam',
          name: 'Center Seam - Dynamic Word-by-Word Subtitle Bar',
          type: 'text_animator',
          bounds: { x: 48, y: 880, width: 984, height: 160 },
          style: {
            background: BRAND_PALETTE.NAVY,
            border: `3.5px solid ${BRAND_PALETTE.DENIM}`,
            border_radius: '32px',
            active_word_color: BRAND_PALETTE.AMBER,
            font: 'Montserrat ExtraBold',
          },
          cues: storyboardData.subtitles || [],
        },
        {
          id: 'layer_bottom_half',
          name: 'Bottom Half - Protagonist Stage',
          type: 'protagonist_stage',
          bounds: { x: 0, y: 960, width: 1080, height: 960 },
          mode: storyboardData.bottomMode || 'chibi-avatar',
          character: storyboardData.character || { folder: 'ivan' },
        },
      ],
    },
  };

  const fcprojPath = path.join(STORYBOARDS_DIR, `${storyboardId}.fcproj`);
  const ecprojPath = path.join(STORYBOARDS_DIR, `${storyboardId}.ecproj`);

  fs.writeFileSync(fcprojPath, JSON.stringify(fcproj, null, 2), 'utf8');
  fs.writeFileSync(ecprojPath, JSON.stringify(ecproj, null, 2), 'utf8');

  return { fcprojPath, ecprojPath };
}

/**
 * Main Reel Render Function
 */
export async function renderReel(options = {}) {
  const storyboardInput = options.storyboardId || options.storyboardPath || 'reel-01-ai-clone';
  const outputDir = options.outputDir || OUTPUT_DIR;
  const quickTest = options.quickTest || false;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Resolve Storyboard JSON
  let storyboardPath = storyboardInput;
  if (!fs.existsSync(storyboardPath)) {
    const candidateName = storyboardInput.endsWith('.json') ? storyboardInput : `${storyboardInput}.json`;
    storyboardPath = path.join(STORYBOARDS_DIR, candidateName);
  }

  if (!fs.existsSync(storyboardPath)) {
    throw new Error(`Storyboard file not found: ${storyboardInput} (looked at ${storyboardPath})`);
  }

  const storyboardData = JSON.parse(fs.readFileSync(storyboardPath, 'utf8'));
  const storyboardId = storyboardData.id || path.basename(storyboardPath, '.json');
  const stagePath = path.join(PIPELINE_DIR, 'stage.html');

  if (!fs.existsSync(stagePath)) {
    throw new Error(`Stage HTML not found at: ${stagePath}`);
  }

  // 1. Export FilmCraft (.fcproj) and EffectCraft (.ecproj) manifests
  const manifests = exportManifests(storyboardData);

  const totalDuration = quickTest ? 3.0 : (storyboardData.durationSeconds || 15.0);

  console.log('================================================================');
  console.log(`🎬 9:16 Vertical Reel Generator: ${storyboardData.title}`);
  console.log(`Resolution: 1080x1920 (9:16) | Duration: ${totalDuration}s`);
  console.log(`Protagonist Mode: ${storyboardData.bottomMode || 'chibi-avatar'}`);
  console.log(`Manifests: FilmCraft (.fcproj) & EffectCraft (.ecproj) Synced`);
  console.log(`Output Directory: ${outputDir}`);
  console.log('================================================================\n');

  console.log('Launching Playwright Chromium in 1080x1920 viewport...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: outputDir,
      size: { width: 1080, height: 1920 }
    }
  });

  const page = await context.newPage();

  const stageUrl = `file://${stagePath.replace(/\\/g, '/')}?render=1`;
  console.log(`Loading stage: ${stageUrl}`);
  await page.goto(stageUrl, { waitUntil: 'networkidle' });

  // Inject Storyboard Data into Stage
  await page.evaluate((data) => {
    window.loadStoryboard(data);
    window.pause();
    window.seekToTime(0);
  }, storyboardData);

  // Wait for Google Fonts & SVGs to stabilize
  await page.waitForTimeout(500);

  // Capture Hero Poster Screenshot at peak moment
  const posterTime = Math.min(2.0, totalDuration / 2);
  await page.evaluate((t) => window.seekToTime(t), posterTime);
  await page.waitForTimeout(150);

  const posterPath = path.join(outputDir, `${storyboardId}-poster.png`);
  await page.screenshot({ path: posterPath, fullPage: false });
  console.log(`✓ Hero Poster saved: ${path.basename(posterPath)} (${(fs.statSync(posterPath).size / 1024).toFixed(1)} KB)`);

  // Start Playback and Record Video
  console.log(`Recording ${totalDuration}s 60fps vertical reel...`);
  await page.evaluate(() => {
    window.seekToTime(0);
    window.play();
  });

  const recordWaitMs = Math.round(totalDuration * 1000) + 400;
  await page.waitForTimeout(recordWaitMs);

  // Finalize video recording
  const videoObj = page.video();
  await page.close();

  const rawVideoPath = videoObj ? await videoObj.path() : null;
  await context.close();
  await browser.close();

  let webmPath = path.join(outputDir, `${storyboardId}.webm`);
  let mp4Path = path.join(outputDir, `${storyboardId}.mp4`);

  if (rawVideoPath && fs.existsSync(rawVideoPath)) {
    if (fs.existsSync(webmPath)) fs.unlinkSync(webmPath);
    fs.renameSync(rawVideoPath, webmPath);
  }

  // Transcode to MP4 via FFmpeg
  let hasMp4 = false;
  if (ffmpegPath && fs.existsSync(webmPath)) {
    console.log('\nTranscoding to Universal H.264/AAC .mp4 via FFmpeg...');
    try {
      const audioSource = storyboardData.audioTrack ? path.resolve(ROOT_DIR, storyboardData.audioTrack) : null;
      const ffmpegArgs = ['-y', '-i', webmPath];

      if (audioSource && fs.existsSync(audioSource)) {
        ffmpegArgs.push('-i', audioSource, '-c:a', 'aac', '-b:a', '192k', '-shortest');
      }

      ffmpegArgs.push(
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-profile:v', 'high',
        '-level:v', '4.2',
        '-preset', 'fast',
        '-crf', '20',
        mp4Path
      );

      execFileSync(ffmpegPath, ffmpegArgs, { stdio: 'inherit' });
      hasMp4 = fs.existsSync(mp4Path);
      if (hasMp4) {
        console.log(`✓ Universal MP4 exported successfully: ${path.basename(mp4Path)}`);
      }
    } catch (ffmpegErr) {
      console.warn('[FFmpeg Warning]: MP4 transcode failed, keeping pristine WebM:', ffmpegErr.message);
    }
  }

  const finalVideo = hasMp4 ? mp4Path : webmPath;
  const videoStats = fs.existsSync(finalVideo) ? fs.statSync(finalVideo) : null;
  const videoSizeMb = videoStats ? (videoStats.size / (1024 * 1024)).toFixed(2) : '0';

  console.log('\n================================================================');
  console.log(`✅ Reel Generation Complete!`);
  console.log(`   Primary Video: ${finalVideo} [${videoSizeMb} MB]`);
  if (hasMp4 && fs.existsSync(webmPath)) {
    console.log(`   WebM Source:   ${webmPath}`);
  }
  console.log(`   Hero Poster:   ${posterPath}`);
  console.log(`   FilmCraft:     ${manifests.fcprojPath}`);
  console.log(`   EffectCraft:   ${manifests.ecprojPath}`);
  console.log('================================================================\n');

  return {
    success: true,
    storyboardId,
    videoPath: finalVideo,
    webmPath,
    mp4Path: hasMp4 ? mp4Path : null,
    posterPath,
    manifests,
    durationSeconds: totalDuration,
    resolution: '1080x1920',
    sizeBytes: videoStats ? videoStats.size : 0
  };
}

// CLI Execution: node media-pipeline/scripts/render-reel.mjs [storyboard] [--quick]
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'reel-01-ai-clone.json';
  const isQuick = process.argv.includes('--quick');
  renderReel({ storyboardId: arg, quickTest: isQuick }).catch((err) => {
    console.error('\n[Renderer Error]:', err);
    process.exit(1);
  });
}
