import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { PHASE1_REELS } from '../remotion/novemberCampaignData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PIPELINE_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PIPELINE_DIR, 'output');
const CAMPAIGN_DIR = path.join(OUTPUT_DIR, 'november-campaign', 'Phase1-Week1-Nov02-06');

fs.mkdirSync(CAMPAIGN_DIR, { recursive: true });

function ensureCoverBake(videoPath, coverPath) {
  if (!coverPath || !fs.existsSync(coverPath) || !fs.existsSync(videoPath)) {
    return videoPath;
  }
  const markerPath = `${videoPath}.cover-baked`;
  if (fs.existsSync(markerPath)) {
    console.log(`   ℹ️ Portada ya horneada en frame 0 (${path.basename(videoPath)})`);
    return videoPath;
  }

  console.log(`   🎬 Horneando portada en frame 0 (0.15s) para YouTube Shorts / Meta / TikTok...`);
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
      console.log(`   ✓ Portada horneada exitosamente en frame 0 de ${path.basename(videoPath)}`);
    } else {
      if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
    }
  } catch (err) {
    console.warn(`   ⚠️ Aviso horneando portada: ${err.message}`);
    if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
  }

  return videoPath;
}

const REEL_FOLDERS = [
  {
    id: 'Nov_Reel01_IntroFreeNov',
    folderName: '01-Mon-Nov02',
    videoFileName: 'reel-01-intro-free-november.mp4',
    title: 'TODO NOVIEMBRE GRATIS EN TEACHERIVAN.COM',
  },
  {
    id: 'Nov_Reel02_WhyDifferentEmma',
    folderName: '02-Wed-Nov04',
    videoFileName: 'reel-02-why-different-emma.mp4',
    title: 'POR QUÉ SOMOS DIFERENTES · EMMA IA COACH',
  },
  {
    id: 'Nov_Reel03_PricingAndFreeTrial',
    folderName: '03-Fri-Nov06',
    videoFileName: 'reel-03-pricing-free-trial.mp4',
    title: 'PRECIOS TRANSPARENTES Y PRUEBA GRATIS',
  },
];

async function main() {
  console.log(`\n======================================================`);
  console.log(`🎬 RENDERIZADO DE FASE 1: NOVIEMBRE KINETIC MOTION GRAPHICS`);
  console.log(`   - Formato: 100% Full-Screen (1080x1920, 60fps, 1620 frames / 27.0s)`);
  console.log(`   - Estabilidad: --concurrency=1 --gl=angle`);
  console.log(`======================================================\n`);

  for (let i = 0; i < REEL_FOLDERS.length; i++) {
    const item = REEL_FOLDERS[i];
    const reelData = PHASE1_REELS.find((r) => r.id === item.id);
    if (!reelData) continue;

    const targetDir = path.join(CAMPAIGN_DIR, item.folderName);
    fs.mkdirSync(targetDir, { recursive: true });

    const finalMp4Path = path.join(targetDir, item.videoFileName);
    const coverPngPath = path.join(targetDir, 'cover-thumbnail.png');
    const captionsMdPath = path.join(targetDir, 'copy-paste-captions.md');

    console.log(`\n▶ [${i + 1}/${REEL_FOLDERS.length}] Renderizando ${item.id} -> ${item.folderName}`);

    const relMp4Path = path.relative(PIPELINE_DIR, finalMp4Path).replace(/\\/g, '/');
    const relCoverPath = path.relative(PIPELINE_DIR, coverPngPath).replace(/\\/g, '/');

    // 1. Render Video using Remotion CLI (if not already rendered)
    if (!fs.existsSync(finalMp4Path) || fs.statSync(finalMp4Path).size < 1000000) {
      const remotionArgs = [
        'remotion',
        'render',
        item.id,
        relMp4Path,
        '--gl=angle',
        '--concurrency=1',
        '--jpeg-quality=95',
        '--pixel-format=yuv420p',
      ];

      console.log(`   Ejecutando: npx ${remotionArgs.join(' ')}`);
      execFileSync('npx', remotionArgs, {
        cwd: PIPELINE_DIR,
        stdio: 'inherit',
        shell: true,
      });
    } else {
      console.log(`   ℹ️ Video ya renderizado previamente (${(fs.statSync(finalMp4Path).size / 1024 / 1024).toFixed(1)} MB). Omitiendo re-render.`);
    }

    const stat = fs.statSync(finalMp4Path);
    console.log(`   ✓ Video verificado: ${item.videoFileName} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);

    // 2. Render Crisp Cover Thumbnail at frame 90 (Hook impact frame)
    console.log(`   Generando cover thumbnail en frame 90...`);
    execFileSync(
      'npx',
      [
        'remotion',
        'still',
        item.id,
        relCoverPath,
        '--frame=90',
        '--gl=angle',
      ],
      {
        cwd: PIPELINE_DIR,
        stdio: 'inherit',
        shell: true,
      }
    );
    console.log(`   ✓ Cover generado: cover-thumbnail.png`);

    // Bake cover thumbnail into frame 0 of .mp4 for YouTube Shorts / Meta / TikTok
    ensureCoverBake(finalMp4Path, coverPngPath);

    // 3. Write Ready-to-Publish Copy-Paste Captions Markdown
    const captionsContent = `# 🚀 COPY-PASTE CAPTIONS · ${item.title}
**Fecha programada:** ${reelData.dateStr}  
**Voz:** ${reelData.voiceName === 'Puck' ? 'Teacher Ivan (Puck - Gemini Audio)' : 'Emma AI Coach (Aoede - Gemini Audio)'}  
**Duración:** 27.0s (1620 frames @ 60fps)  
**Formato:** 100% Full-Screen Kinetic Motion Graphics (1080x1920)

---

### 📸 Instagram Reels (Copy & Paste)
\`\`\`text
${reelData.captions.instagram}
\`\`\`

---

### 🎵 TikTok (Copy & Paste)
\`\`\`text
${reelData.captions.tiktok}
\`\`\`

---

### ▶️ YouTube Shorts (Copy & Paste)
**Título:** ${reelData.title} | Teacher Ivan English Classes
\`\`\`text
${reelData.captions.youtube}

#shorts #aprenderingles #inglesconia #teacherivan #bolivia
\`\`\`

---

### 💬 WhatsApp Community Broadcast / Direct Message
\`\`\`text
👋 ¡Hola! En Teacher Ivan abrimos noviembre con acceso 100% gratuito a nuestra plataforma de práctica con tutor de voz con inteligencia artificial 24/7.

👉 Pruébalo ahora mismo en https://teacherivan.com y haz tu test evaluativo en 90 segundos.
\`\`\`
`;
    fs.writeFileSync(captionsMdPath, captionsContent, 'utf8');
    console.log(`   ✓ Captions generados: copy-paste-captions.md`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 FASE 1 COMPLETADA Y EMPAQUETADA EN:`);
  console.log(`   ${CAMPAIGN_DIR}`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error('Error renderizando Fase 1:', err);
  process.exit(1);
});
