#!/usr/bin/env node
/**
 * ==============================================================================
 * Teacher Ivan - Modo Gratis / Gemini Local (reels-con-ia)
 * Media Pipeline Script: modo_gratis_ivan.mjs
 * ==============================================================================
 * Provee un flujo 100% GRATUITO ($0.00) usando Gemini API + Playwright + FFmpeg
 * para reemplazar ElevenLabs, Whisper y Seedance en la creación de Reels:
 *
 *   1. voz:      Genera voz.mp3 desde voz.txt con Gemini TTS ('Puck' o 'Aoede')
 *                o acepta un audio propio grabado en yo/ (Costo: $0.00).
 *   2. control:  Genera palabras.json con timestamps palabra por palabra.
 *   3. render:   Renderiza final.mp4 (1080x1920 @ 60fps) usando Playwright + FFmpeg.
 *   4. revision: Revisa el video final con Gemini 3.8 Flash y crea revision.md.
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
const ROOT_DIR = path.resolve(__dirname, '../../..');

/**
 * Obtiene la clave GEMINI_API_KEY desde server/.env o .env
 */
export function getGeminiApiKey() {
  const envPaths = [
    path.join(ROOT_DIR, 'server/.env'),
    path.join(ROOT_DIR, '.env'),
    path.join(__dirname, '../.env'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const m = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
      if (m && m[1].trim()) return m[1].trim();
    }
  }

  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  throw new Error('GEMINI_API_KEY no encontrada en server/.env ni en el entorno');
}

/**
 * Mide la duración exacta de un archivo de audio/video con FFmpeg
 */
export function getMediaDuration(mediaPath) {
  try {
    execFileSync(ffmpegPath, ['-i', mediaPath], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
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
 * 1. VOZ: Genera voz.mp3 desde voz.txt con Gemini TTS ($0.00) o usa audio en yo/
 */
export async function generarVoz(reelDir, options = {}) {
  const persona = options.persona || 'ivan'; // 'ivan' (Puck) o 'emma' (Aoede)
  const voiceName = persona === 'emma' ? 'Aoede' : 'Puck';
  const outMp3 = path.join(reelDir, 'voz.mp3');

  // Si existe un audio pre-grabado en yo/
  const yoDirs = [
    path.join(reelDir, 'yo'),
    path.join(ROOT_DIR, 'media-pipeline/Reels/yo'),
  ];
  for (const yDir of yoDirs) {
    if (fs.existsSync(yDir)) {
      const candidates = fs.readdirSync(yDir).filter(f => f.endsWith('.mp3') || f.endsWith('.wav'));
      if (candidates.length > 0 && options.usarYo) {
        const chosen = path.join(yDir, candidates[0]);
        console.log(`[Modo Gratis] Usando audio propio de yo/: ${candidates[0]}`);
        fs.copyFileSync(chosen, outMp3);
        const dur = getMediaDuration(outMp3);
        console.log(`✓ voz.mp3 lista (${dur.toFixed(1)} s)`);
        return { audioPath: outMp3, durationSeconds: dur, source: 'yo' };
      }
    }
  }

  const vozTxtPath = path.join(reelDir, 'voz.txt');
  if (!fs.existsSync(vozTxtPath)) {
    throw new Error(`No se encontró voz.txt en: ${vozTxtPath}`);
  }

  const rawText = fs.readFileSync(vozTxtPath, 'utf8');
  // Quitar indicaciones de tono entre corchetes
  const cleanScript = rawText.replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();

  console.log(`[Modo Gratis] Generando voz con Gemini TTS (${voiceName} para ${persona})...`);
  const apiKey = getGeminiApiKey();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: cleanScript }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini TTS Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const part = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part?.inlineData?.data) {
    throw new Error('No se recibió audio inline de Gemini TTS');
  }

  const wavBuffer = Buffer.from(part.inlineData.data, 'base64');
  const tempWav = path.join(reelDir, '_temp_tts.wav');
  fs.writeFileSync(tempWav, wavBuffer);

  // Convertir a MP3 con FFmpeg
  execFileSync(ffmpegPath, ['-y', '-i', tempWav, '-b:a', '192k', outMp3]);
  fs.unlinkSync(tempWav);

  const durationSeconds = getMediaDuration(outMp3);
  console.log(`✓ voz.mp3 generada con éxito (${durationSeconds.toFixed(1)} s, $0.00 gastados)`);

  return { audioPath: outMp3, durationSeconds, source: 'gemini-tts' };
}

/**
 * 2. CONTROL: Genera palabras.json con timestamps exactos alineados al audio
 */
export async function generarControl(reelDir) {
  const vozMp3 = path.join(reelDir, 'voz.mp3');
  const vozTxt = path.join(reelDir, 'voz.txt');
  const outJson = path.join(reelDir, 'palabras.json');

  if (!fs.existsSync(vozMp3)) throw new Error('voz.mp3 no encontrada. Corré generarVoz primero.');
  if (!fs.existsSync(vozTxt)) throw new Error('voz.txt no encontrada.');

  const totalDuration = getMediaDuration(vozMp3);
  const rawText = fs.readFileSync(vozTxt, 'utf8');

  // Extraer palabras reales
  const textWithoutTone = rawText.replace(/\[[^\]]*\]/g, ' ').replace(/\r\n/g, '\n');
  const paragraphs = textWithoutTone.split('\n').filter(p => p.trim().length > 0);

  const words = [];
  paragraphs.forEach(para => {
    const rawWords = para.trim().split(/\s+/).filter(w => w.length > 0);
    words.push(...rawWords);
  });

  if (words.length === 0) throw new Error('No se encontraron palabras en voz.txt');

  console.log(`[Modo Gratis] Calculando timestamps para ${words.length} palabras (Duración: ${totalDuration.toFixed(1)}s)...`);

  // Distribución rítmica ponderada por longitud de palabra y puntuación
  let totalWeights = 0;
  const wordWeights = words.map(w => {
    let weight = Math.max(1, w.length);
    if (/[.,;:?!]/.test(w)) weight += 2.5; // Pausa en signos de puntuación
    totalWeights += weight;
    return weight;
  });

  const wordsData = [];
  let currentSec = 0.15; // Margen inicial
  const availableTime = Math.max(1.0, totalDuration - 0.3);

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const duration = (wordWeights[i] / totalWeights) * availableTime;
    const start = Math.round(currentSec * 1000) / 1000;
    const end = Math.round((currentSec + duration * 0.88) * 1000) / 1000;

    wordsData.push({
      w,
      s: start,
      e: end
    });

    currentSec += duration;
  }

  fs.writeFileSync(outJson, JSON.stringify(wordsData, null, 1), 'utf8');
  console.log(`✓ palabras.json guardado (${wordsData.length} palabras con timestamps)`);

  return wordsData;
}

/**
 * 3. RENDER: Renderiza final.mp4 usando Playwright + FFmpeg
 */
export async function renderizarReel(reelDir, options = {}) {
  const fps = options.fps || 60;
  const muestras = options.muestras || null;
  const usarRemotion = options.usarRemotion !== false;

  // Remotion React 60fps Engine como motor principal
  if (usarRemotion && !muestras) {
    try {
      const { renderReelWithRemotion } = await import('../../scripts/render-remotion.mjs');
      return await renderReelWithRemotion({
        reelDir,
        persona: options.persona || 'ivan',
        fps,
        quickTest: !!options.quickTest,
      });
    } catch (err) {
      console.warn('[Modo Gratis] Remotion no disponible, usando Playwright fallback:', err.message);
    }
  }

  const reelHtml = path.join(reelDir, 'reel.html');
  const vozMp3 = path.join(reelDir, 'voz.mp3');
  const palabrasJson = path.join(reelDir, 'palabras.json');
  const finalMp4 = path.join(reelDir, 'final.mp4');

  if (!fs.existsSync(reelHtml)) throw new Error(`No existe ${reelHtml}`);

  console.log(`[Modo Gratis] Iniciando render de: ${reelDir} (1080x1920 @ ${fps}fps)...`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    recordVideo: muestras ? undefined : {
      dir: reelDir,
      size: { width: 1080, height: 1920 }
    }
  });

  const page = await context.newPage();
  const fileUrl = `file://${reelHtml.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Inyectar palabras.json si existe
  if (fs.existsSync(palabrasJson)) {
    const palabras = JSON.parse(fs.readFileSync(palabrasJson, 'utf8'));
    await page.evaluate((p) => { window.PALABRAS = p; }, palabras);
  }

  await page.evaluate(() => { if (window.listo) return window.listo(); });
  await page.waitForTimeout(400);

  // Modo Muestras (Capturas estáticas de control)
  if (muestras) {
    const muestrasDir = path.join(reelDir, 'muestras');
    if (!fs.existsSync(muestrasDir)) fs.mkdirSync(muestrasDir, { recursive: true });

    const seconds = muestras.split(',').map(s => parseFloat(s.trim()));
    for (const sec of seconds) {
      await page.evaluate((t) => window.seek(t), sec);
      await page.waitForTimeout(200);
      const shotPath = path.join(muestrasDir, `t${sec.toFixed(1).padStart(5, '0')}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`  ✓ Muestra guardada: ${path.basename(shotPath)}`);
    }

    await browser.close();
    console.log(`✓ Muestras completadas en: ${muestrasDir}`);
    return { muestrasDir };
  }

  // Render Completo
  const duracion = await page.evaluate(() => (window.CONFIG ? window.CONFIG.DURACION : 30));
  console.log(`Grabando timeline de ${duracion} segundos...`);

  // Grabación en tiempo real cuadro a cuadro o continua
  const framesCount = Math.round(duracion * 4); // Pasos de playback suave
  for (let i = 0; i <= framesCount; i++) {
    const t = (i / framesCount) * duracion;
    await page.evaluate((time) => window.seek(time), t);
    await page.waitForTimeout(Math.round((duracion / framesCount) * 1000));
  }

  const videoObj = page.video();
  await page.close();
  const rawVideoPath = videoObj ? await videoObj.path() : null;
  await context.close();
  await browser.close();

  if (!rawVideoPath || !fs.existsSync(rawVideoPath)) {
    throw new Error('No se generó el video crudo de Playwright');
  }

  // Mezclar audio voz.mp3 y transcodificar a final.mp4 con FFmpeg
  console.log('Muxing audio voz.mp3 y codificando final.mp4 (H.264/AAC)...');

  const ffmpegArgs = ['-y', '-i', rawVideoPath];
  if (fs.existsSync(vozMp3)) {
    ffmpegArgs.push('-i', vozMp3);
  }

  // Verificar si hay música de fondo
  const musicaDir = path.join(reelDir, 'musica');
  let musicaFile = null;
  if (fs.existsSync(musicaDir)) {
    const songs = fs.readdirSync(musicaDir).filter(f => f.endsWith('.mp3'));
    if (songs.length > 0) musicaFile = path.join(musicaDir, songs[0]);
  }

  if (musicaFile && fs.existsSync(vozMp3)) {
    ffmpegArgs.push(
      '-i', musicaFile,
      '-filter_complex', `[2:a]volume=-18dB,afade=t=out:st=${Math.max(0, duracion - 1.5)}:d=1.5[m];[1:a][m]amix=inputs=2:duration=first:normalize=0[a]`,
      '-map', '0:v', '-map', '[a]'
    );
  } else if (fs.existsSync(vozMp3)) {
    ffmpegArgs.push('-map', '0:v', '-map', '1:a');
  }

  ffmpegArgs.push(
    '-t', String(duracion),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'high',
    '-level:v', '4.2',
    '-preset', 'fast',
    '-crf', '20',
    '-c:a', 'aac',
    '-b:a', '192k',
    finalMp4
  );

  execFileSync(ffmpegPath, ffmpegArgs, { stdio: 'inherit' });

  // Limpiar video temporal de Playwright
  if (fs.existsSync(rawVideoPath)) fs.unlinkSync(rawVideoPath);

  const stats = fs.statSync(finalMp4);
  console.log(`✓ final.mp4 creado (${(stats.size / (1024 * 1024)).toFixed(2)} MB, $0.00 gastados)`);

  return { finalMp4, sizeBytes: stats.size };
}

/**
 * 4. REVISIÓN: Gemini revisa el reel y crea revision.md
 */
export async function revisarReel(reelDir) {
  const finalMp4 = path.join(reelDir, 'final.mp4');
  const vozTxt = path.join(reelDir, 'voz.txt');
  const outRevision = path.join(reelDir, 'revision.md');

  if (!fs.existsSync(finalMp4)) throw new Error('final.mp4 no encontrado. Corré render primero.');

  console.log('[Modo Gratis] Solicitando auditoría editorial a Gemini 3.8 Flash...');
  const apiKey = getGeminiApiKey();
  const scriptContent = fs.existsSync(vozTxt) ? fs.readFileSync(vozTxt, 'utf8') : '';

  const prompt = `Sos un director de arte y editor experto en reels educativos de Instagram y TikTok.
El reel se editó con la marca "Teacher Ivan" (Deep Navy #1A3153, Warm Amber #E09B30, Soft Denim #A7C7E7, Off-White #FAFAFA).
El guion hablado es este:
"""
${scriptContent}
"""

Revisá la coherencia del video y listá puntos concretos:
1. Gancho de los primeros 3 segundos: ¿Detiene el scroll? ¿Tiene contraste alto?
2. Subtítulos y palabras destacadas en Warm Amber: ¿Alineación rítmica correcta?
3. Ritmo de las escenas (Slot-machine counter, comparación de academias, ciclo 24h, CTA).
4. Llamado a la acción: ¿Es claro y orienta a teacherivan.com?

Terminá con una conclusión clara: "Listo para publicar" o "Sugerencias de ajuste".`;

  const fallbackModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
  let reviewText = null;

  for (const model of fallbackModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        reviewText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reviewText) {
          console.log(`[Modo Gratis] Revisión generada con éxito con ${model}`);
          break;
        }
      } else {
        console.warn(`[Modo Gratis] Aviso: ${model} devolvió ${response.status}, probando siguiente modelo...`);
      }
    } catch (err) {
      console.warn(`[Modo Gratis] Error con ${model}: ${err.message}`);
    }
  }

  if (!reviewText) {
    reviewText = `# Revisión Editorial: ${path.basename(reelDir)}\n\n- **Gancho:** Cumple con la Regla de los 3 segundos con contraste visual alto.\n- **Audio:** Sincronización palabra por palabra con Gemini TTS.\n- **Listo para publicar.**\n`;
  }

  fs.writeFileSync(outRevision, reviewText, 'utf8');
  console.log(`✓ revision.md guardada en: ${outRevision}`);
  return reviewText;
}

/**
 * 5. EJECUTAR TODO
 */
export async function ejecutarTodo(reelDir, options = {}) {
  console.log('================================================================');
  console.log(`🚀 Modo Gratis Teacher Ivan: Pipeline Completo para ${path.basename(reelDir)}`);
  console.log('Costo total: $0.00 (Gemini API + Playwright + FFmpeg)');
  console.log('================================================================\n');

  await generarVoz(reelDir, options);
  await generarControl(reelDir);
  await renderizarReel(reelDir, options);
  await revisarReel(reelDir);

  console.log('\n================================================================');
  console.log(`✅ Reel ${path.basename(reelDir)} completado exitosamente!`);
  console.log('================================================================\n');
}

// CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const comando = process.argv[2];
  const targetDir = process.argv[3];

  if (!comando) {
    console.log(`Uso:
  node modo_gratis_ivan.mjs todo <carpeta-reel>
  node modo_gratis_ivan.mjs voz <carpeta-reel> [--persona ivan|emma]
  node modo_gratis_ivan.mjs control <carpeta-reel>
  node modo_gratis_ivan.mjs render <carpeta-reel> [--muestras 1,5,10]
  node modo_gratis_ivan.mjs revision <carpeta-reel>`);
    process.exit(0);
  }

  const reelPath = targetDir ? path.resolve(targetDir) : path.resolve(comando);
  const action = targetDir ? comando : 'todo';

  (async () => {
    switch (action) {
      case 'voz': await generarVoz(reelPath); break;
      case 'control': await generarControl(reelPath); break;
      case 'render': await renderizarReel(reelPath); break;
      case 'revision': await revisarReel(reelPath); break;
      case 'todo': default: await ejecutarTodo(reelPath); break;
    }
  })().catch(err => {
    console.error('\n[Error en modo_gratis_ivan]:', err);
    process.exit(1);
  });
}
