# Teacher Ivan (`teacherivan.com`) — Bilingual (`ES` + `EN`) Google Search Console Gap-Finder Playbook

> **Purpose:** Turn real Google Search Console (GSC) impression data into higher click-through rates (CTR), stronger rankings, and qualified student conversions (90-second voice diagnostic signups, free accounts, and WhatsApp `+591 72878330` enrollments) across **Bolivia / LATAM (`ES`)** and **International (`EN`)** searches.

---

## Brand & Content Guardrails (Verify on Every Update)
- **Method:** *Método Bicrónico* / *Bicronic Method* — 24/7 interactive voice practice with **Teacher Ivan** & **Emma** + **Mi Ruta / My Path** (10-min daily sprints) + **Recursos & Juegos / Resources & Games** + live 1-on-1 coaching (`>75%` active student speaking time, Mon–Fri `14:00–20:00 BOT`).
- **Transparent Monthly Tiers:**
  - **Essential:** `300 BOB/mes` (`$45 USD/mo`) — `0` live classes, unlimited 24/7 Voice Lab, *My Path*, and *Resources & Games*.
  - **Pro (Flagship):** `580 BOB/mes` (`$85 USD/mo`) — `3` live 1-on-1 classes/week + unlimited 24/7 Voice Lab, *My Path*, and *Resources & Games*.
  - **Executive:** `850 BOB/mes` (`$125 USD/mo`) — `5` live 1-on-1 classes/week (Mon–Fri) + unlimited 24/7 platform + interview/IELTS/workplace rehearsals.
- **Language & Voice:** Neutral Latin American Spanish (*tuteo*: `tú`, `habla`, `prueba`, `tienes`, `puedes`, `elige` — **zero Argentine *voseo***) with 100% `EN` parity.
- **Zero Student-Facing Engineering Jargon:** Never publish `LLM`, `VAD`, `WebSocket`, `STT`, `PCM`, or raw API names in headings, copy, FAQs, or meta descriptions.

---

## Step-by-Step Operational Checklist (`ES` + `EN`)

### 1. Query Extraction & Triage (Every 2–4 Weeks)
- [ ] Open **Google Search Console → Performance → Search results** for `https://teacherivan.com/`.
- [ ] Set date range to **Last 28 days** (and compare against the previous 28 days).
- [ ] Export Queries split by **Country** (`Bolivia` + LATAM for `ES`; `United States` / `Global` for `EN`) and **Page** (`/` vs. `/?lang=en`).
- [ ] Apply the **Gap-Finder Filter**:
  - **Quick-Win CTR Gaps:** `Position 1–8`, `Impressions >= 50`, `CTR < 3.5%` → Fix `<title>`, `<meta name="description">`, and rich `FAQPage` / `Course` schema.
  - **Striking-Distance Content Gaps:** `Position 5–25`, `Impressions >= 40`, `Clicks <= 5` → Expand/tighten an on-page landing section or FAQ with an **answer-first** block targeting the exact phrasing.
  - **Missing-Intent Gaps:** Queries showing impressions for problems not directly answered on the page (e.g., *por qué me bloqueo al hablar inglés*, *clases de inglés en bolivianos*, *IELTS speaking practice 24/7*) → Map to a dedicated FAQ item, section subhead, or future guide route.

### 2. Intent & Language Clustering
- [ ] Tag every shortlisted query with **Language (`ES` | `EN`)**, **User Problem / Intent** (*speaking block*, *mental translation*, *daily speaking vs. passive class*, *interview/scholarship/IELTS*, *pricing/schedule*, *free diagnostic*), and **Funnel Stage** (*Awareness*, *Comparison*, *Ready-to-Book*).
- [ ] Assign **exactly one canonical target section or URL** per cluster so sections never cannibalize each other:
  - `#portal-scene1-hero-copy` — Primary value proposition (*speak without freezing*)
  - `#section-2-stories` — Outcomes (*global jobs, interviews, travel, scholarships, confidence*)
  - `#chapter-1-bicronic` — *Bicronic Method* (*24/7 Voice Lab + My Path + Resources & Games* vs. passive grammar classes)
  - `#chapter-2-voicelab` — Interactive **90-second spoken diagnostic** & 24/7 conversation practice
  - `#chapter-3-plans` — Transparent pricing (`300 / 580 / 850 BOB` | `$45 / $85 / $125 USD`) & schedule (`14:00–20:00 BOT`)
  - `#chapter-4-faq` — Direct objection-handling & high-intent long-tail Q&As (mirrored in `FAQPage` JSON-LD)

### 3. Answer-First Content & Landing Design
- [ ] Lead every targeted H2/H3 or FAQ answer with a **1–2 sentence direct answer** in plain language (zero fluff, zero technical jargon).
- [ ] Pair each answer with **concrete Teacher Ivan proof points**: `>75%` active speaking time, free 90-second CEFR diagnostic (A1–C1), instant natural corrections, 10-minute daily *My Path* habits, *Resources & Games*, and live 1-on-1 sessions (`14:00–20:00 BOT`).
- [ ] Verify **100% `ES | EN` parity** across `client/index.html`, `client/src/modules/i18n/translations.ts`, `PortalLanding.tsx`, `PricingSection.tsx`, and `Footer.tsx`.
- [ ] Verify **Neutral Spanish (*tuteo*)** and **WCAG AA contrast** (`#1A3153`, `#E09B30`, `#9A6515`, `#A7C7E7`, `#4A5568`, `#FAFAFA`) in both Light and Night modes, and confirm **0px vertical scroll** on Mobile (`< 768px`).

### 4. Conversion & Internal Linking
- [ ] Attach one **low-friction contextual CTA** to each gap cluster:
  - Awareness / Diagnostic intent → Scroll to `#chapter-2-voicelab` (*Probar Simulador Gratis 90s* / *Start Free 90s Voice Test*)
  - Method / Comparison intent → Scroll to `#chapter-1-bicronic` or `#chapter-3-plans`
  - Career / Interview / Scholarship intent → Scroll to `#section-2-stories` or open free account modal (*Mi Ruta* + *Recursos & Juegos*)
  - Ready-to-Book / Pricing / Schedule intent → Pre-filled WhatsApp (`https://wa.me/59172878330?text=...`)
- [ ] Keep internal navigation anchors (`#section-2-stories`, `#chapter-1-bicronic`, `#chapter-2-voicelab`, `#chapter-3-plans`, `#chapter-4-faq`) linked consistently from Drawer, Section cards, FAQs, and Footer.

### 5. Indexing & Iteration Cadence (2–4 Week Loop)
- [ ] Confirm `https://teacherivan.com/robots.txt` and `https://teacherivan.com/sitemap.xml` return `200 OK` after deployment.
- [ ] Validate live JSON-LD (`EducationalOrganization`, `Course`, `FAQPage`) in Google's **Rich Results Test**.
- [ ] Use **GSC URL Inspection → Request Indexing** on `https://teacherivan.com/` and `https://teacherivan.com/?lang=en` after major copy/FAQ updates.
- [ ] Log baseline vs. 28-day metrics (`Impressions`, `Clicks`, `CTR`, `Avg. Position`, GA4 `voice_tutor_launch` & `whatsapp_click` events) and promote top-performing clusters into dedicated landing guides only when query volume justifies a standalone URL.

---

## Prioritized Bilingual (`ES` + `EN`) Query Gap Matrix

| Priority | Query Cluster & Language | Search Intent | Canonical Target Section / Route | Answer-First Angle | Primary CTA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P1** | **ES:** *por qué me bloqueo al hablar inglés*, *dejar de traducir en la mente inglés*, *miedo a hablar inglés* | Problem / Speaking-block solution | `#portal-scene1-hero-copy` + `#chapter-4-faq` (FAQ #1) | Answer directly: mental translation happens when you study grammar passively without speaking reflexes; 10-min daily voice drills + instant natural corrections build automatic fluency without freezing. | `#chapter-2-voicelab` — **Probar Diagnóstico Gratis (90s)** |
| **P1** | **ES:** *clases de inglés online Bolivia precios*, *clases de inglés en bolivianos*, *profesor particular de inglés online 1 a 1* | Commercial / Price & format comparison | `#chapter-3-plans` + `#chapter-4-faq` (FAQ #4) + `Course` JSON-LD | Publish all 3 transparent monthly tiers up front (**Essential `300 BOB`**, **Pro `580 BOB` — 3 clases/sem**, **Executive `850 BOB` — 5 clases/sem**), zero contracts, Mon–Fri `14:00–20:00 BOT`. | WhatsApp `+591 72878330` (plan pre-filled) + `#chapter-3-plans` |
| **P1** | **ES:** *practicar inglés hablando gratis online*, *test de nivel de inglés hablado*, *simulador de conversación en inglés* | Try-before-buying / Diagnostic | `#chapter-2-voicelab` + `#chapter-4-faq` (FAQ #6) | Offer immediate 90-second live spoken diagnostic with Teacher Ivan & Emma right in the browser — instant CEFR level (A1–C1) + 3 natural corrections, zero credit card or signup needed. | `#flagship-simulator-section` — **Iniciar Test de 90s Gratis** |
| **P1** | **EN:** *stop freezing when speaking English*, *how to stop translating in my head English*, *speak English confidently without hesitation* | Problem / Fluency confidence | `/?lang=en` (`#portal-scene1-hero-copy` + `#chapter-4-faq` FAQ #1) | Explain how daily 10-minute spoken sprints + gentle real-time corrections rewire speaking reflexes so you think and respond directly in English instead of translating silently. | `#chapter-2-voicelab` — **Test Voice Lab Free (90s)** |
| **P2** | **ES:** *preparación entrevista de trabajo en inglés*, *inglés para becas internacionales*, *practicar IELTS speaking online* | High-stakes career / exam prep | `#section-2-stories` + `#chapter-4-faq` (FAQ #3) | Show real roleplay scenarios (Tech & Job Interviews, Scholarship Panels, IELTS Speaking), custom AI worksheets in *Recursos & Juegos*, and 3–5x/week live rehearsals with Teacher Ivan. | `#chapter-2-voicelab` + Free Account (*Mi Ruta*) |
| **P2** | **EN:** *24/7 English speaking practice*, *daily English conversation practice with tutor*, *1-on-1 English coaching plus daily practice* | Hybrid method comparison | `/?lang=en` (`#chapter-1-bicronic` + `#chapter-4-faq` FAQ #2) | Contrast passive group classes (`80%` lecturing) with the **Bicronic Method**: unlimited 24/7 voice practice with Teacher Ivan & Emma + *My Path* + live 1-on-1 classes with `>75%` student talking time. | `#chapter-3-plans` — **Compare Plans (`$45–$125 USD`)** |
| **P2** | **EN:** *English interview speaking practice*, *IELTS speaking coaching 1 on 1*, *business English fluency coach online* | High-stakes career / IELTS prep | `/?lang=en` (`#section-2-stories` + `#chapter-4-faq` FAQ #3) | Highlight tailored interview & IELTS prompts in *My Path*, printable custom practice sheets in *Resources & Games*, and daily Mon–Fri live mock rehearsals in Pro (`$85/mo`) & Executive (`$125/mo`). | `#chapter-2-voicelab` + WhatsApp `+591 72878330` |
| **P3** | **ES:** *clases de inglés conversacional horario tarde Bolivia*, *profesor de inglés Sucre online* | Local / Schedule verification | `#chapter-4-faq` (FAQ #5) + `Footer` + `EducationalOrganization` JSON-LD | Confirm live 1-on-1 classes run Mon–Fri `14:00–20:00 BOT` (UTC-4) from Sucre, Bolivia (online worldwide) with self-serve portal booking and 24/7 voice practice outside live hours. | WhatsApp `+591 72878330` |
| **P3** | **ES / EN:** *micro-hábitos para aprender inglés 10 minutos al día* / *10 minute daily English speaking habit* | Habit & retention intent | `#chapter-1-bicronic` + `#chapter-4-faq` (FAQ #7) | Detail how **Mi Ruta / My Path** (5-day structured sprints) and **Recursos & Juegos / Resources & Games** turn 10 daily minutes into automatic collocation & speaking retention (`95%` retention). | **Create Free Account / Crear Cuenta Gratis** |
