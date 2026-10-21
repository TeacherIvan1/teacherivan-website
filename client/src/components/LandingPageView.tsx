import React, { useState } from 'react';
import {
  Mic,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  Award,
  CheckCircle2,
  Calendar,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useAuthStore } from '../modules/auth/authStore';
import { CompactVoiceSimulator } from './CompactVoiceSimulator';
import { getWhatsAppUrl } from '../config/contact';

export const LandingPageView: React.FC = () => {
  const { t, isEs } = useTranslation();
  const { status, startSession } = useConversationStore();
  const { openAuthModal } = useAuthStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currency, setCurrency] = useState<'BOB' | 'USD'>('BOB');

  const isConnected = status === 'connected';

  const handleStartVoiceTest = () => {
    const simulatorElement = document.getElementById('flagship-simulator-section');
    if (simulatorElement) {
      simulatorElement.scrollIntoView({ behavior: 'smooth' });
    }
    if (!isConnected) {
      startSession();
    }
  };

  const lp = t.landingPage;

  const faqs = [
    { q: lp.faq1Q, a: lp.faq1A },
    { q: lp.faq2Q, a: lp.faq2A },
    { q: lp.faq3Q, a: lp.faq3A },
    { q: lp.faq4Q, a: lp.faq4A },
  ];

  const plans = [
    {
      id: 'essential',
      name: t.pricingPlans.essential.name,
      target: t.pricingPlans.essential.target,
      price: currency === 'BOB' ? t.pricingPlans.essential.priceBob : t.pricingPlans.essential.priceUsd,
      features: t.pricingPlans.essential.features.slice(0, 4),
      isPopular: false,
    },
    {
      id: 'pro',
      name: t.pricingPlans.pro.name,
      target: t.pricingPlans.pro.target,
      price: currency === 'BOB' ? t.pricingPlans.pro.priceBob : t.pricingPlans.pro.priceUsd,
      features: t.pricingPlans.pro.features.slice(0, 4),
      isPopular: true,
    },
    {
      id: 'executive',
      name: t.pricingPlans.executive.name,
      target: t.pricingPlans.executive.target,
      price: currency === 'BOB' ? t.pricingPlans.executive.priceBob : t.pricingPlans.executive.priceUsd,
      features: t.pricingPlans.executive.features.slice(0, 4),
      isPopular: false,
    },
  ];

  return (
    <div id="landing-page-view" className="flex flex-col w-full animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (ABOVE THE FOLD — STRICTLY 5 ELEMENTS)                    */}
      {/* ========================================================================= */}
      <section
        id="hero-section"
        className="relative bg-gradient-to-b from-[#1A3153] to-[#12223a] border-b border-[#A7C7E7]/25 text-[#FAFAFA] pt-10 pb-14 md:pt-16 md:pb-20 px-4 sm:px-6 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
          {/* Left: Headline, Subheadline, Button, Trust Signal */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            {/* ELEMENT 5 (Trust Signal placed prominently above headline) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12223a] border border-[#E09B30]/40 mb-5 shadow-sm text-xs font-montserrat font-bold text-[#E09B30]">
              <span>{lp.heroTrustSignal}</span>
            </div>

            {/* ELEMENT 1 (Headline: 6–10 words, max 2 lines, outcome-focused, written to "you") */}
            <h1 className="font-montserrat font-extrabold text-3xl sm:text-4xl md:text-5xl leading-[1.15] mb-4 tracking-tight text-[#FAFAFA]">
              {lp.heroHeadline}
            </h1>

            {/* ELEMENT 2 (Subheadline: 1 sentence) */}
            <p className="font-inter text-base sm:text-lg text-[#A7C7E7] mb-7 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {lp.heroSubhead}
            </p>

            {/* ELEMENT 3 (One Primary Button + Friction Reducer) */}
            <div className="flex flex-col items-center lg:items-start gap-2.5">
              <button
                id="hero-primary-cta-btn"
                type="button"
                onClick={handleStartVoiceTest}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-montserrat font-bold text-sm sm:text-base uppercase tracking-[0.12em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 transform hover:-translate-y-0.5 shadow-xl shadow-[#E09B30]/35 cursor-pointer min-h-[52px]"
              >
                <Mic size={20} className="text-[#1A3153]" />
                <span>{lp.heroPrimaryCta}</span>
                <ArrowRight size={18} />
              </button>

              {/* Friction Reducer */}
              <p className="text-xs text-[#A7C7E7] font-medium flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#10b981]" />
                <span>{lp.heroFrictionReducer}</span>
              </p>
            </div>
          </div>

          {/* ELEMENT 4 (One Strong Visual: Interactive Chibi Teacher Ivan & Emma Preview with Wave Animation) */}
          <div className="w-full lg:w-auto flex justify-center flex-shrink-0">
            <div
              id="hero-chibi-visual-card"
              onClick={handleStartVoiceTest}
              className="relative p-6 sm:p-7 rounded-3xl bg-[#12223a]/90 border-2 border-[#E09B30]/50 shadow-2xl max-w-sm sm:max-w-md w-full text-center cursor-pointer group hover:border-[#E09B30] transition-all"
              role="button"
              tabIndex={0}
              aria-label="Click to start 90s voice diagnostic test"
              onKeyDown={(e) => e.key === 'Enter' && handleStartVoiceTest()}
            >
              {/* Top Status */}
              <div className="flex items-center justify-between pb-3 border-b border-[#A7C7E7]/20 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#FAFAFA]">
                    Gemini Live Native Voice
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#E09B30] bg-[#1A3153] px-2 py-0.5 rounded-full border border-[#E09B30]/30 font-bold">
                  90s Spoken Test
                </span>
              </div>

              {/* Rigged Chibi Characters Pair (Ivan & Emma) */}
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1A3153] border border-[#E09B30] p-1.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                    <img
                      src="/assets/characters/ivan-pose-speaking.svg"
                      alt="Chibi Teacher Ivan Speaking"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-montserrat font-bold text-[#E09B30] mt-1.5">
                    Teacher Ivan
                  </span>
                </div>

                {/* Animated Pulsing Sound Waves between them */}
                <div className="flex items-center gap-1 h-12 px-2" aria-hidden="true">
                  {[16, 28, 42, 22, 36, 44, 26, 18].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-[#A7C7E7]/60 to-[#E09B30]"
                      style={{
                        height: `${h}px`,
                        animation: `soundWavePulse 1.1s ease-in-out infinite alternate ${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1A3153] border border-[#A7C7E7] p-1.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                    <img
                      src="/assets/characters/emma-pose-listening.svg"
                      alt="Chibi Emma Listening Coach"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-montserrat font-bold text-[#A7C7E7] mt-1.5">
                    Emma Coach
                  </span>
                </div>
              </div>

              {/* Bottom Tag */}
              <div className="mt-4 pt-3 border-t border-[#A7C7E7]/20 flex items-center justify-center gap-2 text-xs font-montserrat font-bold text-[#FAFAFA] group-hover:text-[#E09B30] transition-colors">
                <Sparkles size={14} className="text-[#E09B30]" />
                <span>{isEs ? 'Haz clic para probar tu voz gratis →' : 'Click to test your voice free →'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PROBLEM → SOLUTION STRIP                                               */}
      {/* ========================================================================= */}
      <section
        id="problem-solution-strip"
        className="py-10 px-4 sm:px-6 bg-[#12223a] border-b border-[#A7C7E7]/25 text-center"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Contrast Line 1 (The Problem: Traditional) */}
          <p className="font-montserrat font-semibold text-sm sm:text-base md:text-lg text-[#f87171] leading-relaxed">
            ❌ {lp.problemLine}
          </p>

          {/* Contrast Line 2 (The Solution: Teacher Ivan + AI) */}
          <p className="font-montserrat font-extrabold text-base sm:text-xl md:text-2xl text-[#FAFAFA] leading-relaxed">
            ✨ <span className="text-[#E09B30]">{lp.solutionLine}</span>
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FLAGSHIP AI VOICE SIMULATOR SHOWCASE (CENTERPIECE ON LANDING PAGE)     */}
      {/* ========================================================================= */}
      <section
        id="flagship-simulator-section"
        className="py-12 md:py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full border-b border-[#A7C7E7]/25"
      >
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>{lp.centerpieceBadge}</span>
          </div>
          <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
            {lp.centerpieceTitle}
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#A7C7E7]">
            {lp.centerpieceSubtitle}
          </p>
        </div>

        {/* Embedded Interactive Simulator Console with Tiered Access */}
        <div className="rounded-3xl bg-[#12223a] border-2 border-[#A7C7E7]/30 shadow-2xl overflow-hidden p-2 sm:p-4">
          <CompactVoiceSimulator />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. 3 OUTCOME BENEFITS (NOT FEATURES) — 3 CLEAN #FAFAFA CARDS              */}
      {/* ========================================================================= */}
      <section
        id="outcome-benefits-section"
        className="py-14 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full border-b border-[#A7C7E7]/25"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
            <Award size={13} />
            <span>{lp.outcomeBenefitsBadge}</span>
          </div>
          <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#FAFAFA] tracking-tight">
            {lp.outcomeBenefitsTitle}
          </h2>
        </div>

        {/* 3 Outcome Cards (Max 3 lines each, crisp #FAFAFA on light cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Stop translating in your head */}
          <div className="p-6 rounded-3xl bg-[#FAFAFA] text-[#1A3153] border border-[#A7C7E7] shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#1A3153] text-[#E09B30] flex items-center justify-center mb-4">
                <Brain size={22} />
              </div>
              <h3 className="font-montserrat font-bold text-lg text-[#1A3153] mb-2 leading-snug">
                {lp.benefit1Title}
              </h3>
              <p className="font-inter text-xs sm:text-sm text-[#4A5568] leading-relaxed">
                {lp.benefit1Desc}
              </p>
            </div>
          </div>

          {/* Card 2: Fix mistakes in real time */}
          <div className="p-6 rounded-3xl bg-[#FAFAFA] text-[#1A3153] border border-[#A7C7E7] shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#1A3153] text-[#E09B30] flex items-center justify-center mb-4">
                <Zap size={22} />
              </div>
              <h3 className="font-montserrat font-bold text-lg text-[#1A3153] mb-2 leading-snug">
                {lp.benefit2Title}
              </h3>
              <p className="font-inter text-xs sm:text-sm text-[#4A5568] leading-relaxed">
                {lp.benefit2Desc}
              </p>
            </div>
          </div>

          {/* Card 3: Advance 1 CEFR level faster */}
          <div className="p-6 rounded-3xl bg-[#FAFAFA] text-[#1A3153] border border-[#A7C7E7] shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#1A3153] text-[#10b981] flex items-center justify-center mb-4">
                <Award size={22} />
              </div>
              <h3 className="font-montserrat font-bold text-lg text-[#1A3153] mb-2 leading-snug">
                {lp.benefit3Title}
              </h3>
              <p className="font-inter text-xs sm:text-sm text-[#4A5568] leading-relaxed">
                {lp.benefit3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS (3 NUMBERED STEPS)                                        */}
      {/* ========================================================================= */}
      <section
        id="how-it-works-section"
        className="py-14 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full border-b border-[#A7C7E7]/25"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>{lp.howItWorksBadge}</span>
          </div>
          <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#FAFAFA] tracking-tight">
            {lp.howItWorksTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#12223a] border border-[#A7C7E7]/30 shadow-xl flex flex-col justify-between">
            <div>
              <span className="font-montserrat font-extrabold text-2xl text-[#E09B30] block mb-3">01</span>
              <h3 className="font-montserrat font-bold text-base text-[#FAFAFA] mb-2">
                {lp.step1Title}
              </h3>
              <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
                {lp.step1Desc}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#12223a] border border-[#A7C7E7]/30 shadow-xl flex flex-col justify-between">
            <div>
              <span className="font-montserrat font-extrabold text-2xl text-[#E09B30] block mb-3">02</span>
              <h3 className="font-montserrat font-bold text-base text-[#FAFAFA] mb-2">
                {lp.step2Title}
              </h3>
              <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
                {lp.step2Desc}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#12223a] border border-[#A7C7E7]/30 shadow-xl flex flex-col justify-between">
            <div>
              <span className="font-montserrat font-extrabold text-2xl text-[#10b981] block mb-3">03</span>
              <h3 className="font-montserrat font-bold text-base text-[#FAFAFA] mb-2">
                {lp.step3Title}
              </h3>
              <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
                {lp.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. OBJECTION HANDLING (SHORT FAQ + TRANSPARENT PLANS)                     */}
      {/* ========================================================================= */}
      <section
        id="faq-pricing-section"
        className="py-14 md:py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full border-b border-[#A7C7E7]/25"
      >
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
            <ShieldCheck size={13} />
            <span>{lp.faqBadge}</span>
          </div>
          <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#FAFAFA] tracking-tight">
            {lp.faqTitle}
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#A7C7E7]">
            {lp.faqSubtitle}
          </p>
        </div>

        {/* Currency Switcher for Plans */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-xs font-montserrat font-bold text-[#A7C7E7]">Moneda:</span>
          <div className="p-1 rounded-full bg-[#12223a] border border-[#A7C7E7]/30 flex items-center">
            <button
              type="button"
              onClick={() => setCurrency('BOB')}
              className={`px-3 py-1 rounded-full text-xs font-montserrat font-bold transition-all cursor-pointer ${
                currency === 'BOB' ? 'bg-[#E09B30] text-[#1A3153]' : 'text-[#A7C7E7]'
              }`}
            >
              BOB (Bs.)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-full text-xs font-montserrat font-bold transition-all cursor-pointer ${
                currency === 'USD' ? 'bg-[#E09B30] text-[#1A3153]' : 'text-[#A7C7E7]'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* 3 Transparent Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-6 rounded-3xl flex flex-col justify-between transition-all ${
                p.isPopular
                  ? 'bg-gradient-to-b from-[#1A3153] to-[#12223a] border-2 border-[#E09B30] shadow-2xl'
                  : 'bg-[#12223a]/80 border border-[#A7C7E7]/30 shadow-lg'
              }`}
            >
              <div>
                {p.isPopular && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E09B30] text-[#1A3153] text-[10px] font-montserrat font-extrabold uppercase tracking-wider mb-2">
                    {isEs ? 'Más Popular' : 'Most Popular'}
                  </span>
                )}
                <h3 className="font-montserrat font-bold text-lg text-[#FAFAFA] mb-1">{p.name}</h3>
                <span className="text-xs text-[#A7C7E7] font-medium block mb-3">{p.target}</span>
                <span className="font-montserrat font-black text-2xl text-[#FAFAFA] block mb-4">{p.price}</span>

                <ul className="space-y-2 text-xs text-[#FAFAFA]/90 mb-6">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-[#E09B30] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={getWhatsAppUrl(`Hola Teacher Ivan! Me gustaría inscribirme al plan ${p.name} (${p.price}).`)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 px-4 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                  p.isPopular
                    ? 'bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624]'
                    : 'bg-[#1A3153] border border-[#A7C7E7]/40 text-[#FAFAFA] hover:border-[#E09B30]'
                }`}
              >
                <MessageCircle size={14} />
                <span>{isEs ? 'Elegir Plan' : 'Select Plan'}</span>
              </a>
            </div>
          ))}
        </div>

        {/* 4 Concise FAQ Accordion Items */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#12223a]/90 border border-[#A7C7E7]/30 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left font-montserrat font-bold text-xs sm:text-sm text-[#FAFAFA] flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} className="text-[#E09B30] shrink-0" /> : <ChevronDown size={16} className="text-[#A7C7E7] shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs font-inter text-[#A7C7E7] leading-relaxed border-t border-[#A7C7E7]/15 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FINAL CALL TO ACTION (REPEATS EXACT PRIMARY BUTTON)                   */}
      {/* ========================================================================= */}
      <section
        id="final-cta-section"
        className="py-16 md:py-20 px-4 sm:px-6 bg-[#12223a] text-center"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#FAFAFA] tracking-tight">
            {lp.finalCtaHeadline}
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] max-w-lg mx-auto">
            {lp.finalCtaSubhead}
          </p>

          <div className="pt-3 flex flex-col items-center gap-2">
            <button
              type="button"
              id="final-primary-cta-btn"
              onClick={handleStartVoiceTest}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-montserrat font-bold text-sm sm:text-base uppercase tracking-[0.12em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 transform hover:-translate-y-0.5 shadow-xl shadow-[#E09B30]/35 cursor-pointer min-h-[52px]"
            >
              <Mic size={20} className="text-[#1A3153]" />
              <span>{lp.finalPrimaryCta}</span>
              <ArrowRight size={18} />
            </button>
            <p className="text-xs text-[#A7C7E7] font-medium flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#10b981]" />
              <span>{lp.heroFrictionReducer}</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPageView;
