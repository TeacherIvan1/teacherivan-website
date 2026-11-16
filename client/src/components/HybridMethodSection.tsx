import React from 'react';
import { UserCheck, Bot, BarChart3, CheckCircle2, MessageSquareQuote, ArrowUpRight } from 'lucide-react';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTranslation } from '../modules/i18n/languageStore';

export const HybridMethodSection: React.FC = () => {
  const startSession = useConversationStore((s) => s.startSession);
  const status = useConversationStore((s) => s.status);
  const { t } = useTranslation();

  const handleStartTutor = () => {
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
      id="hybrid-method-section"
      className="bg-[#FAFAFA] py-16 md:py-24 px-6 border-t border-b border-[#A7C7E7]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A7C7E7]/20 border border-[#A7C7E7] mb-4">
            <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#1A3153]">
              {t.hybridMethod.badge}
            </span>
          </div>

          <h2 className="font-montserrat font-extrabold text-3xl sm:text-4xl text-[#1A3153] mb-5 tracking-tight">
            {t.hybridMethod.title}
          </h2>

          <p className="font-inter text-base sm:text-lg text-[#4A5568] leading-relaxed">
            {t.hybridMethod.subtitle}
          </p>
        </div>

        {/* 3 Core Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Pillar 1: Teacher Ivan */}
          <div className="bg-[#FAFAFA] border border-[#A7C7E7] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#1A3153] text-[#FAFAFA] flex items-center justify-center mb-6 shadow-md">
                <UserCheck size={24} className="text-[#E09B30]" />
              </div>

              <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30] mb-2">
                {t.hybridMethod.pillar1.badge}
              </div>

              <h3 className="font-montserrat font-bold text-xl text-[#1A3153] mb-4">
                {t.hybridMethod.pillar1.title}
              </h3>

              <p className="font-inter text-sm text-[#4A5568] leading-relaxed mb-6">
                {t.hybridMethod.pillar1.desc}
              </p>

              <ul className="space-y-3 text-xs text-[#4A5568]">
                {t.hybridMethod.pillar1.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[#A7C7E7]/50 text-xs font-montserrat font-semibold uppercase tracking-[0.15em] text-[#1A3153]">
              {t.hybridMethod.pillar1.footer}
            </div>
          </div>

          {/* Pillar 2: 24/7 AI Voice Immersion */}
          <div className="bg-[#FAFAFA] border-2 border-[#E09B30] rounded-2xl p-8 shadow-md relative flex flex-col justify-between transform md:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E09B30] text-[#1A3153] px-3.5 py-0.5 rounded-full font-montserrat font-extrabold text-[10px] uppercase tracking-[0.15em]">
              {t.hybridMethod.pillar2.centerpieceBadge}
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E09B30] text-[#1A3153] flex items-center justify-center mb-6 shadow-md">
                <Bot size={24} />
              </div>

              <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#1A3153] mb-2">
                {t.hybridMethod.pillar2.badge}
              </div>

              <h3 className="font-montserrat font-bold text-xl text-[#1A3153] mb-4">
                {t.hybridMethod.pillar2.title}
              </h3>

              <p className="font-inter text-sm text-[#4A5568] leading-relaxed mb-6">
                {t.hybridMethod.pillar2.desc}
              </p>

              <ul className="space-y-3 text-xs text-[#4A5568]">
                {t.hybridMethod.pillar2.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[#A7C7E7]/50">
              <button
                onClick={handleStartTutor}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-montserrat font-bold text-xs uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all"
              >
                <span>{t.hybridMethod.pillar2.cta}</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Pillar 3: Pedagogical Reports */}
          <div className="bg-[#FAFAFA] border border-[#A7C7E7] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#1A3153] text-[#FAFAFA] flex items-center justify-center mb-6 shadow-md">
                <BarChart3 size={24} className="text-[#A7C7E7]" />
              </div>

              <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30] mb-2">
                {t.hybridMethod.pillar3.badge}
              </div>

              <h3 className="font-montserrat font-bold text-xl text-[#1A3153] mb-4">
                {t.hybridMethod.pillar3.title}
              </h3>

              <p className="font-inter text-sm text-[#4A5568] leading-relaxed mb-6">
                {t.hybridMethod.pillar3.desc}
              </p>

              <ul className="space-y-3 text-xs text-[#4A5568]">
                {t.hybridMethod.pillar3.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[#A7C7E7]/50 text-xs font-montserrat font-semibold uppercase tracking-[0.15em] text-[#1A3153]">
              {t.hybridMethod.pillar3.footer}
            </div>
          </div>
        </div>

        {/* Brand Speech Bubble (Teacher Ivan's Word on the Hybrid Method) */}
        <div className="bg-[#FAFAFA] border border-[#A7C7E7] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#1A3153] flex-shrink-0 flex items-center justify-center text-[#E09B30]">
            <MessageSquareQuote size={28} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30] mb-1">
              {t.hybridMethod.philosophyBadge}
            </div>
            <p className="font-inter text-sm sm:text-base text-[#4A5568] italic leading-relaxed">
              {t.hybridMethod.philosophyQuote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HybridMethodSection;
