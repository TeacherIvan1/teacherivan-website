import React from 'react';
import { Sliders, Compass, Mic, Award } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';

export const HowToUseGuide: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      num: t.howToUse.step1.number,
      title: t.howToUse.step1.title,
      desc: t.howToUse.step1.desc,
      icon: <Sliders size={18} className="text-[#E09B30]" />,
    },
    {
      num: t.howToUse.step2.number,
      title: t.howToUse.step2.title,
      desc: t.howToUse.step2.desc,
      icon: <Compass size={18} className="text-[#E09B30]" />,
    },
    {
      num: t.howToUse.step3.number,
      title: t.howToUse.step3.title,
      desc: t.howToUse.step3.desc,
      icon: <Mic size={18} className="text-[#E09B30]" />,
    },
    {
      num: t.howToUse.step4.number,
      title: t.howToUse.step4.title,
      desc: t.howToUse.step4.desc,
      icon: <Award size={18} className="text-[#E09B30]" />,
    },
  ];

  return (
    <div
      id="how-to-use-guide"
      className="mb-8 p-5 sm:p-6 rounded-2xl bg-[#12223a]/80 border border-[#A7C7E7]/30 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#A7C7E7]/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E09B30]" />
          <h3 className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30]">
            {t.howToUse.title}
          </h3>
        </div>
        <span className="text-[11px] text-[#A7C7E7] font-medium hidden sm:inline">
          {t.howToUse.subtitle}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[#1A3153]/70 border border-[#A7C7E7]/25 hover:border-[#E09B30]/50 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#E09B30]/15 border border-[#E09B30]/30 font-montserrat font-bold text-xs text-[#E09B30]">
                  {step.num}
                </span>
                <div className="p-1.5 rounded-lg bg-[#12223a] border border-[#A7C7E7]/20">
                  {step.icon}
                </div>
              </div>

              <h4 className="font-montserrat font-bold text-xs sm:text-sm text-[#FAFAFA] mb-2 group-hover:text-[#E09B30] transition-colors leading-snug">
                {step.title}
              </h4>

              <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowToUseGuide;
