import React from 'react';
import { Mic, MessageCircle, ArrowRight, CheckCircle2, Zap, Clock } from 'lucide-react';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { useTranslation } from '../modules/i18n/languageStore';

export const HeroSection: React.FC = () => {
  const { status, startSession } = useConversationStore();
  const persona = useTeachingStore((s) => s.persona);
  const setActiveView = useNavigationStore((s) => s.setActiveView);
  const { t } = useTranslation();
  const isConnected = status === 'connected';

  const WHATSAPP_PHONE = '59178680795';
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    'Hola Teacher Ivan! Me gustaría consultar disponibilidad para clases 1 a 1 de inglés y probar el tutor de voz IA.'
  )}`;

  const handleStartPractice = () => {
    setActiveView('simulator');
    if (!isConnected) {
      startSession();
    }
  };

  const isEmma = persona === 'emma';
  const tutorName = isEmma ? 'Emma' : 'Teacher Ivan';

  return (
    <section className="relative bg-[#1A3153] border-b border-[#A7C7E7]/25 text-[#FAFAFA] pt-12 pb-14 md:pt-20 md:pb-24 px-4 sm:px-6 overflow-hidden">
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12223a]/80 border border-[#A7C7E7]/40 mb-4 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#FAFAFA]">
              {t.heroRedesign.badge}
            </span>
          </div>

          {/* Main Outcome-Focused H1 (<=8 words) */}
          <h1 className="font-montserrat font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.12] mb-4 tracking-tight text-[#FAFAFA]">
            {t.heroRedesign.headlinePart1}
            <span className="text-[#E09B30] relative inline-block underline decoration-[#E09B30]/40 decoration-4 underline-offset-4">
              {t.heroRedesign.headlineHighlight}
            </span>
          </h1>

          {/* Subhead (<=20 words: Ivan + AI differentiator) */}
          <p className="font-inter text-base sm:text-lg text-[#A7C7E7] mb-5 leading-relaxed max-w-xl mx-auto lg:mx-0">
            {t.heroRedesign.subhead}
          </p>

          {/* 3 KPI Pills (>75% STT, 10–15m Daily Micro-Learning, 24/7 AI Tutor) */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-7">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12223a] border border-[#E09B30]/40 text-[#E09B30] text-xs font-montserrat font-bold">
              <Clock size={13} />
              <span>&gt;75% STT</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12223a] border border-[#A7C7E7]/30 text-[#A7C7E7] text-xs font-montserrat font-bold">
              <Zap size={13} />
              <span>10–15m Daily Micro-Learning</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12223a] border border-[#10b981]/30 text-[#10b981] text-xs font-montserrat font-bold">
              <CheckCircle2 size={13} />
              <span>24/7 AI Tutor</span>
            </span>
          </div>

          {/* Single Clean Hero CTA + Subtle WhatsApp Link (No mobile clutter) */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-4">
            {/* Primary: Try AI Voice Tutor */}
            <button
              id="hero-primary-cta-btn"
              onClick={handleStartPractice}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-montserrat font-bold text-sm uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-[#E09B30]/35 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E09B30]/50 cursor-pointer min-h-[48px]"
            >
              <Mic size={18} className="text-[#1A3153]" />
              <span>{isConnected ? t.hero.sessionActive : t.heroRedesign.primaryCta}</span>
              <ArrowRight size={16} />
            </button>

            {/* Subtle WhatsApp Link */}
            <a
              id="hero-whatsapp-subtle-link"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#A7C7E7] hover:text-[#FAFAFA] hover:underline font-semibold flex items-center gap-1.5 py-2 px-3 transition-colors"
            >
              <MessageCircle size={15} className="text-[#25D366]" />
              <span>{t.heroRedesign.whatsappCta}</span>
            </a>
          </div>

          {/* Reassurance Microcopy */}
          <p className="text-xs text-[#A7C7E7]/80 flex items-center justify-center lg:justify-start gap-1.5 font-medium">
            <CheckCircle2 size={13} className="text-[#10b981]" />
            <span>{t.heroRedesign.noSignup}</span>
          </p>
        </div>

        {/* Right Column: Interactive Live Mic + Sound Wave Visual */}
        <div className="w-full lg:w-auto flex-shrink-0 flex justify-center">
          <div className="relative p-6 sm:p-8 rounded-3xl bg-[#12223a]/90 border border-[#A7C7E7]/40 shadow-2xl backdrop-blur-md max-w-sm sm:max-w-md w-full text-center">
            {/* Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-[#A7C7E7]/25 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#FAFAFA]">
                  {t.heroRedesign.liveReady}
                </span>
              </div>
              <span className="text-[11px] font-mono font-medium text-[#E09B30] px-2.5 py-0.5 rounded-full bg-[#1A3153] border border-[#E09B30]/30">
                {tutorName}
              </span>
            </div>

            {/* Interactive Sound Wave & Mic Stage */}
            <div
              onClick={handleStartPractice}
              className="bg-[#1A3153]/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center border border-[#A7C7E7]/30 hover:border-[#E09B30] transition-all cursor-pointer group shadow-inner relative overflow-hidden"
              role="button"
              tabIndex={0}
              aria-label="Click to start speaking English with AI tutor"
              onKeyDown={(e) => e.key === 'Enter' && handleStartPractice()}
            >
              {/* Radial background pulse */}
              <div className="absolute inset-0 bg-radial from-[#E09B30]/10 via-transparent to-transparent pointer-events-none group-hover:scale-125 transition-transform duration-700" />

              {/* Pulsing Mic Circle */}
              <div className="relative mb-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#E09B30] to-[#f59e0b] flex items-center justify-center text-[#1A3153] shadow-lg shadow-[#E09B30]/35 transform group-hover:scale-105 transition-transform duration-300">
                  <Mic size={36} className="text-[#1A3153]" />
                </div>
                {/* Subtle ripple rings */}
                <div className="absolute -inset-2 rounded-full border border-[#E09B30]/40 animate-ping pointer-events-none opacity-40" />
                <div className="absolute -inset-4 rounded-full border border-[#A7C7E7]/20 pointer-events-none" />
              </div>

              {/* Dynamic Sound Wave Bars */}
              <div className="flex items-center justify-center gap-1.5 h-10 w-full mb-3" aria-hidden="true">
                {[14, 24, 38, 20, 32, 42, 28, 16, 36, 44, 26, 18, 30, 22].map((height, i) => (
                  <span
                    key={i}
                    className="w-1.5 rounded-full bg-gradient-to-t from-[#A7C7E7]/50 via-[#E09B30] to-[#E09B30]/80 group-hover:scale-y-125 transition-transform duration-300"
                    style={{
                      height: `${height}px`,
                      animation: `soundWavePulse 1.2s ease-in-out infinite alternate ${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>

              <p className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#FAFAFA] group-hover:text-[#E09B30] transition-colors">
                {t.heroRedesign.liveReadySub}
              </p>
            </div>

            {/* Bottom Value Tag */}
            <div className="mt-4 pt-3 border-t border-[#A7C7E7]/15 flex items-center justify-center gap-2 text-xs text-[#A7C7E7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E09B30]" />
              <span>{t.heroRedesign.tagline}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
