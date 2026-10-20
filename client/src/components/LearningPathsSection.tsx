import React from 'react';
import { Compass, GraduationCap, ArrowRight } from 'lucide-react';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTranslation } from '../modules/i18n/languageStore';

export const LearningPathsSection: React.FC = () => {
  const { setLevel, setCorrectionMode, selectScenario, isLocked } = useTeachingStore();
  const { startSession, status } = useConversationStore();
  const { t } = useTranslation();

  const handleSelectGeneralFluency = () => {
    if (!isLocked) {
      setLevel('intermediate');
      setCorrectionMode('conversation');
      selectScenario('casual-coffee');
    }
    const el = document.getElementById('voice-tutor-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (status !== 'connected') {
        startSession();
      }
    }
  };

  const handleSelectIELTS = () => {
    if (!isLocked) {
      setLevel('advanced');
      setCorrectionMode('coaching');
      selectScenario('job-interview');
    }
    const el = document.getElementById('voice-tutor-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (status !== 'connected') {
        startSession();
      }
    }
  };

  return (
    <section
      id="learning-paths-section"
      className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full border-b border-[#A7C7E7]/25"
      aria-label="Targeted Learning Paths"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
            <Compass size={14} />
            <span>{t.learningPathsStreamlined.badge}</span>
          </div>

          <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
            {t.learningPathsStreamlined.title}
          </h2>

          <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed">
            {t.learningPathsStreamlined.subtitle}
          </p>
        </div>

        {/* 2 Focused Cards (Max 2 lines per card + 1 CTA) in Dark Navy Aesthetic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Track 1: General English Fluency */}
          <div className="p-8 sm:p-9 rounded-3xl bg-[#12223a]/90 border border-[#A7C7E7]/30 shadow-xl flex flex-col justify-between hover:border-[#E09B30]/60 transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="px-3 py-1 rounded-full bg-[#1A3153] text-[#E09B30] border border-[#E09B30]/30 font-montserrat font-bold text-xs uppercase tracking-wider">
                  {t.learningPathsStreamlined.generalBadge}
                </span>
                <Compass size={22} className="text-[#A7C7E7]" />
              </div>

              <h3 className="font-montserrat font-bold text-xl sm:text-2xl text-[#FAFAFA] mb-3">
                {t.learningPathsStreamlined.generalTitle}
              </h3>

              <p className="font-inter text-sm text-[#A7C7E7] leading-relaxed mb-8 line-clamp-2">
                {t.learningPathsStreamlined.generalDesc}
              </p>
            </div>

            <button
              type="button"
              id="select-general-fluency-btn"
              onClick={handleSelectGeneralFluency}
              className="w-full py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#1A3153] border border-[#A7C7E7]/60 text-[#FAFAFA] hover:bg-[#E09B30] hover:text-[#1A3153] hover:border-[#E09B30] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{t.learningPathsStreamlined.generalCta}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Track 2: IELTS Speaking Prep */}
          <div className="p-8 sm:p-9 rounded-3xl bg-[#12223a]/90 border border-[#A7C7E7]/30 shadow-xl flex flex-col justify-between hover:border-[#E09B30]/60 transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="px-3 py-1 rounded-full bg-[#1A3153] text-[#10b981] border border-[#10b981]/30 font-montserrat font-bold text-xs uppercase tracking-wider">
                  {t.learningPathsStreamlined.ieltsBadge}
                </span>
                <GraduationCap size={22} className="text-[#A7C7E7]" />
              </div>

              <h3 className="font-montserrat font-bold text-xl sm:text-2xl text-[#FAFAFA] mb-3">
                {t.learningPathsStreamlined.ieltsTitle}
              </h3>

              <p className="font-inter text-sm text-[#A7C7E7] leading-relaxed mb-8 line-clamp-2">
                {t.learningPathsStreamlined.ieltsDesc}
              </p>
            </div>

            <button
              type="button"
              id="select-ielts-prep-btn"
              onClick={handleSelectIELTS}
              className="w-full py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#1A3153] border border-[#A7C7E7]/60 text-[#FAFAFA] hover:bg-[#E09B30] hover:text-[#1A3153] hover:border-[#E09B30] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{t.learningPathsStreamlined.ieltsCta}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningPathsSection;
