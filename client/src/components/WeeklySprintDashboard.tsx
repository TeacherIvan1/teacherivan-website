import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  PenTool,
  Send,
  Award,
  BookOpen,
  Gamepad2,
  Mic,
  BarChart3,
  Volume2,
  Target,
  Edit3,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useSprintStore, CEFRLevel } from '../modules/sprint/sprintStore';
import { useAuthStore } from '../modules/auth/authStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { TEACHER_PHONE, getWhatsAppUrl } from '../config/contact';
import { MandatoryGoalsModal } from './MandatoryGoalsModal';

export interface WeeklySprintDashboardProps {
  compact?: boolean;
}

export const WeeklySprintDashboard: React.FC<WeeklySprintDashboardProps> = ({
  compact = false,
}) => {
  const { t, isEs } = useTranslation();
  const { user } = useAuthStore();
  const {
    profile,
    completedStages,
    completeStage,
    day4Writing,
    day4Feedback,
    saveDay4Writing,
    openReportModal,
    totalXp,
    personalizedSprint,
  } = useSprintStore();

  const setActiveView = useNavigationStore((s) => s.setActiveView);
  const selectScenario = useTeachingStore((s) => s.selectScenario);

  // Active selected day for the Interactive Stage (0: D1, 1: D2, 2: D3, 3: D4, 4: D5)
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [isEditGoalsOpen, setIsEditGoalsOpen] = useState(false);
  const [localWriting, setLocalWriting] = useState(day4Writing || '');
  const [writingStatus, setWritingStatus] = useState<string | null>(null);

  // Interactive Mini-game state for D2
  const [d2SelectedOption, setD2SelectedOption] = useState<string | null>(null);
  const [d2Feedback, setD2Feedback] = useState<string | null>(null);

  // Audio pronunciation preview state for D1
  const [playingCollocation, setPlayingCollocation] = useState<string | null>(null);

  // Student metadata resolution
  const studentName = user?.fullName || profile.studentName || 'Student';
  const targetLevel = user?.learningGoals?.targetLevel || profile.cefrLevel || 'B1';
  const primaryGoal = user?.learningGoals?.primaryGoal || 'Tech & Job Interviews';
  const personalObjective =
    user?.learningGoals?.personalObjective ||
    'Prepare for high-stakes interviews and speak English without mental translation.';
  const userCountry = user?.country || 'Bolivia';

  const getCountryFlag = (country?: string): string => {
    if (!country) return '🌐';
    const c = country.toLowerCase();
    if (c.includes('bolivia')) return '🇧🇴 Bolivia';
    if (c.includes('mexico')) return '🇲🇽 Mexico';
    if (c.includes('colombia')) return '🇨🇴 Colombia';
    if (c.includes('peru')) return '🇵🇪 Peru';
    if (c.includes('argentina')) return '🇦🇷 Argentina';
    if (c.includes('chile')) return '🇨🇱 Chile';
    if (c.includes('spain') || c.includes('españa')) return '🇪🇸 Spain';
    if (c.includes('usa') || c.includes('united states')) return '🇺🇸 USA';
    return `🌐 ${country}`;
  };

  const pDays = personalizedSprint?.days || [];

  // Helper to extract bilingual day content safely
  const getDayContent = (index: number) => {
    const pDay = pDays[index];

    // Default bilingual mapping fallbacks per day index
    const defaultTitles = [
      { en: 'Receptive Input & Collocation Immersion', es: 'Entrada Receptiva e Inmersión de Colocaciones' },
      { en: 'Structural Processing & Syntax Framing', es: 'Procesamiento Estructural y Sintaxis' },
      { en: 'Oral Simulation: Conversational Challenge', es: 'Simulación Oral en Vivo con Tutor IA' },
      { en: 'Functional Writing: Objective Pitch', es: 'Redacción Funcional Guiada' },
      { en: 'Weekly Closure & Pedagogical Report', es: 'Cierre Semanal y Reporte Pedagógico' },
    ];

    const defaultDescs = [
      {
        en: 'Analyze high-level dialogue patterns and internalize natural lexical collocations.',
        es: 'Analiza patrones de diálogo avanzado e internaliza colocaciones léxicas nativas.',
      },
      {
        en: 'Master formal connectors and syntactic structures to bridge ideas seamlessly.',
        es: 'Domina conectores formales y estructuras gramaticales para enlazar tus ideas con fluidez.',
      },
      {
        en: 'Practice your target scenario with real-time feedback using Gemini Live native audio.',
        es: 'Practica tu escenario objetivo en tiempo real con audio nativo de Gemini Live.',
      },
      {
        en: `Draft an 80–120 word response directly addressing: "${personalObjective}".`,
        es: `Redacta un texto formal de 80–120 palabras enfocado en: "${personalObjective}".`,
      },
      {
        en: 'Consolidate your 5-day habit streak and submit your progress report to Teacher Ivan.',
        es: 'Consolida tu racha de 5 días y envía tu reporte de progreso a Teacher Ivan por WhatsApp.',
      },
    ];

    const title = isEs
      ? pDay?.titleEs || defaultTitles[index]?.es || pDay?.title || ''
      : pDay?.title || defaultTitles[index]?.en || '';

    const description = isEs
      ? pDay?.descriptionEs || defaultDescs[index]?.es || pDay?.description || ''
      : pDay?.description || defaultDescs[index]?.en || '';

    const collocations = pDay?.targetCollocations && pDay.targetCollocations.length > 0
      ? pDay.targetCollocations
      : ['strategic trade-offs', 'drive consensus', 'cross-functional collaboration', 'quantifiable impact'];

    const preset = pDay?.simulatorScenarioPreset || 'job-interview';

    const writingPrompt = isEs
      ? pDay?.functionalWritingPromptEs ||
        `Escribe un texto formal de 80–120 palabras enfocado en tu meta: "${personalObjective}". Destaca tus principales fortalezas, utiliza al menos 2 colocaciones aprendidas y explica tu estrategia de impacto.`
      : pDay?.functionalWritingPrompt ||
        `Write an 80–120 word professional response addressing your personal objective: "${personalObjective}". Highlight your core strengths, use at least 2 target collocations, and articulate your actionable roadmap.`;

    const highlight = isEs
      ? pDay?.highlightEs || 'Recibe retroalimentación personalizada de Teacher Ivan.'
      : pDay?.highlight || 'Receive personalized recast feedback from Teacher Ivan.';

    return { title, description, collocations, preset, writingPrompt, highlight };
  };

  // Day Definitions
  const dayTabs = [
    { id: 0, label: 'D1', type: isEs ? 'Entrada Receptiva' : 'Receptive Input', icon: BookOpen },
    { id: 1, label: 'D2', type: isEs ? 'Procesamiento' : 'Structural Processing', icon: Gamepad2 },
    { id: 2, label: 'D3', type: isEs ? 'Simulación Oral' : 'Oral Simulation', icon: Mic },
    { id: 3, label: 'D4', type: isEs ? 'Escritura' : 'Functional Writing', icon: PenTool },
    { id: 4, label: 'D5', type: isEs ? 'Cierre Semanal' : 'Weekly Closure', icon: Award },
  ];

  const activeDayData = getDayContent(selectedDay);

  // Word count for D4 Writing
  const wordCount = localWriting.trim() ? localWriting.trim().split(/\s+/).length : 0;
  const isWritingValid = wordCount >= 70 && wordCount <= 140;

  const handleSaveWriting = () => {
    if (!localWriting.trim()) return;
    let feedback = '';
    if (wordCount < 70) {
      feedback = isEs
        ? `Buen comienzo (${wordCount} palabras). Intenta expandir a un mínimo de 80 palabras con más detalles y conectores.`
        : `Good start (${wordCount} words). Try expanding to at least 80 words with additional details and cohesive connectors.`;
    } else if (wordCount > 130) {
      feedback = isEs
        ? `Texto amplio (${wordCount} palabras). Excelente esfuerzo; en comunicación ejecutiva, busca concisión (<120 palabras).`
        : `Detailed text (${wordCount} words). Great effort; in executive communication, aim for conciseness (<120 words).`;
    } else {
      feedback = isEs
        ? `¡Excelente extensión (${wordCount} palabras)! Sintaxis fluida, tono formal y vocabulario alineado a tu nivel ${targetLevel}.`
        : `Optimal length (${wordCount} words)! Clean syntax, formal tone, and vocabulary well-suited for CEFR ${targetLevel}.`;
    }

    saveDay4Writing(localWriting, feedback);
    completeStage(3); // Complete Day 4
    setWritingStatus(isEs ? '¡Entregado con éxito! Día 4 completado ✓ (+25 XP)' : 'Submitted successfully! Day 4 completed ✓ (+25 XP)');
    setTimeout(() => setWritingStatus(null), 4000);
  };

  // Audio Collocation simulation playback
  const handlePlayCollocation = (collocation: string) => {
    setPlayingCollocation(collocation);
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(collocation);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.onend = () => setPlayingCollocation(null);
        utterance.onerror = () => setPlayingCollocation(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setPlayingCollocation(null), 1200);
      }
    } catch {
      setTimeout(() => setPlayingCollocation(null), 1200);
    }
  };

  // Launch target scenario in simulator
  const handleLaunchTargetSimulator = () => {
    completeStage(2); // Complete Day 3
    selectScenario(activeDayData.preset as any || 'job-interview');
    setActiveView('simulator');
  };

  // WhatsApp summary payload for D5
  const generateWhatsAppReportMessage = () => {
    const text = isEs
      ? `Hola Teacher Ivan! Te comparto mi reporte semanal de progreso:\n\n👤 Estudiante: ${studentName}\n🎯 Nivel Objetivo: ${targetLevel}\n📌 Meta Principal: ${primaryGoal}\n🚀 Objetivo Específico: "${personalObjective}"\n📈 Hábito Semanal: ${completedStages.length}/5 Días Completados (+${totalXp} XP)\n📝 Redacción Día 4: ${localWriting ? `"${localWriting.substring(0, 100)}..."` : 'Completada'}\n\n¡Listo para afinar detalles en nuestra próxima clase 1-a-1!`
      : `Hi Teacher Ivan! Here is my weekly micro-learning sprint report:\n\n👤 Student: ${studentName}\n🎯 Target Level: ${targetLevel}\n📌 Primary Goal: ${primaryGoal}\n🚀 Specific Objective: "${personalObjective}"\n📈 Weekly Habit: ${completedStages.length}/5 Days Completed (+${totalXp} XP)\n📝 Day 4 Writing: ${localWriting ? `"${localWriting.substring(0, 100)}..."` : 'Completed'}\n\nReady to refine fluency in our upcoming 1-on-1 session!`;
    return getWhatsAppUrl(text);
  };

  const progressPercentage = Math.round((completedStages.length / 5) * 100);

  // Compact Mode Render (used in Dev Mode or Simulator sidebar)
  if (compact) {
    return (
      <div className="p-4 rounded-2xl bg-[#12223a] border border-[#A7C7E7]/25 text-[#FAFAFA] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E09B30] animate-pulse" />
            <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#FAFAFA]">
              {t.microLearning.badge}
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-[#E09B30]">
            {completedStages.length}/5 {isEs ? 'Días' : 'Days'} • {totalXp} XP
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#1A3153] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#E09B30] to-[#10b981] transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-[#A7C7E7]">
          <span>{studentName} ({targetLevel})</span>
          <button
            type="button"
            onClick={() => setActiveView('path' as any)}
            className="text-[#E09B30] hover:underline font-bold cursor-pointer"
          >
            {isEs ? 'Ver Mi Ruta →' : 'View Full Path →'}
          </button>
        </div>
      </div>
    );
  }

  // Full Rich Dashboard for '🎯 Mi Ruta (Micro-Learning)'
  return (
    <div id="student-microlearning-dashboard" className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-200">
      {/* Edit Goals Modal Modal Instance */}
      <MandatoryGoalsModal
        isOpen={isEditGoalsOpen}
        onClose={() => setIsEditGoalsOpen(false)}
      />

      {/* ========================================================================= */}
      {/* 1. PERSONALIZED GOAL HEADER CARD (#FAFAFA CARD WITH #A7C7E7 BORDER)        */}
      {/* ========================================================================= */}
      <div
        id="personalized-goal-header-card"
        className="p-6 sm:p-8 rounded-3xl bg-[#FAFAFA] text-[#1A3153] border-2 border-[#A7C7E7] shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        {/* Left: Chibi Teacher Ivan Avatar with Ambient Frame & Speech Bubble */}
        <div className="flex items-center gap-4 sm:gap-5 w-full lg:w-auto">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#1A3153] border-2 border-[#E09B30] p-1.5 flex items-center justify-center shadow-lg shadow-[#E09B30]/20">
              <img
                src="/assets/characters/ivan-pose-celebrate.svg"
                alt="Teacher Ivan Mascot"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#E09B30] text-[#1A3153] p-1 rounded-full shadow-sm">
              <Sparkles size={14} fill="currentColor" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#1A3153] tracking-tight">
                {studentName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1A3153]/10 border border-[#A7C7E7] text-xs font-montserrat font-bold text-[#4A5568]">
                {getCountryFlag(userCountry)}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-[#1A3153] text-[#E09B30] text-xs font-montserrat font-extrabold tracking-wider uppercase">
                {targetLevel}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-inter text-[#4A5568] leading-relaxed max-w-md">
              <strong className="text-[#1A3153]">{primaryGoal}</strong> • "{personalObjective}"
            </p>
          </div>
        </div>

        {/* Right: Weekly Progress Bar + Edit Goals Button */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end justify-between gap-3 w-full lg:w-auto shrink-0">
          <div className="w-full sm:w-64 lg:w-64 space-y-1.5 text-center lg:text-right">
            <div className="flex justify-between text-xs font-montserrat font-bold text-[#1A3153]">
              <span>{t.microLearning.progressLabel}</span>
              <span className="text-[#E09B30] font-black">{completedStages.length}/5 ({progressPercentage}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#E2E8F0] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E09B30] to-[#10b981] transition-all duration-700 shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-[#4A5568]">
              <span className="font-semibold">+{totalXp} XP {isEs ? 'ganados' : 'earned'}</span>
              <span className="font-bold text-[#10b981]">🔥 {completedStages.length} {isEs ? 'días de racha' : 'day streak'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              id="edit-student-goals-btn"
              onClick={() => setIsEditGoalsOpen(true)}
              className="px-4 py-2 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] hover:bg-slate-100 text-[#1A3153] text-xs font-montserrat font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Edit3 size={13} className="text-[#E09B30]" />
              <span>{t.microLearning.editGoals}</span>
            </button>

            <button
              type="button"
              id="sprint-book-class-quick-btn"
              onClick={() => setActiveView('schedule')}
              className="px-4 py-2 rounded-xl bg-[#E09B30] hover:bg-[#c88624] text-[#1A3153] text-xs font-montserrat font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Calendar size={13} />
              <span>{isEs ? 'Agendar Clase' : 'Book Class'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE 5-DAY VISUAL JOURNEY STEPPER (D1 TO D5)                    */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E09B30] animate-pulse" />
            <h3 className="font-montserrat font-extrabold text-base sm:text-lg text-[#FAFAFA] tracking-tight">
              {isEs ? 'Ruta de Aprendizaje Semanal (D1 a D5)' : '5-Day Weekly Habit Journey (D1 to D5)'}
            </h3>
          </div>
          <span className="text-xs text-[#A7C7E7] font-medium hidden sm:inline">
            {isEs ? 'Haz clic en cada día para abrir su actividad inline ↓' : 'Click any day to launch its inline activity ↓'}
          </span>
        </div>

        {/* 5 Day Stepper Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {dayTabs.map((day) => {
            const Icon = day.icon;
            const isSelected = selectedDay === day.id;
            const isCompleted = completedStages.includes(day.id);
            const content = getDayContent(day.id);

            return (
              <div
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1A3153] border-[#E09B30] shadow-xl ring-2 ring-[#E09B30]/30 scale-[1.02]'
                    : isCompleted
                    ? 'bg-[#12223a]/90 border-[#10b981]/50 opacity-90'
                    : 'bg-[#12223a]/70 border-[#A7C7E7]/25 hover:border-[#A7C7E7]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-montserrat font-black text-xs px-2.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-[#E09B30] text-[#1A3153]'
                          : isCompleted
                          ? 'bg-[#10b981] text-[#1A3153]'
                          : 'bg-[#FAFAFA]/10 text-[#A7C7E7]'
                      }`}
                    >
                      {day.label}
                    </span>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#10b981]">
                        <CheckCircle2 size={13} />
                        <span>{isEs ? 'Listo' : 'Done'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#A7C7E7] font-medium">10–15m</span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-[#FAFAFA]/10 flex items-center justify-center text-[#E09B30] mb-2">
                    <Icon size={16} />
                  </div>

                  <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-[#E09B30] block mb-1">
                    {day.type}
                  </span>

                  <h4 className="font-montserrat font-bold text-xs text-[#FAFAFA] leading-snug line-clamp-2">
                    {content.title}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-[#A7C7E7]/15 flex items-center justify-between text-[10px] font-montserrat font-semibold text-[#A7C7E7]">
                  <span>{isSelected ? (isEs ? 'Activo ↓' : 'Active ↓') : (isEs ? 'Ver Tarea' : 'View Task')}</span>
                  <ArrowRight size={12} className={isSelected ? 'text-[#E09B30]' : ''} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE ACTIVE DAY STAGE (COMPLETED INLINE)                        */}
      {/* ========================================================================= */}
      <div
        id="interactive-active-day-stage"
        className="p-6 sm:p-8 rounded-3xl bg-[#FAFAFA] text-[#1A3153] border-2 border-[#A7C7E7] shadow-2xl space-y-6 animate-in fade-in duration-200"
      >
        {/* Stage Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#A7C7E7]/40">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A3153] text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
              <span>{dayTabs[selectedDay].label}: {dayTabs[selectedDay].type}</span>
              {completedStages.includes(selectedDay) && (
                <span className="text-[#10b981] flex items-center gap-1 font-bold">
                  ✓ {isEs ? 'Completado' : 'Completed'}
                </span>
              )}
            </div>
            <h3 className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#1A3153] tracking-tight">
              {activeDayData.title}
            </h3>
            <p className="font-inter text-xs sm:text-sm text-[#4A5568] leading-relaxed">
              {activeDayData.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-full bg-[#E09B30]/20 text-[#1A3153] text-xs font-montserrat font-bold">
              +25 XP
            </span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* DAY 1: RECEPTIVE INPUT — READ ARTICLE & AUDIO COLLOCATIONS               */}
        {/* ======================================================================= */}
        {selectedDay === 0 && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-[#A7C7E7]/50 space-y-3">
              <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#1A3153] flex items-center gap-1.5">
                <BookOpen size={15} className="text-[#E09B30]" />
                <span>{t.microLearning.d1ReadingTitle}</span>
              </h4>
              <p className="font-inter text-xs sm:text-sm text-[#4A5568] leading-relaxed">
                {isEs
                  ? `Para avanzar hacia tu objetivo "${personalObjective}", los hablantes de nivel ${targetLevel} estructuran sus respuestas utilizando colocaciones de alta frecuencia. Escucha y repite en voz alta las siguientes colocaciones clave:`
                  : `To achieve your milestone "${personalObjective}", high-level speakers articulate their thoughts using natural collocations. Listen and repeat aloud these target collocations:`}
              </p>

              {/* Interactive Audio Collocation Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {activeDayData.collocations.map((colloc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7] shadow-sm flex items-center justify-between gap-2 hover:border-[#E09B30] transition-colors"
                  >
                    <span className="font-mono text-xs font-bold text-[#1A3153] truncate">
                      "{colloc}"
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlayCollocation(colloc)}
                      className="p-1.5 rounded-lg bg-[#1A3153] text-[#E09B30] hover:bg-[#E09B30] hover:text-[#1A3153] transition-colors cursor-pointer shrink-0"
                      title="Pronounce with native audio"
                    >
                      <Volume2 size={14} className={playingCollocation === colloc ? 'animate-bounce' : ''} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Highlight */}
            <div className="p-3.5 rounded-2xl bg-[#E09B30]/15 border border-[#E09B30]/40 text-xs text-[#1A3153] flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#E09B30] shrink-0" />
              <span><strong>{isEs ? 'Consejo de Teacher Ivan:' : 'Teacher Ivan’s Tip:'}</strong> {activeDayData.highlight}</span>
            </div>

            <button
              type="button"
              id="d1-mark-complete-btn"
              onClick={() => completeStage(0)}
              className="py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#10b981] hover:bg-[#059669] text-[#FAFAFA] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>{t.microLearning.d1MarkDone}</span>
            </button>
          </div>
        )}

        {/* ======================================================================= */}
        {/* DAY 2: STRUCTURAL PROCESSING — GRAMMAR & SYNTAX MINI-GAME               */}
        {/* ======================================================================= */}
        {selectedDay === 1 && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-[#A7C7E7]/50 space-y-4">
              <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#1A3153] flex items-center gap-1.5">
                <Gamepad2 size={16} className="text-[#E09B30]" />
                <span>{t.microLearning.d2GrammarTitle}</span>
              </h4>

              <p className="font-inter text-xs sm:text-sm text-[#4A5568]">
                {isEs
                  ? 'Selecciona el conector formal adecuado para estructurar una respuesta persuasiva:'
                  : 'Select the proper formal connector to articulate a persuasive executive narrative:'}
              </p>

              {/* Challenge Box */}
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7] font-inter text-sm text-[#1A3153] leading-relaxed">
                "Our team encountered severe scalability bottlenecks; <strong>[ _____ ]</strong>, we spearheaded a modular migration that subsequently reduced latency by 40%."
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['subsequently', 'nevertheless', 'whereas', 'on the other hand'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setD2SelectedOption(opt);
                      if (opt === 'subsequently') {
                        setD2Feedback(isEs ? '¡Correcto! "Subsequently" denota consecuencia y resultado cronológico formal.' : 'Correct! "Subsequently" denotes chronological outcome and quantifiable impact.');
                      } else {
                        setD2Feedback(isEs ? 'Intenta de nuevo: ese conector indica contraste, no consecuencia directa.' : 'Try again: that connector expresses contrast rather than direct consequence.');
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-montserrat font-bold transition-all cursor-pointer ${
                      d2SelectedOption === opt
                        ? opt === 'subsequently'
                          ? 'bg-[#10b981] text-[#FAFAFA] border-[#10b981]'
                          : 'bg-red-500 text-[#FAFAFA] border-red-500'
                        : 'bg-[#FAFAFA] text-[#1A3153] border-[#A7C7E7] hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {d2Feedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    d2SelectedOption === 'subsequently'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  }`}
                >
                  <Sparkles size={14} className="shrink-0" />
                  <span>{d2Feedback}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              id="d2-mark-complete-btn"
              onClick={() => {
                completeStage(1);
                setD2Feedback(isEs ? '¡Día 2 validado y completado! ✓ (+25 XP)' : 'Day 2 validated and completed! ✓ (+25 XP)');
              }}
              className="py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#10b981] hover:bg-[#059669] text-[#FAFAFA] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>{t.microLearning.d2MarkDone}</span>
            </button>
          </div>
        )}

        {/* ======================================================================= */}
        {/* DAY 3: ORAL SIMULATION — TARGET ROLEPLAY PRESET                         */}
        {/* ======================================================================= */}
        {selectedDay === 2 && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-[#A7C7E7]/50 space-y-4">
              <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#1A3153] flex items-center gap-1.5">
                <Mic size={16} className="text-[#E09B30]" />
                <span>{t.microLearning.d3OralTitle}</span>
              </h4>

              <div className="p-4 rounded-xl bg-[#1A3153] text-[#FAFAFA] border border-[#E09B30]/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#E09B30] font-montserrat font-bold uppercase tracking-wider">
                  <span>Preset: {activeDayData.preset}</span>
                  <span>90s – 3 min</span>
                </div>
                <h5 className="font-montserrat font-extrabold text-base text-[#FAFAFA]">
                  {activeDayData.title}
                </h5>
                <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
                  {isEs
                    ? `Activa el simulador de voz de Gemini Live. Practica responder con naturalidad aplicando las colocaciones de la semana: ${activeDayData.collocations.join(', ')}.`
                    : `Launch Gemini Live native voice tutor. Speak freely applying your weekly collocations: ${activeDayData.collocations.join(', ')}.`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  id="d3-launch-simulator-btn"
                  onClick={handleLaunchTargetSimulator}
                  className="w-full sm:w-auto py-3.5 px-7 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all shadow-lg shadow-[#E09B30]/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mic size={16} />
                  <span>{t.microLearning.d3LaunchBtn}</span>
                </button>

                <button
                  type="button"
                  id="d3-mark-complete-btn"
                  onClick={() => completeStage(2)}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-slate-200 hover:bg-slate-300 text-[#1A3153] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>{isEs ? 'Marcar Completado (+25 XP)' : 'Mark Complete (+25 XP)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* DAY 4: FUNCTIONAL WRITING — PERSONALIZED PROMPT                         */}
        {/* ======================================================================= */}
        {selectedDay === 3 && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-[#A7C7E7]/50 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#1A3153] flex items-center gap-1.5">
                  <PenTool size={16} className="text-[#E09B30]" />
                  <span>{t.microLearning.d4WritingTitle}</span>
                </h4>
                <span
                  className={`font-mono text-xs font-bold ${
                    isWritingValid
                      ? 'text-[#10b981]'
                      : wordCount > 0
                      ? 'text-[#E09B30]'
                      : 'text-[#4A5568]'
                  }`}
                >
                  {wordCount} {t.microLearning.wordCount} ({t.microLearning.minWords})
                </span>
              </div>

              {/* Tailored Prompt Box */}
              <div className="p-4 rounded-xl bg-[#E09B30]/15 border border-[#E09B30]/40 text-xs text-[#1A3153] space-y-1">
                <span className="font-montserrat font-bold text-[#1A3153] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <Sparkles size={13} className="text-[#E09B30]" />
                  <span>{isEs ? 'Consigna Personalizada de Teacher Ivan:' : 'Teacher Ivan’s Custom Prompt:'}</span>
                </span>
                <p className="font-inter text-xs leading-relaxed text-[#1A3153]">
                  {activeDayData.writingPrompt}
                </p>
              </div>

              <textarea
                id="sprint-day4-inline-writing-input"
                rows={4}
                value={localWriting}
                onChange={(e) => setLocalWriting(e.target.value)}
                placeholder={t.microLearning.writingPlaceholder}
                className="w-full p-3.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30] resize-y leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                {writingStatus ? (
                  <span className="text-xs font-bold text-[#10b981]">{writingStatus}</span>
                ) : (
                  <p className="text-[11px] text-[#4A5568]">
                    {isEs
                      ? 'Tu redacción se incluirá en tu reporte semanal para Teacher Ivan.'
                      : 'Your writing sample will be sent in your weekly report to Teacher Ivan.'}
                  </p>
                )}

                <button
                  type="button"
                  id="submit-day4-writing-btn"
                  onClick={handleSaveWriting}
                  disabled={!localWriting.trim()}
                  className="py-3 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Send size={14} />
                  <span>{t.microLearning.d4SubmitBtn}</span>
                </button>
              </div>

              {day4Feedback && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <span className="font-montserrat font-bold block">
                    {isEs ? 'Evaluación de Redacción:' : 'Writing Critique:'}
                  </span>
                  <p className="font-inter">{day4Feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* DAY 5: WEEKLY CLOSURE & WHATSAPP REPORT SUBMISSION                      */}
        {/* ======================================================================= */}
        {selectedDay === 4 && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-[#A7C7E7]/50 space-y-4">
              <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#1A3153] flex items-center gap-1.5">
                <Award size={16} className="text-[#E09B30]" />
                <span>{t.microLearning.d5ClosureTitle}</span>
              </h4>

              {/* Weekly Scorecard Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7] text-center">
                  <span className="text-[10px] font-montserrat font-bold uppercase text-[#4A5568] block mb-1">
                    {isEs ? 'Hábito' : 'Habit'}
                  </span>
                  <span className="font-montserrat font-black text-xl text-[#10b981]">
                    {completedStages.length}/5 {isEs ? 'Días' : 'Days'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7] text-center">
                  <span className="text-[10px] font-montserrat font-bold uppercase text-[#4A5568] block mb-1">
                    XP Total
                  </span>
                  <span className="font-montserrat font-black text-xl text-[#E09B30]">
                    +{totalXp} XP
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7] text-center">
                  <span className="text-[10px] font-montserrat font-bold uppercase text-[#4A5568] block mb-1">
                    {isEs ? 'Nivel MCER' : 'CEFR Band'}
                  </span>
                  <span className="font-montserrat font-black text-xl text-[#1A3153]">
                    {targetLevel}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7] text-center">
                  <span className="text-[10px] font-montserrat font-bold uppercase text-[#4A5568] block mb-1">
                    {isEs ? 'Redacción' : 'Writing'}
                  </span>
                  <span className="font-montserrat font-black text-xl text-[#10b981]">
                    {completedStages.includes(3) ? '✓ 100%' : 'Pendiente'}
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp Action to Teacher Ivan (+591 72878330) */}
              <div className="pt-2">
                <a
                  id="send-whatsapp-sprint-report-btn"
                  href={generateWhatsAppReportMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => completeStage(4)}
                  className="w-full py-4 px-6 rounded-full font-montserrat font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#10b981] hover:bg-[#059669] text-[#FAFAFA] transition-all shadow-xl shadow-[#10b981]/25 flex items-center justify-center gap-2.5 cursor-pointer text-center"
                >
                  <MessageCircle size={18} />
                  <span>{t.microLearning.d5WhatsAppBtn}</span>
                </a>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={openReportModal}
                className="text-xs text-[#E09B30] hover:underline font-montserrat font-bold flex items-center gap-1 cursor-pointer"
              >
                <BarChart3 size={14} />
                <span>{t.sprintDashboard.viewWeeklyReport}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklySprintDashboard;
