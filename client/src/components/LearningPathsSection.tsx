import React from 'react';
import { Compass, GraduationCap, ArrowRight, Check } from 'lucide-react';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTranslation } from '../modules/i18n/languageStore';

export const LearningPathsSection: React.FC = () => {
  const { setLevel, setCorrectionMode, selectScenario, isLocked } = useTeachingStore();
  const { startSession, status } = useConversationStore();
  const { t } = useTranslation();

  const handleSelectGeneralFluency = (lvl: 'beginner' | 'intermediate') => {
    if (!isLocked) {
      setLevel(lvl);
      setCorrectionMode('conversation');
      selectScenario(lvl === 'beginner' ? 'travel-airport' : 'casual-coffee');
    }
    const el = document.getElementById('start-session-btn');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    const el = document.getElementById('start-session-btn');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (status !== 'connected') {
        startSession();
      }
    }
  };

  return (
    <section
      id="learning-paths-section"
      className="bg-[#FAFAFA] py-16 md:py-24 px-6 border-b border-[#A7C7E7]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A7C7E7]/20 border border-[#A7C7E7] mb-4">
            <Compass size={14} className="text-[#1A3153]" />
            <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#1A3153]">
              {t.learningPaths.badge}
            </span>
          </div>

          <h2 className="font-montserrat font-extrabold text-3xl sm:text-4xl text-[#1A3153] mb-5 tracking-tight">
            {t.learningPaths.title}
          </h2>

          <p className="font-inter text-base sm:text-lg text-[#4A5568] leading-relaxed">
            {t.learningPaths.subtitle}
          </p>
        </div>

        {/* Path Grid: 2 Comprehensive Roadmaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Track 1: General English Fluency (A1–B2) */}
          <div className="bg-[#FAFAFA] border border-[#A7C7E7] rounded-2xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#1A3153] text-[#FAFAFA] font-montserrat font-bold text-xs uppercase tracking-[0.15em]">
                  {t.learningPaths.track1.badge1}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#A7C7E7]/30 text-[#1A3153] border border-[#A7C7E7] font-montserrat font-bold text-xs uppercase tracking-[0.15em]">
                  {t.learningPaths.track1.badge2}
                </span>
              </div>

              <h3 className="font-montserrat font-bold text-2xl text-[#1A3153] mb-3">
                {t.learningPaths.track1.title}
              </h3>

              <p className="font-inter text-sm text-[#4A5568] leading-relaxed mb-6">
                {t.learningPaths.track1.desc}
              </p>

              {/* Curriculum Milestones */}
              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7]/60">
                  <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30] mb-1">
                    {t.learningPaths.track1.stage1Title}
                  </div>
                  <p className="font-inter text-xs text-[#4A5568] leading-relaxed">
                    {t.learningPaths.track1.stage1Desc}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7]/60">
                  <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#1A3153] mb-1">
                    {t.learningPaths.track1.stage2Title}
                  </div>
                  <p className="font-inter text-xs text-[#4A5568] leading-relaxed">
                    {t.learningPaths.track1.stage2Desc}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                  <Check size={16} className="text-[#E09B30]" />
                  <span>{t.learningPaths.track1.bullet1}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                  <Check size={16} className="text-[#E09B30]" />
                  <span>{t.learningPaths.track1.bullet2}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#A7C7E7]/40 flex flex-col sm:flex-row items-center gap-3">
              <button
                id="learning-path-btn-a1"
                onClick={() => handleSelectGeneralFluency('beginner')}
                className="w-full sm:flex-1 py-3 px-4 rounded-full font-montserrat font-bold text-xs uppercase tracking-[0.15em] bg-[#1A3153] text-[#FAFAFA] hover:bg-[#12223a] transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3153]"
              >
                <span>{t.learningPaths.track1.btnA1}</span>
                <ArrowRight size={14} />
              </button>
              <button
                id="learning-path-btn-b1"
                onClick={() => handleSelectGeneralFluency('intermediate')}
                className="w-full sm:flex-1 py-3 px-4 rounded-full font-montserrat font-bold text-xs uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30]"
              >
                <span>{t.learningPaths.track1.btnB1}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Track 2: IELTS Speaking Prep (Band 7.0–8.5 Intensive) */}
          <div className="bg-[#FAFAFA] border-2 border-[#1A3153] rounded-2xl p-8 sm:p-10 shadow-md relative flex flex-col justify-between">
            <div className="absolute -top-3 right-8 bg-[#1A3153] text-[#FAFAFA] px-3.5 py-0.5 rounded-full font-montserrat font-bold text-[10px] uppercase tracking-[0.15em]">
              {t.learningPaths.track2.intensiveBadge}
            </div>

            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#E09B30] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-[0.15em]">
                  {t.learningPaths.track2.badge1}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#1A3153] text-[#FAFAFA] font-montserrat font-bold text-xs uppercase tracking-[0.15em]">
                  {t.learningPaths.track2.badge2}
                </span>
              </div>

              <h3 className="font-montserrat font-bold text-2xl text-[#1A3153] mb-3">
                {t.learningPaths.track2.title}
              </h3>

              <p className="font-inter text-sm text-[#4A5568] leading-relaxed mb-6">
                {t.learningPaths.track2.desc}
              </p>

              {/* The 3 Exam Parts */}
              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7]/60">
                  <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#1A3153] mb-1">
                    {t.learningPaths.track2.part1Title}
                  </div>
                  <p className="font-inter text-xs text-[#4A5568] leading-relaxed">
                    {t.learningPaths.track2.part1Desc}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7]/60">
                  <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30] mb-1">
                    {t.learningPaths.track2.part2Title}
                  </div>
                  <p className="font-inter text-xs text-[#4A5568] leading-relaxed">
                    {t.learningPaths.track2.part2Desc}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#A7C7E7]/60">
                  <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#1A3153] mb-1">
                    {t.learningPaths.track2.part3Title}
                  </div>
                  <p className="font-inter text-xs text-[#4A5568] leading-relaxed">
                    {t.learningPaths.track2.part3Desc}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                  <Check size={16} className="text-[#E09B30]" />
                  <span>{t.learningPaths.track2.bullet1}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                  <Check size={16} className="text-[#E09B30]" />
                  <span>{t.learningPaths.track2.bullet2}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#A7C7E7]/40">
              <button
                id="learning-path-btn-ielts"
                onClick={handleSelectIELTS}
                className="w-full py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all flex items-center justify-center gap-2 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30]"
              >
                <GraduationCap size={16} />
                <span>{t.learningPaths.track2.btnIelts}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningPathsSection;
