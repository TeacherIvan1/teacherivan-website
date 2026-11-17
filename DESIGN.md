# DESIGN SYSTEM: Teacher Ivan - English Classes & Gemini Voice Tutor

## 1. Brand Essence & Tone
- **Identity:** Modern, approachable, empathetic, and rigorous English teaching platform powered by real-time AI voice tutoring.
- **Visual Vibe:** Institutional trust (Deep Navy) balanced with warmth and dynamism (Warm Amber) and clean EdTech clarity (Soft Denim & Off-White).

## 2. Color Palette (Tailwind & CSS Tokens)
- **Primary (Deep Navy):** `#1A3153` (RGB: 26, 49, 83) -> Use for main headers, primary dark backgrounds, institutional sections, and H1/H2 text on light backgrounds.
- **Accent (Warm Amber):** `#E09B30` (RGB: 224, 155, 48) -> Use strictly for primary CTAs, active voice wave highlights, key badges, and the "I" accent in "Teacher Ivan".
- **Secondary (Soft Denim Blue):** `#A7C7E7` (RGB: 167, 199, 231) -> Use for secondary card backgrounds, subtle borders (1px), informational tags, and speech bubbles.
- **Body Text (Neutral Slate):** `#4A5568` (RGB: 74, 85, 104) -> Use for paragraphs, explanatory text, and subtle dividers.
- **Background (Pure / Off White):** `#FAFAFA` (RGB: 250, 250, 250) -> Primary light background for maximum readability and visual lightness.

## 3. Typography Hierarchy
- **Headings (H1, H2):** `Montserrat` or `Poppins`, Bold/Semi-Bold (700/600).
- **Subheadings (H3, H4):** `Montserrat` or `Inter`, Medium (500).
- **Body Copy:** `Inter`, Regular (400).
- **Descriptors, Badges & CTAs:** `Montserrat`, Bold, UPPERCASE with `tracking-wider` (+15% letter spacing) for CEFR levels (A1–B2, IELTS) and buttons.

## 4. Brand Identity & Primary Logo System (The Bicronic Resonance Monogram)

### 4.1 Concept & Architectural Rationale
The primary visual identity for **Teacher Ivan (`teacherivan.com`)** is the **Bicronic Resonance Monogram (Direction A)**, engineered using the `kaankiziltug/logo-design-skill` and Astryx design tokens:
- **Monolithic `T` Pillar (`#FAFAFA` Off-White):** Represents the structural foundation, institutional authority, and rigor of Teacher Ivan's live 1-on-1 human coaching.
- **Dynamic Resonant `I` Column (`#E09B30` Warm Amber):** Represents the 24/7 AI Voice Practice Lab (powered by Gemini Live), crowned with an acoustic spark dot (`r=10px`) and dashed harmonic orbital aura (`stroke-dasharray="4 3"`).
- **Triple Acoustic Frequency Bridge:** Three horizontal conduits connecting the `T` and `I` stems (`#E09B30` and `#A7C7E7` at $y=116, 138, 160$), symbolizing the bidirectional acoustic feedback loop between coach, student, and AI tutor.
- **Tactile 3D Squircle Base:** A precision rounded squircle ($216\times 216\text{px}, rx=48\text{px}$) extruded with a 3D bottom bevel lip (`#091326`), ambient studio navy face (`#1E3960` $\to$ `#142642`), Soft Denim rim stroke (`#A7C7E7`, $2\text{px}$), and top edge specular sheen.

### 4.2 Production SVG Asset Suite
All official production SVGs are compiled with 100% integer coordinates, semantic group IDs, and embedded web fonts:
- **Icon Mark / Favicon:** `/assets/logo.svg` & `/assets/favicon.svg` (256×256 viewBox, standalone squircle emblem).
- **Primary Horizontal Lockup (Dark):** `/assets/logo-horizontal-dark.svg` (800×200 viewBox, optimized for `#1A3153` headers).
- **Primary Horizontal Lockup (Light):** `/assets/logo-horizontal-light.svg` (800×200 viewBox, optimized for `#FAFAFA` light mode).
- **Stacked Emblem Lockup:** `/assets/logo-stacked.svg` (500×500 viewBox, centered mark + two-line wordmark).
- **Monochrome Print / High-Contrast:** `/assets/logo-print.svg` (500×500 viewBox, 100% single-ink `#1A3153` for 8.5"×14" worksheets).

### 4.3 Separation of Concerns: Brand Logo vs. Character Mascot
- **Institutional Brand Identity (The Monogram):** Used for browser favicons, navigation headers, legal badges, trust seals, application icons, and official stationery.
- **Character Personas (The Rigged Duo):** Teacher Ivan (`/assets/teacher-ivan.svg` / `teacher-ivan-rig.svg`) and Emma (`/assets/emma.svg` / `emma-rig.svg`) represent the interactive voice coaches inside the Live Voice Lab, diagnostic modals, and social video carousels.

### 4.4 Geometric Grid, Clear Space & Scale Limits
- **ViewBox Grid:** Standard 256×256 unit square with minimum stroke thickness $\ge 7\text{px}$ for sub-elements.
- **Clear Space:** Minimum isolation zone equal to $0.5X$ (where $X = 88\text{px}$, the width of the `T` crossbar) on all sides.
- **Scale Boundaries:**
  - Favicon / App Tab: $16\times 16\text{px}$ – $32\times 32\text{px}$ (retains high legibility).
  - Mobile Navbar: $28\times 28\text{px}$ minimum mark height.
  - Desktop Header: $40\times 40\text{px}$ – $48\times 48\text{px}$ mark height.
  - Social Profile Avatar: $960\times 960\text{px}$ circular crop within $1080\times 1080\text{px}$ canvas.
- **Strict Brand Rules:**
  - DO NOT alter the aspect ratio or skew the squircle.
  - DO NOT change the hue of the Warm Amber `#E09B30` resonant column or frequency bridge.
  - DO NOT apply external heavy drop-shadows that conceal the extruded `#091326` 3D bottom bevel lip.

## 5. Motionmaxxing Video & 3D Production Standards
- **Governing Specification:** See `./media-pipeline/VIDEO-STYLE-GUIDE.md` and `./reference-repos/motionmaxxing/SKILL.md`.
- **Zero Page Chrome (Gate G5):** Strict ban on HUD timecodes, corner watermarks, kicker ribbons, and pinned subtitle pills.
- **One Hero Object Per Frame (Gate G1 & G4):** Single lit 3D product slab, phone stage, or monumental kinetic statement ($\ge 0.55\text{ W}$, headlines $\ge 77\text{px}$, UI text $\ge 42\text{px}$).
- **Measured Eases Only:** `softLand` (12f) arrivals from oversize, `snapSettle` (10f) focal snaps, `accelExit` (8f) cuts on motion. Zero linear movement or bouncy springs.
- **Timing Discipline (Gates G2 & G3):** 100% continuous camera glide/drift (zero runs of $>3$ flat frames) and a resolved end hold strictly $\le 1.4\text{s}$.
- **Broadcast Audio Standard:** Voiceover at 100%, copyright-free music (`public/audio/library/music/`) ducked at `0.14` during speech, master mix at `-14 LUFS` to `-16 LUFS` with true peak $\le -1.5\text{ dBFS}$.

## 6. Web & Application Design Tokens (Astryx & Tailwind)
- **Token System:** CSS Custom Properties bound to `@astryxdesign/theme-neutral` and project brand tokens.
- **Surfaces:**
  - `bg-surface-primary`: `#FAFAFA` (Light) / `#0B1626` (Dark)
  - `bg-surface-elevated`: `#FFFFFF` with `box-shadow: 0 10px 30px rgba(26,49,83,0.08)` (Light) / `#12223A` with `box-shadow: 0 20px 40px rgba(0,0,0,0.4)` (Dark)
  - `border-subtle`: `1px solid rgba(167, 199, 231, 0.25)`
  - `border-accent`: `1.5px solid #E09B30`

## 7. Responsive Layout Grid & Spacing
- **Container Max-Widths:** Mobile `390px`, Tablet `768px`, Desktop `1280px`, Ultra-Wide `1440px`.
- **Spacing Scale:** Standard 8pt grid (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`).
- **Equal Margins:** Strict alignment of left and right content edges across all desktop viewports.

## 8. Anti-Slop Discipline & Component Behavior (Taste Skill 2.5)
- **No Captions Under Visuals:** Images and UI fragments explain themselves through clear labels inside the visual.
- **One Hero Entrance:** Elements enter once on initial mount (`data-enter`), followed by subtle 2px lifts and 1.02x scale on hover.
- **Direct Voice Copy:** Crisp, human-led copy without buzzwords ("potencia tu aprendizaje", "revoluciona"). Every line speaks to concrete speaking bottlenecks and solutions.

## 9. Voice & Recasting Feedback UI
- **Live Recasting Card:** Real-time speech reformulation showing student utterance with phoneme/grammar correction.
- **Visual Waveform:** Three-column or multi-bar reactive canvas rendered in `#E09B30` warm amber.
- **Bilingual Interface:** Instant seamless toggle between English (EN) and Spanish (ES) across all student workflows.

---

## 10. Social Post & 3D Carousel System (1080×1350 & 1080×1920)
*Following the 9-Section Stitch & Linear/Sanity Design Standard (Taste Skill 2.5.1 + awesome-design-md)*

### 10.1 Visual Theme & Creative Direction
- **Atmospheric Worlds:** High-contrast editorial tech aesthetic inspired by Linear and Sanity. Cinematic dark studio stages (`#0B1626` / `#1A3153` / `#091326`) alternating with lit architectural gallery surfaces (`#FAFAFA` / `#EBF2FA`).
- **Photorealistic 3D Lit Stage:** Angled 3D isometric perspective (`perspective: 1400px`, `rotateX(10deg) rotateY(-8deg)`) rendering real UI product slabs with depth lips, specular glass sheen, and realistic contact shadows.
- **Character Integration:** High-saturation Chibi vectors (`teacher-ivan-rig.svg` and `emma-rig.svg`) layered as 3D physical elements bursting through card boundaries with realistic depth occlusion.

### 10.2 Color Roles & Surface Tokens
| Role | Color Token | Hex Code | Usage in Posts |
| :--- | :--- | :--- | :--- |
| **Canvas Deep Dark** | `--canvas-dark` | `#091326` / `#0B1626` | Slides 1, 3, 4 background base with 3% SVG noise grain |
| **Studio Ambient** | `--studio-navy` | `#1A3153` / `#24426E` | Radial gradient core and primary glass slab surface |
| **Hero Accent** | `--amber-hero` | `#E09B30` | Key metrics, tilted highlight slabs, CTA tactile buttons, swipe chevron |
| **Subtle Border** | `--denim-rim` | `#A7C7E7` | 1.5px - 2px slab borders, conduit pipes, secondary data badges |
| **Architectural Light** | `--off-white` | `#FAFAFA` / `#EBF2FA` | Slide 2 full world background and primary headline typography |
| **Semantic Crimson** | `--alert-crimson`| `#EF4444` / `#FCA5A5` | Blocked time, traditional bottleneck slabs, diagnostic contrast |
| **Semantic Emerald** | `--success-green`| `#10B981` | Real-time speech passes, active sessions, approved status |

### 10.3 Typography Scale (Monumental Hierarchy)
- **Monumental Display H1:** `Montserrat Black (900)`, `76px – 92px`, `line-height: 0.95`, `letter-spacing: -0.04em`. Maximum 8–10 words total. Zero subheadline paragraphs!
- **Data Callouts & Stats:** `Montserrat Black (900)`, `54px – 72px`, uppercase.
- **Slab Primary Labels:** `Montserrat Bold (700)`, `40px – 50px`, line-height: 1.1.
- **Sub-metrics & Badges:** `Inter SemiBold (600)`, `28px – 34px`.
- **Technical Step Tags:** `JetBrains Mono / monospace (700)`, `24px – 28px`, uppercase tracking +0.15em.

### 10.4 3D Component Stylings & Physicality
- **3D Extruded Slabs:**
  - Width: `900px – 940px`, Height: `180px – 420px`, Border-radius: `24px – 28px`.
  - Tilted angles: `transform: perspective(1400px) rotateX(10deg) rotateY(-6deg)`.
  - Heavy 3D depth bevel: `box-shadow: 0 24px 0 #091326, 0 45px 90px rgba(0,0,0,0.65)` (Dark World) or `box-shadow: 0 20px 0 #CBD5E1, 0 35px 60px rgba(26,49,83,0.14)` (Light World).
  - Diagonal Specular Sheen: `linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 40%, transparent 100%)`.
- **Glowing 3D Conduit Pipes:**
  - Vertical neon connectors (`width: 4px – 6px`, `background: #E09B30`, `box-shadow: 0 0 16px rgba(224,155,48,0.6)`).
- **Tactile 3D CTA Button:**
  - `height: 140px – 150px`, `background: #E09B30`, `border-radius: 28px`.
  - Physical bottom bevel: `box-shadow: 0 14px 0 #9A6515, 0 30px 60px rgba(0,0,0,0.5)`.
  - Label: `56px Montserrat Black #091326` with 3D cursor icon.

### 10.5 Layout Density & 2-Zone Bento Hierarchy
- **Canvas Size:** `1080×1350` (4:5 Feed) and `1080×1920` (9:16 Story/Status).
- **Padding:** Exactly `64px` around all canvas borders.
- **Zero Empty Void Law (85%+ Occupancy):**
  - Gap between Top Zone and 3D Hero Stage must never exceed `48px`.
  - **Zone 1 (Top 320px):** Monumental Headline with optional angled accent slab.
  - **Zone 2 (Bottom 860px, width 952px):** 3D Hero Stage filled edge-to-edge with interactive visual architecture.
- **Strict Word Cap:** Maximum 18 words total across all cards on any given slide.

### 10.6 Depth, Perspective & Elevation Grammar
- **Single Vanishing Point:** Every slab on stage shares a coherent 3D vanishing line.
- **Z-Index Layer Occlusion:**
  - Layer 0: Radial background lighting + ambient noise.
  - Layer 1: Background 3D grid and conduit pipes.
  - Layer 2: Main tilted UI slab.
  - Layer 3: Popped highlight card (`translateZ(40px) scale(1.03)`).
  - Layer 4: Chibi characters overlapping slab borders (`z-index: 50`).
  - Layer 5: Frameless 3D swipe chevron.

### 10.7 Alternating Worlds Pattern (Swipe Retention)
- **Slide 1:** Deep Navy Studio World (`#1A3153` / `#091326` with `#E09B30` top-right rim glow).
- **Slide 2:** Lit Off-White Architectural World (`#FAFAFA` / `#EBF2FA` with `#1A3153` monumental type).
- **Slide 3:** Deep Navy Studio World (Method & Sprints comparison).
- **Slide 4 (or final slide):** Warm Amber Hero Spotlight CTA Stage (`#132642` surface + `#E09B30` aura + Chibi duo).

### 10.8 Zero Slide-Deck Chrome & Swipe Tagging
- **BANNED:** Top kicker pill ribbons (e.g. `[EL GRAN DILEMA]`), bottom horizontal divider lines, and footer page counters (`➡️ (1/4)`).
- **ALLOWED:**
  - 3D Extruded Corner Tag inside the UI slab top-left: `JetBrains Mono 24px #E09B30`.
  - Frameless 3D Swipe Chevron Pill: `56px × 56px`, `#E09B30` surface with `10px` 3D bottom bevel, fixed at `right: 28px, top: 640px` on Slides 1–3.

### 10.9 Do's and Don'ts Checklist
- **DO:**
  - Replace all generic icons with custom inline SVG vectors (`stroke-width="2.5"`).
  - Use real rigged SVG characters (`teacher-ivan-rig.svg` and `emma-rig.svg`).
  - Render dual-format output: both `.png` and `.jpg` (at quality: 95) for every slide.
  - Keep UI typography large and legible ($\ge 28\text{px}$ for badges, $\ge 40\text{px}$ for card copy).
- **DON'T:**
  - NEVER use Unicode system emojis (`🧠`, `➡️`, `🤐`, `❌`, `📊`, `👨🏫`, `🎙️`, `⏳`, `🚀`).
  - NEVER leave large empty vertical dead zones in the canvas center.
  - NEVER write long paragraphs or multi-sentence explanations on visual slides.
  - NEVER use flat low-contrast cards without 3D depth bevels or specular sheens.
