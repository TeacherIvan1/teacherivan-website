import React from 'react';
import { Mic, Sparkles, ArrowRight, ShieldCheck, Headphones, Zap } from 'lucide-react';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { useDevModeStore } from '../modules/dev/devModeStore';

export const HeroSection: React.FC = () => {
  const { status, startSession } = useConversationStore();
  const persona = useTeachingStore((s) => s.persona);
  const { t } = useTranslation();
  const isDeveloperMode = useDevModeStore((s) => s.isDeveloperMode);
  const isConnected = status === 'connected';

  const isIvan = persona === 'teacher-ivan';
  const heroCoachName = isIvan ? 'Teacher Ivan • AI Mentor' : t.hero.coachName;
  const heroAvatarSrc = isIvan ? '/assets/logo.svg' : '/assets/emma.svg';
  const heroAvatarAlt = isIvan ? 'Teacher Ivan Official Mascot' : 'Emma AI Tutor Mascot';

  const handleStartPractice = () => {
    const startBtn = document.getElementById('start-session-btn');
    if (startBtn) {
      startBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (!isConnected) {
        startSession();
      }
    }
  };

  const handleLearnMore = () => {
    const el = document.getElementById('hybrid-method-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative bg-[#1A3153] border-b border-[#A7C7E7]/25 text-[#FAFAFA] py-16 md:py-20 px-6 overflow-hidden">
      {/* Decorative ambient background accents */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 bg-[#A7C7E7]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-10 w-80 h-80 bg-[#E09B30]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        {/* Left Column: Value Proposition & High-Converting CTAs */}
        <div className="flex-1 text-center lg:text-left">
          {/* Institutional Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAFAFA]/10 border border-[#A7C7E7]/40 mb-6 backdrop-blur-sm">
            <Sparkles size={14} className="text-[#E09B30]" />
            <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#FAFAFA]">
              {t.hero.badge}
            </span>
          </div>

          {/* Main H1 Headline */}
          <h1 className="font-montserrat font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-5xl leading-tight mb-6 tracking-tight text-[#FAFAFA]">
            {t.hero.titlePart1}
            <span className="text-[#E09B30] relative inline-block">
              {t.hero.titleTeacher}
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E09B30]/40 rounded-full" />
            </span>
            <br className="hidden sm:inline" /> {t.hero.titlePart2}
          </h1>

          {/* Subtitle / Value Proposition */}
          <p className="font-inter text-base sm:text-lg text-[#A7C7E7] max-width-xl mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            {t.hero.subtitle}
          </p>

          {/* High-Converting CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
            <button
              id="hero-start-practice-btn"
              onClick={handleStartPractice}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-montserrat font-bold text-sm uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-[#E09B30]/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E09B30]/50"
            >
              <Mic size={18} />
              <span>{isConnected ? t.hero.sessionActive : t.hero.startPractice}</span>
              <ArrowRight size={16} />
            </button>

            <button
              id="hero-the-method-btn"
              onClick={handleLearnMore}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-montserrat font-semibold text-sm uppercase tracking-[0.15em] bg-transparent border border-[#A7C7E7] text-[#FAFAFA] hover:bg-[#FAFAFA]/10 hover:border-[#FAFAFA] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7C7E7]"
            >
              <span>{t.hero.theMethod}</span>
            </button>
          </div>

          {/* Trust Metrics / Micro-proof */}
          <div className="pt-6 border-t border-[#A7C7E7]/20 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#A7C7E7]">
            <div className="flex items-center gap-2">
              <Headphones size={16} className="text-[#E09B30]" />
              <span>{isDeveloperMode ? t.hero.metricAudio : t.hero.metricAudioStudent}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-[#E09B30]" />
              <span>{t.hero.metricLatency}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#E09B30]" />
              <span>{t.hero.metricCefr}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Card with Brand Mascot Logo */}
        <div className="w-full lg:w-auto flex-shrink-0 flex justify-center">
          <div className="relative p-6 sm:p-8 rounded-2xl bg-[#12223a]/90 border border-[#A7C7E7] shadow-2xl backdrop-blur-md max-w-sm sm:max-w-md w-full">
            {/* Top Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-[#A7C7E7]/25 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#FAFAFA]">
                  {t.hero.cardBadge}
                </span>
              </div>
              <span className="text-[11px] font-mono font-medium text-[#A7C7E7] px-2 py-0.5 rounded bg-[#1A3153] border border-[#A7C7E7]/30">
                {heroCoachName}
              </span>
            </div>

            {/* Logo Graphic Display with Isolation Zone (Minimum 160px width guaranteed) */}
            <div className="bg-[#1A3153] rounded-xl p-6 flex flex-col items-center justify-center border border-[#A7C7E7]/30 mb-6 group transition-all">
              <div className="relative py-2 px-4 flex items-center justify-center min-h-[160px]">
                <img
                  src={heroAvatarSrc}
                  alt={heroAvatarAlt}
                  className="min-w-[160px] w-52 sm:w-60 h-auto max-h-56 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30]">
                {t.hero.platformTag}
              </p>
            </div>

            {/* Quick Interactive Snippet */}
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#1A3153]/70 border border-[#A7C7E7]/25 text-xs text-[#FAFAFA] flex items-center justify-between">
                <span className="text-[#A7C7E7]">{t.hero.curriculumMode}</span>
                <span className="font-montserrat font-bold uppercase tracking-[0.15em] text-[#E09B30]">
                  {t.hero.curriculumVal}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#1A3153]/70 border border-[#A7C7E7]/25 text-xs text-[#FAFAFA] flex items-center justify-between">
                <span className="text-[#A7C7E7]">{t.hero.cefrRange}</span>
                <span className="font-montserrat font-bold uppercase tracking-[0.15em] text-[#FAFAFA]">
                  {t.hero.cefrVal}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
