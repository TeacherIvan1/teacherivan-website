import React, { useEffect } from 'react';
import {
  Sparkles,
  Award,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  X,
  Play,
  Clock,
  MessageSquare,
  BookOpen,
  ArrowRight,
  ExternalLink,
  BarChart3,
} from 'lucide-react';
import { useReportStore } from '../modules/report/reportStore';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { getWhatsAppUrl } from '../config/contact';

export const StudentReportModal: React.FC = () => {
  const {
    isModalOpen,
    isGenerating,
    currentReport,
    tooShortNotice,
    error,
    isRateLimited,
    retryGeneration,
    dismissReport,
  } = useReportStore();

  const startSession = useConversationStore((s) => s.startSession);
  const setCustomExerciseScenario = useTeachingStore((s) => s.setCustomExerciseScenario);
  const { t } = useTranslation();

  // Handle escape key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        dismissReport();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, dismissReport]);

  if (!isModalOpen) {
    return null;
  }

  const handlePracticeAgain = () => {
    if (currentReport?.nextExercise) {
      setCustomExerciseScenario(currentReport.nextExercise);
    }
    dismissReport();
    const startBtn = document.getElementById('start-session-btn');
    if (startBtn) {
      startBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    startSession();
  };

  const handleEnrollInPlan = (whatsappMessage?: string) => {
    dismissReport();
    // 1. Scroll to pricing plans section
    const plansSection = document.getElementById('pricing-plans-section');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 2. Open WhatsApp if pre-filled message is provided
    if (whatsappMessage) {
      const url = getWhatsAppUrl(whatsappMessage);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const topErrors = currentReport?.topErrors?.slice(0, 3) || [];
  const vocabItems = currentReport?.vocabularyUsed || [];

  // Fallback defaults for score and competencies if session report was generated before or externally
  const overallScore = currentReport?.overallScore ?? 75;
  const cefrBand = currentReport?.cefrLevel ?? (currentReport?.level === 'beginner' ? 'A2' : currentReport?.level === 'advanced' ? 'C1' : 'B1');
  const competencies = currentReport?.competencies ?? {
    discourseFluency: 78,
    syntacticControl: 72,
    lexicalPrecision: 74,
    phonologicalControl: 76,
  };
  const plan = currentReport?.recommendedPlan;

  return (
    <div
      id="student-report-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-[#1A3153]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-report-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isGenerating) {
          dismissReport();
        }
      }}
    >
      <div
        id="student-report-modal-card"
        className="relative w-full max-w-2xl bg-[#FAFAFA] text-[#1A3153] border-2 border-[#A7C7E7] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1A3153] to-[#12223a] text-[#FAFAFA] border-b border-[#A7C7E7]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E09B30]/20 border border-[#E09B30] flex items-center justify-center text-[#E09B30]">
              <Sparkles size={16} />
            </div>
            <div>
              <h2
                id="student-report-title"
                className="font-montserrat font-bold text-base sm:text-lg tracking-tight"
              >
                {t.studentModal.title}
              </h2>
              {currentReport && (
                <p className="text-xs text-[#A7C7E7]">
                  {currentReport.scenarioTitle} • {currentReport.scenarioCategory}
                </p>
              )}
            </div>
          </div>

          <button
            id="close-student-report-btn"
            onClick={dismissReport}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30]"
            aria-label={t.studentModal.closeBtn}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* 1. Loading State */}
          {isGenerating && (
            <div
              id="student-report-loading"
              className="py-12 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#A7C7E7]/30 border-t-[#E09B30] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[#E09B30]">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-montserrat font-bold text-lg text-[#1A3153]">
                  {t.studentModal.analyzingTitle}
                </h3>
                <p className="font-inter text-sm text-[#4A5568] leading-relaxed">
                  {t.studentModal.analyzingSubtitle}
                </p>
              </div>
            </div>
          )}

          {/* 2. Session Too Short Notice */}
          {!isGenerating && tooShortNotice && (
            <div
              id="student-report-too-short"
              className="py-8 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/40 flex items-center justify-center text-[#E09B30]">
                <Clock size={24} />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-montserrat font-bold text-lg text-[#1A3153]">
                  {t.studentModal.tooShortTitle}
                </h3>
                <p className="font-inter text-sm text-[#4A5568] leading-relaxed">
                  {tooShortNotice || t.studentModal.tooShortDesc}
                </p>
              </div>
            </div>
          )}

          {/* 3. Error Notice */}
          {!isGenerating && error && (
            <div
              id="student-report-error"
              className="py-8 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-600">
                <AlertCircle size={24} />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-montserrat font-bold text-lg text-red-700">
                  {t.studentModal.errorTitle}
                </h3>
                <p className="font-inter text-sm text-[#4A5568] leading-relaxed">
                  {error}
                </p>
                {isRateLimited && (
                  <p className="text-xs text-[#E09B30] font-medium">
                    {t.report.rateLimitTitle}
                  </p>
                )}
              </div>
              <button
                id="retry-report-generation-btn"
                onClick={retryGeneration}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#1A3153] text-[#FAFAFA] hover:bg-[#12223a] transition-all"
              >
                <RefreshCw size={14} />
                <span>{t.studentModal.retryBtn}</span>
              </button>
            </div>
          )}

          {/* 4. Complete Analytical Report Content */}
          {!isGenerating && !tooShortNotice && !error && currentReport && (
            <>
              {/* Overall CEFR Score & Band Card */}
              <div
                id="cefr-overall-score-card"
                className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1A3153] via-[#1A3153] to-[#12223a] text-[#FAFAFA] border border-[#A7C7E7]/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-[#FAFAFA]/10 border-2 border-[#E09B30] shadow-inner">
                    <span className="font-montserrat font-extrabold text-3xl text-[#FAFAFA]">
                      {overallScore}
                    </span>
                    <span className="absolute bottom-1.5 text-[9px] uppercase tracking-wider font-semibold text-[#A7C7E7]">
                      / 100
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-[#A7C7E7] mb-1">
                      {t.studentModal.overallScore}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#E09B30] text-[#1A3153] text-sm font-montserrat font-extrabold tracking-wider shadow-sm">
                        CEFR {cefrBand}
                      </span>
                      <span className="text-xs text-[#FAFAFA]/90 font-medium">
                        {currentReport.level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#A7C7E7]">
                  <span className="flex items-center gap-1.5 bg-[#FAFAFA]/10 px-3 py-1 rounded-full border border-[#A7C7E7]/25">
                    <Clock size={12} className="text-[#E09B30]" />
                    <strong>{currentReport.stats.durationFormatted}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#FAFAFA]/10 px-3 py-1 rounded-full border border-[#A7C7E7]/25">
                    <MessageSquare size={12} className="text-[#E09B30]" />
                    <strong>{currentReport.stats.learnerWords} {t.studentModal.wordsSpoken}</strong>
                  </span>
                </div>
              </div>

              {/* Summary Description */}
              <div className="bg-[#1A3153]/5 rounded-xl p-3.5 border border-[#A7C7E7]/40">
                <p className="font-inter text-xs sm:text-sm text-[#1A3153] leading-relaxed">
                  {currentReport.summary}
                </p>
              </div>

              {/* 4 CEFR Competency Sub-Scores Progress Bars */}
              <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#A7C7E7] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#A7C7E7]/30 pb-2">
                  <h3 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#1A3153] flex items-center gap-1.5">
                    <BarChart3 size={15} className="text-[#E09B30]" />
                    <span>{t.studentModal.competenciesTitle}</span>
                  </h3>
                  <span className="text-[11px] text-[#4A5568] font-semibold">CEFR Rubric</span>
                </div>

                <div className="space-y-2.5">
                  {/* 1. Discourse Fluency */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#1A3153]">{t.studentModal.discourseFluency}</span>
                      <strong className="text-[#1A3153]">{competencies.discourseFluency}/100</strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#1A3153] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${competencies.discourseFluency}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. Syntactic Control */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#1A3153]">{t.studentModal.syntacticControl}</span>
                      <strong className="text-[#1A3153]">{competencies.syntacticControl}/100</strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#E09B30] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${competencies.syntacticControl}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. Lexical Precision */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#1A3153]">{t.studentModal.lexicalPrecision}</span>
                      <strong className="text-[#1A3153]">{competencies.lexicalPrecision}/100</strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#1A3153] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${competencies.lexicalPrecision}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. Phonological Control */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#1A3153]">{t.studentModal.phonologicalControl}</span>
                      <strong className="text-[#1A3153]">{competencies.phonologicalControl}/100</strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#E09B30] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${competencies.phonologicalControl}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 3 Recasts (Side-by-side with #E09B30 highlight) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#1A3153] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#E09B30]" />
                    <span>{t.studentModal.recastsTitle}</span>
                  </h3>
                  <span className="text-[11px] text-[#4A5568] font-medium">
                    {topErrors.length > 0 ? `${topErrors.length} / 3` : ''}
                  </span>
                </div>

                {topErrors.length > 0 ? (
                  <div className="space-y-2">
                    {topErrors.map((err, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7] shadow-xs space-y-2 hover:border-[#E09B30] transition-colors"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {/* What you said */}
                          <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[#4A5568]">
                            <span className="block text-[9px] font-montserrat font-bold uppercase tracking-wider text-[#4A5568]/80 mb-0.5">
                              {t.studentModal.whatYouSaid}
                            </span>
                            <span className="italic line-through decoration-red-400">
                              "{err.original}"
                            </span>
                          </div>

                          {/* Professional English Alternative (#E09B30 highlight) */}
                          <div className="p-2.5 rounded-lg bg-[#E09B30]/10 border-2 border-[#E09B30] text-[#1A3153] font-semibold">
                            <span className="block text-[9px] font-montserrat font-bold uppercase tracking-wider text-[#E09B30] mb-0.5 flex items-center gap-1">
                              <Sparkles size={9} />
                              {t.studentModal.alternativeHeading}
                            </span>
                            <span>"{err.corrected}"</span>
                          </div>
                        </div>

                        {err.explanation && (
                          <p className="text-[11px] text-[#4A5568] px-1 italic">
                            💡 {err.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <div>
                      <strong className="block font-semibold">
                        {t.studentModal.noErrorsTitle}
                      </strong>
                      <span className="text-[11px] text-emerald-700">
                        {t.studentModal.noErrorsDesc}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommended Coaching Plan Card (Dynamic Matching) */}
              {plan && (
                <div
                  id="recommended-coaching-plan-card"
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1A3153] to-[#12223a] text-[#FAFAFA] border-2 border-[#E09B30] shadow-lg space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#A7C7E7]/25 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E09B30] animate-ping" />
                      <span className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-[#E09B30]">
                        {t.studentModal.recommendedPlanTitle}
                      </span>
                    </div>
                    <span className="text-xs font-montserrat font-bold px-2.5 py-0.5 rounded-full bg-[#E09B30]/20 text-[#E09B30] border border-[#E09B30]/40">
                      {plan.priceBob} / {plan.priceUsd}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-montserrat font-extrabold text-lg sm:text-xl text-[#FAFAFA]">
                      {plan.name}
                    </h4>
                    <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] leading-relaxed mt-1">
                      {plan.reason}
                    </p>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                    <button
                      id="enroll-recommended-plan-btn"
                      onClick={() => handleEnrollInPlan(plan.whatsappMessage)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all shadow-md shadow-[#E09B30]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30]"
                    >
                      <span>Inscribirme al {plan.name}</span>
                      <ExternalLink size={13} />
                    </button>

                    <button
                      onClick={() => handleEnrollInPlan()}
                      className="w-full sm:w-auto text-xs text-[#A7C7E7] hover:text-[#FAFAFA] hover:underline font-medium py-1 px-3"
                    >
                      {t.studentModal.explorePlansBtn}
                    </button>
                  </div>
                </div>
              )}

              {/* Target Vocabulary Used & Quick Next-Step Exercise */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Vocabulary Tags */}
                <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7] space-y-1.5">
                  <span className="block font-montserrat font-bold text-xs uppercase tracking-wider text-[#1A3153] flex items-center gap-1.5">
                    <BookOpen size={12} className="text-[#E09B30]" />
                    {t.studentModal.vocabTitle}
                  </span>
                  {vocabItems.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {vocabItems.map((word, wIdx) => (
                        <span
                          key={wIdx}
                          className="px-2 py-0.5 rounded-full bg-[#A7C7E7]/25 border border-[#A7C7E7] text-[11px] font-semibold text-[#1A3153]"
                        >
                          ✓ {word}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#4A5568] italic pt-0.5">
                      {t.studentModal.noVocabDesc}
                    </p>
                  )}
                </div>

                {/* 1 Quick Next-Step Exercise */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#E09B30]/10 to-[#E09B30]/5 border border-[#E09B30]/40 space-y-1.5">
                  <span className="block font-montserrat font-bold text-xs uppercase tracking-wider text-[#E09B30] flex items-center gap-1.5">
                    <Award size={12} />
                    {t.studentModal.nextStepTitle}
                  </span>
                  <p className="font-inter text-xs text-[#1A3153] font-medium leading-relaxed">
                    {currentReport.nextExercise}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-[#A7C7E7]/30 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            id="close-student-report-footer-btn"
            onClick={dismissReport}
            className="w-full sm:w-auto px-6 py-2 rounded-full font-montserrat font-semibold text-xs uppercase tracking-wider border border-[#A7C7E7] text-[#4A5568] hover:bg-slate-200 hover:text-[#1A3153] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3153]"
          >
            {t.studentModal.closeBtn}
          </button>

          {!isGenerating && (
            <button
              id="practice-again-student-report-btn"
              onClick={handlePracticeAgain}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 shadow-md shadow-[#E09B30]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30]"
            >
              <Play size={13} fill="currentColor" />
              <span>{t.studentModal.practiceAgainBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentReportModal;
