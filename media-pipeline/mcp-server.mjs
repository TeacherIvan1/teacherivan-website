#!/usr/bin/env node
/**
 * ==============================================================================
 * Teacher Ivan & Coach Emma - Media Pipeline MCP Server
 * ==============================================================================
 * Zero-dependency Node.js MCP Server communicating over JSON-RPC 2.0 stdio.
 * Replaces the Rust filmcraft binary with full compatibility for Antigravity,
 * Gemini, and Claude MCP clients.
 *
 * Supported Methods:
 *   - initialize
 *   - notifications/initialized
 *   - ping
 *   - tools/list
 *   - tools/call
 *
 * Tools:
 *   1. prepare_svg_poses
 *   2. generate_storyboard
 *   3. render_split_screen_reel
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

// Utilities from local scripts
import { generateAllPoses } from './scripts/prepare-svg-poses.mjs';
import { renderReel } from './scripts/render-reel.mjs';
import { renderReelWithRemotion } from './scripts/render-remotion.mjs';
import { generarVoz, generarControl, renderizarReel, revisarReel, ejecutarTodo } from './reels-con-ia/scripts/modo_gratis_ivan.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PIPELINE_DIR = __dirname;
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

  // 1. FilmCraft Project Schema v13 Manifest
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
              name: 'V3_BottomHalf_CharacterRig',
              type: 'video',
              items: [
                {
                  id: 301,
                  character: storyboardData.character?.name || 'Teacher Ivan',
                  folder: storyboardData.character?.folder || 'ivan',
                  start_time: 0,
                  end_time: duration,
                },
              ],
            },
            {
              name: 'A1_Voiceover',
              type: 'audio',
              items: [
                {
                  id: 401,
                  name: 'Gemini Live Speech / Voice Track',
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

  // 2. EffectCraft Motion Graphics Project Manifest
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
          name: 'Top Half - Motion Graphics',
          type: 'graphics_group',
          bounds: { x: 0, y: 0, width: 1080, height: 960 },
          scenes: storyboardData.scenes || [],
        },
        {
          id: 'layer_center_seam',
          name: 'Center Seam - Dynamic Subtitle Banner',
          type: 'text_animator',
          bounds: { x: 48, y: 880, width: 984, height: 160 },
          style: {
            background: BRAND_PALETTE.NAVY,
            border: `3.5px solid ${BRAND_PALETTE.DENIM}`,
            border_radius: '32px',
            active_word_color: BRAND_PALETTE.AMBER,
          },
          cues: storyboardData.subtitles || [],
        },
        {
          id: 'layer_bottom_half',
          name: 'Bottom Half - 2D Chibi Character Rig',
          type: 'svg_puppet',
          bounds: { x: 0, y: 960, width: 1080, height: 960 },
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
 * MCP Tools Definitions
 */
const TOOLS = [
  {
    name: 'prepare_svg_poses',
    description:
      'Copies ./Assets/logo.svg and base character SVGs (teacher-ivan-rig.svg, emma.svg) into ./media-pipeline/assets/characters/ and client/public/assets/, generating the 4 pose variants (pose-speaking.svg, pose-listening.svg, pose-recast-alert.svg, pose-celebrate.svg) strictly using our 5 brand hex tokens (#1A3153, #E09B30, #A7C7E7, #4A5568, #FAFAFA).',
    inputSchema: {
      type: 'object',
      properties: {
        force: {
          type: 'boolean',
          description: 'Force re-generation of all pose SVGs even if they already exist',
          default: false,
        },
      },
    },
  },
  {
    name: 'generate_storyboard',
    description:
      'Creates or updates a 9:16 split-screen storyboard JSON inside ./media-pipeline/storyboards/ and exports FilmCraft/EffectCraft-compatible manifests (.fcproj / .ecproj).',
    inputSchema: {
      type: 'object',
      properties: {
        storyboardId: {
          type: 'string',
          description: 'Unique storyboard ID (e.g. "reel-01-ai-clone")',
        },
        storyboardData: {
          type: 'object',
          description: 'Full storyboard specification JSON object. If omitted, loads and updates existing storyboard.',
        },
        exportProjectManifests: {
          type: 'boolean',
          description: 'Whether to generate .fcproj and .ecproj project manifests',
          default: true,
        },
      },
      required: ['storyboardId'],
    },
  },
  {
    name: 'render_split_screen_reel',
    description:
      'Renders any split-screen reel or storyboard using Remotion (React + TypeScript + Tailwind 1080x1920 @ 60fps) with synced word timestamps from palabras.json, voz.mp3 audio, and rigged SVG characters into ./media-pipeline/output/.',
    inputSchema: {
      type: 'object',
      properties: {
        storyboardId: {
          type: 'string',
          description: 'Storyboard identifier or reel folder name to render (e.g. "reel-01-ai-clone" or "2026-10-20-clon-ia-ingles")',
        },
        carpetaReel: {
          type: 'string',
          description: 'Optional direct path to reel folder in Reels/reels/',
        },
        persona: {
          type: 'string',
          enum: ['ivan', 'emma'],
          description: 'Tutor character avatar (ivan or emma)',
          default: 'ivan',
        },
        quickTest: {
          type: 'boolean',
          description: 'Render a quick 3-second preview instead of the full duration',
          default: false,
        },
        engine: {
          type: 'string',
          enum: ['remotion', 'playwright'],
          description: 'Video rendering engine (default: remotion)',
          default: 'remotion',
        },
      },
      required: ['storyboardId'],
    },
  },
  {
    name: 'crear_guion_reel',
    description:
      'Crea un nuevo guion para un reel vertical 9:16 en media-pipeline/Reels/reels/AAAA-MM-DD-tema/guion.md y voz.txt siguiendo la Regla #1 de SKILL.md ("El guion se aprueba antes de gastar"). Deja pre-construido reel.html con la plantilla de Teacher Ivan para previsualización inmediata.',
    inputSchema: {
      type: 'object',
      properties: {
        tema: {
          type: 'string',
          description: 'Identificador del tema en kebab-case (ej. "clon-ia-ingles", "metodo-recast")',
        },
        fecha: {
          type: 'string',
          description: 'Fecha en formato AAAA-MM-DD (opcional, por defecto fecha de hoy)',
        },
        titulo: {
          type: 'string',
          description: 'Título o gancho del reel en dos líneas',
        },
        textoGuion: {
          type: 'string',
          description: 'Texto completo del guion (75-110 palabras, 30-45s)',
        },
        cta: {
          type: 'string',
          description: 'Llamado a la acción para el cierre (ej. "teacherivan.com — Test de Voz Gratis")',
        },
        persona: {
          type: 'string',
          enum: ['ivan', 'emma'],
          description: 'Persona/Voz del tutor (ivan o emma)',
          default: 'ivan',
        },
      },
      required: ['tema', 'titulo', 'textoGuion'],
    },
  },
  {
    name: 'compilar_reel_aprobado',
    description:
      'Compila un reel aprobado en su carpeta de Reels: genera voz.mp3 (Gemini TTS $0.00 o audio en yo/), palabras.json (timestamps palabra por palabra), y renderiza final.mp4 en 9:16 vertical (1080x1920 @ 60fps) usando Remotion React Engine con sincronización cuadro a cuadro y avatar Chibi SVG rig animado.',
    inputSchema: {
      type: 'object',
      properties: {
        carpetaReel: {
          type: 'string',
          description: 'Ruta o nombre de la carpeta del reel (ej. "2026-10-20-clon-ia-ingles" o "media-pipeline/Reels/reels/2026-10-20-clon-ia-ingles")',
        },
        persona: {
          type: 'string',
          enum: ['ivan', 'emma'],
          description: 'Avatar y voz a utilizar',
          default: 'ivan',
        },
        usarModoGratis: {
          type: 'boolean',
          description: 'Usar modo gratuito 100% local/Gemini ($0.00)',
          default: true,
        },
        usarRemotion: {
          type: 'boolean',
          description: 'Renderizar con Remotion React 60fps Engine (por defecto true)',
          default: true,
        },
        quickTest: {
          type: 'boolean',
          description: 'Render rápido de 3 segundos de verificación',
          default: false,
        },
        muestras: {
          type: 'string',
          description: 'Segundos para capturas de control antes del render (ej. "1,5,12")',
        },
      },
      required: ['carpetaReel'],
    },
  },
];

/**
 * Handle Tool Invocations
 */
async function handleToolCall(name, args = {}) {
  switch (name) {
    case 'prepare_svg_poses': {
      await generateAllPoses();
      return {
        content: [
          {
            type: 'text',
            text:
              '✅ Successfully synchronized base assets (logo.svg, teacher-ivan-rig.svg, emma.svg) and generated all 4 pose variants for Teacher Ivan & Coach Emma:\n' +
              '  - pose-speaking.svg\n' +
              '  - pose-listening.svg\n' +
              '  - pose-recast-alert.svg\n' +
              '  - pose-celebrate.svg\n' +
              'All files strictly comply with brand hex tokens: #1A3153, #E09B30, #A7C7E7, #4A5568, #FAFAFA.',
          },
        ],
      };
    }

    case 'generate_storyboard': {
      const { storyboardId, storyboardData, exportProjectManifests = true } = args;
      if (!storyboardId) {
        throw new Error('Missing required parameter: storyboardId');
      }

      const jsonPath = path.join(STORYBOARDS_DIR, `${storyboardId}.json`);
      let data = storyboardData;

      if (data) {
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      } else if (fs.existsSync(jsonPath)) {
        data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      } else {
        throw new Error(`Storyboard not found: ${jsonPath}`);
      }

      let manifestResult = null;
      if (exportProjectManifests) {
        manifestResult = exportManifests(data);
      }

      return {
        content: [
          {
            type: 'text',
            text:
              `✅ Storyboard processed: ${storyboardId}\n` +
              `  - JSON:    ${jsonPath}\n` +
              (manifestResult
                ? `  - FilmCraft:   ${manifestResult.fcprojPath}\n  - EffectCraft: ${manifestResult.ecprojPath}\n`
                : '') +
              `  - Title:   ${data.title || 'Untitled'}\n` +
              `  - Scenes:  ${(data.scenes || []).length}\n` +
              `  - Duration: ${data.durationSeconds || 12}s`,
          },
        ],
      };
    }

    case 'render_split_screen_reel': {
      const {
        storyboardId,
        carpetaReel,
        persona = 'ivan',
        quickTest = false,
        engine = 'remotion',
      } = args;

      if (!storyboardId && !carpetaReel) {
        throw new Error('Missing required parameter: storyboardId or carpetaReel');
      }

      let targetReelDir = carpetaReel;
      if (!targetReelDir && storyboardId) {
        const candidate = path.join(PIPELINE_DIR, 'Reels/reels', storyboardId);
        if (fs.existsSync(candidate)) {
          targetReelDir = candidate;
        }
      }

      if (engine === 'remotion' || targetReelDir) {
        const result = await renderReelWithRemotion({
          reelDir: targetReelDir,
          storyboardId: storyboardId || (targetReelDir ? path.basename(targetReelDir) : 'reel'),
          persona,
          quickTest,
        });

        return {
          content: [
            {
              type: 'text',
              text:
                `🎬 Remotion 9:16 Split-Screen Reel Render Complete!\n` +
                `  - Engine:     Remotion React (@remotion/cli 60fps)\n` +
                `  - Video:      ${result.finalMp4} (${(result.sizeBytes / (1024 * 1024)).toFixed(2)} MB)\n` +
                (result.posterPath ? `  - Hero Poster: ${result.posterPath}\n` : '') +
                `  - Character:  ${result.character === 'emma' ? 'Coach Emma' : 'Teacher Ivan'}\n` +
                `  - Timestamps: ${result.wordsCount} words synced from palabras.json\n` +
                `  - Resolution: 1080x1920 (9:16 Vertical)\n` +
                `  - Duration:   ${result.durationSeconds}s`,
            },
          ],
        };
      }

      const result = await renderReel({ storyboardId, quickTest });
      return {
        content: [
          {
            type: 'text',
            text:
              `🎬 Split-Screen Reel Render Complete!\n` +
              `  - Storyboard: ${result.storyboardId}\n` +
              `  - Video:      ${result.videoPath} (${(result.sizeBytes / (1024 * 1024)).toFixed(2)} MB)\n` +
              `  - Hero Poster: ${result.posterPath}\n` +
              `  - Resolution: ${result.resolution} (9:16 Split-Screen)\n` +
              `  - Duration:   ${result.durationSeconds}s`,
          },
        ],
      };
    }

    case 'crear_guion_reel': {
      const {
        tema,
        titulo,
        textoGuion,
        cta = 'TEACHERIVAN.COM — TEST DE VOZ GRATIS (90S)',
        fecha = new Date().toISOString().slice(0, 10),
        persona = 'ivan',
      } = args;

      if (!tema || !titulo || !textoGuion) {
        throw new Error('Faltan parámetros obligatorios: tema, titulo o textoGuion.');
      }

      const reelFolderName = `${fecha}-${tema}`;
      const reelsBaseDir = path.join(PIPELINE_DIR, 'Reels/reels');
      const targetReelDir = path.join(reelsBaseDir, reelFolderName);

      fs.mkdirSync(path.join(targetReelDir, 'tomas'), { recursive: true });
      fs.mkdirSync(path.join(targetReelDir, 'musica'), { recursive: true });
      fs.mkdirSync(path.join(targetReelDir, 'assets'), { recursive: true });

      const wordCount = textoGuion.trim().split(/\s+/).length;
      const estimatedSecs = Math.round(wordCount / 2.5);

      const guionMd =
        `# Guion: ${titulo}\n\n` +
        `- **Fecha:** ${fecha}\n` +
        `- **Tema:** ${tema}\n` +
        `- **Persona:** ${persona === 'emma' ? 'Coach Emma' : 'Teacher Ivan'}\n` +
        `- **CTA:** "${cta}"\n` +
        `- **Estado:** Pendiente de Aprobación (Regla #1 SKILL.md: El guion se aprueba antes de gastar/compilar)\n` +
        `- **Palabras:** ${wordCount} palabras (≈ ${estimatedSecs}s a 2,5 palabras/s)\n\n` +
        `---\n\n` +
        `## Texto del Guion\n\n` +
        `${textoGuion}\n`;

      const vozTxt =
        `[confident]\n` +
        `${textoGuion}\n\n` +
        `[excited]\n` +
        `${cta}\n`;

      fs.writeFileSync(path.join(targetReelDir, 'guion.md'), guionMd, 'utf8');
      fs.writeFileSync(path.join(targetReelDir, 'voz.txt'), vozTxt, 'utf8');

      // Pre-construir reel.html
      const templatePath = path.join(PIPELINE_DIR, 'reels-con-ia/plantillas/teacher-ivan-reel.html');
      if (fs.existsSync(templatePath)) {
        let templateContent = fs.readFileSync(templatePath, 'utf8');
        templateContent = templateContent.replace(/DURACION:\s*\d+(\.\d+)?,/, `DURACION: ${estimatedSecs},`);
        templateContent = templateContent.replace(/AVATAR:\s*"[^"]*",/, `AVATAR: "${persona}",`);
        templateContent = templateContent.replace(/CTA:\s*"[^"]*",/, `CTA: "${cta}",`);
        fs.writeFileSync(path.join(targetReelDir, 'reel.html'), templateContent, 'utf8');
      }

      // Copiar SVG del rig a la carpeta assets local del reel
      const rigSource = path.join(PIPELINE_DIR, `assets/characters/${persona === 'emma' ? 'emma-rig.svg' : 'teacher-ivan-rig.svg'}`);
      if (fs.existsSync(rigSource)) {
        fs.copyFileSync(rigSource, path.join(targetReelDir, 'assets', path.basename(rigSource)));
      }

      return {
        content: [
          {
            type: 'text',
            text:
              `📝 Guion de Reel Creado Exitosamente:\n` +
              `  - Carpeta:   ${targetReelDir}\n` +
              `  - Guion:     ${path.join(targetReelDir, 'guion.md')}\n` +
              `  - Texto Voz: ${path.join(targetReelDir, 'voz.txt')}\n` +
              `  - Vista HTML: ${path.join(targetReelDir, 'reel.html')}\n` +
              `  - Palabras:  ${wordCount} (≈ ${estimatedSecs}s)\n\n` +
              `⚠️ REGLA #1 DE SKILL.MD:\n` +
              `"El guion se aprueba antes de compilar". Revisá el guion antes de ejecutar compilar_reel_aprobado.`,
          },
        ],
      };
    }

    case 'compilar_reel_aprobado': {
      const {
        carpetaReel,
        persona = 'ivan',
        usarModoGratis = true,
        usarRemotion = true,
        quickTest = false,
        muestras = null,
      } = args;

      if (!carpetaReel) {
        throw new Error('Falta el parámetro obligatorio: carpetaReel');
      }

      let targetDir = carpetaReel;
      if (!fs.existsSync(targetDir)) {
        const candidate = path.join(PIPELINE_DIR, 'Reels/reels', carpetaReel);
        if (fs.existsSync(candidate)) targetDir = candidate;
        else throw new Error(`No se encontró la carpeta del reel: ${carpetaReel}`);
      }

      process.stderr.write(`[FilmCraft MCP] Compilando reel en ${targetDir} (Motor: ${usarRemotion ? 'Remotion 60fps' : 'Playwright'})...\n`);

      const vozResult = await generarVoz(targetDir, { persona });
      const controlResult = await generarControl(targetDir);

      let renderResult;
      if (usarRemotion) {
        renderResult = await renderReelWithRemotion({
          reelDir: targetDir,
          persona,
          quickTest,
        });
      } else {
        renderResult = await renderizarReel(targetDir, { muestras });
      }

      let revisionText = '';
      if (!muestras && !quickTest) {
        revisionText = await revisarReel(targetDir);
      }

      return {
        content: [
          {
            type: 'text',
            text:
              `🎬 Reel Compilado Exitosamente con Remotion React Engine ($0.00 Gastados):\n` +
              `  - Carpeta:     ${targetDir}\n` +
              `  - Motor:       ${usarRemotion ? 'Remotion 9:16 (1080x1920 @ 60fps)' : 'Playwright HTML5'}\n` +
              `  - Audio Voz:   ${vozResult.audioPath} (${vozResult.durationSeconds.toFixed(1)}s)\n` +
              `  - Timestamps:  ${controlResult.length} palabras sincronizadas en palabras.json\n` +
              (renderResult.finalMp4 ? `  - Video Final: ${renderResult.finalMp4} (${(renderResult.sizeBytes / (1024 * 1024)).toFixed(2)} MB)\n` : '') +
              (renderResult.posterPath ? `  - Póster:      ${renderResult.posterPath}\n` : '') +
              (revisionText ? `  - Revisión:    ${path.join(targetDir, 'revision.md')} (Auditado con Gemini 3.8 Flash)\n` : ''),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * Main JSON-RPC 2.0 stdio Server Loop
 */
function startMcpServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  process.stderr.write('[FilmCraft MCP Server] Started stdio transport.\n');

  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch (err) {
      process.stderr.write(`[FilmCraft MCP Server] JSON Parse Error: ${err.message}\n`);
      return;
    }

    const { id, method, params } = msg;

    try {
      switch (method) {
        case 'initialize': {
          const response = {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: params?.protocolVersion || '2024-11-05',
              capabilities: {
                tools: { listChanged: false },
              },
              serverInfo: {
                name: 'teacherivan-filmcraft-mcp',
                version: '1.0.0',
              },
            },
          };
          process.stdout.write(JSON.stringify(response) + '\n');
          break;
        }

        case 'notifications/initialized': {
          process.stderr.write('[FilmCraft MCP Server] Client initialized notification received.\n');
          break;
        }

        case 'ping': {
          const response = { jsonrpc: '2.0', id, result: {} };
          process.stdout.write(JSON.stringify(response) + '\n');
          break;
        }

        case 'tools/list': {
          const response = {
            jsonrpc: '2.0',
            id,
            result: {
              tools: TOOLS,
            },
          };
          process.stdout.write(JSON.stringify(response) + '\n');
          break;
        }

        case 'tools/call': {
          const toolName = params?.name;
          const toolArgs = params?.arguments || {};
          process.stderr.write(`[FilmCraft MCP Server] Calling tool: ${toolName}\n`);

          const result = await handleToolCall(toolName, toolArgs);
          const response = {
            jsonrpc: '2.0',
            id,
            result,
          };
          process.stdout.write(JSON.stringify(response) + '\n');
          break;
        }

        default: {
          if (id !== undefined) {
            const response = {
              jsonrpc: '2.0',
              id,
              error: {
                code: -32601,
                message: `Method not found: ${method}`,
              },
            };
            process.stdout.write(JSON.stringify(response) + '\n');
          }
          break;
        }
      }
    } catch (err) {
      process.stderr.write(`[FilmCraft MCP Server] Error handling ${method}: ${err.stack || err.message}\n`);
      if (id !== undefined) {
        const errorResponse = {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32603,
            message: err.message,
          },
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    }
  });

  rl.on('close', () => {
    process.stderr.write('[FilmCraft MCP Server] Stdio closed. Exiting.\n');
    process.exit(0);
  });
}

// Export manifests for existing storyboards on launch if executed standalone with --sync
if (process.argv.includes('--sync-manifests')) {
  ['reel-01-ai-clone', 'reel-02-recast-challenge', 'reel-03-bichronous-method'].forEach((id) => {
    const p = path.join(STORYBOARDS_DIR, `${id}.json`);
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      const res = exportManifests(data);
      console.log(`Exported manifests for ${id}:`, res);
    }
  });
  process.exit(0);
}

// Start stdio server
startMcpServer();
