import React from 'react';
import { XCircle, CheckCircle2, Sparkles, Building2, User, Globe2, Trophy } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';

export const MarketComparisonSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section
      id="market-comparison-section"
      className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full"
      aria-label="Market Comparison"
    >
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>{t.marketComparison.badge}</span>
        </div>
        <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
          {t.marketComparison.title}
        </h2>
        <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed">
          {t.marketComparison.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {/* Card 1: Traditional Local Academy */}
        <div className="p-6 rounded-3xl bg-[#1A3153]/60 border border-[#A7C7E7]/25 backdrop-blur-sm flex flex-col justify-between hover:border-[#A7C7E7]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-700/60 text-[#A7C7E7]">
                {t.marketComparison.cba.tag}
              </span>
              <Building2 size={18} className="text-[#A7C7E7]" />
            </div>

            <h3 className="font-montserrat font-bold text-lg text-[#FAFAFA] mb-1">
              {t.marketComparison.cba.name}
            </h3>

            <div className="space-y-0.5 mb-4 text-xs">
              <div className="text-[#A7C7E7] font-medium">{t.marketComparison.cba.hours}</div>
              <div className="text-[#FAFAFA] font-bold text-sm">{t.marketComparison.cba.price}</div>
            </div>

            <ul className="space-y-2.5 text-xs text-[#A7C7E7] border-t border-[#A7C7E7]/20 pt-4">
              {t.marketComparison.cba.drawbacks.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 2: Local Private Tutor */}
        <div className="p-6 rounded-3xl bg-[#1A3153]/60 border border-[#A7C7E7]/25 backdrop-blur-sm flex flex-col justify-between hover:border-[#A7C7E7]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-700/60 text-[#A7C7E7]">
                {t.marketComparison.tutor.tag}
              </span>
              <User size={18} className="text-[#A7C7E7]" />
            </div>

            <h3 className="font-montserrat font-bold text-lg text-[#FAFAFA] mb-1">
              {t.marketComparison.tutor.name}
            </h3>

            <div className="space-y-0.5 mb-4 text-xs">
              <div className="text-[#A7C7E7] font-medium">{t.marketComparison.tutor.hours}</div>
              <div className="text-[#FAFAFA] font-bold text-sm">{t.marketComparison.tutor.price}</div>
            </div>

            <ul className="space-y-2.5 text-xs text-[#A7C7E7] border-t border-[#A7C7E7]/20 pt-4">
              {t.marketComparison.tutor.drawbacks.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 3: International Platforms */}
        <div className="p-6 rounded-3xl bg-[#1A3153]/60 border border-[#A7C7E7]/25 backdrop-blur-sm flex flex-col justify-between hover:border-[#A7C7E7]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-700/60 text-[#A7C7E7]">
                {t.marketComparison.platforms.tag}
              </span>
              <Globe2 size={18} className="text-[#A7C7E7]" />
            </div>

            <h3 className="font-montserrat font-bold text-lg text-[#FAFAFA] mb-1">
              {t.marketComparison.platforms.name}
            </h3>

            <div className="space-y-0.5 mb-4 text-xs">
              <div className="text-[#A7C7E7] font-medium">{t.marketComparison.platforms.hours}</div>
              <div className="text-[#FAFAFA] font-bold text-sm">{t.marketComparison.platforms.price}</div>
            </div>

            <ul className="space-y-2.5 text-xs text-[#A7C7E7] border-t border-[#A7C7E7]/20 pt-4">
              {t.marketComparison.platforms.drawbacks.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 4: Teacher Ivan Bichronous Coaching (HIGHLIGHTED) */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1A3153] to-[#12223a] border-2 border-[#E09B30] shadow-2xl relative flex flex-col justify-between transform md:scale-105 z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E09B30] text-[#1A3153] text-[10px] font-montserrat font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
            FLAGSHIP WINNER
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-3 mt-1">
              <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#E09B30]/20 text-[#E09B30]">
                {t.marketComparison.ivan.tag}
              </span>
              <Trophy size={20} className="text-[#E09B30]" />
            </div>

            <h3 className="font-montserrat font-extrabold text-xl text-[#FAFAFA] mb-1">
              {t.marketComparison.ivan.name}
            </h3>

            <div className="space-y-0.5 mb-4 text-xs">
              <div className="text-[#E09B30] font-semibold">{t.marketComparison.ivan.hours}</div>
              <div className="text-[#FAFAFA] font-extrabold text-base">{t.marketComparison.ivan.price}</div>
            </div>

            <ul className="space-y-3 text-xs text-[#FAFAFA] border-t border-[#E09B30]/30 pt-4">
              {t.marketComparison.ivan.benefits.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#E09B30] flex-shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketComparisonSection;
