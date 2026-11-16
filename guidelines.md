# UI & ACCESSIBILITY AUDIT GUIDELINES

Before finalizing any component or page update, audit the code against this checklist:
- [ ] **Color Contrast:** Is body text (`#4A5568`) only placed on light backgrounds (`#FAFAFA`)? On `#1A3153` backgrounds, text must be `#FAFAFA` or `#A7C7E7`.
- [ ] **Badge Formatting:** Are all CEFR level tags (A1-B2, IELTS) and descriptors using `uppercase` and wide letter-spacing (`tracking-[0.15em]`)?
- [ ] **Logo & Mascot Safety:** Does the logo have a minimum width of `160px` (`min-w-[160px]`) and proper padding around it? Never distort or stretch the character image.
- [ ] **Interactive States:** Do all buttons, scenario selectors, and audio controls have clear `:hover`, `:focus-visible`, and `:active` states?
- [ ] **Responsive Layout:** Does the layout stack cleanly on mobile (`360px–390px`) without horizontal overflow (`scrollWidth <= clientWidth`)?

---

## Astryx Design System Architecture & Conventions

Our frontend integrates Meta's **Astryx Design System** with a dedicated custom theme (`astryx-teacher-ivan-theme.css`) and swizzled primitives in `client/src/design-system/astryx/`. All future agent and developer edits must follow these conventions:

### 1. CSS Custom Property Token Architecture
All styling connects to Astryx CSS variables defined in `@layer astryx-theme` and scoped via `[data-astryx-theme="teacher-ivan"]`:
- **Primary / Surface Dark:** Deep Navy `#1A3153` (`--astryx-navy-primary`, `--color-surface-dark`)
- **Accent / Interactive Primary:** Warm Amber `#E09B30` (`--color-accent`, `--color-accent-hover: #C88624`)
- **Secondary / Subtle Border & Tag Surface:** Soft Denim Blue `#A7C7E7` (`--astryx-denim-primary`, `--color-border`)
- **Body Copy / Muted Text:** Neutral Slate `#4A5568` (`--astryx-slate-body`, `--color-text-secondary`)
- **Background Light / Elevated Card Surface:** Pure Off-White `#FAFAFA` (`--color-background-surface`, `--color-background-card`)
- **Typography Tokens:** Headings & badges use `Montserrat` (`--font-family-heading`); body copy & controls use `Inter` (`--font-family-body`).

### 2. Astryx Component Primitives (`client/src/design-system/astryx/`)
- `<Button>`: Variants `primary` (Warm Amber), `secondary` (Soft Denim), `outline`, `ghost`, `danger`. Always has explicit `:focus-visible` ring in `#E09B30` and `active:scale-[0.98]`.
- `<Badge>`: Variants `info`, `success`, `warning`, `error`, `neutral`, `cefr`. CEFR badges MUST use `uppercase font-heading font-extrabold tracking-[0.15em]`.
- `<Card>`: Variants `default` (`#FAFAFA` with 1px `#A7C7E7` border), `elevated`, `dark` (`#1A3153`), `interactive`. Avoid heavy drop shadows or 3D bevels.
- `<SegmentedControl>`: Standardized selector for Tutor Persona (`Teacher Ivan` | `Emma`), CEFR Level pills, and toggles. Strictly no emojis.
- `<Dialog>`: Accessible modal with focus trapping, Escape key listener, mobile centering, and max-height scrolling (`max-h-[92dvh]`).
- `<Table>` / `<TableCard>`: Table Page pattern for tabular data with horizontal scroll wrapper and responsive column widths.
- `<FormLayout>` / `<Field>` / `<TextInput>`: Accessible form controls with integrated labels, error states (`#EF4444`), and wizard progress bars.

### 3. Header & Voice Selector Discipline
- Strictly no emojis in header navigation, plan badges, or voice simulator persona selector.
- All interactive controls must be responsive down to `360px` mobile screens with zero clipping.

---

## Taste Skill (Anti-Slop Frontend Discipline & Visual Standards)

In combination with Astryx tokens and `@DESIGN.md`, all UI components must uphold the **Taste Skill** core principles to guarantee distinct, high-fidelity interfaces without AI boilerplate or generic styling:

### 1. Anti-Slop Discipline
- **Zero Generic Neon/Purple AI Gradients:** Never apply generic gradients (purple-to-cyan, neon pink glows, or AI boilerplate shines). Grounds must be either pure Deep Navy (`#1A3153`), crisp architectural Off-White (`#FAFAFA`), or restrained tonal layers.
- **Break Card Uniformity:** Eliminate endless rows of identical rounded white boxes. Vary layouts with editorial split screens, structured data rails, and asymmetric content modules.
- **Banish Crowded Text Walls:** Keep copy concise, scannable, and purposeful (60–80 words per screen maximum outside interactive transcripts and drills). Use micro-bulleted feature pills and high-contrast typography.

### 2. Typographic & Spatial Contrast
- **Monumental Display Typography:** Feature bold `Montserrat` display headings (`font-bold` / `font-black`, tight tracking `-0.02em`) balanced by generous breathing room (`py-16 md:py-24`).
- **Crisp Architectural Borders:** Use subtle, razor-sharp 1px borders (`border-[#A7C7E7]/25` or `border-[#1A3153]/15`) rather than diffuse, heavy drop shadows.
- **Strict Focal Hierarchy:** One dominant Warm Amber (`#E09B30`) primary action per viewport. Supporting actions must remain quiet (`outline`, `ghost`, or tonal denim `#A7C7E7`).

### 3. Tactile Micro-Interactions & Real Product Showcase
- **Tactile Transitions:** Interactive elements must have subtle spring / cubic-bezier hover states (`transition-all duration-200 ease-out`, slight `hover:-translate-y-0.5` or `hover:shadow-md`, and tactile `active:scale-[0.98]`).
- **Real Visual Centerpiece:** Front-and-center real product UI: the live **90s Spoken Diagnostic & AI Voice Simulator**, interactive CEFR meters, and animated rigged characters (`teacher-ivan-rig.svg` / `emma-rig.svg`).
- **Mobile Touch Targets:** All mobile touch targets must be at least `44px` tall (`min-h-[44px]`) with no horizontal scroll leakage (`scrollWidth <= clientWidth`).
