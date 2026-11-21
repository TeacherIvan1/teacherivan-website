import { GoogleGenAI } from '@google/genai';
import type { LearningGoals } from './userStore.js';
import { sanitizeInput, wrapStudentInput, SYSTEM_GUARDRAILS } from '../utils/promptGuard.js';
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

  const safeTargetLevel = sanitizeInput(goals.targetLevel, 20) || 'B1';
  const safePrimaryGoal = sanitizeInput(goals.primaryGoal, 80) || 'Daily Conversational Fluency';
  const safeFocusSkill = sanitizeInput(goals.focusSkill, 80) || 'Speaking Fluency & Pronunciation';
  const safePersonalObjective = sanitizeInput(goals.personalObjective, 400);

  const studentContext = wrapStudentInput(
    `- Target CEFR Level: ${safeTargetLevel}\n- Primary Learning Goal: ${safePrimaryGoal}\n- Priority Focus Skill: ${safeFocusSkill}\n- Specific Personal Objective: "${safePersonalObjective}"`,
    'student_input'
  );

  const prompt = `You are Teacher Ivan, a world-class bilingual English tutor.
A student has completed their onboarding profile and requires a personalized 5-Day Micro-Learning Sprint (D1 to D5).
Generate both English and Spanish translations for titles, descriptions, writing prompts, and highlights so bilingual UI switches flawlessly.

${SYSTEM_GUARDRAILS}

STUDENT PROFILE DATA:
${studentContext}

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
      "functionalWritingPrompt": "A detailed 80-120 word writing prompt in English explicitly mentioning and targeting: '${safePersonalObjective}'",
      "functionalWritingPromptEs": "Consigna detallada de escritura de 80-120 palabras en español mencionando explícitamente y enfocada en: '${safePersonalObjective}'",
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
2. Ensure Day 4 functionalWritingPrompt and functionalWritingPromptEs are deeply tailored to: "${safePersonalObjective}".
3. Keep collocations high-frequency, natural, and directly applicable to "${safePrimaryGoal}".`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.4,
          responseMimeType: 'application/json',
          maxOutputTokens: 2048,
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

// =========================================================================
// ON-DEMAND CUSTOM RESOURCE GENERATOR (For Essential 300 BOB, Pro & Exec)
// =========================================================================

export type ResourceType =
  | 'article_collocations'
  | 'dialogue_script'
  | 'vocab_phrasal_deck'
  | 'worksheet';

export interface CustomResourceRequest {
  topic: string;
  targetLevel?: string;
  resourceType?: ResourceType;
  studentGoal?: string;
}

export interface CustomResourceResult {
  id: string;
  topic: string;
  targetLevel: string;
  resourceType: ResourceType;
  title: string;
  titleEs: string;
  content: string;
  collocations: Array<{
    term: string;
    phonetic?: string;
    definitionEn: string;
    definitionEs: string;
    example: string;
  }>;
  comprehensionChecks: Array<{
    question: string;
    questionEs: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  practiceTip: string;
  practiceTipEs: string;
  generatedBy: 'gemini' | 'deterministic-fallback';
  createdAt: string;
}

export function getDeterministicCustomResource(req: CustomResourceRequest): CustomResourceResult {
  const topic = (req.topic || 'Professional Communication').trim();
  const level = req.targetLevel || 'B2';
  const type: ResourceType = req.resourceType || 'article_collocations';
  const id = `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  if (type === 'dialogue_script') {
    return {
      id,
      topic,
      targetLevel: level,
      resourceType: type,
      title: `Active Speaking Simulation: ${topic}`,
      titleEs: `Simulación Activa de Conversación: ${topic}`,
      content: `[Scenario: High-stakes dialogue practicing direct communication and fluent turn-taking]\n\n` +
        `Teacher Ivan: "Thanks for taking the time to sync today. Regarding our focus on ${topic}, where do you see the biggest challenge right now?"\n\n` +
        `Student: "To be completely candid, my main hurdle is formulating spontaneous arguments without pausing to translate from Spanish."\n\n` +
        `Teacher Ivan: "That's completely natural. The key is leaning into modular sentence stems rather than building every clause from scratch. How would you pitch your core idea in 30 seconds?"\n\n` +
        `Student: "If I had to distill it, the primary advantage is accelerating execution while eliminating unnecessary friction across the entire workflow."\n\n` +
        `Teacher Ivan: "Spot on! That phrasing — 'accelerating execution while eliminating friction' — sounds crisp, authoritative, and native."`,
      collocations: [
        {
          term: 'to be completely candid',
          phonetic: '/tə biː kəmˈpliːtli ˈkændɪd/',
          definitionEn: 'Speaking honestly and directly without sugarcoating',
          definitionEs: 'Para ser completamente sincero/directo',
          example: 'To be completely candid, our deadline is extremely tight.',
        },
        {
          term: 'distill the core idea',
          phonetic: '/dɪˈstɪl ðə kɔːr aɪˈdɪə/',
          definitionEn: 'To extract the essential meaning or key message',
          definitionEs: 'Sintetizar la idea central',
          example: 'Can you distill the core idea into one elevator pitch?',
        },
        {
          term: 'eliminate friction',
          phonetic: '/ɪˈlɪmɪneɪt ˈfrɪkʃən/',
          definitionEn: 'To remove obstacles, delays, or misunderstandings',
          definitionEs: 'Eliminar fricciones o trabas',
          example: 'Clear documentation helps eliminate friction between teams.',
        },
      ],
      comprehensionChecks: [
        {
          question: 'What does "to be completely candid" signal in professional discourse?',
          questionEs: '¿Qué señala "to be completely candid" en una conversación profesional?',
          options: ['An apology for a mistake', 'A direct, honest perspective', 'An intention to quit', 'A request for permission'],
          correctIndex: 1,
          explanation: '"To be candid" establishes high trust and transparent communication.',
        },
        {
          question: 'Which collocation best replaces "make things faster without problems"?',
          questionEs: '¿Qué colocación reemplaza mejor "hacer las cosas más rápido sin problemas"?',
          options: ['Do fast without pain', 'Accelerate execution while eliminating friction', 'Run quick with zero trouble', 'Hurry up cleanly'],
          correctIndex: 1,
          explanation: 'It uses formal, high-impact executive vocabulary.',
        },
        {
          question: 'How should the student practice this dialogue with the 24/7 Voice Lab?',
          questionEs: '¿Cómo debería el estudiante practicar este diálogo en el Laboratorio de Voz?',
          options: ['Reading silently', 'Speaking aloud focusing on rhythm and pitch', 'Writing it 10 times', 'Translating each word'],
          correctIndex: 1,
          explanation: 'Active vocal production builds oral reflexes and muscle memory.',
        },
      ],
      practiceTip: 'Read the dialogue out loud with Emma or Teacher Ivan in the Voice Lab, matching the intonation of each question.',
      practiceTipEs: 'Lee el diálogo en voz alta con Emma o Teacher Ivan en el Laboratorio de Voz, imitando la entonación natural de cada frase.',
      generatedBy: 'deterministic-fallback',
      createdAt: new Date().toISOString(),
    };
  }

  if (type === 'vocab_phrasal_deck') {
    return {
      id,
      topic,
      targetLevel: level,
      resourceType: type,
      title: `High-Frequency Phrasal & Idiom Deck: ${topic}`,
      titleEs: `Baraja de Phrasal Verbs y Colocaciones: ${topic}`,
      content: `Targeted vocabulary deck engineered for ${level} fluency in the context of "${topic}". Focus on combining these seamlessly into spontaneous speech.`,
      collocations: [
        {
          term: 'drill down into',
          phonetic: '/drɪl daʊn ˈɪntuː/',
          definitionEn: 'To examine or analyze something in deeper detail',
          definitionEs: 'Profundizar en un análisis o detalle',
          example: 'Let’s drill down into the conversion metrics before finalizing.',
        },
        {
          term: 'bridge the gap',
          phonetic: '/brɪdʒ ðə ɡæp/',
          definitionEn: 'To connect or reconcile two differing perspectives or states',
          definitionEs: 'Cerrar la brecha o acortar distancias',
          example: 'Our Bicronic Method bridges the gap between passive study and active fluency.',
        },
        {
          term: 'pave the way for',
          phonetic: '/peɪv ðə weɪ fɔːr/',
          definitionEn: 'To create favorable conditions for future success',
          definitionEs: 'Allanar el camino para algo nuevo',
          example: 'Daily oral practice paves the way for effortless speaking.',
        },
      ],
      comprehensionChecks: [
        {
          question: 'If you want to investigate a bottleneck thoroughly, you:',
          questionEs: 'Si quieres investigar un cuello de botella a fondo, tú:',
          options: ['Drill down into it', 'Look over it lightly', 'Back away from it', 'Brush off it'],
          correctIndex: 0,
          explanation: '"Drill down into" signifies in-depth investigation.',
        },
        {
          question: 'What does "bridge the gap" mean in a learning context?',
          questionEs: '¿Qué significa "bridge the gap" en un contexto de aprendizaje?',
          options: ['Build a physical bridge', 'Overcome the divide between knowledge and practice', 'Stop studying', 'Memorize grammar rules'],
          correctIndex: 1,
          explanation: 'It means connecting theoretical knowledge with real-time performance.',
        },
        {
          question: 'Select the correct sentence using "pave the way":',
          questionEs: 'Selecciona la oración correcta usando "pave the way":',
          options: [
            'This breakthrough will pave the way for international contracts.',
            'He paved the way by walking on the grass.',
            'Pave the way your coffee please.',
            'The way was paved to the door.',
          ],
          correctIndex: 0,
          explanation: 'It figuratively describes opening doors for future achievements.',
        },
      ],
      practiceTip: 'Create 2 personalized sentences for each collocation applying them directly to your work or daily life.',
      practiceTipEs: 'Crea 2 oraciones personalizadas para cada término aplicándolas directamente a tu trabajo o vida diaria.',
      generatedBy: 'deterministic-fallback',
      createdAt: new Date().toISOString(),
    };
  }

  if (type === 'worksheet') {
    return {
      id,
      topic,
      targetLevel: level,
      resourceType: type,
      title: `Error-Correction & Recast Worksheet: ${topic}`,
      titleEs: `Ficha de Corrección y Recast: ${topic}`,
      content: `Printable and interactive diagnostic worksheet targeting common interference errors made by Spanish speakers when discussing "${topic}".`,
      collocations: [
        {
          term: 'depend on (NOT depend of)',
          phonetic: '/dɪˈpɛnd ɒn/',
          definitionEn: 'Preposition rule: things depend ON something, never of',
          definitionEs: 'Depender DE en español se traduce como depend ON en inglés',
          example: 'Our promotion depends on our spoken performance.',
        },
        {
          term: 'make a decision (NOT take a decision)',
          phonetic: '/meɪk ə dɪˈsɪʒən/',
          definitionEn: 'Collocation rule: English speakers MAKE decisions',
          definitionEs: 'Tomar una decisión se dice MAKE a decision (nunca take)',
          example: 'We need to make a firm decision before Friday.',
        },
        {
          term: 'explain to someone (NOT explain someone)',
          phonetic: '/ɪkˈspleɪn tuː/',
          definitionEn: 'Preposition requirement: explain requires "to" before the person',
          definitionEs: 'Explicar a alguien requiere la preposición "to"',
          example: 'Could you explain the process to me again?',
        },
      ],
      comprehensionChecks: [
        {
          question: 'Which sentence is grammatically natural in English?',
          questionEs: '¿Cuál oración es gramaticalmente natural en inglés?',
          options: [
            'It depends of the budget.',
            'It depends on the budget.',
            'It depends at the budget.',
            'It depends from the budget.',
          ],
          correctIndex: 1,
          explanation: 'Always use "depend on".',
        },
        {
          question: 'Choose the correct business collocation:',
          questionEs: 'Elige la colocación profesional correcta:',
          options: ['We took an important decision.', 'We made an important decision.', 'We did a decision.', 'We gave a decision.'],
          correctIndex: 1,
          explanation: 'In English we "make" decisions, proposals, and mistakes.',
        },
        {
          question: 'Identify the error: "He explained me the whole system."',
          questionEs: 'Identifica el error: "He explained me the whole system."',
          options: [
            'System is misspelled',
            'Needs "to": "He explained to me the whole system"',
            'Explained must be explain',
            'No error',
          ],
          correctIndex: 1,
          explanation: 'Explain must be followed by "to [person]".',
        },
      ],
      practiceTip: 'Print this low-ink sheet using the "Print Worksheet" button below or record yourself recasting each corrected sentence in the Voice Lab.',
      practiceTipEs: 'Imprime esta ficha usando el botón "Imprimir Ficha" abajo o grábate reformulando cada oración corregida en el Laboratorio de Voz.',
      generatedBy: 'deterministic-fallback',
      createdAt: new Date().toISOString(),
    };
  }

  // Default: article_collocations
  return {
    id,
    topic,
    targetLevel: level,
    resourceType: type,
    title: `Mastery Passage & Collocations: ${topic}`,
    titleEs: `Artículo de Dominio y Colocaciones: ${topic}`,
    content: `When navigating complex situations in "${topic}", spoken fluency hinges on rapid structural assembly rather than exhaustive vocabulary memorization. In high-stakes meetings or cross-border technical dialogues, professionals who articulate their viewpoints concisely consistently outperform those who hesitate while searching for individual words.\n\n` +
      `By anchoring your speech around proven collocations, you sidestep cognitive overload and deliver your insights with natural confidence. As you read this passage, pay close attention to how rhythmic phrasing and deliberate pauses create authority and trust.`,
    collocations: [
      {
        term: 'hinges on',
        phonetic: '/ˈhɪndʒɪz ɒn/',
        definitionEn: 'Depends completely on a central factor',
        definitionEs: 'Depende decisivamente de un factor central',
        example: 'Our team’s success hinges on real-time collaboration.',
      },
      {
        term: 'articulate viewpoints concisely',
        phonetic: '/ɑːrˈtɪkjʊleɪt ˈvjuːpɔɪnts kənˈsaɪsli/',
        definitionEn: 'To express opinions clearly using few, well-chosen words',
        definitionEs: 'Articular puntos de vista de manera concisa y clara',
        example: 'He articulated his viewpoints concisely during the presentation.',
      },
      {
        term: 'cognitive overload',
        phonetic: '/ˈkɒɡnɪtɪv ˈoʊvərloʊd/',
        definitionEn: 'Mental exhaustion caused by too much simultaneous processing',
        definitionEs: 'Sobrecarga mental por exceso de procesamiento',
        example: 'Memorizing collocations prevents cognitive overload when speaking.',
      },
    ],
    comprehensionChecks: [
      {
        question: 'According to the passage, what does spoken fluency primarily hinge on?',
        questionEs: 'Según el texto, ¿de qué depende principalmente la fluidez hablada?',
        options: [
          'Memorizing entire dictionaries',
          'Rapid structural assembly and modular phrasing',
          'Speaking as fast as humanly possible',
          'Avoiding talking to native speakers',
        ],
        correctIndex: 1,
        explanation: 'Fluency is built on assembling structures rapidly without overthinking.',
      },
      {
        question: 'What is the primary benefit of anchoring your speech around collocations?',
        questionEs: '¿Cuál es el beneficio principal de anclar tu habla en colocaciones?',
        options: [
          'It eliminates cognitive overload',
          'It replaces the need to practice',
          'It changes your accent to British',
          'It avoids grammar entirely',
        ],
        correctIndex: 0,
        explanation: 'Collocations automate phrase construction, freeing mental bandwidth.',
      },
      {
        question: 'What does "to articulate viewpoints concisely" mean?',
        questionEs: '¿Qué significa "to articulate viewpoints concisely"?',
        options: [
          'To speak loudly and aggressively',
          'To express ideas clearly and without rambling',
          'To write long academic papers',
          'To stay quiet in meetings',
        ],
        correctIndex: 1,
        explanation: 'It denotes speaking with clarity, brevity, and authority.',
      },
    ],
    practiceTip: 'Click any collocation to listen to native pronunciation, then challenge yourself to summarize this passage in 3 spoken sentences.',
    practiceTipEs: 'Haz clic en cualquier colocación para escuchar su pronunciación nativa, luego resume el texto en 3 oraciones habladas.',
    generatedBy: 'deterministic-fallback',
    createdAt: new Date().toISOString(),
  };
}

export async function generateCustomResource(req: CustomResourceRequest): Promise<CustomResourceResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getDeterministicCustomResource(req);
  }

  const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
  const ai = new GoogleGenAI({ apiKey });

  const safeTopic = sanitizeInput(req.topic, 300);
  const safeTargetLevel = sanitizeInput(req.targetLevel, 20) || 'B2';
  const safeResourceType = sanitizeInput(req.resourceType, 50) || 'article_collocations';
  const safeStudentGoal = sanitizeInput(req.studentGoal, 300) || 'Spoken English Mastery';

  const requestContext = wrapStudentInput(
    `- Topic / Situation: "${safeTopic}"\n- Target CEFR Level: ${safeTargetLevel}\n- Resource Type: ${safeResourceType}\n- Student Learning Objective: "${safeStudentGoal}"`,
    'student_input'
  );

  const prompt = `You are Teacher Ivan, an elite bilingual English tutor and curriculum designer.
Generate an on-demand, highly engaging custom learning resource tailored to the student's request.

${SYSTEM_GUARDRAILS}

STUDENT REQUEST PARAMETERS:
${requestContext}

OUTPUT SCHEMA (Return strictly JSON):
{
  "title": "string in English (punchy, motivational)",
  "titleEs": "string in Spanish",
  "content": "Rich string content formatted with markdown for paragraph breaks. If article: 180-250 words engaging passage. If dialogue: 6-8 turn realistic conversation. If deck: intro and context. If worksheet: 5 clear error cases with context.",
  "collocations": [
    {
      "term": "string (high-frequency phrase or phrasal verb)",
      "phonetic": "string (IPA phonetic transcription)",
      "definitionEn": "string in English",
      "definitionEs": "string in Spanish",
      "example": "string (realistic sentence using the collocation)"
    }
  ],
  "comprehensionChecks": [
    {
      "question": "string in English",
      "questionEs": "string in Spanish",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "string explaining why the answer is correct"
    }
  ],
  "practiceTip": "A concrete 1-sentence action item for the student to practice in Teacher Ivan's 24/7 Voice Lab",
  "practiceTipEs": "Consejo práctico en español de 1 oración para practicar en el Laboratorio de Voz 24/7"
}

CRITICAL CONSTRAINTS:
1. Provide exactly 3 collocations and exactly 3 comprehension checks.
2. Return ONLY valid JSON with zero surrounding commentary or backticks.
3. Keep the tone encouraging, direct, and professional.`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.4,
          responseMimeType: 'application/json',
          maxOutputTokens: 2048,
        },
      });

      const text = response.text?.trim() || '';
      if (!text) continue;

      const cleanJson = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleanJson);

      if (parsed && parsed.title && parsed.content && Array.isArray(parsed.collocations)) {
        return {
          id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          topic: req.topic,
          targetLevel: req.targetLevel || 'B2',
          resourceType: req.resourceType || 'article_collocations',
          title: parsed.title,
          titleEs: parsed.titleEs || parsed.title,
          content: parsed.content,
          collocations: parsed.collocations,
          comprehensionChecks: parsed.comprehensionChecks || [],
          practiceTip: parsed.practiceTip || 'Practice this aloud in the Voice Lab.',
          practiceTipEs: parsed.practiceTipEs || 'Practica esto en voz alta en el Laboratorio de Voz.',
          generatedBy: 'gemini',
          createdAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn(`[CustomResourceGenerator] Model ${model} failed:`, err instanceof Error ? err.message : err);
    }
  }

  return getDeterministicCustomResource(req);
}
