import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 1. Standalone Icon Mark (256x256)
const logoIconMarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%" role="img" aria-label="Teacher Ivan - Bicronic Resonance Monogram">
  <defs>
    <linearGradient id="ti-amber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0AB3D" />
      <stop offset="100%" stop-color="#E09B30" />
    </linearGradient>
    <linearGradient id="ti-slab-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E3960" />
      <stop offset="100%" stop-color="#142642" />
    </linearGradient>
  </defs>

  <!-- 1. Tactile 3D Studio Slab Base (Center: 128, 128) -->
  <g id="logo-bg-slab">
    <!-- Midnight 3D Bevel Lip -->
    <rect x="20" y="28" width="216" height="216" rx="48" fill="#091326" />
    <!-- Navy Studio Surface Face -->
    <rect x="20" y="20" width="216" height="216" rx="48" fill="url(#ti-slab-grad)" stroke="#A7C7E7" stroke-width="2" stroke-opacity="0.35" />
    <!-- Top Edge Specular Sheen -->
    <path d="M 64 22 L 192 22" stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.35" />
  </g>

  <!-- 2. Primary Geometry: Structural T Pillar (Pivot: 96, 128) -->
  <g id="logo-primary-mark">
    <!-- T Crossbar -->
    <rect x="52" y="52" width="88" height="24" rx="6" fill="#FAFAFA" />
    <!-- T Vertical Stem -->
    <rect x="84" y="76" width="24" height="124" rx="6" fill="#FAFAFA" />
  </g>

  <!-- 3. Acoustic Frequency Bridge (The Bicronic Link) (Pivot: 128, 138) -->
  <g id="logo-acoustic-bridge">
    <line x1="108" y1="116" x2="148" y2="116" stroke="#E09B30" stroke-width="7" stroke-linecap="round" />
    <line x1="108" y1="138" x2="148" y2="138" stroke="#A7C7E7" stroke-width="7" stroke-linecap="round" />
    <line x1="108" y1="160" x2="148" y2="160" stroke="#E09B30" stroke-width="7" stroke-linecap="round" />
  </g>

  <!-- 4. Resonant I Pillar & Acoustic Crown Spark (Pivot: 160, 128) -->
  <g id="logo-amber-accent">
    <!-- I Vertical Stem -->
    <rect x="148" y="76" width="24" height="124" rx="6" fill="url(#ti-amber-grad)" />
    <!-- I Floating Resonant Crown Dot -->
    <circle cx="160" cy="56" r="10" fill="#E09B30" />
    <!-- Ambient Acoustic Harmonic Ring -->
    <circle cx="160" cy="56" r="17" fill="none" stroke="#E09B30" stroke-width="2" stroke-dasharray="4 3" stroke-opacity="0.75" />
  </g>
</svg>`;

// 2. Primary Horizontal Dark (800x200)
const logoPrimaryDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="100%" height="100%" role="img" aria-label="Teacher Ivan - English Classes (Dark Lockup)">
  <defs>
    <linearGradient id="ti-amber-h-dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0AB3D" />
      <stop offset="100%" stop-color="#E09B30" />
    </linearGradient>
    <linearGradient id="ti-slab-h-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E3960" />
      <stop offset="100%" stop-color="#142642" />
    </linearGradient>
  </defs>

  <!-- 1. Icon Mark Scaled (160x160 at x=20, y=20) -->
  <g id="logo-primary-mark" transform="translate(20, 20) scale(0.625)">
    <g id="logo-bg-slab">
      <rect x="20" y="28" width="216" height="216" rx="48" fill="#091326" />
      <rect x="20" y="20" width="216" height="216" rx="48" fill="url(#ti-slab-h-dark)" stroke="#A7C7E7" stroke-width="3" stroke-opacity="0.35" />
      <path d="M 64 22 L 192 22" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-opacity="0.4" />
    </g>
    <!-- T Pillar -->
    <g id="mark-t-pillar">
      <rect x="52" y="52" width="88" height="24" rx="6" fill="#FAFAFA" />
      <rect x="84" y="76" width="24" height="124" rx="6" fill="#FAFAFA" />
    </g>
    <!-- Acoustic Bridge -->
    <g id="mark-bridge">
      <line x1="108" y1="116" x2="148" y2="116" stroke="#E09B30" stroke-width="7" stroke-linecap="round" />
      <line x1="108" y1="138" x2="148" y2="138" stroke="#A7C7E7" stroke-width="7" stroke-linecap="round" />
      <line x1="108" y1="160" x2="148" y2="160" stroke="#E09B30" stroke-width="7" stroke-linecap="round" />
    </g>
    <!-- Resonant I Pillar & Crown -->
    <g id="logo-amber-accent">
      <rect x="148" y="76" width="24" height="124" rx="6" fill="url(#ti-amber-h-dark)" />
      <circle cx="160" cy="56" r="10" fill="#E09B30" />
      <circle cx="160" cy="56" r="17" fill="none" stroke="#E09B30" stroke-width="2.5" stroke-dasharray="4 3" />
    </g>
  </g>

  <!-- 2. Wordmark Section -->
  <g id="wordmark-container" transform="translate(196, 42)">
    <!-- TEACHER -->
    <g id="logo-wordmark-teacher">
      <text x="0" y="68" font-family="'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="64" letter-spacing="-0.03em" fill="#FAFAFA">TEACHER</text>
    </g>
    <!-- IVAN with Warm Amber I Accent -->
    <g id="logo-wordmark-ivan">
      <text x="352" y="68" font-family="'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="64" letter-spacing="-0.03em">
        <tspan fill="#E09B30">I</tspan><tspan fill="#FAFAFA">VAN</tspan>
      </text>
    </g>
    <!-- Descriptor Badge -->
    <g id="logo-descriptor" transform="translate(2, 94)">
      <rect x="0" y="0" width="310" height="32" rx="8" fill="#12223a" stroke="#A7C7E7" stroke-width="1.5" stroke-opacity="0.35" />
      <circle cx="16" cy="16" r="4.5" fill="#10B981" />
      <text x="30" y="21.5" font-family="'Montserrat', 'Inter', sans-serif" font-weight="800" font-size="13" letter-spacing="0.22em" fill="#A7C7E7">ENGLISH FLUENCY LAB</text>
    </g>
  </g>
</svg>`;

// 3. Primary Horizontal Light (800x200)
const logoPrimaryLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="100%" height="100%" role="img" aria-label="Teacher Ivan - English Classes (Light Lockup)">
  <defs>
    <linearGradient id="ti-amber-h-light" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0AB3D" />
      <stop offset="100%" stop-color="#E09B30" />
    </linearGradient>
  </defs>

  <!-- 1. Icon Mark Scaled (160x160 at x=20, y=20) -->
  <g id="logo-primary-mark" transform="translate(20, 20) scale(0.625)">
    <g id="logo-bg-slab">
      <rect x="20" y="28" width="216" height="216" rx="48" fill="#CBD5E1" />
      <rect x="20" y="20" width="216" height="216" rx="48" fill="#1A3153" stroke="#A7C7E7" stroke-width="3" stroke-opacity="0.4" />
      <path d="M 64 22 L 192 22" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-opacity="0.4" />
    </g>
    <!-- T Pillar -->
    <g id="mark-t-pillar">
      <rect x="52" y="52" width="88" height="24" rx="6" fill="#FAFAFA" />
      <rect x="84" y="76" width="24" height="124" rx="6" fill="#FAFAFA" />
    </g>
    <!-- Acoustic Bridge -->
    <g id="mark-bridge">
      <line x1="108" y1="116" x2="148" y2="116" stroke="#E09B30" stroke-width="7" stroke-linecap="round" />
      <line x1="108" y1="138" x2="148" y2="138" stroke="#A7C7E7" stroke-width="7" stroke-linecap="round" />
      <line x1="108" y1="160" x2="148" y2="160" stroke="#E09B30" stroke-width="7" stroke-linecap="round" />
    </g>
    <!-- Resonant I Pillar & Crown -->
    <g id="logo-amber-accent">
      <rect x="148" y="76" width="24" height="124" rx="6" fill="url(#ti-amber-h-light)" />
      <circle cx="160" cy="56" r="10" fill="#E09B30" />
      <circle cx="160" cy="56" r="17" fill="none" stroke="#E09B30" stroke-width="2.5" stroke-dasharray="4 3" />
    </g>
  </g>

  <!-- 2. Wordmark Section -->
  <g id="wordmark-container" transform="translate(196, 42)">
    <!-- TEACHER -->
    <g id="logo-wordmark-teacher">
      <text x="0" y="68" font-family="'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="64" letter-spacing="-0.03em" fill="#1A3153">TEACHER</text>
    </g>
    <!-- IVAN with Warm Amber I Accent -->
    <g id="logo-wordmark-ivan">
      <text x="352" y="68" font-family="'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="64" letter-spacing="-0.03em">
        <tspan fill="#E09B30">I</tspan><tspan fill="#1A3153">VAN</tspan>
      </text>
    </g>
    <!-- Descriptor Badge -->
    <g id="logo-descriptor" transform="translate(2, 94)">
      <rect x="0" y="0" width="310" height="32" rx="8" fill="#EBF2FA" stroke="#1A3153" stroke-width="1.5" stroke-opacity="0.2" />
      <circle cx="16" cy="16" r="4.5" fill="#059669" />
      <text x="30" y="21.5" font-family="'Montserrat', 'Inter', sans-serif" font-weight="800" font-size="13" letter-spacing="0.22em" fill="#1A3153">ENGLISH FLUENCY LAB</text>
    </g>
  </g>
</svg>`;

// 4. Monochrome Print (500x500)
const logoPrintMonochromeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" role="img" aria-label="Teacher Ivan - Print Monochrome">
  <!-- Square Base Lip & Slab in 100% Single-Ink Deep Navy #1A3153 -->
  <g id="logo-bg-slab">
    <rect x="50" y="60" width="400" height="400" rx="80" fill="#091326" />
    <rect x="50" y="44" width="400" height="400" rx="80" fill="#1A3153" stroke="#1A3153" stroke-width="4" />
  </g>

  <!-- Structural T Pillar in Crisp Paper White -->
  <g id="logo-primary-mark">
    <rect x="108" y="104" width="160" height="44" rx="10" fill="#FFFFFF" />
    <rect x="166" y="148" width="44" height="226" rx="10" fill="#FFFFFF" />
  </g>

  <!-- Acoustic Frequency Bridge -->
  <g id="logo-acoustic-bridge">
    <line x1="210" y1="218" x2="284" y2="218" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-dasharray="1 1" />
    <line x1="210" y1="258" x2="284" y2="258" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" />
    <line x1="210" y1="298" x2="284" y2="298" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-dasharray="1 1" />
  </g>

  <!-- Resonant I Pillar & Solid Crown Dot in High-Contrast White -->
  <g id="logo-amber-accent">
    <rect x="284" y="148" width="44" height="226" rx="10" fill="#FFFFFF" />
    <circle cx="306" cy="112" r="18" fill="#FFFFFF" />
    <circle cx="306" cy="112" r="30" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="8 6" />
  </g>
</svg>`;

// Standardized target directory list
const destinations = [
  // 1. Root assets/
  { dir: path.resolve(projectRoot, 'assets'), isRoot: true },
  // 2. Media Pipeline
  { dir: path.resolve(projectRoot, 'media-pipeline', 'public', 'assets', 'branding') },
  { dir: path.resolve(projectRoot, 'media-pipeline', 'public', 'assets') },
  { dir: path.resolve(projectRoot, 'media-pipeline', 'public') },
  { dir: path.resolve(projectRoot, 'media-pipeline', 'assets', 'branding') },
  { dir: path.resolve(projectRoot, 'media-pipeline', 'output', 'branding') },
  // 3. Client
  { dir: path.resolve(projectRoot, 'client', 'public', 'assets', 'branding') },
  { dir: path.resolve(projectRoot, 'client', 'public', 'assets') },
  { dir: path.resolve(projectRoot, 'client', 'public') },
];

for (const dest of destinations) {
  if (!fs.existsSync(dest.dir)) {
    fs.mkdirSync(dest.dir, { recursive: true });
  }

  // Write the 4 standardized variants
  fs.writeFileSync(path.join(dest.dir, 'logo-icon-mark.svg'), logoIconMarkSvg, 'utf8');
  fs.writeFileSync(path.join(dest.dir, 'logo-primary-dark.svg'), logoPrimaryDarkSvg, 'utf8');
  fs.writeFileSync(path.join(dest.dir, 'logo-primary-light.svg'), logoPrimaryLightSvg, 'utf8');
  fs.writeFileSync(path.join(dest.dir, 'logo-print-monochrome.svg'), logoPrintMonochromeSvg, 'utf8');

  // Also write aliases for direct imports: logo.svg and favicon.svg
  fs.writeFileSync(path.join(dest.dir, 'logo.svg'), logoIconMarkSvg, 'utf8');
  fs.writeFileSync(path.join(dest.dir, 'favicon.svg'), logoIconMarkSvg, 'utf8');
  fs.writeFileSync(path.join(dest.dir, 'logo-horizontal-dark.svg'), logoPrimaryDarkSvg, 'utf8');
  fs.writeFileSync(path.join(dest.dir, 'logo-horizontal-light.svg'), logoPrimaryLightSvg, 'utf8');
  fs.writeFileSync(path.join(dest.dir, 'logo-print.svg'), logoPrintMonochromeSvg, 'utf8');
  
  console.log(`[Deploy] Wrote master SVGs to: ${dest.dir}`);
}

console.log('[Deploy] All master SVGs audited, normalized, and deployed successfully!');
