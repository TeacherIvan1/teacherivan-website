import React, { useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Headphones, ArrowRight } from 'lucide-react';
import { useAssessmentStore } from '../modules/assessment/assessmentStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { TutorPersonaSelector } from './TutorPersonaSelector';
import { TutorAvatarStage } from './TutorAvatarStage';
import { TutorControls } from './TutorControls';

export const SpokenAssessmentModal: React.FC = () => {
  const { isAssessmentModalOpen, closeAssessmentModal } = useAssessmentStore();
  const selectScenario = useTeachingStore((s) => s.selectScenario);
  const selectedScenarioId = useTeachingStore((s) => s.selectedScenarioId);
  const { t } = useTranslation();

  // Preset to diagnostic placement scenario whenever modal opens
  useEffect(() => {
    if (isAssessmentModalOpen && selectedScenarioId !== 'diagnostic-placement') {
      selectScenario('diagnostic-placement');
    }
  }, [isAssessmentModalOpen, selectedScenarioId, selectScenario]);

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

  return (
    <div
      id="spoken-assessment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-[#1A3153]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spoken-assessment-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeAssessmentModal();
        }
      }}
    >
      <div
        id="spoken-assessment-modal-card"
        className="relative w-full max-w-4xl bg-[#FAFAFA] text-[#1A3153] border-2 border-[#A7C7E7] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1A3153] via-[#1A3153] to-[#12223a] text-[#FAFAFA] border-b border-[#A7C7E7]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E09B30]/20 border border-[#E09B30] flex items-center justify-center text-[#E09B30] shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E09B30]/20 text-[#E09B30] text-[10px] font-montserrat font-bold uppercase tracking-wider mb-0.5">
                {t.assessmentModal.badge}
              </div>
              <h2
                id="spoken-assessment-modal-title"
                className="font-montserrat font-bold text-base sm:text-xl tracking-tight text-[#FAFAFA]"
              >
                {t.assessmentModal.title}
              </h2>
            </div>
          </div>

          {/* Clean Skip to Website Button */}
          <button
            id="skip-assessment-modal-btn"
            onClick={closeAssessmentModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-montserrat font-medium text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30]"
            aria-label={t.assessmentModal.skipBtn}
          >
            <span>{t.assessmentModal.skipBtn}</span>
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Subtitle & Value Proposition */}
          <div className="bg-[#1A3153]/5 border border-[#A7C7E7]/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-montserrat font-bold text-[#E09B30] uppercase tracking-wider">
                <Headphones size={14} />
                <span>90–120s Real-Time Spoken Diagnostic</span>
              </div>
              <p className="font-inter text-xs sm:text-sm text-[#4A5568] leading-relaxed">
                {t.assessmentModal.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-xs font-medium text-[#1A3153]">Gemini Live API Ready</span>
            </div>
          </div>

          {/* 3 Progressive Questions Indicator Strip */}
          <div className="space-y-2">
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#1A3153] flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#E09B30]" />
              <span>{t.assessmentModal.questionsTitle}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7] hover:border-[#E09B30] transition-colors">
                <span className="block font-montserrat font-bold text-xs text-[#1A3153] mb-0.5">
                  {t.assessmentModal.q1Title}
                </span>
                <span className="text-[11px] text-[#4A5568]">
                  {t.assessmentModal.q1Desc}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7] hover:border-[#E09B30] transition-colors">
                <span className="block font-montserrat font-bold text-xs text-[#1A3153] mb-0.5">
                  {t.assessmentModal.q2Title}
                </span>
                <span className="text-[11px] text-[#4A5568]">
                  {t.assessmentModal.q2Desc}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7] hover:border-[#E09B30] transition-colors">
                <span className="block font-montserrat font-bold text-xs text-[#1A3153] mb-0.5">
                  {t.assessmentModal.q3Title}
                </span>
                <span className="text-[11px] text-[#4A5568]">
                  {t.assessmentModal.q3Desc}
                </span>
              </div>
            </div>
          </div>

          {/* Persona Selector inside Modal */}
          <div className="pt-1">
            <TutorPersonaSelector />
          </div>

          {/* Animated 2D Avatar Stage */}
          <TutorAvatarStage />

          {/* Interactive Voice Tutor Console Controls */}
          <TutorControls />
        </div>

        {/* Modal Footer with Skip Action */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-[#A7C7E7]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#4A5568]">
            {t.assessmentModal.tutorReady}
          </p>

          <button
            id="close-assessment-bottom-btn"
            onClick={closeAssessmentModal}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-montserrat font-semibold text-xs uppercase tracking-wider text-[#1A3153] hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3153]"
          >
            <span>{t.assessmentModal.skipBtn}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpokenAssessmentModal;
