import React, { useState, useEffect } from 'react';
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
  Smartphone,
  Download,
  X,
} from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useAuthStore } from '../modules/auth/authStore';
import { CompactVoiceSimulator } from './CompactVoiceSimulator';
import { RiggedCharacter } from './RiggedCharacter';
import { getWhatsAppUrl } from '../config/contact';

const AndroidIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 4.26 6 5.96 6 7.88h12c0-1.92-.97-3.62-2.47-4.72zM9 5.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm6 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75z" />
  </svg>
);

const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.79 1.06-1.88.94-2.98-.94.04-2.03.63-2.68 1.41-.58.68-.99 1.77-.87 2.84 1.05.08 2.02-.53 2.61-1.27z" />
  </svg>
);

export const LandingPageView: React.FC = () => {
  const { t, isEs } = useTranslation();
  const { status, startSession } = useConversationStore();
  const { openAuthModal } = useAuthStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currency, setCurrency] = useState<'BOB' | 'USD'>('BOB');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosModal, setShowIosModal] = useState<boolean>(false);
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDownloadAndroid = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }
    setShowAndroidModal(true);
  };

  const handleDownloadIos = () => {
    // Direct download of iOS configuration profile
    const link = document.createElement('a');
    link.href = '/downloads/teacher-ivan-ios.mobileconfig';
    link.download = 'teacher-ivan-ios.mobileconfig';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowIosModal(true);
  };

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

            {/* ELEMENT 3 (Primary Button + Direct WhatsApp Button + Friction Reducer) */}
            <div className="flex flex-col items-center lg:items-start gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  id="hero-primary-cta-btn"
                  type="button"
                  onClick={handleStartVoiceTest}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:py-4 rounded-full font-montserrat font-bold text-xs sm:text-sm uppercase tracking-[0.12em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 transform hover:-translate-y-0.5 shadow-xl shadow-[#E09B30]/35 cursor-pointer min-h-[50px]"
                >
                  <Mic size={18} className="text-[#1A3153]" />
                  <span>{lp.heroPrimaryCta}</span>
                  <ArrowRight size={16} />
                </button>

                <a
                  id="hero-direct-whatsapp-btn"
                  href="https://wa.me/59172878330"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full font-montserrat font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#10b981] text-[#FAFAFA] hover:bg-[#059669] transition-all duration-200 shadow-xl shadow-[#10b981]/25 cursor-pointer min-h-[50px]"
                >
                  <MessageCircle size={17} />
                  <span>{isEs ? 'Contactar a Teacher Ivan por WhatsApp' : 'Contact Teacher Ivan on WhatsApp'}</span>
                </a>
              </div>

              {/* Friction Reducer */}
              <p className="text-xs text-[#A7C7E7] font-medium flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#10b981]" />
                <span>{lp.heroFrictionReducer}</span>
              </p>

              {/* Mobile App Quick Access Buttons in Hero */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-montserrat font-bold text-[#A7C7E7] uppercase tracking-wider">
                  {isEs ? 'App Móvil:' : 'Mobile App:'}
                </span>
                <button
                  id="hero-download-android-btn"
                  type="button"
                  onClick={handleDownloadAndroid}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12223a] hover:bg-[#1A3153] border border-[#A7C7E7]/30 text-xs font-montserrat font-bold text-[#FAFAFA] transition-all cursor-pointer shadow-sm hover:border-[#E09B30]"
                  title="Download for Android"
                >
                  <AndroidIcon className="w-3.5 h-3.5 text-[#3ddc84]" />
                  <span>Android</span>
                </button>
                <button
                  id="hero-download-ios-btn"
                  type="button"
                  onClick={handleDownloadIos}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12223a] hover:bg-[#1A3153] border border-[#A7C7E7]/30 text-xs font-montserrat font-bold text-[#FAFAFA] transition-all cursor-pointer shadow-sm hover:border-[#E09B30]"
                  title="Download for iOS"
                >
                  <AppleIcon className="w-3.5 h-3.5 text-[#FAFAFA]" />
                  <span>iOS</span>
                </button>
              </div>
            </div>
          </div>

          {/* ELEMENT 4 (One Strong Visual: Interactive Chibi Teacher Ivan & Emma Preview with Wave Animation) */}
          <div className="w-full lg:w-auto flex justify-center flex-shrink-0">
            <div
              id="hero-chibi-visual-card"
              onClick={handleStartVoiceTest}
              className="relative p-5 sm:p-7 rounded-3xl bg-[#12223a]/90 border-2 border-[#E09B30]/50 shadow-2xl max-w-sm sm:max-w-md w-full text-center cursor-pointer group hover:border-[#E09B30] transition-all"
              role="button"
              tabIndex={0}
              aria-label="Click to start 90s voice diagnostic test"
              onKeyDown={(e) => e.key === 'Enter' && handleStartVoiceTest()}
            >
              {/* Top Status */}
              <div className="flex items-center justify-between pb-3 border-b border-[#A7C7E7]/20 mb-3 sm:mb-4">
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
              <div className="flex items-center justify-center gap-3 sm:gap-4 py-2">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1A3153] border border-[#E09B30] p-1 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                    <RiggedCharacter
                      persona="teacher-ivan"
                      state="speaking"
                      className="w-full h-full"
                      alt="Chibi Teacher Ivan"
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
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1A3153] border border-[#A7C7E7] p-1 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                    <RiggedCharacter
                      persona="emma"
                      state="listening"
                      className="w-full h-full"
                      alt="Chibi Emma Coach"
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
      {/* 6. DOWNLOAD MOBILE APP SECTION (ANDROID & IOS)                            */}
      {/* ========================================================================= */}
      <section
        id="download-mobile-app-section"
        className="py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-[#12223a] to-[#1A3153] border-t border-b border-[#A7C7E7]/25 text-[#FAFAFA]"
      >
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Column: Headline, Features, and Two Prominent Download Buttons */}
          <div className="flex-1 space-y-6 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A3153] border border-[#E09B30]/40 text-xs font-montserrat font-bold text-[#E09B30] uppercase tracking-wider">
              <Smartphone size={14} />
              <span>{t.mobileApp.sectionBadge}</span>
            </div>

            <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
              {t.mobileApp.title}
            </h2>

            <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed">
              {t.mobileApp.subtitle}
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-[#12223a]/80 border border-[#A7C7E7]/20 space-y-1">
                <span className="text-xs font-montserrat font-bold text-[#E09B30] block">
                  {t.mobileApp.feature1Title}
                </span>
                <p className="text-[11px] font-inter text-[#A7C7E7] leading-snug">
                  {t.mobileApp.feature1Desc}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#12223a]/80 border border-[#A7C7E7]/20 space-y-1">
                <span className="text-xs font-montserrat font-bold text-[#E09B30] block">
                  {t.mobileApp.feature2Title}
                </span>
                <p className="text-[11px] font-inter text-[#A7C7E7] leading-snug">
                  {t.mobileApp.feature2Desc}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#12223a]/80 border border-[#A7C7E7]/20 space-y-1">
                <span className="text-xs font-montserrat font-bold text-[#E09B30] block">
                  {t.mobileApp.feature3Title}
                </span>
                <p className="text-[11px] font-inter text-[#A7C7E7] leading-snug">
                  {t.mobileApp.feature3Desc}
                </p>
              </div>
            </div>

            {/* Two Dedicated Download Buttons (Clean SVG icons, no emojis) */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                id="app-download-android-btn"
                type="button"
                onClick={handleDownloadAndroid}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-[#1A3153] hover:bg-[#12223a] border-2 border-[#3ddc84]/50 hover:border-[#3ddc84] text-[#FAFAFA] font-montserrat font-bold transition-all transform hover:-translate-y-0.5 shadow-xl cursor-pointer"
              >
                <AndroidIcon className="w-6 h-6 text-[#3ddc84] shrink-0" />
                <div className="text-left">
                  <span className="block text-[11px] uppercase tracking-wider text-[#A7C7E7]">
                    {t.mobileApp.androidSubtitle}
                  </span>
                  <span className="block text-sm sm:text-base font-extrabold text-[#FAFAFA]">
                    {t.mobileApp.downloadAndroid}
                  </span>
                </div>
              </button>

              <button
                id="app-download-ios-btn"
                type="button"
                onClick={handleDownloadIos}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-[#1A3153] hover:bg-[#12223a] border-2 border-[#A7C7E7]/50 hover:border-[#E09B30] text-[#FAFAFA] font-montserrat font-bold transition-all transform hover:-translate-y-0.5 shadow-xl cursor-pointer"
              >
                <AppleIcon className="w-6 h-6 text-[#FAFAFA] shrink-0" />
                <div className="text-left">
                  <span className="block text-[11px] uppercase tracking-wider text-[#A7C7E7]">
                    {t.mobileApp.iosSubtitle}
                  </span>
                  <span className="block text-sm sm:text-base font-extrabold text-[#FAFAFA]">
                    {t.mobileApp.downloadIos}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Device Mockup with Chibi Mascot */}
          <div className="w-full lg:w-auto flex justify-center flex-shrink-0">
            <div className="relative w-64 sm:w-72 p-4 rounded-[2.5rem] bg-[#12223a] border-4 border-[#1A3153] shadow-2xl shadow-[#1A3153]/80">
              <div className="w-20 h-4 bg-[#1A3153] rounded-full mx-auto mb-3" />
              <div className="rounded-3xl bg-[#1A3153] p-4 text-center border border-[#A7C7E7]/20 flex flex-col items-center">
                <span className="text-[10px] font-montserrat font-extrabold text-[#E09B30] uppercase tracking-wider mb-2">
                  Live Voice Assistant
                </span>
                <div className="w-36 h-36 mx-auto mb-2">
                  <RiggedCharacter persona="teacher-ivan" state="listening" className="w-full h-full" />
                </div>
                <div className="w-full py-2 px-3 rounded-xl bg-[#12223a] border border-[#A7C7E7]/25 text-left mb-2">
                  <span className="text-[9px] font-mono font-bold text-[#10b981] block">● Connected (Gemini Live)</span>
                  <span className="text-[11px] font-inter text-[#FAFAFA]">"Tell me about your project..."</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#A7C7E7] font-montserrat font-bold">
                  <Mic size={12} className="text-[#E09B30]" />
                  <span>Tap to Speak</span>
                </div>
              </div>
            </div>
          </div>
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

          <div className="pt-3 flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
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

              <a
                id="final-cta-whatsapp-btn"
                href="https://wa.me/59172878330"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-montserrat font-bold text-sm uppercase tracking-wider bg-[#10b981] text-[#FAFAFA] hover:bg-[#059669] transition-all duration-200 shadow-xl shadow-[#10b981]/25 cursor-pointer min-h-[52px]"
              >
                <MessageCircle size={18} />
                <span>{isEs ? 'Contactar a Teacher Ivan por WhatsApp' : 'Contact Teacher Ivan on WhatsApp'}</span>
              </a>
            </div>
            <p className="text-xs text-[#A7C7E7] font-medium flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#10b981]" />
              <span>{lp.heroFrictionReducer}</span>
            </p>

            {/* Mobile App Download in Final CTA */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleDownloadAndroid}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A3153] hover:bg-[#12223a] border border-[#A7C7E7]/30 text-xs font-montserrat font-bold text-[#FAFAFA] transition-all cursor-pointer shadow-sm hover:border-[#E09B30]"
              >
                <AndroidIcon className="w-4 h-4 text-[#3ddc84]" />
                <span>{t.mobileApp.downloadAndroid}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadIos}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A3153] hover:bg-[#12223a] border border-[#A7C7E7]/30 text-xs font-montserrat font-bold text-[#FAFAFA] transition-all cursor-pointer shadow-sm hover:border-[#E09B30]"
              >
                <AppleIcon className="w-4 h-4 text-[#FAFAFA]" />
                <span>{t.mobileApp.downloadIos}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* iOS Installation Instructions Modal */}
      {showIosModal && (
        <div
          id="ios-install-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#12223a]/80 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div className="bg-[#1A3153] border-2 border-[#E09B30]/50 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl relative space-y-4 text-[#FAFAFA]">
            <button
              type="button"
              onClick={() => setShowIosModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#12223a] cursor-pointer"
              aria-label={t.mobileApp.closeModal}
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAFAFA]/10 border border-[#A7C7E7]/30 flex items-center justify-center text-[#FAFAFA]">
                <AppleIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-montserrat font-extrabold text-base sm:text-lg text-[#FAFAFA]">
                  {t.mobileApp.iosModalTitle}
                </h3>
                <p className="text-xs text-[#A7C7E7] font-inter">
                  {t.mobileApp.iosModalSubtitle}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#12223a] border border-[#A7C7E7]/20 space-y-1">
                <span className="text-xs font-montserrat font-bold text-[#E09B30] block">
                  {t.mobileApp.iosStep1Title}
                </span>
                <p className="text-xs text-[#A7C7E7] leading-relaxed">
                  {t.mobileApp.iosStep1Desc}
                </p>
                <a
                  href="/downloads/teacher-ivan-ios.mobileconfig"
                  download="teacher-ivan-ios.mobileconfig"
                  className="inline-flex items-center gap-1.5 text-xs text-[#E09B30] hover:underline font-bold pt-1"
                >
                  <Download size={13} />
                  <span>{t.mobileApp.iosDownloadBtn}</span>
                </a>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#12223a] border border-[#A7C7E7]/20 space-y-1">
                <span className="text-xs font-montserrat font-bold text-[#E09B30] block">
                  {t.mobileApp.iosStep2Title}
                </span>
                <p className="text-xs text-[#A7C7E7] leading-relaxed">
                  {t.mobileApp.iosStep2Desc}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFAFA]/5 border border-[#A7C7E7]/15 text-[11px] text-[#A7C7E7] leading-normal italic">
                {t.mobileApp.iosAlternative}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="px-5 py-2 rounded-full bg-[#E09B30] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-[#c88624] cursor-pointer"
              >
                {t.mobileApp.closeModal}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android Installation Modal */}
      {showAndroidModal && (
        <div
          id="android-install-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#12223a]/80 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div className="bg-[#1A3153] border-2 border-[#3ddc84]/50 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl relative space-y-4 text-[#FAFAFA]">
            <button
              type="button"
              onClick={() => setShowAndroidModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#12223a] cursor-pointer"
              aria-label={t.mobileApp.closeModal}
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#3ddc84]/15 border border-[#3ddc84]/30 flex items-center justify-center text-[#3ddc84]">
                <AndroidIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-montserrat font-extrabold text-base sm:text-lg text-[#FAFAFA]">
                  {t.mobileApp.androidModalTitle}
                </h3>
                <p className="text-xs text-[#A7C7E7] font-inter">
                  {t.mobileApp.androidModalSubtitle}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-[#12223a] border border-[#A7C7E7]/20 space-y-2">
                <span className="text-xs font-montserrat font-bold text-[#3ddc84] block">
                  {t.mobileApp.androidStep1Title}
                </span>
                <p className="text-xs text-[#A7C7E7] leading-relaxed">
                  {t.mobileApp.androidStep1Desc}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAndroidModal(false)}
                className="px-5 py-2 rounded-full bg-[#E09B30] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-[#c88624] cursor-pointer"
              >
                {t.mobileApp.androidClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPageView;
