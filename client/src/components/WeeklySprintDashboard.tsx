import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  User,
  PenTool,
  Send,
  Award,
  BookOpen,
  Gamepad2,
  Mic,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { useSprintStore, CEFRLevel, ScenarioId, Competency } from '../modules/sprint/sprintStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useTranslation } from '../modules/i18n/languageStore';

export const WeeklySprintDashboard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t, isEs } = useTranslation();
  const {
    profile,
    updateProfile,
    completedStages,
    completeStage,
    day4Writing,
    day4Feedback,
    saveDay4Writing,
    openReportModal,
    totalXp,
  } = useSprintStore();

  const setActiveView = useNavigationStore((s) => s.setActiveView);
  const selectScenario = useTeachingStore((s) => s.selectScenario);

  const [isExpanded, setIsExpanded] = useState(!compact);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [localWriting, setLocalWriting] = useState(day4Writing || '');
  const [writingStatus, setWritingStatus] = useState<string | null>(null);

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
        ? `Texto amplio (${wordCount} palabras). Excelente esfuerzo; en comunicación profesional, busca concisión (<120 palabras).`
        : `Detailed text (${wordCount} words). Great effort; in executive communication, aim for conciseness (<120 words).`;
    } else {
      feedback = isEs
        ? `¡Excelente longitud (${wordCount} palabras)! Sintaxis fluida, tono profesional y vocabulario adecuado para tu nivel ${profile.cefrLevel}.`
        : `Optimal length (${wordCount} words)! Clean syntax, professional tone, and vocabulary well-suited for CEFR ${profile.cefrLevel}.`;
    }

    saveDay4Writing(localWriting, feedback);
    setWritingStatus(isEs ? '¡Entregado con éxito! Día 4 completado ✓' : 'Submitted successfully! Day 4 completed ✓');
    setTimeout(() => setWritingStatus(null), 4000);
  };

  const handleGoToSimulator = () => {
    selectScenario(profile.focusScenario);
    setActiveView('simulator');
    completeStage(2); // Complete Day 3
  };

  const handleGoToResources = () => {
    setActiveView('resources');
  };

  const handleGoToGames = () => {
    setActiveView('games');
  };

  const stages = [
    {
      id: 0,
      label: 'D1',
      title: t.sprintDashboard.stage1,
      desc: t.sprintDashboard.stage1Desc,
      icon: BookOpen,
      actionText: t.sprintDashboard.goToResources,
      action: handleGoToResources,
    },
    {
      id: 1,
      label: 'D2',
      title: t.sprintDashboard.stage2,
      desc: t.sprintDashboard.stage2Desc,
      icon: Gamepad2,
      actionText: t.sprintDashboard.goToGames,
      action: handleGoToGames,
    },
    {
      id: 2,
      label: 'D3',
      title: t.sprintDashboard.stage3,
      desc: t.sprintDashboard.stage3Desc,
      icon: Mic,
      actionText: t.sprintDashboard.goToSimulator,
      action: handleGoToSimulator,
    },
    {
      id: 3,
      label: 'D4',
      title: t.sprintDashboard.stage4,
      desc: t.sprintDashboard.stage4Desc,
      icon: PenTool,
      actionText: isEs ? 'Escribir aquí ↓' : 'Write below ↓',
      action: () => setIsExpanded(true),
    },
    {
      id: 4,
      label: 'D5',
      title: t.sprintDashboard.stage5,
      desc: t.sprintDashboard.stage5Desc,
      icon: Award,
      actionText: t.sprintDashboard.viewWeeklyReport,
      action: () => {
        completeStage(4);
        openReportModal();
      },
    },
  ];

  return (
    <section
      id="weekly-sprint-dashboard"
      className="w-full bg-gradient-to-r from-[#1A3153] via-[#12223a] to-[#1A3153] border-b border-[#A7C7E7]/30 shadow-xl transition-all"
      aria-label="Weekly Habit Sprint Dashboard"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Top Summary Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-[#E09B30]/20 border border-[#E09B30]/40 flex items-center justify-center text-[#E09B30] flex-shrink-0">
              <Calendar size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-montserrat font-extrabold text-sm sm:text-base text-[#FAFAFA]">
                  {t.sprintDashboard.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] text-[11px] font-bold">
                  {completedStages.length}/5 {isEs ? 'Completados' : 'Done'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#E09B30]/20 text-[#E09B30] text-[11px] font-bold">
                  +{totalXp} XP
                </span>
              </div>
              <p className="font-inter text-xs text-[#A7C7E7] truncate">
                {profile.studentName} • {profile.cefrLevel} • {profile.focusScenario}
              </p>
            </div>
          </div>

          {/* Quick Actions & Accordion Toggle */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              id="dashboard-open-report-btn"
              type="button"
              onClick={openReportModal}
              className="py-1.5 px-3.5 rounded-xl bg-[#E09B30] hover:bg-[#c88624] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <BarChart3 size={14} />
              <span>{t.sprintDashboard.viewWeeklyReport}</span>
            </button>

            <button
              id="dashboard-toggle-expand-btn"
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-[#1A3153] hover:bg-[#A7C7E7]/20 border border-[#A7C7E7]/25 text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors cursor-pointer"
              aria-label="Toggle Sprint Details"
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="mt-5 pt-5 border-t border-[#A7C7E7]/20 flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Student Profile Quick Settings Strip */}
            <div className="p-4 rounded-2xl bg-[#12223a]/90 border border-[#A7C7E7]/20 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#A7C7E7]/15 flex items-center justify-center text-[#A7C7E7]">
                  <User size={16} />
                </div>
                <div>
                  <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#FAFAFA]">
                    {t.sprintDashboard.studentProfile}
                  </h4>
                  <p className="font-inter text-xs text-[#A7C7E7]">
                    {isEs
                      ? 'Personaliza tu nivel y objetivo para que el sprint adapte lecturas y ejercicios a tu medida.'
                      : 'Customize your target level and scenario to align daily micro-lessons with your real goals.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-end w-full md:w-auto">
                {isEditingProfile ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      value={profile.studentName}
                      onChange={(e) => updateProfile({ studentName: e.target.value })}
                      placeholder="Tu nombre"
                      className="px-2.5 py-1 text-xs rounded-lg bg-[#1A3153] border border-[#A7C7E7]/40 text-[#FAFAFA] focus:outline-none focus:border-[#E09B30]"
                    />

                    <select
                      value={profile.cefrLevel}
                      onChange={(e) => updateProfile({ cefrLevel: e.target.value as CEFRLevel })}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[#1A3153] border border-[#A7C7E7]/40 text-[#FAFAFA] focus:outline-none"
                    >
                      <option value="A1">A1 (Beginner)</option>
                      <option value="A2">A2 (Elementary)</option>
                      <option value="B1">B1 (Intermediate)</option>
                      <option value="B2">B2 (Upper-Int)</option>
                      <option value="C1">C1 (Advanced)</option>
                    </select>

                    <select
                      value={profile.focusScenario}
                      onChange={(e) => updateProfile({ focusScenario: e.target.value as ScenarioId })}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[#1A3153] border border-[#A7C7E7]/40 text-[#FAFAFA] focus:outline-none"
                    >
                      <option value="daily-routine">Daily Routine (A1–A2)</option>
                      <option value="scholarship-interview">Scholarship (B1–B2)</option>
                      <option value="tech-interview">Tech Interview (B2–C1)</option>
                      <option value="ielts-academic">IELTS Prep (C1)</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1 rounded-lg bg-[#E09B30] text-[#1A3153] text-xs font-bold font-montserrat cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="text-xs text-[#E09B30] hover:underline font-semibold cursor-pointer"
                  >
                    ✏️ {isEs ? 'Editar Perfil & Nivel' : 'Edit Profile & Goals'}
                  </button>
                )}
              </div>
            </div>

            {/* 5 Daily Stages Horizontal Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {stages.map((stage) => {
                const Icon = stage.icon;
                const isCompleted = completedStages.includes(stage.id);

                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCompleted
                        ? 'bg-[#10b981]/10 border-[#10b981]/40 shadow-sm'
                        : 'bg-[#12223a]/70 border-[#A7C7E7]/20 hover:border-[#A7C7E7]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className={`font-montserrat font-extrabold text-[11px] px-2 py-0.5 rounded-full ${
                            isCompleted ? 'bg-[#10b981] text-[#1A3153]' : 'bg-[#FAFAFA]/10 text-[#A7C7E7]'
                          }`}
                        >
                          {stage.label}
                        </span>

                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#10b981]">
                            <CheckCircle2 size={13} />
                            <span>{isEs ? 'Listo' : 'Done'}</span>
                          </span>
                        )}
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-[#FAFAFA]/10 flex items-center justify-center text-[#E09B30] mb-2">
                        <Icon size={16} />
                      </div>

                      <h4 className="font-montserrat font-bold text-xs text-[#FAFAFA] mb-1 leading-snug">
                        {stage.title}
                      </h4>
                      <p className="font-inter text-[11px] text-[#A7C7E7] leading-relaxed mb-3">
                        {stage.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={stage.action}
                      className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-montserrat font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981]'
                          : 'bg-[#1A3153] hover:bg-[#E09B30] hover:text-[#1A3153] text-[#A7C7E7] border border-[#A7C7E7]/25'
                      }`}
                    >
                      <span>{stage.actionText}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Embedded Day 4 Writing Interactive Box */}
            <div className="p-5 rounded-2xl bg-[#12223a]/80 border border-[#A7C7E7]/25 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PenTool size={16} className="text-[#E09B30]" />
                  <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#FAFAFA]">
                    {t.sprintDashboard.stage4} — {isEs ? 'Práctica de Escritura Guiada' : 'Interactive Writing Prompt'}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`font-mono font-semibold ${
                      isWritingValid
                        ? 'text-[#10b981]'
                        : wordCount > 0
                        ? 'text-[#E09B30]'
                        : 'text-[#A7C7E7]'
                    }`}
                  >
                    {wordCount} {t.sprintDashboard.wordCount} ({t.sprintDashboard.minWords})
                  </span>
                </div>
              </div>

              <textarea
                id="sprint-day4-writing-input"
                rows={3}
                value={localWriting}
                onChange={(e) => setLocalWriting(e.target.value)}
                placeholder={t.sprintDashboard.writingPlaceholder}
                className="w-full p-3 text-xs sm:text-sm rounded-xl bg-[#1A3153] border border-[#A7C7E7]/30 text-[#FAFAFA] placeholder-[#A7C7E7]/50 focus:outline-none focus:border-[#E09B30] resize-y"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                {writingStatus ? (
                  <span className="text-xs font-bold text-[#10b981] animate-in fade-in">
                    {writingStatus}
                  </span>
                ) : (
                  <p className="text-[11px] text-[#A7C7E7]/80">
                    {isEs
                      ? 'Tu texto será incluido en el reporte semanal para Teacher Ivan.'
                      : 'Your writing sample will be attached to your weekly pedagogical report.'}
                  </p>
                )}

                <button
                  id="save-day4-writing-btn"
                  type="button"
                  onClick={handleSaveWriting}
                  disabled={!localWriting.trim()}
                  className="py-2 px-4 rounded-xl bg-[#E09B30] hover:bg-[#c88624] disabled:opacity-50 text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send size={13} />
                  <span>{t.sprintDashboard.saveWriting}</span>
                </button>
              </div>

              {day4Feedback && (
                <div className="p-3 rounded-xl bg-[#1A3153]/70 border border-[#E09B30]/30 text-xs text-[#FAFAFA] space-y-1">
                  <span className="font-bold text-[#E09B30] block">
                    {t.sprintDashboard.writingFeedbackTitle}
                  </span>
                  <p className="font-inter text-[#A7C7E7]">{day4Feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WeeklySprintDashboard;
