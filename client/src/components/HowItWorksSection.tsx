import React, { useState } from 'react';
import { UserCheck, Headphones, TrendingUp, ChevronDown, ChevronUp, Sparkles, Clock } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';

export const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const steps = [
    {
      num: '01',
      icon: <UserCheck size={24} className="text-[#E09B30]" />,
      title: t.howItWorksSection.step1Title,
      desc: t.howItWorksSection.step1Desc,
    },
    {
      num: '02',
      icon: <Headphones size={24} className="text-[#E09B30]" />,
      title: t.howItWorksSection.step2Title,
      desc: t.howItWorksSection.step2Desc,
    },
    {
      num: '03',
      icon: <TrendingUp size={24} className="text-[#10b981]" />,
      title: t.howItWorksSection.step3Title,
      desc: t.howItWorksSection.step3Desc,
    },
  ];

  const weekPhases = [
    { title: t.howItWorksSection.phase1Title, desc: t.howItWorksSection.phase1Desc },
    { title: t.howItWorksSection.phase2Title, desc: t.howItWorksSection.phase2Desc },
    { title: t.howItWorksSection.phase3Title, desc: t.howItWorksSection.phase3Desc },
    { title: t.howItWorksSection.phase4Title, desc: t.howItWorksSection.phase4Desc },
    { title: t.howItWorksSection.asyncSprintTitle, desc: t.howItWorksSection.asyncSprintDesc },
  ];

  return (
    <section
      id="how-it-works-section"
      className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full border-b border-[#A7C7E7]/25"
      aria-label="How Teacher Ivan Method Works"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>{t.howItWorksSection.badge}</span>
        </div>
        <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
          {t.howItWorksSection.title}
        </h2>
        <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed">
          {t.howItWorksSection.subtitle}
        </p>
      </div>

      {/* 3-Step Visual Grid (Max 10 words per step) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-7 rounded-3xl bg-[#12223a]/80 border border-[#A7C7E7]/30 shadow-xl flex flex-col justify-between hover:border-[#E09B30]/50 transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#1A3153] border border-[#A7C7E7]/30 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="font-montserrat font-black text-2xl text-[#A7C7E7]/30">
                  {step.num}
                </span>
              </div>
              <h3 className="font-montserrat font-bold text-lg text-[#FAFAFA] mb-2">
                {step.title}
              </h3>
              <p className="font-inter text-sm text-[#A7C7E7] leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Talk-Time Comparison Graphic: 75% vs 25% */}
      <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-[#12223a] to-[#1A3153] border border-[#A7C7E7]/40 shadow-2xl mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-xs font-montserrat font-bold uppercase tracking-wider text-[#E09B30] block mb-1">
                {t.howItWorksSection.talkTimeBadge}
              </span>
              <h3 className="font-montserrat font-bold text-xl sm:text-2xl text-[#FAFAFA]">
                {t.howItWorksSection.talkTimeTitle}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E09B30]/20 border border-[#E09B30]/40 text-[#E09B30] text-xs font-bold w-fit">
              <Clock size={13} />
              <span>3 out of 4 min</span>
            </div>
          </div>

          <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] mb-7 leading-relaxed">
            {t.howItWorksSection.talkTimeSubtitle}
          </p>

          {/* Comparative Bars */}
          <div className="space-y-5">
            {/* Ivan: 75% Active Speech */}
            <div>
              <div className="flex justify-between text-xs font-montserrat font-bold mb-1.5">
                <span className="text-[#FAFAFA]">{t.howItWorksSection.ivanTalkTime}</span>
                <span className="text-[#E09B30] text-sm">75%</span>
              </div>
              <div className="w-full h-4 rounded-full bg-[#12223a] border border-[#E09B30]/30 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E09B30] to-[#f59e0b] shadow-md shadow-[#E09B30]/40 transition-all duration-700"
                  style={{ width: '75%' }}
                />
              </div>
            </div>

            {/* Traditional: 25% Passive Speech */}
            <div>
              <div className="flex justify-between text-xs font-montserrat font-semibold mb-1.5">
                <span className="text-[#A7C7E7]">{t.howItWorksSection.groupTalkTime}</span>
                <span className="text-[#A7C7E7] text-sm">25%</span>
              </div>
              <div className="w-full h-4 rounded-full bg-[#12223a] border border-[#A7C7E7]/20 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-[#4A5568]"
                  style={{ width: '25%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed "See a Typical Week" Accordion (1 line per item) */}
      <div className="max-w-3xl mx-auto text-center">
        <button
          type="button"
          id="see-typical-week-btn"
          onClick={() => setIsAccordionOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider bg-[#12223a] border border-[#A7C7E7]/40 text-[#A7C7E7] hover:text-[#FAFAFA] hover:border-[#E09B30] transition-all cursor-pointer"
        >
          <span>
            {isAccordionOpen
              ? t.howItWorksSection.accordionClose
              : t.howItWorksSection.accordionToggle}
          </span>
          {isAccordionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isAccordionOpen && (
          <div
            id="typical-week-accordion-content"
            className="mt-6 p-6 rounded-2xl bg-[#12223a]/90 border border-[#A7C7E7]/30 text-left space-y-4 transition-all duration-300"
          >
            {weekPhases.map((phase, idx) => (
              <div
                key={idx}
                className="pb-3 border-b border-[#A7C7E7]/15 last:border-b-0 last:pb-0"
              >
                <h4 className="font-montserrat font-bold text-xs sm:text-sm text-[#FAFAFA] mb-1">
                  {phase.title}
                </h4>
                <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
                  {phase.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HowItWorksSection;
