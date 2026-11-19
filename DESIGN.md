# DESIGN.md — Teacher Ivan (`teacherivan.com`)

**Version:** 3.0 (Production Design & Motion System)  
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + GSAP (`ScrollTrigger`) + Lenis + Three.js / Remotion + Rigged SVG (`teacher-ivan-rig.svg`, `emma-rig.svg`)  
**Deployment:** GitHub Pages (`https://teacherivan.com`) + Render Backend (`https://teacherivan-website.onrender.com`)  
**Languages:** 100% Bilingual (`ES` primary LATAM/Bolivia | `EN` global)  
**Official Contact:** WhatsApp `+591 72878330` (`https://wa.me/59172878330`)  

---

## 1. Visual Theme, Philosophy & Tension Resolution

### 1.1 Brand Essence & Copy Tone
- **Identity:** Institutional linguistic rigor meets modern, real-time spoken fluency technology. Teacher Ivan is not a passive grammar academy and not a generic gamified flashcard app—it is a **Bichronous Coaching Ecosystem** combining **24/7 Asynchronous Voice Immersion** with **High-Frequency 1-on-1 Live Human Coaching** (`>75%` Student Talking Time).
- **Copy Voice:** Honest, direct, warm, and concrete. Lead with real numbers (`>75%` habla activa, `90s` diagnóstico oral, `10 min/día`, `300 / 580 / 850 BOB`, `14:00–20:00 BOT`). Zero hype, zero walls of text, and **zero system emojis** anywhere in the UI chrome or marketing surfaces.
- **Student-Facing Terminology Rule:** Never expose internal engineering jargon (`LLM`, `VAD`, `WebSocket`, `PCM`, `Speech-to-Text`, `AudioWorklet`) in student-facing UI copy. Always use crisp EdTech language: *24/7 Voice Lab / Laboratorio de Voz 24/7*, *Interactive Conversation Tutor / Tutor Conversacional*, *Live Native Recasting / Recasting Nativo en Vivo*, and *Live Transcription / Transcripción en Vivo*.

### 1.2 Harmonizing Architectural Precision, 3D Glassmorphism & Rigged Mascots
To prevent visual fragmentation across flat grids, 3D slabs, and expressive vector characters, enforce this strict **3-Layer Depth Hierarchy**:
1. **Layer 0 — Architectural Skeleton (Flat & Exact):** Page sections, pricing matrices, navigation bars, and tables are strictly flat and structured by `1px` architectural hairlines (`--rule-light` / `--rule-dark`), clean alternating surfaces (`#FAFAFA` Daylight vs. `#1A3153` / `#091326` Deep Navy), and generous whitespace.
2. **Layer 1 — Focal 3D / Glassmorphic Product Slabs (1 Hero Per Viewport):** Only the centerpiece interactive artifact in each chapter—the **AI Voice Waveform Slab**, the **Pop-Out Quick Recast / CEFR Proof Card**, the **Flagship Pro Pricing Card**, and primary `.btn-3d-amber` actions—receives tactile 3D elevation (physical `#091326` / `#9A6515` bottom bevels, `backdrop-filter` glass sheen, and multi-stage floating shadows with a `1px` specular top inset).
3. **Layer 2 — Grounded Rigged Vector Mascots (`teacher-ivan-rig.svg`, `emma-rig.svg`):** Characters are always anchored to a physical surface (staged inside the lit Hero Waveform Slab, nested inside the Voice Lab console, or docked into the Corner Coach Widget). They share the scene's `#E09B30` Warm Amber rim glow and never float aimlessly over blank space.

---

## 2. Color Tokens, Surface Hierarchy & WCAG Contrast Matrix

### 2.1 Canonical CSS Custom Properties (`client/src/index.css`)

```css
:root {
  /* === Core Brand Anchors === */
  --navy-primary:      #1A3153; /* RGB: 26, 49, 83   | Primary dark canvas, light-mode display ink */
  --navy-elevated:     #1E3A5F; /* RGB: 30, 58, 95   | Elevated dark glass card surface */
  --navy-surface:      #132642; /* RGB: 19, 38, 66   | Deep console well & nested dark panels */
  --navy-midnight:     #091326; /* RGB: 9, 19, 38    | Deepest studio edge & 3D slab bottom bevel */

  --amber-accent:      #E09B30; /* RGB: 224, 155, 48 | Primary CTA fill, active voice waves, key highlights */
  --amber-hover:       #ECAA41; /* RGB: 236, 170, 65 | Hover state for primary 3D amber buttons */
  --amber-bevel:       #9A6515; /* RGB: 154, 101, 21 | 3D button bottom lip & accessible amber text on light */
  --amber-glow:        rgba(224, 155, 48, 0.28);

  --denim-soft:        #A7C7E7; /* RGB: 167, 199, 231| Secondary dark-mode text, 1px borders, CEFR tags */
  --denim-tint:        rgba(167, 199, 231, 0.14);

  --slate-body:        #4A5568; /* RGB: 74, 85, 104  | Body paragraphs & muted captions on light surfaces */
  --slate-muted:       #64748B; /* RGB: 100, 116, 139| Secondary metadata on light surfaces */

  --paper-white:       #FAFAFA; /* RGB: 250, 250, 250| Primary light canvas & dark-mode primary ink */
  --paper-elevated:    #FFFFFF; /* RGB: 255, 255, 255| Elevated light cards */
  --paper-sunken:      #EEF3F8; /* RGB: 238, 243, 248| Sunken chips, inactive pills, light code/input wells */

  /* === Semantic Feedback Tokens === */
  --status-live:       #10B981; /* RGB: 16, 185, 129 | Active microphone / connected WebSocket / verified */
  --status-error:      #DC2626; /* RGB: 220, 38, 38  | Recast original error strikethrough on light */
  --status-error-dark: #FCA5A5; /* RGB: 252, 165, 165| Recast original error text on dark navy */

  /* === Architectural 1px Hairlines & Glassmorphic Borders === */
  --rule-light:        rgba(26, 49, 83, 0.12);
  --rule-dark:         rgba(167, 199, 231, 0.22);
  --glass-light-bg:    rgba(250, 250, 250, 0.72);
  --glass-dark-bg:     rgba(26, 49, 83, 0.68);
  --glass-slab-bg:     linear-gradient(145deg, rgba(30, 58, 95, 0.88) 0%, rgba(19, 38, 66, 0.94) 100%);
  --glass-specular:    inset 0 1px 1px rgba(255, 255, 255, 0.22);

  /* === Elevation & 3D Depth Shadows === */
  --shadow-float-light: 0 2px 3px rgba(26, 49, 83, 0.08),
                        0 32px 64px rgba(26, 49, 83, 0.14),
                        inset 0 1px 1px rgba(255, 255, 255, 0.85);
  --shadow-float-dark:  0 2px 4px rgba(9, 19, 38, 0.35),
                        0 40px 80px rgba(9, 19, 38, 0.58),
                        inset 0 1px 1px rgba(255, 255, 255, 0.20);
  --shadow-slab-3d:     0 12px 0 #091326,
                        0 32px 64px rgba(9, 19, 38, 0.52),
                        inset 0 1px 1px rgba(167, 199, 231, 0.28);
  --shadow-btn-amber:   0 6px 0 #9A6515,
                        0 16px 32px rgba(224, 155, 48, 0.32),
                        inset 0 1px 0 rgba(255, 255, 255, 0.35);

  /* === Surface Backgrounds === */
  --bg-daylight:       linear-gradient(180deg, #FAFAFA 0%, #F4F7FB 45%, #EEF3F8 100%);
  --bg-studio-navy:    radial-gradient(circle at 78% 18%, #24426E 0%, #1A3153 48%, #091326 100%);

  /* === Spatial & Radius Tokens === */
  --nav-height:        68px;
  --container-max:     1280px;
  --container-wide:    1440px;
  --radius-card:       20px;
  --radius-slab:       28px;
  --radius-pill:       999px;

  /* === Measured Motionmaxxing Easing Curves === */
  --ease-soft-land:    cubic-bezier(0.16, 1, 0.3, 1);   /* Decelerating arrivals & scroll reveals */
  --ease-snap-settle:  cubic-bezier(0.22, 1, 0.36, 1);  /* Tactile hover, docking & card settles */
  --ease-accel-exit:   cubic-bezier(0.7, 0, 0.84, 0);   /* Crisp departures & modal exits */
}
```

### 2.2 Tailwind CSS Extension (`client/tailwind.config.js`)

```javascript
export default {
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A3153',
          elevated: '#1E3A5F',
          surface: '#132642',
          midnight: '#091326',
        },
        amber: {
          brand: '#E09B30',
          hover: '#ECAA41',
          bevel: '#9A6515',
        },
        denim: {
          soft: '#A7C7E7',
        },
        slate: {
          body: '#4A5568',
        },
        paper: {
          DEFAULT: '#FAFAFA',
          sunken: '#EEF3F8',
        },
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        'soft-land': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'snap-settle': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'accel-exit': 'cubic-bezier(0.7, 0, 0.84, 0)',
      },
    },
  },
};
```

### 2.3 Verified WCAG AA / AAA Contrast Compliance Matrix

| Foreground Token | Background Token | Contrast Ratio | WCAG Rating | Permitted Usage |
| :--- | :--- | :--- | :--- | :--- |
| `#FAFAFA` (Off-White) | `#1A3153` (Deep Navy) | 12.51 : 1 | AAA | Primary headlines & body on dark sections |
| `#FAFAFA` (Off-White) | `#091326` (Midnight) | 17.77 : 1 | AAA | High-contrast labels inside 3D slabs |
| `#1A3153` (Deep Navy) | `#FAFAFA` (Off-White) | 12.51 : 1 | AAA | Display headings & primary ink on light sections |
| `#4A5568` (Neutral Slate) | `#FAFAFA` (Off-White) | 7.21 : 1 | AAA | Body paragraphs & UI labels on light sections |
| `#A7C7E7` (Soft Denim) | `#1A3153` (Deep Navy) | 7.44 : 1 | AAA | Secondary copy, muted two-tone phrases & tags on dark |
| `#091326` (Midnight Ink) | `#E09B30` (Warm Amber) | 7.86 : 1 | AAA | Primary CTA button text & badge labels |
| `#E09B30` (Warm Amber) | `#1A3153` (Deep Navy) | 5.54 : 1 | AA | Highlight words, waveforms & active icons on dark |
| `#9A6515` (Amber Bevel) | `#FAFAFA` (Off-White) | 4.74 : 1 | AA | Accessible warm-amber accent text on light surfaces |
| `#E09B30` (Warm Amber) | `#FAFAFA` (Off-White) | 2.26 : 1 | FAIL | FORBIDDEN for text on light surfaces. Decorative borders/fills only. |

---

## 3. Typography & Bilingual (ES | EN) Scale

### 3.1 Font Pairing & Loading Strategy
- **Display & Badges:** Montserrat (600 SemiBold, 700 Bold, 800 ExtraBold, 900 Black).
- **Body, Controls & Transcripts:** Inter (400 Regular, 500 Medium, 600 SemiBold).
- Load via `<link>` in `client/index.html` with `display=swap` and `font-variant-numeric: tabular-nums` on all timers (`01:30`), CEFR scores (`0–100`), prices (`300 / 580 / 850 BOB`), and class counters (`X / 3`, `X / 5`).

### 3.2 Fluid Type Hierarchy Table

| Role | Family & Weight | Fluid Size (clamp()) | Line Height | Tracking | Color Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display (H1)** | Montserrat 800 | `clamp(2.25rem, 4.4vw, 4rem)` (36px–64px) | 1.02 | -0.035em | Two-tone: Primary phrase `#1A3153` (light) / `#FAFAFA` (dark); concluding phrase `#4A5568` (light) / `#A7C7E7` (dark) or `#E09B30` on dark |
| **Chapter Heading (H2)** | Montserrat 700 | `clamp(1.875rem, 3.4vw, 3.25rem)` (30px–52px) | 1.06 | -0.03em | Two-tone headline rule: second clause at 65% opacity or `#A7C7E7` |
| **Card / Module Title (H3)** | Montserrat 700 | `clamp(1.25rem, 1.8vw, 1.625rem)` (20px–26px) | 1.20 | -0.02em | `#1A3153` on light, `#FAFAFA` on dark |
| **Subheading (H4)** | Inter 600 | 1.0625rem (17px) | 1.35 | -0.01em | `#1A3153` on light, `#FAFAFA` on dark |
| **Body Copy** | Inter 400 | 1rem (16px) | 1.55 | 0em | `#4A5568` on light, `rgba(250, 250, 250, 0.84)` on dark (max-width: 58ch) |
| **UI Label / Microcopy** | Inter 500 | 0.8125rem (13px) | 1.40 | 0.01em | `#64748B` on light, `#A7C7E7` on dark |
| **Eyebrow / Chapter Kicker** | Montserrat 700 | 0.6875rem (11px) | 1.0 | +0.15em | UPPERCASE, preceded by a 40px × 1px rule (`—— CH. 01 • THE BICRONIC METHOD`) |
| **CEFR & CTA Badges** | Montserrat 700 | 0.75rem (12px) | 1.0 | +0.15em | UPPERCASE (`A1`, `A2`, `B1+`, `C1 / IELTS`, `PRO • 580 BOB`) |

### 3.3 Bilingual (ES | EN) Text-Expansion & Overflow Rules
Spanish copy averages 20–25% longer than equivalent English strings. Every interactive container must enforce:
- **Nav & Pill Safety:** Navigation links, segmented tabs (Mi Ruta, Simulador IA, Recursos & Juegos, Agendar Clase), and CTA buttons use `whitespace-nowrap`, `min-height: 44px`, and fluid horizontal padding (`px-4 lg:px-5`). Never hard-code pixel widths on bilingual buttons.
- **Headline Line Budget:** Cap H1 at 8–10 words (max 3 lines on mobile 390px, max 2 lines on desktop 1440px).
- **Zero Language Leakage:** All dynamic modules—especially the 5-day Mi Ruta generated sprints, Recursos & Juegos prompts, and ReportModal dimensions—must read strictly from the active lang context (`es` or `en`). Only the Voice Lab conversation prompt remains in English (with optional Spanish scaffolding for A1–A2).

---

## 4. Spatial Grid, Daylight-to-Night Surface Rhythm & Breakpoints

### 4.1 Container & Grid Architecture
- **Outer Viewport Lock:** `html, body, #root { max-width: 100vw; overflow-x: clip; }` (use `overflow-x: clip` rather than `hidden` on body so `position: sticky` and GSAP ScrollTrigger pinning work flawlessly).
- **Desktop Content Grid (>= 1024px):** `max-width: 1280px` centered (`px-8`), 12-column grid with 24px column gutter, framed by outer vertical 1px architectural hairlines (`border-x border-[var(--rule-light)]` or `border-[var(--rule-dark)]`).
- **Tablet (768px–1023px):** 8-column grid (`px-6`), 20px gutter, disables scroll-pinning.
- **Mobile (< 768px, audited at 390×844 and 375×812):** Single-column stacked layout (`px-4`, 16px gap), minimum 44×44px touch targets, modals bounded to `w-[calc(100vw-2rem)] max-w-md max-h-[88dvh] overflow-y-auto`.

### 4.2 Section Surface Cadence (Daylight → Midnight Crossfade)
Inspired by gaiababy.app's daylight-to-night transition and pear.no's editorial chapters, the landing page shifts atmosphere intentionally across chapters:

| Chapter | Surface World | Background Token | Primary Ink | Architectural Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Stage** | Daylight Studio | `var(--bg-daylight)` (`#FAFAFA` → `#EEF3F8`) | `#1A3153` | Light 1px grid framing the Dark `#1A3153` 3D Voice Waveform Slab for dramatic focal contrast |
| **Ch. 01 — The Bicronic Method** | Transition Band | Crossfades `#EEF3F8` → `#1A3153` via ScrollTrigger `scrub: 0.6` | `#1A3153` → `#FAFAFA` | Left column pins chapter thesis; right column scrolls 1px-hairlined cards (30% vs >75% STT) |
| **Ch. 02 — 24/7 AI Voice Lab** | Midnight Immersion | `var(--bg-studio-navy)` (`#1A3153` → `#091326`) | `#FAFAFA` | Full-bleed dark console + embedded Remotion 4s micro-loops + docked Chibi Coach Widget |
| **Ch. 03 — Transparent Plans** | Crisp Architectural Light | `#FAFAFA` | `#1A3153` | 3-column 1px hairline matrix (Essential 300, Pro 580 elevated dark slab, Executive 850) |
| **Ch. 04 — Asked Before & Closing CTA** | Deep Navy Footer | `#091326` | `#FAFAFA` | Hairline Q&A accordion, PWA Android/iOS links, WhatsApp `+591 72878330`, finalized `.svg` logo |

---

## 5. Motion, GSAP (ScrollTrigger + Lenis), Rigged SVG & Remotion System

### 5.1 Core Motion Laws (Synthesized from motionmaxxing)
- **Land Decelerates, Leave Accelerates:** Every entrance uses `--ease-soft-land` (320ms–480ms); every exit uses `--ease-accel-exit` (180ms–220ms). Never use linear eases or rubbery bounce springs.
- **Nothing Grows From scale(0):** Cards, pop-outs, and modals enter by gliding 18px–28px and settling from `scale(0.96)` (or `scale(1.06)` for monumental display words) to `scale(1.0)`.
- **Hardware Acceleration & WebGL Budget:** Animate exclusively `transform`, `opacity`, and `clip-path`. Cap WebGL/Three.js canvas contexts to 1 active context maximum (Hero ambient waveform/particle backdrop on Desktop >= 1024px only).
- **Reduced Motion & Mobile Fallback (`prefers-reduced-motion: reduce` OR `window.innerWidth < 1024`):** Disable Lenis smooth-scroll hijacking, disable GSAP ScrollTrigger pinning, disable 3D cursor-tilt parallax, pause ambient `<video>` loops on their poster frame, and render all scroll-revealed elements immediately at `opacity: 1; transform: none`.

### 5.2 Desktop Scroll Choreography (GSAP ScrollTrigger + Lenis)
Initialize Lenis strictly inside a `gsap.matchMedia()` desktop query (`(min-width: 1024px) and (prefers-reduced-motion: no-preference)`):
- **Lenis + GSAP Sync:**
  - Lenis config: `duration: 1.15`, `easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`, `smoothWheel: true`.
  - Bind `lenis.on('scroll', ScrollTrigger.update)` and drive `lenis.raf(time * 1000)` inside `gsap.ticker.add(...)` with `gsap.ticker.lagSmoothing(0)`.
- **Hero → Ch. 01 → Ch. 02 Coach Docking Sequence:**
  - Trigger: `#chapter-1-bicronic` (`start: "top 65%"`, `endTrigger: "#chapter-2-voicelab"`, `end: "top 25%"`, `scrub: 0.6`).
  - Choreography: As the user scrolls out of the Hero Stage, the Chibi Teacher Ivan & Emma Duo (or compact 3D Microphone Badge) detaches smoothly from the Hero Waveform Slab, scales from 1.0 → 0.42, and glides along an arc into the fixed bottom-right Corner Coach Widget (`right: 24px, bottom: 24px`).
  - Simultaneously, the page ground crossfades from `#EEF3F8` to `#1A3153`, triggering `.nav-glass[data-theme="dark"]` so the sticky top navigation flips its ink from `#1A3153` to `#FAFAFA`.
  - As `#chapter-2-voicelab` enters the viewport (`start: "top 60%"`), the Quick Recast pop-out card scales up `1.0 → 1.08` and slides 32px left off the Voice Lab stage (`duration: 0.5s`, `ease: "power3.out"`), echoing the gaiababy.app Feed-card pop-out interaction.
- **Ch. 03 Pricing Hairline Snap:**
  - Trigger: `#chapter-3-plans` (`start: "top 72%"`, `once: true`).
  - The 1px architectural grid hairlines draw across horizontally (`scaleX: 0 → 1`, `transformOrigin: "left center"`, 0.45s), followed by the 3 tier cards (Essential, Pro, Executive) snapping upward in a 0.08s stagger (`y: 24 → 0`, `opacity: 0 → 1`, `ease: "power3.out"`).
- **Right-Edge Scroll-Tied Chapter Rail:** Fixed vertical ruler (`right: 20px`, `top: 50%`, `transform: translateY(-50%)`, Desktop >= 1280px only) displaying thin 1px architectural ticks and an active Warm Amber (`#E09B30`) pill indicator that glides down the rail and updates live: `00 HERO → 01 MODEL → 02 VOICE LAB → 03 PLANS → 04 FAQ`.

### 5.3 Rigged SVG Character Locking Rules (`teacher-ivan-rig.svg` & `emma-rig.svg`)
Both character assets share an identical `viewBox="0 0 600 600"` coordinate rig. Never apply CSS `style.transform` directly to child `<g>` nodes (which breaks `transform-box: view-box` in Chromium/Safari and causes shoulder detachment). Always render through a synchronous React `<ChibiAvatar />` component using native SVG transform attributes:

| Semantic Layer ID | Exact SVG Pivot (cx, cy) | Native SVG Attribute & Motion Spec |
| :--- | :--- | :--- |
| `#bg-aura` | (300, 320) | Subtle ambient pulse (`scale: 1.0 ↔ 1.03`, 3.5s ease-in-out) |
| `#character-body` (Parent wrapper) | (0, 0) | Wraps `#torso`, `#left-arm-prop`, `#right-arm-gesture`, `#head-group`: `transform="translate(0, ${breathY})"` (±2.5px) so joints never separate |
| `#torso` | (300, 430) | Anchored inside `#character-body` |
| `#left-arm-prop` | (242, 332) | `transform="rotate(${angle}, 242, 332)"` (clamped -6deg to +3deg) |
| `#right-arm-gesture` | (358, 332) | `transform="rotate(${angle}, 358, 332)"` (idle -2deg to -5deg; CTA wave up to -18deg) |
| `#head-group` | (300, 310) | `transform="rotate(${tilt}, 300, 310)"` (-4deg in Listening state, ±2deg subtle nod in Speaking state) |
| `#eyes-open` / `#eyes-blink` | (300, 240) | Toggle SVG `opacity="1"` / `opacity="0"` for 140ms every 3.6s |
| `#mouth-idle` / `#mouth-talk-open` / `#mouth-smile` | (300, 280) | Real-time viseme opacity swap driven by AudioWorklet RMS output (> 0.015 opens mouth at ~8Hz) |

### 5.4 Embedded Remotion Micro-Loops Specification (`client/public/media/loops/`)
Export seamless 4.0-second (240 frames at 60fps) micro-loops from `./media-pipeline/` to showcase real product mechanics inside Ch. 02 (Voice Lab) and My Path without stock video dependencies:
- **Loop Asset A — `cefr-diagnostic-loop.webm` / `.mp4` (720×540, `#1A3153` exact background match):** Animates the 90-Second CEFR Diagnostic calculating a 0–100 score across all 4 spoken dimensions (Discourse Fluency 86, Syntactic Control 82, Lexical Precision 88, Phonological Control 84) resolving to a B2+ Warm Amber badge.
- **Loop Asset B — `quick-recast-loop.webm` / `.mp4` (720×420, `#1A3153` exact background match or VP9 alpha transparency):** Shows a live waveform pulse, strikes through "I have 25 years" (`#FCA5A5`), and snaps in the `#E09B30` native recast bubble: "I am 25 years old" ✓.
- **Frontend Container & Performance Contract:**
  - Bitrate capped at <= 1.2 Mbps (<= 650 KB per 4-second file), zero audio track (`-an`), fast-start moov atom (`-movflags +faststart`).
  - Markup: `<video autoPlay muted loop playsInline preload="metadata" poster="/media/loops/<name>-poster.webp" aria-hidden="true">` with both `.webm` (VP9) and `.mp4` (H.264) `<source>` tags.
  - Attach an `IntersectionObserver` (threshold: 0.15) to call `.play()` only while visible in the viewport and `.pause()` when off-screen. Under `prefers-reduced-motion: reduce`, render only the crisp static `-poster.webp`.

---

## 6. Component Blueprints

### 6.1 Sticky Glass Navigation (`Navbar.tsx`)
- **Geometry:** `height: 68px`, `position: fixed; top: 0; inset-x: 0; z-index: 50;`.
- **Surface States:**
  - Light Chapters (`data-theme="light"`): `background: rgba(250, 250, 250, 0.72); backdrop-filter: saturate(1.4) blur(14px); border-bottom: 1px solid var(--rule-light); color: #1A3153;`.
  - Dark Chapters (`data-theme="dark"`): `background: rgba(26, 49, 83, 0.72); backdrop-filter: saturate(1.4) blur(14px); border-bottom: 1px solid var(--rule-dark); color: #FAFAFA;`.
- **Left Zone:** Finalized `logo.svg` (min-width: 160px on desktop, compact `logo-icon-mark.svg` 36×36px + single-line Teacher Ivan lockup on mobile <768px, never wrapping "Teacher" and "Ivan" onto separate lines).
- **Center Zone (Desktop >= 1024px):**
  - Unauthenticated Guests: Chapter links (Ch. 1 Method · Ch. 2 Voice Lab · Ch. 3 Plans · Ch. 4 FAQ) in 14px Inter 500.
  - Authenticated Students: Portal navigation tabs (Mi Ruta, Simulador IA, Recursos & Juegos, Agendar Clase — pure SVG icons, zero emojis), plus hidden Dev Mode tab exclusively when `user.email === 'ivan@teacherivan.com'`.
- **Right Zone:** Compact ES | EN segmented toggle (border: 1px solid currentColor/20), Active Tier Pill (when logged in: ESSENTIAL, PRO, or EXECUTIVE), and a single compact `.btn-3d-amber` CTA (Test 90s Gratis / Free 90s Test).

### 6.2 Desktop Hero Stage (`Hero3DStage.tsx`)
- **Layout:** Centered or asymmetric 12-column editorial split starting 104px below the sticky nav on `var(--bg-daylight)` (min-height: `calc(100vh - 68px)` on desktop).
- **Left Column (col-span-5 — Narrative & Action):**
  - Eyebrow: `—— MÉTODO BICRÓNICO • COACHING 1-A-1 + IA 24/7` (11px Montserrat 700, +0.15em tracking, `#9A6515`).
  - Two-Tone H1: "Hablá inglés con fluidez" (`#1A3153`) + "y sin bloqueos al conversar." (`#4A5568`) / EN: "Speak English fluently" + "without freezing in real conversations."
  - Concise Subcopy (16px Inter, max-width: 44ch): "Mentoría 1-a-1 en vivo (>75% habla activa) + Laboratorio de Voz 24/7 con Teacher Ivan y Emma."
  - Action Row (`flex gap-3`):
    - Primary `.btn-3d-amber` (height: 52px, px-7, rounded-full): "PROBAR MI NIVEL EN 90S GRATIS →"
    - Secondary Architectural Ghost Pill (height: 52px, px-6, rounded-full, border: 1px solid var(--rule-light), `#1A3153`): "WhatsApp +591 72878330"
  - Trust Microcopy (13px `#64748B`): "Diagnóstico hablado gratuito de 90 segundos • Sin tarjeta • Reporte MCER al instante."
- **Right Column (col-span-7 — Lit 3D Glassmorphic AI Voice Waveform Slab):**
  - Container: `perspective: 1400px`. Inner slab rotates subtly with cursor position (±6deg rotateX/rotateY via GSAP `quickTo`, disabled on mobile/reduced motion).
  - Slab Surface: `background: var(--glass-slab-bg)`, `border: 1.5px solid rgba(167, 199, 231, 0.30)`, `border-radius: 28px`, `box-shadow: var(--shadow-slab-3d)`, subtle radial `#E09B30` rim light in top-right corner (opacity: 0.22).
  - Inside the Slab:
    - Top Status Bar (1px solid var(--rule-dark)): Pulsing `#10B981` live dot + "VOICE LAB 24/7 • EN VIVO" + "CEFR A1 → C1" badge.
    - Center Dual Stage: Rigged `<ChibiAvatar character="ivan" />` and `<ChibiAvatar character="emma" />` flanking a real-time `#E09B30` / `#A7C7E7` animated 3D Acoustic Waveform (Canvas/Three.js, 24 frequency bars responding gently to idle breath or live mic audio).
    - Floating Pop-Out Proof Pill (`translateZ(36px)`, `box-shadow: var(--shadow-float-dark)`): Shows live recast proof ("I have 25 years" → "I am 25 years old" ✓) and `>75% HABLA ACTIVA` metric pill.

### 6.3 Docked Corner Coach Widget (`CornerCoachWidget.tsx`)
- **Behavior:** Appears smoothly via GSAP ScrollTrigger once the user scrolls past the Hero into Ch. 01 / Ch. 02 (or stays collapsed as a crisp floating pill on mobile).
- **Geometry:** `position: fixed; right: 24px; bottom: 24px; z-index: 40;`, height: 64px, border-radius: 999px, background: `rgba(19, 38, 66, 0.90)`, backdrop-filter: blur(16px), border: 1px solid `rgba(224, 155, 48, 0.45)`, box-shadow: `var(--shadow-float-dark)`.
- **Contents:** Circular 48×48px cropped animated `<ChibiAvatar character="emma" />` (with `#E09B30` live audio ring) + crisp two-line prompt ("¿Listo para tu diagnóstico?" / "Test hablado 90s") + `#E09B30` microphone launch button that jumps directly into the Ch. 02 Voice Lab console.

### 6.4 3-Tier Pricing Architecture (`PricingSection.tsx`)
- **Header Controls:** Editorial two-tone H2 ("Planes claros." / "Sin contratos ocultos.") paired with a crisp 1px-bordered BOB | USD currency pill toggle.
- **Grid Structure:** 3 equal columns on desktop (`grid-cols-1 lg:grid-cols-3`, `border: 1px solid var(--rule-light)` outer frame with internal 1px architectural hairlines), snapping into place on scroll:

| Attribute | Essential (Autonomous) | Pro (Flagship — Elevated 3D Dark Slab) | Executive (Maximum Immersion) |
| :--- | :--- | :--- | :--- |
| **Monthly Price (BOB / USD)** | 300 BOB / $45 USD | 580 BOB / $85 USD | 850 BOB / $125 USD |
| **Visual Surface** | `#FFFFFF` card, 1px `#A7C7E7` border | `#1A3153` 3D Slab, 2px solid `#E09B30`, `box-shadow: var(--shadow-slab-3d)`, `-translate-y-2` | `#FFFFFF` card, 1px `#1A3153`/25 border, `#1A3153` top accent bar |
| **Badge (+0.15em uppercase)** | AUTÓNOMO 24/7 (`#EEF3F8` / `#1A3153`) | MÁS ELEGIDO • HÍBRIDO (`#E09B30` / `#091326`) | INMERSIÓN TOTAL VIP (`#1A3153` / `#FAFAFA`) |
| **Live 1-on-1 Classes / Week** | 0 clases en vivo (100% autónomo) | 3 clases 1-a-1 / semana (1h c/u, Lun–Vie) | 5 clases 1-a-1 / semana (Diario Lun–Vie) |
| **24/7 Voice Lab (Ivan & Emma)** | Ilimitado 24/7 | Ilimitado 24/7 | Ilimitado 24/7 |
| **Custom Resource Generator** | Ilimitado a medida | Ilimitado a medida | Ilimitado + Prioridad Ejecutiva |
| **My Path (Mi Ruta) Mode** | Ruta Autónoma de 5 Días | Ruta Sincronizada (Prep + 3x Vivo + Recast) | Ruta Ejecutiva Diaria (5x Vivo + Entrevistas) |
| **Primary CTA** | Ghost Navy Outline (Elegir Essential) | Solid `.btn-3d-amber` (Empezar Plan Pro →) | Solid `#1A3153` (Aplicar a Executive) |

**Note:** All plan CTAs open a pre-filled WhatsApp message to `+591 72878330` or trigger the 2-Step Sign-Up flow, while the backend (`POST /api/bookings`) strictly enforces 0, 3, or 5 weekly 1-hour bookings across Monday–Friday (`14:00–20:00 BOT`).

### 6.5 Redesigned Student Modules (`client/src/components/portal/`)

#### A. My Path (Mi Ruta) — Adaptive Tier-Aware Progression Roadmap
- **Command Header Slab (`.slab-3d-dark`):** Displays Student Name, Target CEFR Pill (A2 → B2), Personal Objective, Active Tier Badge (ESSENTIAL 300 | PRO 580 | EXECUTIVE 850), Weekly Completion Ring (0%–100% SVG stroke in `#E09B30`), and an animated `<ChibiAvatar />` status indicator.
- **5-Node Interactive Mon–Fri Roadmap:** Connected by a crisp 1px horizontal conduit (`#A7C7E7/40`) that fills with `#E09B30` as days complete:
  - **Essential (300 BOB) & Free Users:** Displays the 5-Day Autonomous Fluency Loop (D1 Receptive Input → D2 Syntax & Collocation Drill → D3 24/7 Voice Simulation → D4 Functional Writing Pad → D5 Weekly Self-Audit & Score).
  - **Pro (580 BOB — 3x/wk) & Executive (850 BOB — 5x/wk) Users:** Dynamically merges booked 14:00–20:00 BOT live 1-on-1 slots onto the roadmap, pairing each live session with a Pre-Class 10-Min Prep Node and a Post-Class Recast Fixation Node.
- **Inline Active Stage Workspace:** Clicking any day node opens an inline `#FFFFFF` card (`1px solid var(--rule-light)`) directly below the stepper so the student completes readings, audio checks, or the 80–120 word writing pad without page jumps, finishing with a 1-click `.btn-3d-amber` button to send the structured weekly report to `+591 72878330`.
- **Embedded Remotion Loop Preview:** Displays `cefr-diagnostic-loop.webm` inside the Weekly Mastery telemetry panel.

#### B. Resources & Games (Recursos & Juegos) — Personalized Custom Studio
- **Two-Zone Studio Architecture (Zero System Emojis, Crisp 2px Custom Vector Icons):**
  - **Zone 1 — On-Demand Custom Resource Generator (`.slab-3d-dark`):**
    - Pre-populated with the student's `learningGoals.personalObjective` and CEFR target (A2, B1+, B2, C1/IELTS, or custom topic).
    - Controls: Topic input, CEFR segmented pills, Resource Format selector (Interactive Reading + Audio, Role-Play Script, Collocation & Phrasal Verb Deck, Error-Correction Worksheet), and `.btn-3d-amber` trigger (GENERATE CUSTOM RESOURCE).
    - Output Card (`#FFFFFF`, 1px `#A7C7E7` border): Interactive click-to-pronounce collocations (browser TTS), 3 comprehension checks, `localStorage` personal library persistence, and a "Print Low-Ink Worksheet" export styled with `logo-print-monochrome.svg` for legal-size (8.5" × 14") paper.
  - **Zone 2 — Skill-Gap Linked Micro-Games Studio (3-Column Hairline Grid):**
    - **Quick Recast Challenge:** Timed error-fixing cards synced to the student's real Voice Lab mistakes (`quick-recast-loop.webm` preview on idle).
    - **Collocation & Phrasal Verb Matcher:** Tactile card-pair board pulling vocabulary directly from the student's active CEFR level and generated custom resources.
    - **Sentence Structure Builder:** Tactile word-pill ordering puzzles targeting STAR interview connectors, conditionals, and tense control.
    - Live XP counter, accuracy percentage (`tabular-nums`), and instant `<ChibiAvatar />` smiling/nodding reactions on streaks.

---

## 7. Do's, Don'ts & Agent Quality Gate Checklist

### 7.1 Strict Do / Don't Guardrails
- **DO:** Alternate cleanly between `#FAFAFA` daylight surfaces and `#1A3153` / `#091326` deep navy immersion chapters.
- **DO:** Use Montserrat Bold/Black two-tone headlines, 1px architectural hairlines, `tabular-nums` for metrics, and native SVG `transform="rotate(deg, cx, cy)"` pivots on `teacher-ivan-rig.svg` and `emma-rig.svg`.
- **DO:** Keep `prefers-reduced-motion` fallbacks and mobile (<1024px) single-column performance first-class.
- **DON'T:** Never use purple, magenta, or neon cyan AI-slop gradients.
- **DON'T:** Never place `#E09B30` Warm Amber text on `#FAFAFA` white backgrounds (use `#9A6515` instead).
- **DON'T:** Never use Unicode system emojis (🎯, 🎙️, 📚, 📅, 🧠, ➡️) anywhere in the UI—always use inline SVG icons (`stroke-width="2"`).
- **DON'T:** Never pin persistent corner chrome/slide counters during media loops, and never use LLM, VAD, WebSocket, or STT in student-facing copy.
- **DON'T:** Never trigger unsolicited pop-up modals on initial page load; keep the 2-step Registration + Goal Wizard user-initiated.

### 7.2 Pre-Deployment Agent Verification Checklist
Before any PR or GitHub Pages push is declared complete, run and verify:
- [ ] `tsc --noEmit`, `npm test`, and `npm run build` pass across both client and server with 0 errors.
- [ ] Playwright Desktop (1440×900) check confirms: Sticky 68px glass nav flips light → dark cleanly across chapters, GSAP ScrollTrigger docks the Corner Coach Widget without layout jump, and 1px pricing hairlines align cleanly.
- [ ] Playwright Mobile (390×844) check confirms: `document.documentElement.scrollWidth <= window.innerWidth` (0px horizontal overflow), single-day Agendar Clase tabs (Lun–Vie) fit cleanly, and modals stay inside `w-[calc(100vw-2rem)]`.
- [ ] All `<video>` Remotion micro-loops load `.webm`/`.mp4` cleanly (<= 650 KB), pause off-screen, and honor `prefers-reduced-motion`.
- [ ] Weekly booking quotas (free: 0, essential: 0, pro: 3, executive: 5) and pricing (300 / 580 / 850 BOB) match identically across LandingPage, Agendar Clase, Dev Mode, and `server/src/`.
