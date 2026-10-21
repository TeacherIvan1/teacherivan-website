#!/usr/bin/env node
/**
 * ==============================================================================
 * Teacher Ivan & Coach Emma - SVG Character Rig Pose Generator
 * Media Pipeline Utility: prepare-svg-poses.mjs
 * ==============================================================================
 * Takes base SVG character rigs and outputs 4 ready-to-animate SVG pose variants
 * for both Teacher Ivan and Emma:
 *   1. pose-speaking.svg     (mouth open + active #E09B30 soundwaves + pointing up at 9:16 screen)
 *   2. pose-listening.svg    (slight head tilt + #A7C7E7 listening rings + attentive smile)
 *   3. pose-recast-alert.svg (holding up a #E09B30 lightbulb/speech bubble badge for grammar recasts)
 *   4. pose-celebrate.svg    (thumbs up + #E09B30 stars for high CEFR scores)
 *
 * Strict Hex Compliance Enforced:
 *   - #1A3153 (Deep Navy)
 *   - #E09B30 (Warm Amber)
 *   - #A7C7E7 (Soft Denim Blue)
 *   - #4A5568 (Neutral Slate Grey)
 *   - #FAFAFA (Pure Off-White)
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// 100% Strict Brand Hex Codes per DESIGN.md & rules.md
export const BRAND_PALETTE = {
  NAVY: '#1A3153',
  AMBER: '#E09B30',
  DENIM: '#A7C7E7',
  SLATE: '#4A5568',
  WHITE: '#FAFAFA',
};

export const VALID_HEX_CODES = new Set(
  Object.values(BRAND_PALETTE).map((h) => h.toUpperCase())
);

/**
 * Validates that every hex color code in the SVG strictly belongs to our 5 brand colors.
 */
export function validateHexCompliance(svgContent, filename = 'SVG') {
  const matches = svgContent.match(/#([0-9a-fA-F]{3,8})\b/g) || [];
  const invalid = [];

  for (const match of matches) {
    const normalized = match.toUpperCase();
    if (!VALID_HEX_CODES.has(normalized)) {
      invalid.push(match);
    }
  }

  if (invalid.length > 0) {
    const uniqueInvalid = [...new Set(invalid)];
    throw new Error(
      `[Strict Hex Violation in ${filename}]: Found unauthorized colors: ${uniqueInvalid.join(', ')}. ` +
        `Only ${Array.from(VALID_HEX_CODES).join(', ')} are permitted.`
    );
  }

  return true;
}

/**
 * Helper to replace or toggle layer opacity in rigged SVGs.
 */
function setLayerOpacity(svg, layerId, opacity) {
  // Replace style opacity or opacity attribute on the layer
  const regex = new RegExp(`(<g[^>]*id="${layerId}"[^>]*opacity=")[^"]*(")`, 'g');
  if (regex.test(svg)) {
    return svg.replace(regex, `$1${opacity}$2`);
  }
  // If no opacity attribute exists, inject one
  const injectRegex = new RegExp(`(<g[^>]*id="${layerId}"[^>]*)>`, 'g');
  return svg.replace(injectRegex, `$1 opacity="${opacity}">`);
}

/**
 * Helper to replace a layer completely by ID.
 */
function replaceLayer(svg, layerId, newLayerXml) {
  // Match <g id="layerId" ...> ... </g> balancing root g tag
  const startTagRegex = new RegExp(`<g[^>]*id="${layerId}"[^>]*>`, 'g');
  const match = startTagRegex.exec(svg);
  if (!match) return svg;

  const startIndex = match.index;
  let depth = 0;
  let endIndex = -1;

  for (let i = startIndex; i < svg.length; i++) {
    if (svg.substring(i, i + 2) === '<g' && (svg[i + 2] === ' ' || svg[i + 2] === '>')) {
      depth++;
    } else if (svg.substring(i, i + 4) === '</g>') {
      depth--;
      if (depth === 0) {
        endIndex = i + 4;
        break;
      }
    }
  }

  if (endIndex !== -1) {
    return svg.substring(0, startIndex) + newLayerXml + svg.substring(endIndex);
  }

  return svg;
}

/**
 * 1. POSE: SPEAKING
 * Mouth open + active #E09B30 soundwaves + pointing up at top half of 9:16 vertical screen.
 */
export function generateSpeakingPose(baseSvg, characterKey) {
  const isEmma = characterKey === 'emma';
  const weaveId = isEmma ? 'chambray-weave-emma' : 'chambray-weave';
  const cuffFill = isEmma ? '#FAFAFA' : '#A7C7E7';

  let svg = baseSvg;

  // Set visemes: talk-open visible, smile/idle hidden
  svg = setLayerOpacity(svg, 'mouth-smile', '0');
  svg = setLayerOpacity(svg, 'mouth-idle', '0');
  svg = setLayerOpacity(svg, 'mouth-talk-open', '1');

  // Insert active #E09B30 soundwaves radiating from microphone
  const soundwavesXml = `
  <!-- ======================================================== -->
  <!-- ACTIVE SPEAKING SOUNDWAVES (#E09B30)                      -->
  <!-- ======================================================== -->
  <g id="speaking-soundwaves" class="rig-layer">
    <!-- Concentric audio broadcast arcs in #E09B30 -->
    <path d="M 270 278 A 20 20 0 0 1 270 306" fill="none" stroke="#E09B30" stroke-width="4" stroke-linecap="round" />
    <path d="M 282 271 A 32 32 0 0 1 282 313" fill="none" stroke="#E09B30" stroke-width="4" stroke-linecap="round" />
    <path d="M 296 264 A 46 46 0 0 1 296 320" fill="none" stroke="#E09B30" stroke-width="4" stroke-linecap="round" stroke-opacity="0.8" />
    <!-- Dynamic audio amplitude particles in #E09B30 & #FAFAFA -->
    <circle cx="255" cy="291" r="3.5" fill="#E09B30" />
    <circle cx="312" cy="274" r="3" fill="#E09B30" />
    <circle cx="316" cy="310" r="2.5" fill="#E09B30" />
    <circle cx="320" cy="292" r="3.5" fill="#E09B30" />
    <!-- Acoustic broadcast ring in aura -->
    <circle cx="300" cy="300" r="230" fill="none" stroke="#E09B30" stroke-width="2.5" stroke-dasharray="14 10" stroke-opacity="0.65" />
  </g>`;

  // Append soundwaves before </svg>
  svg = svg.replace('</svg>', `${soundwavesXml}\n</svg>`);

  // Upward Pointing Gesture Arm (Pointing toward top half of 9:16 vertical frame)
  const pointingArmXml = `
  <!-- ======================================================== -->
  <!-- 4. RIGHT ARM GESTURE: POINTING UP AT TOP HALF OF 9:16     -->
  <!-- ======================================================== -->
  <g id="right-arm-gesture" class="rig-layer" transform-origin="358 332" style="transform-origin: 358px 332px;">
    <!-- Upper Sleeve Angled Diagonally Upward -->
    <path d="M 352 322 C 366 298 380 274 396 262 L 424 284 L 378 338 Z" fill="url(#${weaveId})" stroke="#1A3153" stroke-width="5.5" stroke-linejoin="round" />
    <!-- Rolled Cuff -->
    <path d="M 390 262 L 422 282 L 416 294 L 384 274 Z" fill="${cuffFill}" stroke="#1A3153" stroke-width="5" stroke-linejoin="round" />

    <!-- Forearm Extends Upward Toward Top of Screen -->
    <path d="M 402 270 C 412 242 424 214 430 188 L 448 196 C 442 222 430 252 418 280 Z" fill="#FAFAFA" stroke="#1A3153" stroke-width="5.5" stroke-linejoin="round" />
    <path d="M 402 270 C 412 242 424 214 430 188 L 448 196 C 442 222 430 252 418 280 Z" fill="#E09B30" fill-opacity="0.28" stroke="#1A3153" stroke-width="5.5" stroke-linejoin="round" />

    <!-- Hand: Closed Fist with Index Finger Raised Pointing Up -->
    <!-- Closed Fingers Base -->
    <path d="M 426 196 C 424 206 438 214 448 206 C 454 202 452 192 446 186 Z" fill="#FAFAFA" stroke="#1A3153" stroke-width="5" stroke-linejoin="round" />
    <path d="M 426 196 C 424 206 438 214 448 206 C 454 202 452 192 446 186 Z" fill="#E09B30" fill-opacity="0.28" />

    <!-- Extended Index Finger Pointing Boldly Upward -->
    <path d="M 428 188 L 430 134 C 430 124 442 124 442 134 L 444 188 Z" fill="#FAFAFA" stroke="#1A3153" stroke-width="5" stroke-linejoin="round" />
    <path d="M 428 188 L 430 134 C 430 124 442 124 442 134 L 444 188 Z" fill="#E09B30" fill-opacity="0.28" stroke="#1A3153" stroke-width="5" stroke-linejoin="round" />
    <!-- Finger Knuckle Details -->
    <line x1="432" y1="156" x2="440" y2="156" stroke="#1A3153" stroke-width="3" stroke-linecap="round" />
    <path d="M 424 196 Q 430 204 438 202" fill="none" stroke="#1A3153" stroke-width="3.5" stroke-linecap="round" />

    <!-- Energy Spark at Fingertip (#E09B30 Focus Ping) -->
    <polygon points="436,104 439,118 453,121 439,124 436,138 433,124 419,121 433,118" fill="#E09B30" />
    <circle cx="436" cy="121" r="3" fill="#FAFAFA" />
    <circle cx="448" cy="108" r="2" fill="#E09B30" />
    <circle cx="422" cy="112" r="2" fill="#E09B30" />
  </g>`;

  svg = replaceLayer(svg, 'right-arm-gesture', pointingArmXml);

  return svg;
}

/**
 * 2. POSE: LISTENING
 * Slight head tilt (-5.5 deg) + #A7C7E7 acoustic listening rings + warm attentive smile.
 */
export function generateListeningPose(baseSvg, characterKey) {
  let svg = baseSvg;

  // Mouth: smile active, talk/idle hidden
  svg = setLayerOpacity(svg, 'mouth-smile', '1');
  svg = setLayerOpacity(svg, 'mouth-idle', '0');
  svg = setLayerOpacity(svg, 'mouth-talk-open', '0');

  // Head tilt: add slight inquisitive rotation to #head-group
  svg = svg.replace(
    `id="head-group" class="rig-layer"`,
    `id="head-group" class="rig-layer" transform="rotate(-5.5 300 310)"`
  );

  // Concentric #A7C7E7 Listening & Audio Reception Rings
  const listeningRingsXml = `
  <!-- ======================================================== -->
  <!-- ACTIVE LISTENING ACOUSTIC RINGS (#A7C7E7)                 -->
  <!-- ======================================================== -->
  <g id="listening-rings" class="rig-layer">
    <!-- Primary Headset Reception Rings (#A7C7E7) -->
    <circle cx="168" cy="254" r="28" fill="none" stroke="#A7C7E7" stroke-width="3.5" stroke-dasharray="8 6" />
    <circle cx="168" cy="254" r="46" fill="none" stroke="#A7C7E7" stroke-width="3" stroke-dasharray="10 8" stroke-opacity="0.8" />
    <circle cx="168" cy="254" r="68" fill="none" stroke="#A7C7E7" stroke-width="2.5" stroke-dasharray="12 10" stroke-opacity="0.55" />
    <circle cx="168" cy="254" r="92" fill="none" stroke="#A7C7E7" stroke-width="2" stroke-dasharray="14 12" stroke-opacity="0.3" />

    <!-- Right Ear Secondary Receiving Wave (#A7C7E7) -->
    <path d="M 426 222 A 38 38 0 0 1 426 282" fill="none" stroke="#A7C7E7" stroke-width="3" stroke-dasharray="8 6" />
    <path d="M 440 210 A 54 54 0 0 1 440 294" fill="none" stroke="#A7C7E7" stroke-width="2.5" stroke-dasharray="10 8" stroke-opacity="0.75" />
    <path d="M 456 198 A 72 72 0 0 1 456 306" fill="none" stroke="#A7C7E7" stroke-width="2" stroke-dasharray="12 10" stroke-opacity="0.45" />

    <!-- Attentive Sparkle Points in #A7C7E7 & #FAFAFA -->
    <polygon points="120,220 123,228 131,231 123,234 120,242 117,234 109,231 117,228" fill="#A7C7E7" />
    <circle cx="120" cy="231" r="2" fill="#FAFAFA" />
    <polygon points="468,248 470,254 476,256 470,258 468,264 466,258 460,256 466,254" fill="#A7C7E7" />
  </g>`;

  svg = svg.replace('</svg>', `${listeningRingsXml}\n</svg>`);

  return svg;
}

/**
 * 3. POSE: RECAST ALERT
 * Holding up a prominent #E09B30 lightbulb & speech bubble badge for pedagogical grammar recasts.
 */
export function generateRecastAlertPose(baseSvg, characterKey) {
  const isEmma = characterKey === 'emma';
  const weaveId = isEmma ? 'chambray-weave-emma' : 'chambray-weave';
  const cuffFill = isEmma ? '#FAFAFA' : '#A7C7E7';

  let svg = baseSvg;

  // Mouth: attentive smile
  svg = setLayerOpacity(svg, 'mouth-smile', '1');
  svg = setLayerOpacity(svg, 'mouth-idle', '0');
  svg = setLayerOpacity(svg, 'mouth-talk-open', '0');

  // Replace left arm with raised arm holding the #E09B30 Recast Badge
  const recastArmAndBadgeXml = `
  <!-- ======================================================== -->
  <!-- 3. LEFT ARM & PROMINENT RECAST ALERT BADGE (#E09B30)      -->
  <!-- ======================================================== -->
  <g id="left-arm-prop" class="rig-layer" transform-origin="242 332" style="transform-origin: 242px 332px;">
    <!-- Sleeve angled up to hold badge -->
    <path d="M 248 320 C 234 298 218 280 198 274 L 180 302 L 236 346 Z" fill="url(#${weaveId})" stroke="#1A3153" stroke-width="5.5" stroke-linejoin="round" />
    <!-- Rolled Cuff -->
    <path d="M 206 270 L 178 296 L 186 308 L 214 282 Z" fill="${cuffFill}" stroke="#1A3153" stroke-width="5" stroke-linejoin="round" />

    <!-- Forearm extending to badge grip -->
    <path d="M 194 286 C 180 302 168 326 160 348 L 140 338 C 148 316 162 292 176 276 Z" fill="#FAFAFA" stroke="#1A3153" stroke-width="5.5" stroke-linejoin="round" />
    <path d="M 194 286 C 180 302 168 326 160 348 L 140 338 C 148 316 162 292 176 276 Z" fill="#E09B30" fill-opacity="0.28" stroke="#1A3153" stroke-width="5.5" stroke-linejoin="round" />

    <!-- Hand Gripping Lower-Right Corner of Badge -->
    <path d="M 152 338 C 158 334 168 344 162 354 C 156 362 144 358 142 348 Z" fill="#FAFAFA" stroke="#1A3153" stroke-width="5" stroke-linejoin="round" />
    <path d="M 152 338 C 158 334 168 344 162 354 C 156 362 144 358 142 348 Z" fill="#E09B30" fill-opacity="0.28" />

    <!-- ======================================================== -->
    <!-- FLOATING PEDAGOGICAL RECAST BADGE CONTAINER (#E09B30)    -->
    <!-- ======================================================== -->
    <g transform="translate(42, 230)">
      <!-- Main Badge Card Body (#FAFAFA + #1A3153 Outline + #A7C7E7 Accents) -->
      <path d="M 12 0 L 152 0 C 160 0 166 6 166 14 L 166 114 C 166 122 160 128 152 128 L 86 128 L 70 144 L 74 128 L 12 128 C 4 128 0 122 0 114 L 0 14 C 0 6 4 0 12 0 Z"
            fill="#FAFAFA" stroke="#1A3153" stroke-width="5" stroke-linejoin="round" />

      <!-- Top Accent Banner in #1A3153 with #E09B30 Title -->
      <rect x="8" y="8" width="150" height="26" rx="6" fill="#1A3153" />
      <text x="83" y="25" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="800" font-size="11" fill="#E09B30" letter-spacing="1">RECAST ALERT</text>

      <!-- Glowing #E09B30 Lightbulb Graphic for Grammar Correction -->
      <g transform="translate(14, 42)">
        <!-- Amber Glow Aura -->
        <circle cx="22" cy="22" r="20" fill="#E09B30" fill-opacity="0.22" />
        <!-- Lightbulb Glass Dome -->
        <path d="M 22 6 C 30 6 37 13 37 21 C 37 27 33 31 31 35 L 13 35 C 11 31 7 27 7 21 C 7 13 14 6 22 6 Z"
              fill="#E09B30" stroke="#1A3153" stroke-width="3" stroke-linejoin="round" />
        <!-- Internal Filament -->
        <path d="M 18 20 L 22 13 L 26 20" fill="none" stroke="#1A3153" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Screw Base in #4A5568 -->
        <rect x="15" y="35" width="14" height="6" rx="2" fill="#4A5568" stroke="#1A3153" stroke-width="2" />
        <line x1="16" y1="38" x2="28" y2="38" stroke="#1A3153" stroke-width="1.5" />
        <!-- Radiant Light Rays in #E09B30 -->
        <line x1="22" y1="0" x2="22" y2="3.5" stroke="#E09B30" stroke-width="3" stroke-linecap="round" />
        <line x1="6" y1="10" x2="3" y2="8" stroke="#E09B30" stroke-width="3" stroke-linecap="round" />
        <line x1="38" y1="10" x2="41" y2="8" stroke="#E09B30" stroke-width="3" stroke-linecap="round" />
      </g>

      <!-- Recast Visual Prompt Cue -->
      <g transform="translate(64, 46)">
        <text x="0" y="14" font-family="Inter, sans-serif" font-size="9.5" font-weight="700" fill="#4A5568">What you said: &#x2717;</text>
        <text x="0" y="28" font-family="Inter, sans-serif" font-size="10.5" font-weight="800" fill="#1A3153">Natural English: &#x2713;</text>
        <!-- Golden Recast Arrow in #E09B30 -->
        <path d="M 68 36 L 76 44 L 92 24" fill="none" stroke="#E09B30" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      <!-- Bottom Pillar Footer in Soft Denim #A7C7E7 -->
      <rect x="8" y="96" width="150" height="24" rx="5" fill="#A7C7E7" fill-opacity="0.32" />
      <text x="83" y="112" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="700" font-size="9" fill="#1A3153">The Hybrid Method &#x2022; Instant Fix</text>
    </g>
  </g>`;

  svg = replaceLayer(svg, 'left-arm-prop', recastArmAndBadgeXml);

  return svg;
}

/**
 * 4. POSE: CELEBRATE
 * Thumbs up gesture + #E09B30 stars for high CEFR scores.
 */
export function generateCelebratePose(baseSvg, characterKey) {
  const isEmma = characterKey === 'emma';
  const weaveId = isEmma ? 'chambray-weave-emma' : 'chambray-weave';
  const cuffFill = isEmma ? '#FAFAFA' : '#A7C7E7';

  let svg = baseSvg;

  // Mouth: wide cheerful smile
  svg = setLayerOpacity(svg, 'mouth-smile', '1');
  svg = setLayerOpacity(svg, 'mouth-idle', '0');
  svg = setLayerOpacity(svg, 'mouth-talk-open', '0');

  // Replace right arm with triumphant Thumbs Up gesture
  const thumbsUpArmXml = `
  <!-- ======================================================== -->
  <!-- 4. RIGHT ARM GESTURE: TRIUMPHANT THUMBS UP (#E09B30)     -->
  <!-- ======================================================== -->
  <g id="right-arm-gesture" class="rig-layer" transform-origin="358 332" style="transform-origin: 358px 332px;">
    <!-- Upper Sleeve Raised Confidently -->
    <path d="M 352 320 C 374 308 396 312 410 326 L 396 360 L 360 348 Z" fill="url(#${weaveId})" stroke="#1A3153" stroke-width="5.5" stroke-linejoin="round" />
    <!-- Rolled Cuff -->
    <path d="M 398 316 L 418 334 L 410 346 L 390 328 Z" fill="${cuffFill}" stroke="#1A3153" stroke-width="5" stroke-linejoin="round" />

    <!-- Forearm Raised Toward Thumbs Up -->
    <path d="M 404 330 C 420 330 436 324 444 310 L 434 290 C 422 300 410 306 394 306 Z" fill="#FAFAFA" stroke="#1A3153" stroke-width="5.5" stroke-linejoin="round" />
    <path d="M 404 330 C 420 330 436 324 444 310 L 434 290 C 422 300 410 306 394 306 Z" fill="#E09B30" fill-opacity="0.28" stroke="#1A3153" stroke-width="5.5" stroke-linejoin="round" />

    <!-- Hand & Bold Upward Thumb -->
    <!-- Clenched Fist Body -->
    <path d="M 428 296 C 426 316 448 322 458 310 C 466 300 460 286 444 284 Z" fill="#FAFAFA" stroke="#1A3153" stroke-width="5.5" stroke-linejoin="round" />
    <path d="M 428 296 C 426 316 448 322 458 310 C 466 300 460 286 444 284 Z" fill="#E09B30" fill-opacity="0.28" />

    <!-- Thumb Extended Upward in #FAFAFA + #E09B30 -->
    <path d="M 436 290 L 436 250 C 436 240 448 240 448 250 L 448 290 Z" fill="#FAFAFA" stroke="#1A3153" stroke-width="5" stroke-linejoin="round" />
    <path d="M 436 290 L 436 250 C 436 240 448 240 448 250 L 448 290 Z" fill="#E09B30" fill-opacity="0.28" stroke="#1A3153" stroke-width="5" stroke-linejoin="round" />
    <!-- Thumb Knuckle Line -->
    <line x1="438" y1="266" x2="446" y2="266" stroke="#1A3153" stroke-width="3" stroke-linecap="round" />

    <!-- Thumbs Up Accent Sparks in #E09B30 -->
    <line x1="442" y1="230" x2="442" y2="236" stroke="#E09B30" stroke-width="3" stroke-linecap="round" />
    <line x1="454" y1="236" x2="449" y2="241" stroke="#E09B30" stroke-width="3" stroke-linecap="round" />
    <line x1="430" y1="236" x2="435" y2="241" stroke="#E09B30" stroke-width="3" stroke-linecap="round" />
  </g>`;

  svg = replaceLayer(svg, 'right-arm-gesture', thumbsUpArmXml);

  // Celebratory Burst of #E09B30 Stars & High-Score CEFR Ribbon
  const celebratoryStarsXml = `
  <!-- ======================================================== -->
  <!-- CELEBRATORY #E09B30 STARS & HIGH-SCORE CEFR BADGE        -->
  <!-- ======================================================== -->
  <g id="celebrate-stars" class="rig-layer">
    <!-- Star 1: Top-Right Large Sparkle (#E09B30) -->
    <g transform="translate(440, 140)">
      <polygon points="16,0 20,12 32,16 20,20 16,32 12,20 0,16 12,12" fill="#E09B30" />
      <circle cx="16" cy="16" r="3.5" fill="#FAFAFA" />
    </g>

    <!-- Star 2: Top-Left Sparkle (#E09B30) -->
    <g transform="translate(130, 160)">
      <polygon points="14,0 18,10 28,14 18,18 14,28 10,18 0,14 10,10" fill="#E09B30" />
      <circle cx="14" cy="14" r="3" fill="#FAFAFA" />
    </g>

    <!-- Star 3: Center-Top Burst (#E09B30) -->
    <g transform="translate(288, 38)">
      <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" fill="#E09B30" />
      <circle cx="12" cy="12" r="2.5" fill="#FAFAFA" />
    </g>

    <!-- Star 4: Mid-Right Sparkle (#A7C7E7) -->
    <g transform="translate(476, 260)">
      <polygon points="10,0 13,8 20,10 13,12 10,20 7,12 0,10 7,8" fill="#A7C7E7" />
    </g>

    <!-- Star 5: Mid-Left Sparkle (#A7C7E7) -->
    <g transform="translate(108, 290)">
      <polygon points="10,0 13,8 20,10 13,12 10,20 7,12 0,10 7,8" fill="#A7C7E7" />
    </g>

    <!-- High-Score CEFR Mastery Rosette / Medal (#E09B30 + #1A3153) -->
    <g transform="translate(112, 360)">
      <!-- Rosette Ribbon Tails -->
      <polygon points="26,44 14,76 28,68 42,76 36,44" fill="#E09B30" stroke="#1A3153" stroke-width="3" stroke-linejoin="round" />
      <polygon points="46,44 40,76 54,68 68,76 56,44" fill="#A7C7E7" stroke="#1A3153" stroke-width="3" stroke-linejoin="round" />
      <!-- Rosette Outer Disc in #E09B30 -->
      <circle cx="36" cy="36" r="32" fill="#E09B30" stroke="#1A3153" stroke-width="4.5" />
      <!-- Rosette Inner Disc in #FAFAFA -->
      <circle cx="36" cy="36" r="24" fill="#FAFAFA" stroke="#1A3153" stroke-width="3.5" />
      <!-- Trophy Star Icon in #E09B30 -->
      <polygon points="36,18 39,26 47,27 41,33 43,41 36,37 29,41 31,33 25,27 33,26" fill="#E09B30" stroke="#1A3153" stroke-width="1.5" />
      <!-- Score Label -->
      <text x="36" y="52" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="900" font-size="8.5" fill="#1A3153">C1 PASS</text>
    </g>
  </g>`;

  svg = svg.replace('</svg>', `${celebratoryStarsXml}\n</svg>`);

  return svg;
}

/**
 * Main generator workflow: processes base rigs and outputs the 4 poses.
 */
export async function generateAllPoses() {
  console.log('================================================================');
  console.log('Teacher Ivan & Coach Emma - SVG Character Rig Pose Generator');
  console.log('Strict Hex Palette: #1A3153, #E09B30, #A7C7E7, #4A5568, #FAFAFA');
  console.log('================================================================\n');

  // Synchronize base assets (logo.svg, teacher-ivan-rig.svg, emma.svg, emma-rig.svg)
  const sourceAssetsDirs = [
    path.join(ROOT_DIR, 'assets'),
    path.join(ROOT_DIR, 'Assets'),
  ];
  const targetAssetsDirs = [
    path.join(ROOT_DIR, 'media-pipeline/assets'),
    path.join(ROOT_DIR, 'media-pipeline/assets/characters'),
    path.join(ROOT_DIR, 'client/public/assets'),
  ];

  for (const tDir of targetAssetsDirs) {
    if (!fs.existsSync(tDir)) fs.mkdirSync(tDir, { recursive: true });
  }

  const assetsToSync = ['logo.svg', 'teacher-ivan-rig.svg', 'emma-rig.svg', 'emma.svg'];
  for (const assetName of assetsToSync) {
    let sourcePath = null;
    for (const sDir of sourceAssetsDirs) {
      const candidate = path.join(sDir, assetName);
      if (fs.existsSync(candidate)) {
        sourcePath = candidate;
        break;
      }
    }
    if (sourcePath) {
      for (const tDir of targetAssetsDirs) {
        const destPath = path.join(tDir, assetName);
        fs.copyFileSync(sourcePath, destPath);
      }
      console.log(`  ✓ Synced base asset: ${assetName}`);
    }
  }

  // Input files (media-pipeline or fallback to Assets)
  const ivanBaseFile = [
    path.join(ROOT_DIR, 'media-pipeline/assets/characters/teacher-ivan-rig.svg'),
    path.join(ROOT_DIR, 'Assets/teacher-ivan-rig.svg'),
    path.join(ROOT_DIR, 'assets/teacher-ivan-rig.svg'),
  ].find((p) => fs.existsSync(p));

  const emmaBaseFile = [
    path.join(ROOT_DIR, 'media-pipeline/assets/characters/emma-rig.svg'),
    path.join(ROOT_DIR, 'Assets/emma-rig.svg'),
    path.join(ROOT_DIR, 'assets/emma-rig.svg'),
    path.join(ROOT_DIR, 'assets/emma.svg'),
  ].find((p) => fs.existsSync(p));

  if (!ivanBaseFile || !emmaBaseFile) {
    throw new Error('Base character rig SVGs not found in media-pipeline or Assets!');
  }

  const ivanSvg = fs.readFileSync(ivanBaseFile, 'utf8');
  const emmaSvg = fs.readFileSync(emmaBaseFile, 'utf8');

  // Define target output directories
  const mediaCharactersDir = path.join(ROOT_DIR, 'media-pipeline/assets/characters');
  const ivanDir = path.join(mediaCharactersDir, 'ivan');
  const emmaDir = path.join(mediaCharactersDir, 'emma');

  // Also sync to client/public/assets/characters
  const clientCharactersDir = path.join(ROOT_DIR, 'client/public/assets/characters');
  const clientIvanDir = path.join(clientCharactersDir, 'ivan');
  const clientEmmaDir = path.join(clientCharactersDir, 'emma');

  const allDirs = [
    mediaCharactersDir,
    ivanDir,
    emmaDir,
    clientCharactersDir,
    clientIvanDir,
    clientEmmaDir,
  ];

  for (const dir of allDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const characters = [
    {
      key: 'ivan',
      title: 'Teacher Ivan',
      baseSvg: ivanSvg,
      folderDir: ivanDir,
      clientFolderDir: clientIvanDir,
      prefix: 'ivan',
    },
    {
      key: 'emma',
      title: 'Coach Emma',
      baseSvg: emmaSvg,
      folderDir: emmaDir,
      clientFolderDir: clientEmmaDir,
      prefix: 'emma',
    },
  ];

  const poses = [
    {
      name: 'pose-speaking.svg',
      desc: 'Mouth open + active #E09B30 soundwaves + pointing up at 9:16 screen',
      generator: generateSpeakingPose,
    },
    {
      name: 'pose-listening.svg',
      desc: 'Slight head tilt + #A7C7E7 listening rings + attentive smile',
      generator: generateListeningPose,
    },
    {
      name: 'pose-recast-alert.svg',
      desc: 'Holding up a #E09B30 lightbulb/speech bubble badge for grammar recasts',
      generator: generateRecastAlertPose,
    },
    {
      name: 'pose-celebrate.svg',
      desc: 'Thumbs up + #E09B30 stars for high CEFR scores',
      generator: generateCelebratePose,
    },
  ];

  let totalGenerated = 0;

  for (const char of characters) {
    console.log(`\nGenerating 4 Ready-to-Animate Pose Variants for: ${char.title}`);
    console.log('----------------------------------------------------------------');

    for (const pose of poses) {
      const poseSvg = pose.generator(char.baseSvg, char.key);

      // Validate strict hex compliance
      validateHexCompliance(poseSvg, `${char.title} ${pose.name}`);

      // 1. Output into character subdirectory: media-pipeline/assets/characters/{ivan|emma}/pose-*.svg
      const subpath = path.join(char.folderDir, pose.name);
      fs.writeFileSync(subpath, poseSvg, 'utf8');

      // 2. Output flat prefixed file: media-pipeline/assets/characters/{ivan|emma}-pose-*.svg
      const flatName = `${char.prefix}-${pose.name}`;
      const flatPath = path.join(mediaCharactersDir, flatName);
      fs.writeFileSync(flatPath, poseSvg, 'utf8');

      // 3. Sync to client/public/assets/characters/
      fs.writeFileSync(path.join(char.clientFolderDir, pose.name), poseSvg, 'utf8');
      fs.writeFileSync(path.join(clientCharactersDir, flatName), poseSvg, 'utf8');

      const sizeKb = (Buffer.byteLength(poseSvg, 'utf8') / 1024).toFixed(1);
      console.log(`  ✓ ${pose.name.padEnd(24)} [${sizeKb} KB] -> ${pose.desc}`);
      totalGenerated++;
    }
  }

  console.log('\n================================================================');
  console.log(`Successfully generated and verified ${totalGenerated} pose SVGs!`);
  console.log('All files strictly comply with the 5 brand colors:');
  console.log(`  #1A3153, #E09B30, #A7C7E7, #4A5568, #FAFAFA`);
  console.log('================================================================\n');
}

// Run CLI when invoked directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await generateAllPoses();
  } catch (err) {
    console.error('\n[ERROR in prepare-svg-poses.mjs]:', err.message);
    process.exit(1);
  }
}
