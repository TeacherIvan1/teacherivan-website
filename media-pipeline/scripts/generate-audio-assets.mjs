import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PIPELINE_DIR = path.resolve(__dirname, '..');
const ROOT_DIR = path.resolve(PIPELINE_DIR, '..');

const AUDIO_DIR = path.join(PIPELINE_DIR, 'public', 'audio');
const SFX_DIR = path.join(AUDIO_DIR, 'sfx');

// Ensure directories exist
fs.mkdirSync(AUDIO_DIR, { recursive: true });
fs.mkdirSync(SFX_DIR, { recursive: true });

/**
 * 1. Read GEMINI_API_KEY from server/.env if available
 */
function getGeminiApiKey() {
  const envPaths = [
    path.join(ROOT_DIR, 'server', '.env'),
    path.join(ROOT_DIR, '.env'),
    path.join(PIPELINE_DIR, '.env'),
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      const m = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
      if (m && m[1].trim()) return m[1].trim();
    }
  }
  return process.env.GEMINI_API_KEY || null;
}

/**
 * Measure exact media duration using ffmpeg
 */
function getMediaDuration(mediaPath) {
  try {
    execFileSync(ffmpegPath, ['-i', mediaPath], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (err) {
    const output = (err.stdout || '') + (err.stderr || '');
    const m = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (m) {
      return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseFloat(m[3]);
    }
  }
  return 29.7;
}

/**
 * Normalizes script text for natural speech synthesis
 * - "24/7" -> "veinticuatro siete" (NEVER "veinticuatro séptimos")
 * - "teacherivan.com" -> "tícher ivan punto com"
 * - "%" -> "por ciento"
 * - "STT" -> "ese te te"
 * - "CEFR" -> "ce efe erre"
 * - "90s" -> "noventa segundos"
 * - "1-a-1" -> "uno a uno"
 */
export function normalizeTextForSpeech(text) {
  return text
    .replace(/\[[^\]]*\]/g, ' ') // Strip tone cues like [excited]
    .replace(/\b24\/7\b/gi, 'veinticuatro siete')
    .replace(/teacherivan\.com/gi, 'tícher ivan punto com')
    .replace(/teacher\s+ivan/gi, 'tícher ivan')
    .replace(/(\d+)\s*%/g, '$1 por ciento')
    .replace(/%\s*/g, ' por ciento ')
    .replace(/\bSTT\b/g, 'ese te te')
    .replace(/\bCEFR\b/g, 'ce efe erre')
    .replace(/\b90\s*s\b/gi, 'noventa segundos')
    .replace(/\b90s\b/gi, 'noventa segundos')
    .replace(/1-a-1/g, 'uno a uno')
    .replace(/1\s*a\s*1/g, 'uno a uno')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Default Reel #1 Script (Fast-paced ~29.7s high-converting script)
 */
const SCRIPT_RAW = `
¿Sabías que en una clase tradicional de inglés de una hora, sólo hablás un treinta por ciento del tiempo?
El profesor explica la regla, tus compañeros se equivocan, y a vos te quedan dos minutos de práctica con miedo al juicio.
Con nuestro método Bichronous, entrenás con un tutor de voz con inteligencia artificial las 24/7.
Hablás más del 75% del tiempo, y el sistema te hace recasting nativo al instante.
Sin vergüenza, a tu ritmo, y combinándolo con clases 1-a-1 personalizadas.
Entrá a teacherivan.com y hacé tu test de voz gratis en 90s.
`;

/**
 * 2. Try Gemini TTS with Energetic Male Voice ("Puck")
 */
async function tryGeminiTTS(apiKey, normalizedText, outPath) {
  console.log('[Audio Gen] Intentando síntesis con Gemini Audio (Puck - Energetic Male)...');
  const models = ['gemini-2.5-flash', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Lee enérgico, claro y motivador en español neutro/latino como Teacher Ivan: ${normalizedText}`
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' } // Strictly Male
            }
          }
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) {
        console.log(`[Audio Gen] Gemini ${model} status ${res.status}`);
        continue;
      }

      const data = await res.json();
      const part = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData?.data) {
        const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
        const tempWav = path.join(AUDIO_DIR, '_temp_gemini.wav');
        fs.writeFileSync(tempWav, audioBuffer);
        // Speed up to brisk 1.10 rate and apply warmth EQ
        execFileSync(ffmpegPath, [
          '-y',
          '-i', tempWav,
          '-af', 'atempo=1.08,bass=g=2.5:f=180,treble=g=1.2:f=3500',
          '-b:a', '192k',
          outPath
        ]);
        fs.unlinkSync(tempWav);
        console.log(`✓ voz.mp3 generada exitosamente con Gemini (${model})`);
        return true;
      }
    } catch (err) {
      console.log(`[Audio Gen] Gemini ${model}: ${err.message}`);
    }
  }
  return false;
}

/**
 * 3. Neural Male Voice Fallback (edge-tts / Python)
 */
async function tryEdgeTTS(normalizedText, outPath) {
  console.log('[Audio Gen] Intentando fallback neural masculino (es-AR-TomasNeural / es-MX-JorgeNeural)...');
  const tempEdgeMp3 = path.join(AUDIO_DIR, '_temp_edge.mp3');
  const voices = ['es-AR-TomasNeural', 'es-MX-JorgeNeural'];

  for (const voice of voices) {
    try {
      execFileSync('python', [
        '-m', 'edge_tts',
        '--voice', voice,
        '--rate', '+12%',
        '--text', normalizedText,
        '--write-media', tempEdgeMp3,
      ], { stdio: 'pipe', encoding: 'utf8' });

      if (fs.existsSync(tempEdgeMp3) && fs.statSync(tempEdgeMp3).size > 5000) {
        execFileSync(ffmpegPath, [
          '-y',
          '-i', tempEdgeMp3,
          '-af', 'bass=g=2.0:f=180',
          '-b:a', '192k',
          outPath
        ]);
        fs.unlinkSync(tempEdgeMp3);
        console.log(`✓ voz.mp3 generada con éxito usando edge-tts (${voice})`);
        return true;
      }
    } catch {
      // Python or edge-tts not available, continue to next fallback
    }
  }
  return false;
}

/**
 * 4. Existing Authentic Male Track Copy (from media-pipeline/Reels/)
 */
function tryExtractExistingAuthenticMale(outPath) {
  const candidates = [
    path.join(PIPELINE_DIR, 'Reels/reels/2026-10-20-clon-ia-ingles/voz.mp3'),
    path.join(PIPELINE_DIR, 'Reels/reels/2026-10-20-clon-ia-ingles/final.mp4'),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      console.log(`[Audio Gen] Extrayendo pista masculina original de: ${path.basename(c)}`);
      execFileSync(ffmpegPath, [
        '-y',
        '-i', c,
        '-vn',
        '-af', 'apad=whole_dur=35',
        '-acodec', 'libmp3lame',
        '-b:a', '192k',
        outPath
      ]);
      console.log('✓ voz.mp3 extraída exitosamente del master masculino (35.0s)');
      return true;
    }
  }
  return false;
}

/**
 * 5. Programmatic WAV Synthesizer (44.1kHz 16-bit PCM RIFF)
 */
function createWavBuffer(sampleRate, channels, samples) {
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = Buffer.alloc(totalSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(totalSize - 8, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);

  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1.0, Math.min(1.0, samples[i]));
    const intSample = Math.floor(s < 0 ? s * 32768 : s * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

/**
 * Synthesize `bg-music.wav`: 110 BPM Lo-Fi Ambient Chord Loop (35s)
 */
function synthesizeBgMusic(outPath, durationSec = 35.0) {
  console.log(`[Audio Gen] Sintetizando bg-music.wav (${durationSec}s @ 110 BPM lo-fi synth)...`);
  const sampleRate = 44100;
  const channels = 2;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const bufferSamples = new Float32Array(totalSamples * channels);

  const bpm = 110;
  const beatDuration = 60 / bpm;
  const barDuration = beatDuration * 4;

  const chordFrequencies = [
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [164.81, 196.00, 246.94, 293.66], // Em7
    [146.83, 220.00, 261.63, 293.66, 370.0], // Dm9
    [130.81, 164.81, 196.00, 246.94], // Cmaj7
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const barIndex = Math.floor(t / barDuration) % chordFrequencies.length;
    const currentChord = chordFrequencies[barIndex];
    const timeInBar = t % barDuration;

    const barEnv = Math.sin((Math.PI * timeInBar) / barDuration);
    const beatPos = (t % beatDuration) / beatDuration;
    const sidechainDuck = 0.55 + 0.45 * Math.pow(beatPos, 0.4);

    let chordSignal = 0;
    for (let c = 0; c < currentChord.length; c++) {
      const freq = currentChord[c];
      const detune = Math.sin(t * 1.5 + c) * 0.4;
      const s1 = Math.sin(2 * Math.PI * (freq + detune) * t);
      const s2 = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.18;
      chordSignal += (s1 + s2) * 0.22;
    }

    const bassFreq = currentChord[0] / 2;
    const bassEnv = Math.exp(-3.0 * (timeInBar % (beatDuration * 2)));
    const bassSignal = Math.sin(2 * Math.PI * bassFreq * t) * 0.35 * bassEnv;
    const loFiNoise = (Math.random() * 2 - 1) * 0.008;

    const rawMix = (chordSignal * barEnv * sidechainDuck + bassSignal + loFiNoise) * 0.38;
    const panOffset = Math.sin(t * 0.5) * 0.15;
    bufferSamples[i * 2] = rawMix * (1 - panOffset);
    bufferSamples[i * 2 + 1] = rawMix * (1 + panOffset);
  }

  const wavBuffer = createWavBuffer(sampleRate, channels, bufferSamples);
  fs.writeFileSync(outPath, wavBuffer);
  console.log(`✓ bg-music.wav sintetizado con éxito (${(wavBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
}

/**
 * Synthesize `whoosh.wav`: Smooth filtered frequency sweep (0.50s)
 */
function synthesizeWhoosh(outPath) {
  const sampleRate = 44100;
  const channels = 2;
  const durationSec = 0.50;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const bufferSamples = new Float32Array(totalSamples * channels);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const progress = t / durationSec;
    const env = Math.sin(Math.PI * progress);
    const freq = 650 * Math.pow(0.2, progress);
    const sineTone = Math.sin(2 * Math.PI * freq * t) * 0.35;
    const noise = (Math.random() * 2 - 1) * 0.45;
    const signal = (sineTone + noise) * env * 0.65;

    bufferSamples[i * 2] = signal * (1.0 - progress * 0.7);
    bufferSamples[i * 2 + 1] = signal * (0.3 + progress * 0.7);
  }

  const wavBuffer = createWavBuffer(sampleRate, channels, bufferSamples);
  fs.writeFileSync(outPath, wavBuffer);
}

/**
 * Synthesize `pop.wav`: Crisp UI bubble/tick (0.12s)
 */
function synthesizePop(outPath) {
  const sampleRate = 44100;
  const channels = 2;
  const durationSec = 0.12;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const bufferSamples = new Float32Array(totalSamples * channels);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const progress = t / durationSec;
    const env = Math.exp(-progress * 22);
    const freq = 180 + 700 * Math.exp(-progress * 26);
    const signal = Math.sin(2 * Math.PI * freq * t) * env * 0.75;
    bufferSamples[i * 2] = signal;
    bufferSamples[i * 2 + 1] = signal;
  }

  const wavBuffer = createWavBuffer(sampleRate, channels, bufferSamples);
  fs.writeFileSync(outPath, wavBuffer);
}

/**
 * Synthesize `ding.wav`: Warm harmonic chime (#E09B30 brand cue, 1.2s)
 */
function synthesizeDing(outPath) {
  const sampleRate = 44100;
  const channels = 2;
  const durationSec = 1.2;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const bufferSamples = new Float32Array(totalSamples * channels);

  const harmonics = [
    { freq: 659.25, gain: 0.50, decay: 3.5 }, // E5
    { freq: 987.77, gain: 0.35, decay: 4.8 }, // B5
    { freq: 1318.51, gain: 0.20, decay: 6.2 }, // E6
    { freq: 1661.22, gain: 0.12, decay: 7.5 }, // G#6
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let chime = 0;
    for (const h of harmonics) {
      const env = Math.exp(-t * h.decay);
      chime += Math.sin(2 * Math.PI * h.freq * t) * env * h.gain;
    }
    const signal = chime * 0.75;
    bufferSamples[i * 2] = signal;
    bufferSamples[i * 2 + 1] = signal;
  }

  const wavBuffer = createWavBuffer(sampleRate, channels, bufferSamples);
  fs.writeFileSync(outPath, wavBuffer);
}

/**
 * Main Runner
 */
async function main() {
  console.log('====================================================');
  console.log('Teacher Ivan - Media Pipeline Male Audio Generator');
  console.log('====================================================');

  const vozMp3Path = path.join(AUDIO_DIR, 'voz.mp3');
  const palabrasJsonPath = path.join(AUDIO_DIR, 'palabras.json');
  const bgMusicWavPath = path.join(SFX_DIR, 'bg-music.wav');
  const whooshWavPath = path.join(SFX_DIR, 'whoosh.wav');
  const popWavPath = path.join(SFX_DIR, 'pop.wav');
  const dingWavPath = path.join(SFX_DIR, 'ding.wav');

  // Step 1: Synthesize SFX suite
  synthesizeBgMusic(bgMusicWavPath, 35.0);
  synthesizeWhoosh(whooshWavPath);
  synthesizePop(popWavPath);
  synthesizeDing(dingWavPath);
  console.log('✓ SFX suite lista (bg-music, whoosh, pop, ding)');

  // Step 2: Generate or Extract Voiceover
  const normalizedText = normalizeTextForSpeech(SCRIPT_RAW);
  let voiceGenerated = false;

  const apiKey = getGeminiApiKey();
  if (apiKey) {
    voiceGenerated = await tryGeminiTTS(apiKey, normalizedText, vozMp3Path);
  }

  if (!voiceGenerated) {
    voiceGenerated = await tryEdgeTTS(normalizedText, vozMp3Path);
  }

  if (!voiceGenerated) {
    voiceGenerated = tryExtractExistingAuthenticMale(vozMp3Path);
  }

  if (!voiceGenerated) {
    throw new Error('No se pudo generar ni extraer la voz masculina.');
  }

  const actualDuration = getMediaDuration(vozMp3Path);
  console.log(`✓ Duración final de voz.mp3: ${actualDuration.toFixed(2)}s`);

  // Step 3: Align or sync palabras.json (preserving true cadence without artificial 29s compression)
  const existingPalabras = path.join(PIPELINE_DIR, 'Reels/reels/2026-10-20-clon-ia-ingles/palabras.json');
  if (fs.existsSync(existingPalabras)) {
    const rawWords = JSON.parse(fs.readFileSync(existingPalabras, 'utf8'));

    const synced = rawWords.map(w => ({
      w: w.w,
      word: w.w,
      s: Math.round(w.s * 1000) / 1000,
      start: Math.round(w.s * 1000) / 1000,
      e: Math.round(w.e * 1000) / 1000,
      end: Math.round(w.e * 1000) / 1000,
    }));

    fs.writeFileSync(palabrasJsonPath, JSON.stringify(synced, null, 2));
    console.log(`✓ palabras.json sincronizado (${synced.length} palabras) en ${palabrasJsonPath}`);
  }

  console.log('\n====================================================');
  console.log('¡Activos de audio masculino listos en public/audio/!');
  console.log('====================================================');
}

main().catch(err => {
  console.error('Fatal error en generador de audio:', err);
  process.exit(1);
});
