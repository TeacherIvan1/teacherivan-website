import { GoogleGenAI } from '@google/genai';
import type { LearningGoals } from './userStore.js';
export type { LearningGoals };

export interface SprintDay {
  day: 'D1' | 'D2' | 'D3' | 'D4' | 'D5';
  type: 'Receptive Input' | 'Structural Processing' | 'Async Oral Production' | 'Functional Writing Prompt' | 'Weekly Closure';
  title: string;
  titleEs?: string;
  time: string;
  description: string;
  descriptionEs?: string;
  targetCollocations: string[];
  simulatorScenarioPreset: string;
  functionalWritingPrompt?: string;
  functionalWritingPromptEs?: string;
  highlight: string;
  highlightEs?: string;
}

export interface GeneratedSprint {
  targetLevel: string;
  primaryGoal: string;
  focusSkill: string;
  personalObjective: string;
  days: SprintDay[];
  generatedBy: 'gemini' | 'deterministic-fallback';
  modelUsed?: string;
}

/**
 * Deterministic goal-based sprint generator ensuring instant, 100% reliable 
 * fallback with zero downtime or rate limit failure, with 100% bilingual EN | ES parity.
 */
export function getDeterministicSprint(goals: LearningGoals): GeneratedSprint {
  const { targetLevel, primaryGoal, focusSkill, personalObjective } = goals;

  switch (primaryGoal) {
    case 'Tech & Job Interviews':
      return {
        targetLevel,
        primaryGoal,
        focusSkill,
        personalObjective,
        generatedBy: 'deterministic-fallback',
        days: [
          {
            day: 'D1',
            type: 'Receptive Input',
            title: 'Technical Narrative & Behavioral Analysis',
            titleEs: 'Narrativa Técnica y Análisis Conductual',
            time: '10–12 min',
            description: `Listen to a Silicon Valley interview breakdown on articulating engineering trade-offs and leadership principles. Focus: ${focusSkill}.`,
            descriptionEs: `Escucha el desglose de una entrevista en Silicon Valley sobre cómo articular trade-offs de ingeniería y principios de liderazgo. Enfoque: ${focusSkill}.`,
            targetCollocations: ['architectural trade-offs', 'drive consensus', 'scalability bottleneck', 'cross-functional alignment'],
            simulatorScenarioPreset: 'Tech Lead Behavioral Interview',
            highlight: 'Identify 4 high-impact verbs used to describe incident resolution.',
            highlightEs: 'Identifica 4 verbos de alto impacto para describir resolución de incidentes.',
          },
          {
            day: 'D2',
            type: 'Structural Processing',
            title: 'STAR Method Syntax & Past-Present Perfect Framing',
            titleEs: 'Sintaxis del Método STAR y Estructuración de Tiempos',
            time: '12–15 min',
            description: 'Master seamless transitions between past narrative (Situation/Task) and quantifiable present impact (Result).',
            descriptionEs: 'Domina transiciones fluidas entre la narrativa pasada (Situación/Tarea) y el impacto presente cuantificable (Resultado).',
            targetCollocations: ['spearheaded the migration', 'subsequently reduced latency by', 'mitigated single points of failure'],
            simulatorScenarioPreset: 'System Design Justification',
            highlight: 'Formulate 3 STAR narrative responses using contrasting past tenses.',
            highlightEs: 'Formula 3 respuestas en formato STAR contrastando tiempos pasados y perfectos.',
          },
          {
            day: 'D3',
            type: 'Async Oral Production',
            title: 'Voice Sprint: "Tell Me About a System Conflict"',
            titleEs: 'Sprint de Voz: "Conflicto Técnico y Negociación"',
            time: '10–15 min',
            description: 'Record a 90-second voice note detailing how you resolved a high-stakes technical disagreement. Receive audio recasting from Teacher Ivan.',
            descriptionEs: 'Graba una nota de voz de 90 segundos explicando cómo resolviste un desacuerdo técnico crítico. Recibe corrección en audio de Teacher Ivan.',
            targetCollocations: ['differing technical perspectives', 'data-backed compromise', 'post-mortem takeaways'],
            simulatorScenarioPreset: 'Conflict & Collaboration Simulation',
            highlight: 'Submit voice note on WhatsApp; receive acoustic and phonological recast within 24h.',
            highlightEs: 'Envía tu nota de voz por WhatsApp; recibe corrección fonética en menos de 24h.',
          },
          {
            day: 'D4',
            type: 'Functional Writing Prompt',
            title: 'Executive Follow-Up & Portfolio Pitch',
            titleEs: 'Correo Ejecutivo de Seguimiento y Propuesta de Valor',
            time: '15–20 min',
            description: `Draft an executive email synthesis addressing: "${personalObjective}". Anchor your technical value proposition.`,
            descriptionEs: `Redacta un correo ejecutivo de seguimiento alineado a: "${personalObjective}". Consolida tu propuesta de valor técnica.`,
            targetCollocations: ['thank you for the thoughtful discussion', 'further elaborating on our discussion regarding', 'key technical deliverables'],
            simulatorScenarioPreset: 'Post-Interview Thank You & Value Add',
            functionalWritingPrompt: `Write a 120-word professional follow-up email to the Hiring Committee specifically addressing your personal target: "${personalObjective}". Highlight one system bottleneck you discussed, propose an actionable solution with 2 collocations, and reaffirm your enthusiasm.`,
            functionalWritingPromptEs: `Escribe un correo formal de seguimiento de 80–120 palabras dirigido al Comité de Selección, enfocado en tu meta: "${personalObjective}". Destaca un desafío técnico abordado en la entrevista, propón una solución concreta con 2 colocaciones avanzadas y reafirma tu entusiasmo.`,
            highlight: 'Teacher Ivan provides written syntactic critique with CEFR band alignment.',
            highlightEs: 'Teacher Ivan proporciona retroalimentación sintáctica con nivelación MCER.',
          },
          {
            day: 'D5',
            type: 'Weekly Closure',
            title: 'Live AI Simulation & Metric Calibration',
            titleEs: 'Simulación de Voz en Vivo y Reporte Semanal',
            time: '10–15 min',
            description: 'Engage in a live interactive voice round with Emma simulating a Principal Engineer probing your career history.',
            descriptionEs: 'Participa en una ronda de voz interactiva con Emma simulando un Principal Engineer que evalúa tu trayectoria profesional.',
            targetCollocations: ['in retrospect', 'key architectural takeaway', 'strategic long-term vision'],
            simulatorScenarioPreset: 'Executive Engineering Final Round',
            highlight: 'Complete 3 turns to generate your comprehensive CEFR progress report.',
            highlightEs: 'Completa tu sesión para generar tu reporte integral de progreso para Teacher Ivan.',
          },
        ],
      };

    case 'University Scholarship':
      return {
        targetLevel,
        primaryGoal,
        focusSkill,
        personalObjective,
        generatedBy: 'deterministic-fallback',
        days: [
          {
            day: 'D1',
            type: 'Receptive Input',
            title: 'Academic Statement & Purpose Dissection',
            titleEs: 'Ensayo Académico y Declaración de Propósito',
            time: '10–12 min',
            description: `Listen to Chevening & Fulbright alumni interviews breaking down community impact narratives. Focus on ${focusSkill}.`,
            descriptionEs: `Escucha entrevistas de becarios Chevening y Fulbright estructurando su impacto comunitario. Enfoque: ${focusSkill}.`,
            targetCollocations: ['socioeconomic catalyst', 'scholarly rigor', 'sustainable development initiative', 'transformative potential'],
            simulatorScenarioPreset: 'Scholarship Committee Screening',
            highlight: 'Extract 3 rhetorical markers used to bridge academic theory and local impact.',
            highlightEs: 'Extrae 3 marcadores retóricos que conecten teoría académica e impacto social.',
          },
          {
            day: 'D2',
            type: 'Structural Processing',
            title: 'Causal Connectors & Conditional Vision Framing',
            titleEs: 'Conectores Causales y Proyección Condicional',
            time: '12–15 min',
            description: 'Master complex conditional structures ("Had I not encountered..., I would not have pioneered...").',
            descriptionEs: 'Domina estructuras condicionales avanzadas para articular tu visión a largo plazo.',
            targetCollocations: ['integral to my long-term vision', 'fostering regional resilience', 'bridging systemic disparities'],
            simulatorScenarioPreset: 'Academic Panel Q&A',
            highlight: 'Synthesize your research purpose into 2 complex compound sentences.',
            highlightEs: 'Sintetiza tu propósito académico en 2 oraciones compuestas de alto nivel.',
          },
          {
            day: 'D3',
            type: 'Async Oral Production',
            title: 'Voice Sprint: "Why You Deserve This Fellowship"',
            titleEs: 'Sprint de Voz: "Por Qué Merezco Esta Beca"',
            time: '10–15 min',
            description: 'Record a 90-second voice pitch articulating your personal leadership trajectory and dedication to your country.',
            descriptionEs: 'Graba un discurso de 90 segundos explicando tu liderazgo y compromiso de retorno para tu país.',
            targetCollocations: ['committed to reinvesting knowledge', 'catalyzing grassroots reform', 'interdisciplinary approach'],
            simulatorScenarioPreset: 'Scholarship Interview Panel',
            highlight: 'WhatsApp submission with personalized phonetic stress recast from Teacher Ivan.',
            highlightEs: 'Envío por WhatsApp con recasting fonético personalizado de Teacher Ivan.',
          },
          {
            day: 'D4',
            type: 'Functional Writing Prompt',
            title: 'Academic Motivation Essay Excerpt',
            titleEs: 'Extracto de Ensayo de Motivación Académica',
            time: '15–20 min',
            description: `Craft an academic statement of intent directly addressing: "${personalObjective}".`,
            descriptionEs: `Redacta una declaración académica formal directamente enfocada en: "${personalObjective}".`,
            targetCollocations: ['my scholarly trajectory', 'compelling imperative', 'actionable roadmap'],
            simulatorScenarioPreset: 'Admissions & Grant Review',
            functionalWritingPrompt: `Write a 150-word scholarship motivation paragraph tailored to your goal: "${personalObjective}". Explicitly explain how this opportunity will empower you to create sustainable impact in your field, using at least 3 academic collocations.`,
            functionalWritingPromptEs: `Escribe un párrafo formal de motivación de beca de 80–120 palabras enfocado en: "${personalObjective}". Explica cómo esta oportunidad te permitirá generar un impacto sostenible, usando al menos 3 colocaciones académicas.`,
            highlight: 'Receive formal academic register critique and lexical precision feedback.',
            highlightEs: 'Recibe retroalimentación de registro académico formal y precisión léxica.',
          },
          {
            day: 'D5',
            type: 'Weekly Closure',
            title: 'Live Panel Simulation & CEFR Diagnostic',
            titleEs: 'Defensa ante Panel Académico en Vivo',
            time: '10–15 min',
            description: 'Live voice defense with Tutor Emma acting as Chair of the International Scholarship Board.',
            descriptionEs: 'Defensa oral en vivo con la tutora Emma simulando el comité de admisiones de la beca internacional.',
            targetCollocations: ['policy implementation', 'demonstrable community impact', 'scholarly contribution'],
            simulatorScenarioPreset: 'Scholarship Board Final Defense',
            highlight: 'Earn your weekly CEFR competency certificate and WPM speaking cadence score.',
            highlightEs: 'Genera tu certificación de avance semanal y reporte para Teacher Ivan.',
          },
        ],
      };

    case 'IELTS Exam Prep':
      return {
        targetLevel,
        primaryGoal,
        focusSkill,
        personalObjective,
        generatedBy: 'deterministic-fallback',
        days: [
          {
            day: 'D1',
            type: 'Receptive Input',
            title: 'Band 8+ Speaking & Academic Discourse Analysis',
            titleEs: 'Análisis de Discurso Académico para Banda 8+',
            time: '10–12 min',
            description: `Analyze authentic Part 2 & Part 3 candidate samples showcasing discourse markers and lexical flexibility. Focus: ${focusSkill}.`,
            descriptionEs: `Analiza respuestas reales de Part 2 y 3 identificando marcadores discursivos y flexibilidad léxica. Enfoque: ${focusSkill}.`,
            targetCollocations: ['far-reaching ramifications', 'predominant contributing factor', 'a contentious debate', 'markedly distinct'],
            simulatorScenarioPreset: 'IELTS Examiner Part 3 Simulation',
            highlight: 'Note how Band 8.5 speakers buy thinking time with academic discourse hedges.',
            highlightEs: 'Observa cómo los candidatos de Banda 8.5 ganan tiempo para estructurar ideas.',
          },
          {
            day: 'D2',
            type: 'Structural Processing',
            title: 'Complex Inversion & Passive Cleft Sentences',
            titleEs: 'Inversión Gramatical Compleja y Énfasis Cleft',
            time: '12–15 min',
            description: 'Practice high-band grammatical structures: "Not only does it exacerbate...", "What remains paramount is...".',
            descriptionEs: 'Practica estructuras gramaticales de banda alta: "Not only does it exacerbate...", "What remains paramount is...".',
            targetCollocations: ['seldom do we observe', 'it is widely contended that', 'under no circumstances should'],
            simulatorScenarioPreset: 'Grammatical Range Drill',
            highlight: 'Transform 3 standard sentences into inverted academic constructions.',
            highlightEs: 'Transforma 3 oraciones cotidianas en estructuras académicas invertidas.',
          },
          {
            day: 'D3',
            type: 'Async Oral Production',
            title: 'Voice Sprint: IELTS Speaking Part 2 Cue Card',
            titleEs: 'Sprint de Voz: Tarjeta Cue Card IELTS Part 2',
            time: '10–15 min',
            description: 'Speak for a full 2 minutes on an unfamiliar topic cue card with 1 minute prep time.',
            descriptionEs: 'Habla durante 2 minutos continuos sobre un tema asignado con 1 minuto de preparación previa.',
            targetCollocations: ['vividly recollect', 'pivotal turning point', 'profoundly influenced my outlook'],
            simulatorScenarioPreset: 'IELTS Part 2 Long Turn',
            highlight: 'Teacher Ivan calculates speech continuity, pause frequency, and phonological rhythm.',
            highlightEs: 'Teacher Ivan evalúa continuidad de habla, frecuencia de pausas y ritmo fonológico.',
          },
          {
            day: 'D4',
            type: 'Functional Writing Prompt',
            title: 'Task 2 Essay Introduction & Thesis Framing',
            titleEs: 'Introducción y Tesis para Ensayo IELTS Task 2',
            time: '15–20 min',
            description: `Write a compelling Band 8 intro and thesis targeting: "${personalObjective}".`,
            descriptionEs: `Escribe una introducción persuasiva y tesis de Banda 8 enfocada en: "${personalObjective}".`,
            targetCollocations: ['while it is often argued that', 'I firmly maintain that', 'merits rigorous examination'],
            simulatorScenarioPreset: 'IELTS Academic Writing Task 2',
            functionalWritingPrompt: `Write an IELTS Task 2 introduction and topic sentence (75 words) focused on your milestone: "${personalObjective}". State opposing views succinctly and present a clear, nuanced personal stance with 2 advanced cohesive devices.`,
            functionalWritingPromptEs: `Escribe la introducción y tesis para un ensayo IELTS Task 2 de 80–100 palabras enfocado en: "${personalObjective}". Plantea posturas contrarias y define una tesis matizada usando conectores formales.`,
            highlight: 'Examiner-level assessment across Coherence, Lexical Resource, and Grammatical Range.',
            highlightEs: 'Evaluación formal según criterios de Coherencia, Recursos Léxicos y Rango Gramatical.',
          },
          {
            day: 'D5',
            type: 'Weekly Closure',
            title: 'Full IELTS Speaking Part 3 Mock with Emma',
            titleEs: 'Simulacro Completo IELTS Speaking Part 3',
            time: '10–15 min',
            description: 'Abstract debate on global socioeconomic trends with rapid follow-up probing questions.',
            descriptionEs: 'Debate abstracto sobre tendencias socioeconómicas con preguntas inquisitivas en tiempo real.',
            targetCollocations: ['inextricably linked', 'speculative projection', 'substantiate this claim'],
            simulatorScenarioPreset: 'IELTS Speaking Part 3 Deep Dive',
            highlight: 'Receive full CEFR/IELTS Band estimate (e.g. 6.5, 7.0, 7.5) with target correction notes.',
            highlightEs: 'Recibe tu estimación de banda IELTS con reporte pedagógico para Teacher Ivan.',
          },
        ],
      };

    case 'Business & Executive English':
      return {
        targetLevel,
        primaryGoal,
        focusSkill,
        personalObjective,
        generatedBy: 'deterministic-fallback',
        days: [
          {
            day: 'D1',
            type: 'Receptive Input',
            title: 'Boardroom Negotiations & Diplomatic Pushback',
            titleEs: 'Negociaciones Ejecutivas y Objeción Diplomática',
            time: '10–12 min',
            description: `Deconstruct C-suite negotiations analyzing tactful disagreements and stakeholder alignment. Focus: ${focusSkill}.`,
            descriptionEs: `Analiza negociaciones a nivel directivo estudiando desacuerdos corteses y alineación de socios. Enfoque: ${focusSkill}.`,
            targetCollocations: ['strategic imperatives', 'manage stakeholder expectations', 'commercial viability', 'synergistic alignment'],
            simulatorScenarioPreset: 'Executive Board Meeting',
            highlight: 'Spot 4 modal hedges used to assert authority diplomatically.',
            highlightEs: 'Identifica 4 giros modales para ejercer autoridad con diplomacia y firmeza.',
          },
          {
            day: 'D2',
            type: 'Structural Processing',
            title: 'Diplomatic Recasting & Persuasive Framing',
            titleEs: 'Reformulación Diplomática y Enfoque Persuasivo',
            time: '12–15 min',
            description: 'Convert blunt Spanish-to-English literal expressions into polite, persuasive executive idiom.',
            descriptionEs: 'Convierte expresiones literales directas en modismos ejecutivos persuasivos y profesionales.',
            targetCollocations: ['with all due respect, looking at the data', 'I see merit in your proposal, however', 'our primary concern centers around'],
            simulatorScenarioPreset: 'Budget Negotiation & Trade-Offs',
            highlight: 'Reframe 3 direct objections into executive consensus-building statements.',
            highlightEs: 'Reformula 3 objeciones directas en propuestas de consenso corporativo.',
          },
          {
            day: 'D3',
            type: 'Async Oral Production',
            title: 'Voice Sprint: Delivering Quarterly OKRs & Pushback',
            titleEs: 'Sprint de Voz: Presentación de OKRs y Presupuesto',
            time: '10–15 min',
            description: 'Deliver a concise 2-minute oral executive briefing on project milestones and budget requests.',
            descriptionEs: 'Realiza una presentación ejecutiva concisa de 2 minutos sobre hitos de proyecto y solicitudes presupuestarias.',
            targetCollocations: ['deliverables on track', 'mitigating supply chain headwinds', 'capital allocation strategy'],
            simulatorScenarioPreset: 'Executive Status Briefing',
            highlight: 'Teacher Ivan evaluates cadence, executive poise, and vocal projection.',
            highlightEs: 'Teacher Ivan evalúa tu cadencia de voz, porte ejecutivo y proyección oral.',
          },
          {
            day: 'D4',
            type: 'Functional Writing Prompt',
            title: 'High-Stakes Client Proposal / Escalation Memo',
            titleEs: 'Memorándum Ejecutivo de Propuesta a Clientes',
            time: '15–20 min',
            description: `Draft an executive memo directly addressing your target: "${personalObjective}".`,
            descriptionEs: `Redacta un memorándum formal orientado a tu objetivo: "${personalObjective}".`,
            targetCollocations: ['action items and next steps', 'mitigating operational risk', 'mutual strategic benefit'],
            simulatorScenarioPreset: 'Executive Stakeholder Escalation',
            functionalWritingPrompt: `Write a 120-word executive briefing memo addressing your personal goal: "${personalObjective}". Outline the primary business challenge, propose a two-phase action roadmap, and define 2 key performance metrics with corporate collocations.`,
            functionalWritingPromptEs: `Redacta un memorándum ejecutivo de 80–120 palabras enfocado en: "${personalObjective}". Define el desafío comercial principal, propón un plan de acción de 2 fases y 2 métricas clave con colocaciones corporativas.`,
            highlight: 'Feedback focused on conciseness, diplomatic tone, and corporate credibility.',
            highlightEs: 'Retroalimentación centrada en concisión, tono diplomático y credibilidad ejecutiva.',
          },
          {
            day: 'D5',
            type: 'Weekly Closure',
            title: 'Live Boardroom Defense with Tutor Emma',
            titleEs: 'Defensa de Directorio en Vivo con Tutora Emma',
            time: '10–15 min',
            description: 'Present your proposal to an AI investor board that challenges your pricing assumptions.',
            descriptionEs: 'Presenta tu propuesta comercial a un directorio con IA que cuestionará tus supuestos de costos.',
            targetCollocations: ['return on investment', 'mitigating enterprise exposure', 'scale operations sustainably'],
            simulatorScenarioPreset: 'Venture Pitch & Cross-Examination',
            highlight: 'Generate your weekly Executive Fluency & WPM Speech Velocity scorecard.',
            highlightEs: 'Genera tu reporte de fluidez ejecutiva y velocidad WPM para Teacher Ivan.',
          },
        ],
      };

    case 'Daily Conversational Fluency':
    default:
      return {
        targetLevel,
        primaryGoal: primaryGoal || 'Daily Conversational Fluency',
        focusSkill,
        personalObjective,
        generatedBy: 'deterministic-fallback',
        days: [
          {
            day: 'D1',
            type: 'Receptive Input',
            title: 'Spontaneous Idiomatic Chunks & Connected Speech',
            titleEs: 'Expresiones Idiomáticas Cotidianas y Habla Conectada',
            time: '10–12 min',
            description: `Analyze authentic native conversational exchanges featuring contractions, elision, and small talk flow. Focus: ${focusSkill}.`,
            descriptionEs: `Analiza conversaciones nativas reales con contracciones, elisiones y fluidez de charla casual. Enfoque: ${focusSkill}.`,
            targetCollocations: ['catch up with', 'hit the ground running', 'make ends meet', 'keep an eye on'],
            simulatorScenarioPreset: 'Coffee Shop Small Talk & Culture',
            highlight: 'Notice 3 instances where consonants link smoothly across word boundaries.',
            highlightEs: 'Nota 3 instancias donde las consonantes se enlazan fluidamente entre palabras.',
          },
          {
            day: 'D2',
            type: 'Structural Processing',
            title: 'Conversational Echo Questions & Storytelling Flow',
            titleEs: 'Preguntas Eco y Fluidez al Contar Anécdotas',
            time: '12–15 min',
            description: 'Learn to narrate personal anecdotes with engaging transition markers ("Guess what happened next...", "Out of nowhere...").',
            descriptionEs: 'Aprende a relatar anécdotas personales usando marcadores cautivadores ("Guess what happened next...", "Out of nowhere...").',
            targetCollocations: ['out of the blue', 'to make matters worse', 'it turns out that'],
            simulatorScenarioPreset: 'Casual Dinner Party Storytelling',
            highlight: 'Practice 3 response tags to keep conversations alive effortlessly.',
            highlightEs: 'Practica 3 muletillas y tags naturales para mantener viva la conversación.',
          },
          {
            day: 'D3',
            type: 'Async Oral Production',
            title: 'Voice Sprint: "A Day That Changed My Perspective"',
            titleEs: 'Sprint de Voz: "Un Día que Cambió mi Perspectiva"',
            time: '10–15 min',
            description: 'Send a natural 90-second voice note telling a personal story with emotion and descriptive vocabulary.',
            descriptionEs: 'Envía una nota de voz de 90 segundos relatando una vivencia personal con emoción y vocabulario descriptivo.',
            targetCollocations: ['unforgettable experience', 'completely caught off guard', 'looking back on it now'],
            simulatorScenarioPreset: 'Weekend Travel Experience',
            highlight: 'Receive feedback on intonation patterns, word stress, and pronunciation.',
            highlightEs: 'Recibe feedback personalizado de entonación, acentuación y pronunciación.',
          },
          {
            day: 'D4',
            type: 'Functional Writing Prompt',
            title: 'Casual Digital Messaging & Personal Reflection',
            titleEs: 'Mensajería Casual y Reflexión Personal',
            time: '15–20 min',
            description: `Write a natural conversational text/email reflecting your goal: "${personalObjective}".`,
            descriptionEs: `Escribe un mensaje natural e informal alineado a tu meta: "${personalObjective}".`,
            targetCollocations: ['let me know how it goes', 'been meaning to tell you', 'catch you later'],
            simulatorScenarioPreset: 'Planning a Trip with Friends',
            functionalWritingPrompt: `Write a 100-word warm, conversational message to a native-speaking friend or colleague sharing your exciting objective: "${personalObjective}". Use at least 2 phrasal verbs, 1 idiomatic expression, and natural informal transitions.`,
            functionalWritingPromptEs: `Escribe un mensaje informal y cercano de 80–120 palabras a un amigo angloparlante compartiendo tu meta: "${personalObjective}". Usa al menos 2 phrasal verbs, 1 modismo natural y transiciones casuales.`,
            highlight: 'Teacher Ivan checks naturalness, tone consistency, and slang appropriateness.',
            highlightEs: 'Teacher Ivan revisa naturalidad, coherencia de tono y uso adecuado de modismos.',
          },
          {
            day: 'D5',
            type: 'Weekly Closure',
            title: 'Free-Flowing Voice Chat with Emma',
            titleEs: 'Conversación Oral Fluida en Vivo con Emma',
            time: '10–15 min',
            description: 'An unstructured, real-time voice chat covering hobbies, aspirations, and current events.',
            descriptionEs: 'Una charla de voz en tiempo real sin guion sobre pasatiempos, aspiraciones y eventos actuales.',
            targetCollocations: ['can you imagine', 'from my perspective', 'to tell you the truth'],
            simulatorScenarioPreset: 'Casual Walk & Talk Conversation',
            highlight: 'Celebrate your 5-day streak and review your updated CEFR proficiency level.',
            highlightEs: 'Celebra tu racha de 5 días y genera tu reporte pedagógico para Teacher Ivan.',
          },
        ],
      };
  }
}

/**
 * Generates an AI-tailored 5-Day Micro-Learning Sprint using Gemini
 * (gemini-3.1-flash-lite -> gemini-2.5-flash), with an instant deterministic
 * fallback so the platform never fails.
 */
export async function generateWeeklySprint(goals: LearningGoals): Promise<GeneratedSprint> {
  const rawApiKey = process.env.GEMINI_API_KEY;
  const apiKey = rawApiKey ? rawApiKey.trim() : '';

  // If no API key is available, return deterministic sprint immediately
  if (!apiKey || apiKey === '' || apiKey === 'your_gemini_api_key_here') {
    return getDeterministicSprint(goals);
  }

  const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are Teacher Ivan, a world-class bilingual English tutor.
A student has completed their onboarding profile and requires a personalized 5-Day Micro-Learning Sprint (D1 to D5).
Generate both English and Spanish translations for titles, descriptions, writing prompts, and highlights so bilingual UI switches flawlessly.

STUDENT PROFILE:
- Target CEFR Level: ${goals.targetLevel}
- Primary Learning Goal: ${goals.primaryGoal}
- Priority Focus Skill: ${goals.focusSkill}
- Specific Personal Objective: "${goals.personalObjective}"

Generate a 5-day sprint strictly in JSON format conforming to this exact structure:
{
  "days": [
    {
      "day": "D1",
      "type": "Receptive Input",
      "title": "string in English",
      "titleEs": "string in Spanish",
      "time": "10–12 min",
      "description": "string in English",
      "descriptionEs": "string in Spanish",
      "targetCollocations": ["collocation 1", "collocation 2", "collocation 3", "collocation 4"],
      "simulatorScenarioPreset": "string (name of matching roleplay scenario)",
      "highlight": "string in English",
      "highlightEs": "string in Spanish"
    },
    {
      "day": "D2",
      "type": "Structural Processing",
      "title": "string in English",
      "titleEs": "string in Spanish",
      "time": "12–15 min",
      "description": "string in English",
      "descriptionEs": "string in Spanish",
      "targetCollocations": ["collocation 1", "collocation 2", "collocation 3"],
      "simulatorScenarioPreset": "string",
      "highlight": "string in English",
      "highlightEs": "string in Spanish"
    },
    {
      "day": "D3",
      "type": "Async Oral Production",
      "title": "string in English",
      "titleEs": "string in Spanish",
      "time": "10–15 min",
      "description": "string in English",
      "descriptionEs": "string in Spanish",
      "targetCollocations": ["collocation 1", "collocation 2", "collocation 3"],
      "simulatorScenarioPreset": "string",
      "highlight": "string in English",
      "highlightEs": "string in Spanish"
    },
    {
      "day": "D4",
      "type": "Functional Writing Prompt",
      "title": "string in English",
      "titleEs": "string in Spanish",
      "time": "15–20 min",
      "description": "string in English",
      "descriptionEs": "string in Spanish",
      "targetCollocations": ["collocation 1", "collocation 2", "collocation 3"],
      "simulatorScenarioPreset": "string",
      "functionalWritingPrompt": "A detailed 80-120 word writing prompt in English explicitly mentioning and targeting: '${goals.personalObjective}'",
      "functionalWritingPromptEs": "Consigna detallada de escritura de 80-120 palabras en español mencionando explícitamente y enfocada en: '${goals.personalObjective}'",
      "highlight": "string in English",
      "highlightEs": "string in Spanish"
    },
    {
      "day": "D5",
      "type": "Weekly Closure",
      "title": "string in English",
      "titleEs": "string in Spanish",
      "time": "10–15 min",
      "description": "string in English",
      "descriptionEs": "string in Spanish",
      "targetCollocations": ["collocation 1", "collocation 2", "collocation 3"],
      "simulatorScenarioPreset": "string",
      "highlight": "string in English",
      "highlightEs": "string in Spanish"
    }
  ]
}

CRITICAL RULES:
1. Return ONLY valid JSON, with NO surrounding markdown or commentary.
2. Ensure Day 4 functionalWritingPrompt and functionalWritingPromptEs are deeply tailored to: "${goals.personalObjective}".
3. Keep collocations high-frequency, natural, and directly applicable to "${goals.primaryGoal}".`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      if (!text) continue;

      // Clean potential markdown fences
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleanJson);

      if (parsed && Array.isArray(parsed.days) && parsed.days.length === 5) {
        return {
          targetLevel: goals.targetLevel,
          primaryGoal: goals.primaryGoal,
          focusSkill: goals.focusSkill,
          personalObjective: goals.personalObjective,
          days: parsed.days,
          generatedBy: 'gemini',
          modelUsed: model,
        };
      }
    } catch (err) {
      console.warn(`[CurriculumGenerator] Model ${model} failed:`, err instanceof Error ? err.message : err);
    }
  }

  // Graceful deterministic fallback
  console.info('[CurriculumGenerator] Returning deterministic fallback sprint');
  return getDeterministicSprint(goals);
}
