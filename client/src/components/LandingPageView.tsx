import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  Layers,
  Check,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useAuthStore } from '../modules/auth/authStore';
import { CompactVoiceSimulator } from './CompactVoiceSimulator';
import { HeroCanvasStage } from './landing/HeroCanvasStage';
import { ChapterNavPill } from './landing/ChapterNavPill';
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

  // Progressive scroll-scrubbed progress calculation on desktop
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
      simulatorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      badge: isEs ? '1 Clase 1-a-1 / sem' : '1 Live Class / wk',
      features: [
        isEs ? '1 reunión individual por semana (60 min)' : '1 live 1-on-1 meeting per week (60 min)',
        isEs ? '10 sesiones de práctica diaria con IA' : '10 AI voice simulator practice sessions/day',
        isEs ? 'Tracker de sprint de micro-aprendizaje 5 días' : '5-day micro-learning habit sprint tracker',
        isEs ? 'Feedback asíncrono de pronunciación semanal' : 'Weekly asynchronous speaking feedback',
      ],
      isPopular: false,
    },
    {
      id: 'pro',
      name: t.pricingPlans.pro.name,
      target: t.pricingPlans.pro.target,
      price: currency === 'BOB' ? t.pricingPlans.pro.priceBob : t.pricingPlans.pro.priceUsd,
      badge: isEs ? '⭐ FLAGSHIP / MÁS POPULAR' : '⭐ FLAGSHIP / MOST POPULAR',
      features: [
        isEs ? '2 reuniones individuales por semana (60 min c/u)' : '2 live 1-on-1 meetings per week (60 min each)',
        isEs ? 'Acceso 24/7 ILIMITADO al Simulador de Voz IA' : 'Unlimited 24/7 Access to AI Voice Simulator',
        isEs ? 'Micro-aprendizaje diario + Feedback de audio por WhatsApp' : 'Daily micro-learning + WhatsApp audio feedback',
        isEs ? 'Reporte pedagógico semanal con avance MCER' : 'Weekly AI pedagogical progress report & CEFR tracking',
      ],
      isPopular: true,
    },
    {
      id: 'executive',
      name: t.pricingPlans.executive.name,
      target: t.pricingPlans.executive.target,
      price: currency === 'BOB' ? t.pricingPlans.executive.priceBob : t.pricingPlans.executive.priceUsd,
      badge: isEs ? 'Executive Partner' : 'Executive Partner',
      features: [
        isEs ? '3 reuniones individuales por semana (60 min c/u)' : '3 live 1-on-1 meetings per week (60 min each)',
        isEs ? 'Acceso 24/7 ILIMITADO al Simulador de Voz IA' : 'Unlimited 24/7 Access to AI Voice Simulator',
        isEs ? 'Revisión de presentaciones y correos de trabajo real' : 'Workplace presentation & real email reviews',
        isEs ? 'Agenda prioritaria VIP y consultoría a demanda' : 'Executive impact metrics & VIP priority support',
      ],
      isPopular: false,
    },
  ];

  return (
    <div
      id="landing-page-view"
      className="flex flex-col w-full max-w-[100vw] overflow-x-hidden animate-in fade-in duration-200"
    >
      {/* Floating Pear.no-Style Sticky Chapter Navigation Bar (Desktop & Mobile) */}
      <ChapterNavPill onStartVoiceTest={handleStartVoiceTest} />

      {/* Global Scroll-Scrub Progress Hairline Indicator on Top */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-[#1A3153] z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#A7C7E7] via-[#E09B30] to-[#E09B30] transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (EDITORIAL ARCHITECTURE + RELOAD VARIATION STAGE)         */}
      {/* ========================================================================= */}
      <section
        id="hero-section"
        className="relative bg-gradient-to-b from-[#1A3153] via-[#12223a] to-[#12223a] border-b border-[#A7C7E7]/25 text-[#FAFAFA] pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-12 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10">
          {/* Left Column: Monumental Headline, Subhead, Primary Action & Badges */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            {/* Architectural Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A3153] border border-[#E09B30]/40 mb-6 shadow-sm text-xs font-montserrat font-bold text-[#E09B30] uppercase tracking-[0.15em]">
              <Sparkles size={13} className="text-[#E09B30]" />
              <span>{lp.heroTrustSignal}</span>
            </div>

            {/* Monumental Headline */}
            <h1 className="font-montserrat font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.1] mb-6 tracking-tight text-[#FAFAFA]">
              {lp.heroHeadline}
            </h1>

            {/* Editorial Subhead */}
            <p className="font-inter text-base sm:text-lg text-[#A7C7E7] mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {lp.heroSubhead}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col items-center lg:items-start gap-3.5">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  id="hero-primary-cta-btn"
                  type="button"
                  onClick={handleStartVoiceTest}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-montserrat font-extrabold text-xs sm:text-sm uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 transform hover:-translate-y-0.5 shadow-xl shadow-[#E09B30]/35 cursor-pointer min-h-[52px]"
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-montserrat font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#10b981] text-[#FAFAFA] hover:bg-[#059669] transition-all duration-200 shadow-xl shadow-[#10b981]/25 cursor-pointer min-h-[52px]"
                >
                  <MessageCircle size={18} />
                  <span>{isEs ? 'WhatsApp Teacher Ivan' : 'Chat on WhatsApp'}</span>
                </a>
              </div>

              {/* Friction Reducer */}
              <p className="text-xs text-[#A7C7E7] font-medium flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#10b981]" />
                <span>{lp.heroFrictionReducer}</span>
              </p>

              {/* Mobile App Quick Access Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-mono font-bold text-[#A7C7E7] uppercase tracking-wider">
                  {isEs ? 'APP NATIVA:' : 'NATIVE APP:'}
                </span>
                <button
                  id="hero-download-android-btn"
                  type="button"
                  onClick={handleDownloadAndroid}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12223a] hover:bg-[#1A3153] border border-[#A7C7E7]/30 text-xs font-montserrat font-bold text-[#FAFAFA] transition-all cursor-pointer shadow-sm hover:border-[#3ddc84]"
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

          {/* Right Column: Interactive Halftone / Dither Canvas Hero Stage (3 Reload Variations) */}
          <div className="w-full lg:w-auto flex justify-center flex-shrink-0">
            <HeroCanvasStage onStartVoiceTest={handleStartVoiceTest} />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ARCHITECTURAL PROBLEM → SOLUTION HAIRLINE STRIP                           */}
      {/* ========================================================================= */}
      <section
        id="problem-solution-strip"
        className="py-10 px-4 sm:px-6 bg-[#12223a] border-b border-[#A7C7E7]/25 text-center"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="font-montserrat font-semibold text-sm sm:text-base md:text-lg text-[#f87171] leading-relaxed">
            ❌ {lp.problemLine}
          </p>
          <p className="font-montserrat font-extrabold text-base sm:text-xl md:text-2xl text-[#FAFAFA] leading-relaxed">
            ✨ <span className="text-[#E09B30]">{lp.solutionLine}</span>
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CH. 1 — THE BICHRONOUS MODEL (SPLIT-SCREEN STICKY PIN ON DESKTOP)          */}
      {/* ========================================================================= */}
      <section
        id="chapter-1-model"
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 bg-[#FAFAFA] text-[#1A3153] border-b border-[#1A3153]/15"
      >
        <div className="max-w-7xl mx-auto">
          {/* Split-Screen Layout (Sticky pinned left column on lg: >=1024px) */}
          <div className="lg:grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Sticky Thesis & Institutional Metrics */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start space-y-6 mb-10 lg:mb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A3153] text-[#FAFAFA] text-xs font-montserrat font-bold uppercase tracking-[0.15em]">
                <Clock size={13} className="text-[#E09B30]" />
                <span>{lp.ch1Badge}</span>
              </div>

              <div className="font-mono text-xs text-[#4A5568] uppercase tracking-wider">
                // ARCHITECTURE: BICHRONOUS PEDAGOGY
              </div>

              <h2 className="font-montserrat font-black text-2xl sm:text-3xl md:text-4xl leading-tight text-[#1A3153] tracking-tight">
                {lp.ch1Thesis}
              </h2>

              <p className="font-inter text-sm sm:text-base text-[#4A5568] leading-relaxed">
                {lp.ch1Description}
              </p>

              {/* Architectural Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#1A3153]/15 shadow-sm">
                  <span className="font-montserrat font-black text-2xl sm:text-3xl text-[#E09B30] block">
                    &gt;75%
                  </span>
                  <span className="text-xs font-montserrat font-bold text-[#1A3153] uppercase tracking-wider">
                    {isEs ? 'Habla del Alumno' : 'Student Talking Time'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#1A3153]/15 shadow-sm">
                  <span className="font-montserrat font-black text-2xl sm:text-3xl text-[#1A3153] block">
                    0.0s
                  </span>
                  <span className="text-xs font-montserrat font-bold text-[#4A5568] uppercase tracking-wider">
                    {isEs ? 'Latencia Nativa PCM' : 'PCM Native Latency'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#1A3153]/15 shadow-sm">
                  <span className="font-montserrat font-black text-2xl sm:text-3xl text-[#10b981] block">
                    3x
                  </span>
                  <span className="text-xs font-montserrat font-bold text-[#1A3153] uppercase tracking-wider">
                    {isEs ? 'Reflejos Más Rápidos' : 'Faster Fluency Reflex'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#1A3153]/15 shadow-sm">
                  <span className="font-montserrat font-black text-2xl sm:text-3xl text-[#E09B30] block">
                    10m
                  </span>
                  <span className="text-xs font-montserrat font-bold text-[#4A5568] uppercase tracking-wider">
                    {isEs ? 'Micro-Hábito Diario' : 'Daily Micro-Habit'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Architectural Cards with Scroll-Scrubbed Progress Bars */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Traditional Academies (30% STT) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#FAFAFA] border border-[#1A3153]/15 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#f87171] uppercase tracking-wider">
                    [01 // TRADITIONAL ACADEMIES]
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-montserrat font-bold">
                    30% STT
                  </span>
                </div>

                <h3 className="font-montserrat font-bold text-xl text-[#1A3153]">
                  {isEs
                    ? 'Academias Tradicionales y Clases Masivas'
                    : 'Traditional Academies & 30-Student Lectures'}
                </h3>

                {/* Progress bar scrub */}
                <div>
                  <div className="flex justify-between text-xs font-inter text-[#4A5568] mb-1.5">
                    <span>{isEs ? 'Tiempo de producción oral del alumno:' : 'Student speaking participation:'}</span>
                    <span className="font-mono font-bold text-red-600">30%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full w-[30%]" />
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-[#4A5568] pt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold shrink-0">✕</span>
                    <span>
                      {isEs
                        ? '20 a 30 alumnos compitiendo por 2 minutos de participación al azar.'
                        : '20 to 30 students competing for 2 minutes of random speaking time.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold shrink-0">✕</span>
                    <span>
                      {isEs
                        ? '45 minutos de explicaciones gramaticales pasivas en pizarrón.'
                        : '45 minutes of passive grammatical lecture on a whiteboard.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold shrink-0">✕</span>
                    <span>
                      {isEs
                        ? 'Miedo al juicio grupal que paraliza la espontaneidad al hablar.'
                        : 'Fear of peer judgment freezes conversational spontaneity.'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Teacher Ivan 1-on-1 Bichronous Coaching (78% STT) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#1A3153] text-[#FAFAFA] border-2 border-[#E09B30] shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#E09B30] uppercase tracking-wider">
                    [02 // TEACHER IVAN BICHRONOUS COACHING]
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#E09B30] text-[#1A3153] text-[11px] font-montserrat font-extrabold uppercase">
                    &gt;75% STT
                  </span>
                </div>

                <h3 className="font-montserrat font-bold text-xl sm:text-2xl text-[#FAFAFA]">
                  {isEs
                    ? 'Coaching 1-a-1 en Vivo con Teacher Ivan'
                    : 'Live 1-on-1 Coaching with Teacher Ivan'}
                </h3>

                {/* Progress bar scrub */}
                <div>
                  <div className="flex justify-between text-xs font-inter text-[#A7C7E7] mb-1.5">
                    <span>{isEs ? 'Tiempo de producción oral del alumno:' : 'Student speaking participation:'}</span>
                    <span className="font-mono font-bold text-[#E09B30]">78%</span>
                  </div>
                  <div className="h-2 w-full bg-[#12223a] rounded-full overflow-hidden">
                    <div className="h-full bg-[#E09B30] rounded-full w-[78%]" />
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-[#A7C7E7] pt-2">
                  <li className="flex items-start gap-2 text-[#FAFAFA]">
                    <CheckCircle2 size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                    <span>
                      {isEs
                        ? 'Sesión privada de 60 minutos enfocada 100% en tu conversación real.'
                        : 'Private 60-minute session dedicated 100% to your actual speaking.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-[#FAFAFA]">
                    <CheckCircle2 size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                    <span>
                      {isEs
                        ? 'Recasting auditivo inmediato: errores corregidos sutilmente sin cortar tu tren de pensamiento.'
                        : 'Immediate gentle audio recasting: mistakes corrected without halting your train of thought.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-[#FAFAFA]">
                    <CheckCircle2 size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                    <span>
                      {isEs
                        ? 'Simulaciones directas de entrevistas técnicas, exámenes IELTS y reuniones corporativas.'
                        : 'Tailored simulations of technical job interviews, IELTS exams, and executive meetings.'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Card 3: 24/7 AI Voice Immersion & Daily Micro-Learning (95% Reflex Retention) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#FAFAFA] border border-[#1A3153]/15 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#10b981] uppercase tracking-wider">
                    [03 // 24/7 AI VOICE IMMERSION & MICRO-SPRINTS]
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-montserrat font-bold">
                    95% RETENTION
                  </span>
                </div>

                <h3 className="font-montserrat font-bold text-xl text-[#1A3153]">
                  {isEs
                    ? 'Simulador de Voz IA 24/7 y Micro-Sprints Diarios'
                    : '24/7 AI Voice Lab & Daily Micro-Learning Sprints'}
                </h3>

                {/* Progress bar scrub */}
                <div>
                  <div className="flex justify-between text-xs font-inter text-[#4A5568] mb-1.5">
                    <span>{isEs ? 'Retención de reflejos automáticos:' : 'Automated speaking reflex retention:'}</span>
                    <span className="font-mono font-bold text-[#10b981]">95%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#10b981] rounded-full w-[95%]" />
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-[#4A5568] pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#10b981] shrink-0 mt-0.5" />
                    <span>
                      {isEs
                        ? 'Práctica ilimitada a cualquier hora con Emma y Teacher Ivan con audio nativo Gemini Live.'
                        : 'Unlimited practice anytime with Emma & Teacher Ivan powered by Gemini Live native audio.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#10b981] shrink-0 mt-0.5" />
                    <span>
                      {isEs
                        ? 'Micro-hábitos de 10 minutos al día que convierten el conocimiento pasivo en reflejo oral.'
                        : '10-minute daily micro-habits that turn passive knowledge into automatic spoken reflex.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#10b981] shrink-0 mt-0.5" />
                    <span>
                      {isEs
                        ? 'Scorecards pedagógicos con recasts exactos y reporte de colocaciones aprendidas.'
                        : 'Instant pedagogical scorecards with exact recasts and target collocation logs.'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CH. 2 — THE FLAGSHIP AI VOICE LAB (EMBEDDED INTERACTIVE SIMULATOR)        */}
      {/* ========================================================================= */}
      <section
        id="chapter-2-lab"
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 bg-[#1A3153] text-[#FAFAFA] border-b border-[#A7C7E7]/25"
      >
        <div id="flagship-simulator-section" className="max-w-6xl mx-auto w-full space-y-10">
          {/* Architectural Chapter Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-[0.15em]">
              <Sparkles size={13} />
              <span>{lp.ch2Badge}</span>
            </div>

            <div className="font-mono text-xs text-[#A7C7E7] uppercase tracking-wider">
              [SYS.VOICE // GEMINI LIVE NATIVE PCM 24kHz // DUAL CHIBI RIGS]
            </div>

            <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
              {lp.ch2Title}
            </h2>

            <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed">
              {lp.ch2Subtitle}
            </p>
          </div>

          {/* Embedded Interactive Simulator Console */}
          <div className="rounded-3xl bg-[#12223a] border-2 border-[#A7C7E7]/30 shadow-2xl overflow-hidden p-2 sm:p-5">
            <CompactVoiceSimulator />
          </div>

          {/* Locked Scenarios / Sign-Up Prompt Banner */}
          <div className="p-5 rounded-2xl bg-[#12223a]/80 border border-[#A7C7E7]/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-xs font-montserrat font-bold text-[#E09B30] uppercase tracking-wider block">
                {isEs ? '¿Quieres desbloquear todos los escenarios y tu ruta de 5 días?' : 'Want to unlock all scenarios and your 5-day path?'}
              </span>
              <p className="text-xs text-[#A7C7E7]">
                {isEs
                  ? 'Crea tu cuenta de estudiante gratis en 2 pasos para guardar tu progreso y agendar con Teacher Ivan.'
                  : 'Create your free student account in 2 steps to track your progress and book with Teacher Ivan.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="px-6 py-2.5 rounded-full bg-[#1A3153] hover:bg-[#E09B30] hover:text-[#1A3153] border border-[#A7C7E7]/40 text-xs font-montserrat font-bold text-[#FAFAFA] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-md"
            >
              {isEs ? 'Crear Cuenta Gratis →' : 'Create Free Account →'}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CH. 3 — THE PLANS & FULL DISCLOSURE (EDITORIAL LAYOUT + BOB / USD)        */}
      {/* ========================================================================= */}
      <section
        id="chapter-3-plans"
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 bg-[#12223a] text-[#FAFAFA] border-b border-[#A7C7E7]/25"
      >
        <div className="max-w-6xl mx-auto w-full space-y-12">
          {/* Chapter Header + Currency Toggle */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-[0.15em]">
              <ShieldCheck size={14} />
              <span>{lp.ch3Badge}</span>
            </div>

            <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
              {lp.ch3Title}
            </h2>

            <p className="font-inter text-sm sm:text-base text-[#A7C7E7]">
              {lp.ch3Subtitle}
            </p>

            {/* Currency Switcher */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <span className="text-xs font-montserrat font-bold text-[#A7C7E7]">
                {isEs ? 'Moneda de Pago:' : 'Currency:'}
              </span>
              <div className="p-1 rounded-full bg-[#1A3153] border border-[#A7C7E7]/30 flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => setCurrency('BOB')}
                  className={`px-4 py-1 rounded-full text-xs font-montserrat font-bold transition-all cursor-pointer ${
                    currency === 'BOB'
                      ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
                      : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
                  }`}
                >
                  BOB (Bs.)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-4 py-1 rounded-full text-xs font-montserrat font-bold transition-all cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
                      : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>
          </div>

          {/* 3 Transparent Plan Columns with Architectural Hairline Borders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`p-7 rounded-3xl flex flex-col justify-between transition-all duration-200 ${
                  p.isPopular
                    ? 'bg-gradient-to-b from-[#1A3153] to-[#12223a] border-2 border-[#E09B30] shadow-2xl transform md:-translate-y-2'
                    : 'bg-[#12223a]/90 border border-[#A7C7E7]/30 shadow-xl'
                }`}
              >
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[10px] font-montserrat font-extrabold uppercase tracking-wider mb-3 ${
                      p.isPopular
                        ? 'bg-[#E09B30] text-[#1A3153]'
                        : 'bg-[#1A3153] text-[#A7C7E7] border border-[#A7C7E7]/25'
                    }`}
                  >
                    {p.badge}
                  </span>

                  <h3 className="font-montserrat font-bold text-xl text-[#FAFAFA] mb-1">
                    {p.name}
                  </h3>
                  <span className="text-xs text-[#A7C7E7] font-medium block mb-4">
                    {p.target}
                  </span>

                  <div className="pb-4 mb-4 border-b border-[#A7C7E7]/20">
                    <span className="font-montserrat font-black text-2xl sm:text-3xl text-[#FAFAFA]">
                      {p.price}
                    </span>
                  </div>

                  <ul className="space-y-3 text-xs sm:text-sm text-[#FAFAFA]/90 mb-8">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2
                          size={15}
                          className={`${p.isPopular ? 'text-[#E09B30]' : 'text-[#10b981]'} shrink-0 mt-0.5`}
                        />
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={getWhatsAppUrl(`Hola Teacher Ivan! Me gustaría consultar disponibilidad e inscribirme al ${p.name} (${p.price}).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 px-4 rounded-full font-montserrat font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    p.isPopular
                      ? 'bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] shadow-[#E09B30]/30'
                      : 'bg-[#1A3153] hover:bg-[#E09B30] hover:text-[#1A3153] border border-[#A7C7E7]/40 text-[#FAFAFA]'
                  }`}
                >
                  <MessageCircle size={15} />
                  <span>{isEs ? 'Elegir Plan por WhatsApp' : 'Select Plan on WhatsApp'}</span>
                </a>
              </div>
            ))}
          </div>

          {/* Full Disclosure Comparative Table (Hairline Grid) */}
          <div className="rounded-3xl bg-[#1A3153]/60 border border-[#A7C7E7]/25 p-6 overflow-x-auto">
            <span className="text-xs font-mono font-bold text-[#E09B30] uppercase tracking-wider block mb-4">
              [FULL DISCLOSURE // COMPARATIVE MATRIX]
            </span>
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#A7C7E7]/20 text-[#A7C7E7] font-montserrat font-bold">
                  <th className="pb-3 pr-4">Feature / Metric</th>
                  <th className="pb-3 px-4 text-[#E09B30]">Teacher Ivan</th>
                  <th className="pb-3 px-4">Traditional Franchises</th>
                  <th className="pb-3 pl-4">Mass Apps (Duolingo/Elsa)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A7C7E7]/15 text-[#FAFAFA]">
                <tr>
                  <td className="py-3 pr-4 font-semibold text-[#A7C7E7]">Speaking Time / Class</td>
                  <td className="py-3 px-4 font-bold text-[#10b981]">&gt;75% (45+ min/hr)</td>
                  <td className="py-3 px-4 text-[#f87171]">2–5 min in group of 25</td>
                  <td className="py-3 pl-4 text-[#A7C7E7]">Only isolated words</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-[#A7C7E7]">Live Native AI Voice</td>
                  <td className="py-3 px-4 font-bold text-[#10b981]">Gemini Live PCM 24kHz</td>
                  <td className="py-3 px-4 text-[#f87171]">None</td>
                  <td className="py-3 pl-4 text-[#A7C7E7]">Robotic TTS (high lag)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-[#A7C7E7]">Pedagogical Mentor</td>
                  <td className="py-3 px-4 font-bold text-[#10b981]">Teacher Ivan 1-on-1</td>
                  <td className="py-3 px-4 text-[#f87171]">Rotating student tutors</td>
                  <td className="py-3 pl-4 text-[#f87171]">None (automated bot)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-[#A7C7E7]">Contract & Hidden Fees</td>
                  <td className="py-3 px-4 font-bold text-[#10b981]">Zero lock-in, cancel anytime</td>
                  <td className="py-3 px-4 text-[#f87171]">12-month forced billing</td>
                  <td className="py-3 pl-4 text-[#A7C7E7]">Auto-renew subscriptions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CH. 4 — ASKED BEFORE (EDITORIAL ACCORDION) & MOBILE APP DOWNLOAD STRIP    */}
      {/* ========================================================================= */}
      <section
        id="chapter-4-faq"
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 bg-[#FAFAFA] text-[#1A3153] border-b border-[#1A3153]/15"
      >
        <div className="max-w-4xl mx-auto w-full space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1A3153] text-[#FAFAFA] text-xs font-montserrat font-bold uppercase tracking-[0.15em]">
              <Sparkles size={13} className="text-[#E09B30]" />
              <span>{lp.ch4Badge}</span>
            </div>

            <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#1A3153] tracking-tight">
              {lp.ch4Title}
            </h2>

            <p className="font-inter text-sm sm:text-base text-[#4A5568]">
              {lp.ch4Subtitle}
            </p>
          </div>

          {/* Clean Hairline-Divided Q&A Rows */}
          <div className="border-t border-b border-[#1A3153]/15 divide-y divide-[#1A3153]/15">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="transition-all">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-5 text-left font-montserrat font-bold text-sm sm:text-base text-[#1A3153] flex items-center justify-between gap-4 cursor-pointer hover:text-[#E09B30] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-[#E09B30] shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-[#1A3153]/60 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="pb-5 text-xs sm:text-sm font-inter text-[#4A5568] leading-relaxed pr-8">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Direct WhatsApp Callout */}
          <div className="p-6 rounded-3xl bg-[#1A3153] text-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left shadow-xl">
            <div className="space-y-1">
              <h3 className="font-montserrat font-extrabold text-base sm:text-lg text-[#FAFAFA]">
                {isEs ? '¿Tienes una pregunta específica sobre tu caso?' : 'Have a specific question about your situation?'}
              </h3>
              <p className="text-xs sm:text-sm text-[#A7C7E7]">
                {isEs
                  ? 'Escríbele directamente a Teacher Ivan por WhatsApp y recibe respuesta en minutos.'
                  : 'Chat directly with Teacher Ivan on WhatsApp and get answers in minutes.'}
              </p>
            </div>

            <a
              href="https://wa.me/59172878330"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#FAFAFA] font-montserrat font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-lg"
            >
              <MessageCircle size={16} />
              <span>+591 72878330</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MOBILE APP DOWNLOAD STRIP (ANDROID & IOS)                                  */}
      {/* ========================================================================= */}
      <section
        id="download-mobile-app-section"
        className="py-16 md:py-20 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#12223a] to-[#1A3153] border-b border-[#A7C7E7]/25 text-[#FAFAFA]"
      >
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Column: Headline, Features, Download Buttons */}
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

            {/* Two Dedicated Download Buttons */}
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
      {/* FINAL CALL TO ACTION                                                      */}
      {/* ========================================================================= */}
      <section
        id="final-cta-section"
        className="py-16 md:py-24 px-4 sm:px-6 bg-[#12223a] text-center"
      >
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
            {lp.finalCtaHeadline}
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] max-w-lg mx-auto">
            {lp.finalCtaSubhead}
          </p>

          <div className="pt-4 flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
              <button
                type="button"
                id="final-primary-cta-btn"
                onClick={handleStartVoiceTest}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-montserrat font-extrabold text-sm sm:text-base uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 transform hover:-translate-y-0.5 shadow-xl shadow-[#E09B30]/35 cursor-pointer min-h-[52px]"
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
                <span>{isEs ? 'WhatsApp Teacher Ivan' : 'WhatsApp Teacher Ivan'}</span>
              </a>
            </div>

            <p className="text-xs text-[#A7C7E7] font-medium flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#10b981]" />
              <span>{lp.heroFrictionReducer}</span>
            </p>
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
