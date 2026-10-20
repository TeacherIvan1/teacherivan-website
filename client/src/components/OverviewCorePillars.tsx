import React from 'react';
import { UserCheck, MessageCircle, Bot, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { ChibiSceneShowcase } from './ChibiSceneShowcase';

export const OverviewCorePillars: React.FC = () => {
  const { t } = useTranslation();
  const setActiveView = useNavigationStore((s) => s.setActiveView);

  return (
    <section
      id="overview-core-pillars"
      className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full border-b border-[#A7C7E7]/20"
      aria-label="Core Learning Pillars"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 mb-3">
          <Sparkles size={13} className="text-[#E09B30]" />
          <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30]">
            {t.overviewPillars.badge}
          </span>
        </div>
        <h2 className="font-montserrat font-extrabold text-2xl sm:text-4xl text-[#FAFAFA] tracking-tight mb-3">
          {t.overviewPillars.title}
        </h2>
        <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed">
          {t.overviewPillars.subtitle}
        </p>
      </div>

      {/* Hero Showcase Split: Custom Chibi Online Coach + Pillar Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
        {/* Left: Custom Chibi Online Coach Scene */}
        <div className="lg:col-span-6 w-full">
          <ChibiSceneShowcase
            imageSrc="/assets/chibi-online-coach.png"
            altText="Teacher Ivan Online Live Coaching Session with Headset"
            badge1Text="Live 1-on-1 Mentorship 🎧"
            badge1Icon="recast"
            badge2Text="Active Speaking >75% 🗣️"
            badge2Icon="cefr"
            caption="1-on-1 Live Coaching: Real-time correction and personalized pronunciation modeling"
          />
        </div>

        {/* Right: The 3 Core Pillars Cards */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Pillar 1: 1-on-1 Live Coaching */}
          <div className="rounded-2xl bg-[#12223a]/90 border border-[#A7C7E7]/25 p-5 hover:border-[#E09B30]/60 transition-all shadow-md group">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#E09B30]/15 border border-[#E09B30]/30 flex items-center justify-center shrink-0 text-[#E09B30] group-hover:scale-105 transition-transform">
                <UserCheck size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-montserrat font-bold text-base text-[#FAFAFA]">
                    {t.overviewPillars.pillar1Title}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E09B30]/15 text-[#E09B30] border border-[#E09B30]/30">
                    {t.overviewPillars.pillar1Tag}
                  </span>
                </div>
                <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] leading-relaxed">
                  {t.overviewPillars.pillar1Desc}
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 2: Daily WhatsApp Voice Sprints */}
          <div className="rounded-2xl bg-[#12223a]/90 border border-[#A7C7E7]/25 p-5 hover:border-[#10b981]/60 transition-all shadow-md group">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center shrink-0 text-[#10b981] group-hover:scale-105 transition-transform">
                <MessageCircle size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-montserrat font-bold text-base text-[#FAFAFA]">
                    {t.overviewPillars.pillar2Title}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                    {t.overviewPillars.pillar2Tag}
                  </span>
                </div>
                <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] leading-relaxed">
                  {t.overviewPillars.pillar2Desc}
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 3: 24/7 AI Voice Simulator */}
          <div className="rounded-2xl bg-[#12223a]/90 border-2 border-[#E09B30]/50 p-5 hover:border-[#E09B30] transition-all shadow-lg shadow-[#E09B30]/10 group relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#E09B30] text-[#1A3153] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
                <Bot size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-montserrat font-bold text-base text-[#FAFAFA]">
                    {t.overviewPillars.pillar3Title}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E09B30] text-[#1A3153]">
                    {t.overviewPillars.pillar3Tag}
                  </span>
                </div>
                <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] leading-relaxed mb-3">
                  {t.overviewPillars.pillar3Desc}
                </p>
                <button
                  type="button"
                  id="overview-open-simulator-btn"
                  onClick={() => setActiveView('simulator')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all cursor-pointer shadow-md"
                >
                  <span>{t.overviewPillars.openSimulatorBtn}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Quick Value Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto pt-4 text-center">
        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1A3153]/60 border border-[#A7C7E7]/20 text-xs text-[#FAFAFA]">
          <CheckCircle2 size={16} className="text-[#10b981] shrink-0" />
          <span>Zero Grammatical Anxiety</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1A3153]/60 border border-[#A7C7E7]/20 text-xs text-[#FAFAFA]">
          <CheckCircle2 size={16} className="text-[#E09B30] shrink-0" />
          <span>Native Google Gemini Live Audio</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1A3153]/60 border border-[#A7C7E7]/20 text-xs text-[#FAFAFA]">
          <CheckCircle2 size={16} className="text-[#10b981] shrink-0" />
          <span>Personalized Audio Recasts</span>
        </div>
      </div>
    </section>
  );
};

export default OverviewCorePillars;
