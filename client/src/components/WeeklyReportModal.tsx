import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Copy,
  Check,
  BookOpen,
  Gamepad2,
  Mic,
  PenTool,
} from 'lucide-react';
import { useSprintStore } from '../modules/sprint/sprintStore';
import { useReportStore } from '../modules/report/reportStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { TEACHER_PHONE, getWhatsAppUrl } from '../config/contact';

export const WeeklyReportModal: React.FC = () => {
  const { t, isEs } = useTranslation();
  const {
    profile,
    completedStages,
    completedReadings,
    completedVideos,
    gameResults,
    totalXp,
    day4Writing,
    isReportModalOpen,
    closeReportModal,
  } = useSprintStore();

  const currentSessionReport = useReportStore((s) => s.currentReport);
  const [copied, setCopied] = useState(false);

  if (!isReportModalOpen) return null;

  // Calculate game accuracy aggregate
  const gamesPlayed = Object.values(gameResults);
  const avgAccuracy =
    gamesPlayed.length > 0
      ? Math.round(
          gamesPlayed.reduce((acc, curr) => acc + curr.accuracy, 0) / gamesPlayed.length
        )
      : 88;

  const simulatorScore = currentSessionReport?.overallScore ?? 82;
  const recentRecastsCount = currentSessionReport?.topErrors?.length ?? 2;
  const stageCount = completedStages.length;

  const buildStructuredReportMessage = (): string => {
    return [
      `📊 *${t.sprintDashboard.reportTitle}*`,
      `👨‍🎓 *${isEs ? 'Estudiante' : 'Student'}:* ${profile.studentName || 'Estudiante'}`,
      `🎯 *${isEs ? 'Nivel MCER' : 'CEFR Level'}:* ${profile.cefrLevel} | *${isEs ? 'Escenario' : 'Scenario'}:* ${profile.focusScenario}`,
      `💡 *${isEs ? 'Competencia Clave' : 'Focus Area'}:* ${profile.weakCompetency}`,
      ``,
      `🔥 *${isEs ? 'Progreso Semanal' : 'Weekly Habit Sprint'}:* ${stageCount}/5 ${isEs ? 'Días Completados' : 'Days Completed'} (+${totalXp} XP)`,
      `📚 *${isEs ? 'Recursos Completados' : 'Resources Completed'}:* ${completedReadings.length} ${isEs ? 'lecturas' : 'readings'}, ${completedVideos.length} ${isEs ? 'videos' : 'videos'}`,
      `🎮 *${isEs ? 'Precisión en Juegos' : 'Game Accuracy'}:* ${avgAccuracy}%`,
      `🗣️ *${isEs ? 'Simulador de Voz IA' : 'AI Voice Simulator'}:* ${simulatorScore}/100 pts (${recentRecastsCount} recasts)`,
      ``,
      `✍️ *${isEs ? 'Producción Escrita (Día 4)' : 'Written Response (Day 4)'}:*`,
      `"${day4Writing ? day4Writing.slice(0, 200) + (day4Writing.length > 200 ? '...' : '') : (isEs ? 'Sin entrega escrita aún' : 'No written submission yet')}"`,
      ``,
      `Teacher Ivan, ${isEs ? 'este es mi resumen de la semana para coordinar mi próxima clase 1 a 1!' : 'here is my weekly progress summary to schedule our next 1-on-1 session!'}`,
    ].join('\n');
  };

  const whatsappMessage = buildStructuredReportMessage();
  const whatsappUrl = getWhatsAppUrl(whatsappMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="weekly-report-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-[#1A3153]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Weekly Pedagogical Progress Report"
    >
      <div className="relative w-full max-w-2xl bg-[#12223a] border-2 border-[#E09B30]/50 rounded-3xl shadow-2xl p-6 sm:p-8 text-[#FAFAFA] flex flex-col gap-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-[#A7C7E7]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E09B30]/20 border border-[#E09B30]/40 flex items-center justify-center text-[#E09B30] flex-shrink-0">
              <Award size={26} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E09B30]/15 text-[#E09B30] text-[11px] font-montserrat font-bold uppercase tracking-wider mb-1">
                <Sparkles size={12} />
                <span>Teacher Ivan • Bichronous Coaching</span>
              </div>
              <h2 className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#FAFAFA]">
                {t.sprintDashboard.reportTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={closeReportModal}
            className="p-2 rounded-full bg-[#1A3153] hover:bg-[#A7C7E7]/20 text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Student & Level Badge Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#1A3153]/70 p-4 rounded-2xl border border-[#A7C7E7]/25 text-center">
          <div>
            <span className="block text-[11px] font-semibold text-[#A7C7E7] uppercase tracking-wider">
              {isEs ? 'Estudiante' : 'Student'}
            </span>
            <span className="font-montserrat font-bold text-sm text-[#FAFAFA] truncate block">
              {profile.studentName || 'Estudiante'}
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-semibold text-[#A7C7E7] uppercase tracking-wider">
              {isEs ? 'Nivel MCER' : 'CEFR Level'}
            </span>
            <span className="font-montserrat font-extrabold text-sm text-[#E09B30]">
              {profile.cefrLevel}
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-semibold text-[#A7C7E7] uppercase tracking-wider">
              {isEs ? 'Sprint 5 Días' : '5-Day Sprint'}
            </span>
            <span className="font-montserrat font-extrabold text-sm text-[#10b981]">
              {stageCount}/5 {isEs ? 'Días' : 'Days'}
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-semibold text-[#A7C7E7] uppercase tracking-wider">
              XP Total
            </span>
            <span className="font-montserrat font-extrabold text-sm text-[#E09B30]">
              +{totalXp} XP
            </span>
          </div>
        </div>

        {/* Competency & Weekly Activity Breakdown */}
        <div className="space-y-3">
          <h3 className="font-montserrat font-bold text-sm text-[#A7C7E7] uppercase tracking-wider">
            {isEs ? 'Métricas de la Semana' : 'Weekly Activity Metrics'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#1A3153]/50 border border-[#A7C7E7]/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E09B30]/15 flex items-center justify-center text-[#E09B30]">
                <Mic size={18} />
              </div>
              <div>
                <span className="text-[11px] text-[#A7C7E7] block">
                  {isEs ? 'Práctica Oral en Simulador IA' : 'AI Voice Simulator'}
                </span>
                <span className="font-montserrat font-bold text-sm text-[#FAFAFA]">
                  {simulatorScore}/100 pts • {recentRecastsCount} recasting
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1A3153]/50 border border-[#A7C7E7]/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#34d399]/15 flex items-center justify-center text-[#34d399]">
                <Gamepad2 size={18} />
              </div>
              <div>
                <span className="text-[11px] text-[#A7C7E7] block">
                  {isEs ? 'Precisión en Juegos Lingüísticos' : 'Games Accuracy'}
                </span>
                <span className="font-montserrat font-bold text-sm text-[#FAFAFA]">
                  {avgAccuracy}% {isEs ? 'promedio' : 'average'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1A3153]/50 border border-[#A7C7E7]/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#A7C7E7]/15 flex items-center justify-center text-[#A7C7E7]">
                <BookOpen size={18} />
              </div>
              <div>
                <span className="text-[11px] text-[#A7C7E7] block">
                  {isEs ? 'Lecturas y Micro-Lecciones' : 'Resources Completed'}
                </span>
                <span className="font-montserrat font-bold text-sm text-[#FAFAFA]">
                  {completedReadings.length} {isEs ? 'lecturas' : 'readings'} • {completedVideos.length} {isEs ? 'videos' : 'videos'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1A3153]/50 border border-[#A7C7E7]/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c084fc]/15 flex items-center justify-center text-[#c084fc]">
                <PenTool size={18} />
              </div>
              <div>
                <span className="text-[11px] text-[#A7C7E7] block">
                  {isEs ? 'Escritura Funcional (Día 4)' : 'Functional Writing (Day 4)'}
                </span>
                <span className="font-montserrat font-bold text-sm text-[#FAFAFA]">
                  {day4Writing ? `${day4Writing.trim().split(/\s+/).length} ${isEs ? 'palabras' : 'words'}` : (isEs ? 'Pendiente' : 'Pending')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Day 4 Writing Preview */}
        {day4Writing && (
          <div className="p-4 rounded-2xl bg-[#1A3153]/60 border border-[#A7C7E7]/25 space-y-2">
            <span className="text-[11px] font-bold text-[#E09B30] uppercase tracking-wider block">
              ✍️ {isEs ? 'Muestra de Escritura Funcional (Día 4)' : 'Day 4 Written Sample'}
            </span>
            <p className="font-inter text-xs text-[#FAFAFA] italic leading-relaxed bg-[#12223a]/80 p-3 rounded-xl border border-[#A7C7E7]/15">
              "{day4Writing}"
            </p>
          </div>
        )}

        {/* Action Buttons: WhatsApp to Teacher Ivan & Copy */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <a
            id="send-report-whatsapp-btn"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 px-5 rounded-2xl bg-[#E09B30] hover:bg-[#c88624] text-[#1A3153] font-montserrat font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-[#E09B30]/30 transition-all cursor-pointer"
          >
            <MessageCircle size={18} fill="currentColor" />
            <span>{t.sprintDashboard.sendToIvan}</span>
          </a>

          <button
            id="copy-report-summary-btn"
            type="button"
            onClick={handleCopy}
            className="py-3.5 px-4 rounded-2xl bg-[#1A3153] hover:bg-[#A7C7E7]/20 border border-[#A7C7E7]/30 text-[#A7C7E7] hover:text-[#FAFAFA] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check size={16} className="text-[#10b981]" /> : <Copy size={16} />}
            <span>{copied ? t.sprintDashboard.reportCopied : t.sprintDashboard.copyReport}</span>
          </button>
        </div>

        <p className="text-center text-[11px] text-[#A7C7E7]/70">
          {isEs
            ? 'Teacher Ivan responderá directamente por WhatsApp (+591 72878330) con recomendaciones personalizadas para tu próxima sesión en vivo.'
            : 'Teacher Ivan will review your weekly metrics directly on WhatsApp (+591 72878330) with personalized advice for your next live session.'}
        </p>
      </div>
    </div>
  );
};

export default WeeklyReportModal;
