import React, { useEffect } from 'react';
import { X, Sparkles, Headphones, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAssessmentStore } from '../modules/assessment/assessmentStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { useTranslation } from '../modules/i18n/languageStore';

export const SpokenAssessmentModal: React.FC = () => {
  const { isAssessmentModalOpen, closeAssessmentModal } = useAssessmentStore();
  const selectScenario = useTeachingStore((s) => s.selectScenario);
  const { startSession, status } = useConversationStore();
  const setActiveView = useNavigationStore((s) => s.setActiveView);
  const { t } = useTranslation();

  // Preset to diagnostic placement scenario whenever modal opens
  useEffect(() => {
    if (isAssessmentModalOpen) {
      selectScenario('diagnostic-placement');
    }
  }, [isAssessmentModalOpen, selectScenario]);

  // Handle escape key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAssessmentModalOpen) {
        closeAssessmentModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAssessmentModalOpen, closeAssessmentModal]);

  if (!isAssessmentModalOpen) {
    return null;
  }

  const handleStartTest = () => {
    selectScenario('diagnostic-placement');
    closeAssessmentModal();
    setActiveView('simulator');
    if (status !== 'connected') {
      startSession();
    }
  };

  return (
    <div
      id="spoken-assessment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A3153]/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spoken-assessment-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeAssessmentModal();
        }
      }}
    >
      {/* Sleek, Single-Card Welcome Sheet (max-h-[85vh] overflow-hidden) */}
      <div
        id="spoken-assessment-modal-card"
        className="relative w-full max-w-md max-h-[85vh] overflow-hidden rounded-3xl bg-[#12223a] text-[#FAFAFA] border-2 border-[#E09B30]/50 shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center my-auto"
      >
        {/* Top Close Button */}
        <button
          id="skip-assessment-modal-btn"
          onClick={closeAssessmentModal}
          className="absolute top-4 right-4 p-2 rounded-full text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#1A3153] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30] cursor-pointer"
          aria-label={t.assessmentModal.skipBtn}
          title={t.assessmentModal.skipBtn}
        >
          <X size={18} />
        </button>

        {/* Chibi Mascot Avatar in Ambient Frame */}
        <div className="relative mb-4 mt-1">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#1A3153] border-2 border-[#E09B30] p-2 flex items-center justify-center shadow-lg shadow-[#E09B30]/25 relative overflow-hidden">
            <img
              src="/assets/logo.svg"
              alt="Teacher Ivan Mascot"
              className="w-full h-full object-contain filter drop-shadow-sm hover:scale-105 transition-transform"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#E09B30] text-[#1A3153] p-1 rounded-full shadow-sm">
            <Sparkles size={14} fill="currentColor" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E09B30]/20 border border-[#E09B30]/40 text-[#E09B30] text-[10px] font-montserrat font-bold uppercase tracking-wider mb-2">
          <Headphones size={12} />
          <span>{t.assessmentModal.badge}</span>
        </div>

        {/* Title */}
        <h2
          id="spoken-assessment-modal-title"
          className="font-montserrat font-extrabold text-xl sm:text-2xl tracking-tight text-[#FAFAFA] mb-2"
        >
          {t.assessmentModal.title}
        </h2>

        {/* 1-Sentence Value Proposition */}
        <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] leading-relaxed mb-5 max-w-sm">
          {t.assessmentModal.subtitle}
        </p>

        {/* 3 Progressive Questions Mini Preview */}
        <div className="grid grid-cols-3 gap-2 w-full mb-6">
          <div className="p-2 rounded-xl bg-[#1A3153]/80 border border-[#A7C7E7]/25 text-[10px] text-[#A7C7E7]">
            <span className="font-bold text-[#E09B30] block mb-0.5">Q1</span>
            <span>Intro (A1/A2)</span>
          </div>
          <div className="p-2 rounded-xl bg-[#1A3153]/80 border border-[#A7C7E7]/25 text-[10px] text-[#A7C7E7]">
            <span className="font-bold text-[#E09B30] block mb-0.5">Q2</span>
            <span>Projects (B1)</span>
          </div>
          <div className="p-2 rounded-xl bg-[#1A3153]/80 border border-[#A7C7E7]/25 text-[10px] text-[#A7C7E7]">
            <span className="font-bold text-[#E09B30] block mb-0.5">Q3</span>
            <span>Hypothesis (B2)</span>
          </div>
        </div>

        {/* Primary Action Button (#E09B30) */}
        <button
          id="start-assessment-modal-btn"
          onClick={handleStartTest}
          className="w-full py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-[#E09B30]/35 flex items-center justify-center gap-2 cursor-pointer mb-3 min-h-[46px]"
        >
          <Sparkles size={16} />
          <span>{t.assessmentModal.startBtn}</span>
          <ArrowRight size={15} />
        </button>

        {/* Subtle Dismiss Link */}
        <button
          id="dismiss-assessment-link"
          onClick={closeAssessmentModal}
          className="text-xs text-[#A7C7E7]/80 hover:text-[#FAFAFA] hover:underline transition-colors font-medium cursor-pointer"
        >
          {t.assessmentModal.skipBtn}
        </button>

        {/* Micro Privacy Guarantee */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#A7C7E7]/60 mt-4">
          <ShieldCheck size={12} className="text-[#10b981]" />
          <span>Google Gemini Live Native Audio • No Sign-up</span>
        </div>
      </div>
    </div>
  );
};

export default SpokenAssessmentModal;
