import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  X,
  Headphones,
  Calendar,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { useTranslation } from '../../modules/i18n/languageStore';
import { useConversationStore } from '../../modules/conversation/conversationStore';
import { useAuthStore } from '../../modules/auth/authStore';
import { useTheme } from '../../modules/theme/ThemeContext';
import { useScrollLock } from '../../hooks/useScrollLock';
import { BrandWordmark } from '../BrandWordmark';
import { WorldBackdrop, PortalGateway } from '../portal/PortalBackdrop';
import { ArcCardCarousel } from './ArcCardCarousel';
import { CompactVoiceSimulator } from '../CompactVoiceSimulator';
import { PricingSection } from '../PricingSection';
import { Footer } from '../Footer';
import { getGeneralWhatsAppUrl, handleWhatsAppClick } from '../../utils/whatsapp';
import { PARALLAX_MAGNITUDES } from '../../config/portalAssets';

// ============================================================================
// 2.1 Hooks & Math Helpers
// ============================================================================

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const handleChange = () => setIsMobile(mq.matches);
    handleChange();
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReduced(mq.matches);
    handleChange();
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}

export const PortalLanding: React.FC = () => {
  const { lang, setLang, isEs } = useTranslation();
  const { status, startSession } = useConversationStore();
  const { openAuthModal } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Refs for zero-lag requestAnimationFrame transforms
  const introRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const scrollProgressRef = useRef<number>(0);

  // State for opacity choreography & UI Drawer / FAQ
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [uiVisible, setUiVisible] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useScrollLock(isDrawerOpen);

  // Flip uiVisible true 600ms after mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUiVisible(true);
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

  // Pinned Intro Scroll Progress (0 -> 1)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateScroll = () => {
      const introEl = introRef.current;
      const denom = introEl ? Math.max(1, introEl.offsetHeight - window.innerHeight) : window.innerHeight * 0.6;
      const progress = clamp(window.scrollY / denom, 0, 1);
      scrollProgressRef.current = progress;
      setScrollProgress(progress);

      // Immediately update transform on scroll even if mouse loop is idle (mobile / reduced motion)
      const ep = easeInOut(progress);
      if (prefersReducedMotion) {
        if (worldRef.current) {
          worldRef.current.style.transform = 'scale(1) translate(0px, 0px)';
        }
        if (portalRef.current) {
          portalRef.current.style.transform = 'scale(1) translate(0px, 0px)';
        }
      } else if (isMobile) {
        const ws = lerp(1, 1.18, ep);
        const ps = lerp(1, 7.5, ep);
        if (worldRef.current) {
          worldRef.current.style.transform = `scale(${ws}) translate(0px, 0px)`;
        }
        if (portalRef.current) {
          portalRef.current.style.transform = `scale(${ps}) translate(0px, 0px)`;
        }
      }
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [isMobile, prefersReducedMotion]);

  // Desktop Mouse Parallax + Scroll Zoom requestAnimationFrame Loop
  useEffect(() => {
    if (typeof window === 'undefined' || isMobile || prefersReducedMotion) {
      return;
    }

    let tx = 0;
    let ty = 0;
    let mx = 0;
    let my = 0;
    let rafId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      tx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      ty = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    };

    const tick = () => {
      mx = lerp(mx, tx, 0.07);
      my = lerp(my, ty, 0.07);
      const rx = -mx;
      const ry = -my;

      const ep = easeInOut(scrollProgressRef.current);

      if (worldRef.current) {
        const s = lerp(1, 1.18, ep);
        worldRef.current.style.transform = `scale(${s}) translate(${rx * PARALLAX_MAGNITUDES.world}px, ${ry * PARALLAX_MAGNITUDES.world}px)`;
      }

      if (portalRef.current) {
        const s = lerp(1, 7.5, ep);
        portalRef.current.style.transform = `scale(${s}) translate(${rx * PARALLAX_MAGNITUDES.portal}px, ${ry * PARALLAX_MAGNITUDES.portal}px)`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.cancelAnimationFrame(rafId);
    };
  }, [isMobile, prefersReducedMotion]);

  // Opacity Choreography
  const portalOpacity =
    scrollProgress <= 0.66 ? 1 : clamp(1 - (scrollProgress - 0.66) / 0.22, 0, 1);
  const scene1Opacity = clamp(1 - scrollProgress / 0.22, 0, 1);

  const isConnected = status === 'connected';

  const handleStartVoiceTest = () => {
    setIsDrawerOpen(false);
    const simulatorElement = document.getElementById('flagship-simulator-section');
    if (simulatorElement) {
      simulatorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (!isConnected) {
      startSession();
    }
  };

  const scrollToSection = (id: string) => {
    setIsDrawerOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const faqs = [
    {
      q: isEs
        ? '¿Cómo funciona el Método Bicrónico (>75% de habla activa)?'
        : 'How does the Bicronic Method (>75% active speaking) work?',
      a: isEs
        ? 'Combina dos motores: (1) Inmersión asincrónica 24/7 con la tutora de voz Emma, micro-sprints de 10 minutos en Mi Ruta y el generador de recursos; y (2) Sesiones 1-a-1 en vivo de 60 minutos con Teacher Ivan donde hablás más del 75% del tiempo con recasting nativo inmediato.'
        : 'It combines two engines: (1) 24/7 asynchronous voice immersion with AI tutor Emma, 10-minute daily sprints in My Path, and custom resources; and (2) 60-minute live 1-on-1 sessions with Teacher Ivan where you speak over 75% of the time with instant native recasting.',
    },
    {
      q: isEs
        ? '¿En qué horarios puedo agendar mis clases 1-a-1 en vivo?'
        : 'What hours are available for live 1-on-1 class scheduling?',
      a: isEs
        ? 'Las sesiones 1-a-1 en vivo con Teacher Ivan se reservan de Lunes a Viernes entre las 14:00 y las 20:00 (hora de Bolivia, BOT / UTC-4) directamente desde tu calendario en el portal.'
        : 'Live 1-on-1 sessions with Teacher Ivan can be booked Monday through Friday between 14:00 and 20:00 (Bolivia Time, BOT / UTC-4) directly inside your student portal calendar.',
    },
    {
      q: isEs
        ? '¿Qué incluye cada plan mensual (300 / 580 / 850 BOB) y cómo me inscribo?'
        : 'What does each monthly plan (300 / 580 / 850 BOB) include and how do I enroll?',
      a: isEs
        ? 'Essential (300 BOB/mes) te da acceso ilimitado 24/7 al Laboratorio de Voz, Generador de Recursos y Mi Ruta (0 clases en vivo). Pro (580 BOB/mes) suma 3 clases 1-a-1 en vivo por semana. Executive (850 BOB/mes) suma 5 clases 1-a-1 en vivo por semana (diario Lun–Vie). Sin contratos forzosos.'
        : 'Essential (300 BOB/mo) unlocks unlimited 24/7 Voice Lab, Resource Generator, and My Path (0 live classes). Pro (580 BOB/mo) adds 3 live 1-on-1 classes per week. Executive (850 BOB/mo) adds 5 live 1-on-1 classes per week (daily Mon–Fri). Zero lock-in contracts.',
    },
    {
      q: isEs
        ? '¿Cómo funciona el Diagnóstico Hablado gratuito de 90 segundos?'
        : 'How does the free 90-second Spoken Diagnostic work?',
      a: isEs
        ? 'Hacé clic en "Test 90s Gratis", activá tu micrófono y conversá en inglés con Teacher Ivan o Emma durante 90 segundos. Al finalizar recibís al instante tu puntaje MCER (A1 a C1), métricas de fluidez y 3 reformulaciones nativas sin necesidad de tarjeta.'
        : 'Click "Free 90s Test", enable your microphone, and speak in English with Teacher Ivan or Emma for 90 seconds. You immediately receive your CEFR band (A1 to C1), fluency breakdown, and 3 native recasts—no credit card required.',
    },
  ];

  return (
    <div
      id="landing-page-view"
      className="relative w-full max-w-[100vw] overflow-x-clip text-[#FAFAFA] select-none"
    >
      {/* ========================================================================= */}
      {/* 1. FIXED WORLD BACKGROUND (zIndex: 0)                                     */}
      {/* ========================================================================= */}
      <WorldBackdrop worldRef={worldRef} />

      {/* ========================================================================= */}
      {/* 2. FIXED TOP NAVIGATION (zIndex: 50)                                      */}
      {/* ========================================================================= */}
      <nav
        id="portal-top-navbar"
        aria-label="Primary Navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '14px 14px' : '26px 40px',
          background:
            scrollProgress > 0.25
              ? 'linear-gradient(180deg, rgba(9,19,38,0.82) 0%, rgba(9,19,38,0) 100%)'
              : 'transparent',
          transition: 'background 0.3s ease',
        }}
      >
        {/* Left: <BrandWordmark /> */}
        <BrandWordmark
          isMobile={isMobile}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />

        {/* Right: ES|EN pill + "Test 90s Gratis" pill + "Entrar" link + Round Hamburger */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 6 : 14,
            flexShrink: 0,
          }}
        >
          {/* Compact ES | EN Translucent Pill Toggle */}
          <div
            id="portal-lang-toggle"
            role="group"
            aria-label="Language Switcher"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 3,
              borderRadius: 999,
              background: 'rgba(9, 19, 38, 0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(167, 199, 231, 0.30)',
            }}
          >
            <button
              type="button"
              id="lang-btn-es"
              onClick={() => setLang('es')}
              style={{
                padding: isMobile ? '4px 6px' : '5px 10px',
                borderRadius: 999,
                fontFamily: "'Montserrat', 'Inter', sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? 10.5 : 11,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                border: 'none',
                background: lang === 'es' ? '#E09B30' : 'transparent',
                color: lang === 'es' ? '#091326' : '#FAFAFA',
                transition: 'all 0.2s ease',
              }}
            >
              ES
            </button>
            <button
              type="button"
              id="lang-btn-en"
              onClick={() => setLang('en')}
              style={{
                padding: isMobile ? '4px 6px' : '5px 10px',
                borderRadius: 999,
                fontFamily: "'Montserrat', 'Inter', sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? 10.5 : 11,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                border: 'none',
                background: lang === 'en' ? '#E09B30' : 'transparent',
                color: lang === 'en' ? '#091326' : '#FAFAFA',
                transition: 'all 0.2s ease',
              }}
            >
              EN
            </button>
          </div>

          {/* Subtle "Entrar" / "Login" link (hidden into drawer on <480px) */}
          <button
            id="signin-nav-btn"
            type="button"
            onClick={() => openAuthModal('signin')}
            className="hidden sm:inline-flex items-center gap-1.5 font-montserrat font-semibold text-xs text-[#FAFAFA] hover:text-[#E09B30] transition-colors cursor-pointer px-2.5 py-1.5"
          >
            <UserIcon size={13} />
            <span>{isEs ? 'Entrar' : 'Login'}</span>
          </button>

          {/* Pill CTA Button "Test 90s Gratis" / "Free 90s Test" */}
          <button
            id="guest-nav-assessment"
            type="button"
            onClick={handleStartVoiceTest}
            className="bg-[#FAFAFA] text-[#1A3153] hover:bg-[#E09B30] hover:text-[#091326] transition-colors cursor-pointer whitespace-nowrap shadow-md"
            style={{
              fontFamily: "'Montserrat', 'Inter', sans-serif",
              fontWeight: 600,
              fontSize: isMobile ? 11 : 13,
              borderRadius: 999,
              padding: isMobile ? '8px 11px' : '11px 22px',
              border: 'none',
            }}
          >
            {isMobile ? (isEs ? 'Test 90s' : '90s Test') : (isEs ? 'Test 90s Gratis' : 'Free 90s Test')}
          </button>

          {/* Auragate-style Round 42px (38px mobile) White Hamburger Button */}
          <button
            id="mobile-hamburger-btn"
            data-testid="portal-hamburger-btn"
            type="button"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            aria-label={isDrawerOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
            aria-expanded={isDrawerOpen}
            style={{
              width: isMobile ? 38 : 42,
              height: isMobile ? 38 : 42,
              borderRadius: '50%',
              background: '#FAFAFA',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(9,19,38,0.28)',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <line
                x1="3.5"
                y1="7.2"
                x2="16.5"
                y2="7.2"
                stroke="#1A3153"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="3.5"
                y1="12.8"
                x2="16.5"
                y2="12.8"
                stroke="#1A3153"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* SLEEK FROSTED-NAVY FULL-HEIGHT NAVIGATION DRAWER                          */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <>
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-[#091326]/70 backdrop-blur-sm z-[80] animate-in fade-in duration-200"
            aria-hidden="true"
          />
          <div
            id="mobile-navigation-drawer"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Drawer"
            className="fixed top-0 right-0 w-[86vw] max-w-sm h-full z-[85] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto overscroll-contain text-[#FAFAFA] shadow-2xl animate-in slide-in-from-right duration-250"
            style={{
              background: 'rgba(19, 38, 66, 0.94)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              borderLeft: '1px solid rgba(167, 199, 231, 0.25)',
            }}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-5 border-b border-[#A7C7E7]/20">
              <BrandWordmark isMobile={true} onClick={() => setIsDrawerOpen(false)} />
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-[#091326]/70 hover:bg-[#E09B30] text-[#FAFAFA] hover:text-[#091326] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="py-6 flex flex-col gap-2.5 flex-1">
              <button
                type="button"
                onClick={() => scrollToSection('section-2-stories')}
                className="w-full min-h-[44px] px-4 py-3 rounded-2xl text-left font-montserrat font-bold text-sm text-[#FAFAFA] hover:bg-[#E09B30]/15 hover:text-[#E09B30] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{isEs ? 'Historias de Fluidez Real' : 'Real Fluency Stories'}</span>
                <ArrowRight size={14} className="text-[#E09B30]" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('chapter-1-bicronic')}
                className="w-full min-h-[44px] px-4 py-3 rounded-2xl text-left font-montserrat font-bold text-sm text-[#FAFAFA] hover:bg-[#E09B30]/15 hover:text-[#E09B30] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{isEs ? 'El Método Bicrónico' : 'The Bicronic Method'}</span>
                <ArrowRight size={14} className="text-[#E09B30]" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('chapter-2-voicelab')}
                className="w-full min-h-[44px] px-4 py-3 rounded-2xl text-left font-montserrat font-bold text-sm text-[#FAFAFA] hover:bg-[#E09B30]/15 hover:text-[#E09B30] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{isEs ? 'Laboratorio de Voz IA 24/7' : '24/7 AI Voice Lab'}</span>
                <ArrowRight size={14} className="text-[#E09B30]" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('chapter-3-plans')}
                className="w-full min-h-[44px] px-4 py-3 rounded-2xl text-left font-montserrat font-bold text-sm text-[#FAFAFA] hover:bg-[#E09B30]/15 hover:text-[#E09B30] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{isEs ? 'Planes (300 / 580 / 850 BOB)' : 'Plans (300 / 580 / 850 BOB)'}</span>
                <ArrowRight size={14} className="text-[#E09B30]" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('chapter-4-faq')}
                className="w-full min-h-[44px] px-4 py-3 rounded-2xl text-left font-montserrat font-bold text-sm text-[#FAFAFA] hover:bg-[#E09B30]/15 hover:text-[#E09B30] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{isEs ? 'Preguntas Frecuentes' : 'FAQ'}</span>
                <ArrowRight size={14} className="text-[#E09B30]" />
              </button>

              {/* Light / Night Mode Toggle inside Drawer */}
              <div className="mt-3 pt-3 border-t border-[#A7C7E7]/15 flex items-center justify-between px-4">
                <span className="font-inter text-xs text-[#A7C7E7]">
                  {isEs ? 'Modo de Superficie' : 'Surface Theme'}
                </span>
                <button
                  id="drawer-theme-toggle-btn"
                  type="button"
                  onClick={toggleTheme}
                  className="px-3.5 py-1.5 rounded-full bg-[#091326] border border-[#A7C7E7]/30 text-xs font-montserrat font-bold text-[#E09B30] cursor-pointer"
                >
                  {isDark ? (isEs ? 'Noche' : 'Night') : (isEs ? 'Día' : 'Daylight')}
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#A7C7E7]/20 space-y-3">
              <button
                id="mobile-drawer-auth-btn"
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  openAuthModal('signin');
                }}
                className="w-full min-h-[46px] py-3 px-4 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <UserIcon size={15} />
                <span>{isEs ? 'Entrar / Crear Cuenta' : 'Login / Register'}</span>
              </button>

              <a
                href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
                onClick={() => handleWhatsAppClick('hero')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-2.5 px-4 rounded-full font-montserrat font-bold text-xs text-[#FAFAFA] border border-[#A7C7E7]/35 hover:bg-[#FAFAFA]/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle size={15} className="text-[#E09B30]" />
                <span>WhatsApp +591 72878330</span>
              </a>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. INTRO TRACK (zIndex: 5, 160vh with 100vh sticky Portal Zoom Stage)     */}
      {/* ========================================================================= */}
      <div
        ref={introRef}
        id="portal-intro-track"
        data-testid="portal-intro-track"
        style={{
          position: 'relative',
          zIndex: 5,
          height: '160vh',
          width: '100%',
        }}
      >
        <div
          id="portal-sticky-viewport"
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Portal Archway Foreground Layer (Scales 1x -> 7.5x around 52% 38%) */}
          <PortalGateway portalRef={portalRef} opacity={portalOpacity} />

          {/* Scene 1 Hero Copy (Bottom-anchored, fades out in first 22% of scroll) */}
          <div
            id="portal-scene1-hero-copy"
            data-testid="portal-scene1-hero-copy"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              opacity: scene1Opacity,
              pointerEvents: scene1Opacity < 0.05 ? 'none' : 'auto',
            }}
          >
            <div
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-12 md:gap-20 max-w-[1440px] mx-auto"
              style={{
                padding: isMobile ? '0 22px 40px' : '0 44px 52px',
                opacity: uiVisible ? 1 : 0,
                transform: uiVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 1s ease, transform 1s ease',
                transitionDelay: '0.3s',
              }}
            >
              {/* Column 1 (maxWidth: 580px, left-aligned) */}
              <div style={{ maxWidth: 580, textAlign: 'left' }}>
                <h1
                  style={{
                    fontFamily: "'Montserrat', 'Inter', sans-serif",
                    fontWeight: 600,
                    color: '#FAFAFA',
                    lineHeight: 1.04,
                    letterSpacing: '-0.02em',
                    fontSize: isMobile ? 'clamp(30px, 9vw, 44px)' : 'clamp(40px, 4vw, 58px)',
                    margin: 0,
                  }}
                >
                  <span style={{ display: 'block' }}>
                    <span
                      style={{
                        fontFamily: "'Mr Dafoe', cursive",
                        fontWeight: 400,
                        color: '#E09B30',
                        fontSize: '1.18em',
                        marginRight: '0.14em',
                      }}
                    >
                      {isEs ? 'Hablá' : 'Speak'}
                    </span>
                    {isEs ? 'Inglés' : 'Living'}
                  </span>
                  <span style={{ display: 'block' }}>
                    {isEs ? 'Real Sin Bloquearte' : 'Real-World English'}
                  </span>
                  <span style={{ display: 'block' }}>
                    {isEs ? 'Claro, Fluido, Libre' : 'Clear, Fluent, Free'}
                  </span>
                </h1>

                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'rgba(250,250,250,0.72)',
                    maxWidth: 380,
                    marginTop: 18,
                  }}
                >
                  {isEs
                    ? 'Combiná práctica 24/7 con nuestra tutora de voz IA Emma y mentoría 1-a-1 en vivo con Teacher Ivan.'
                    : 'Combine 24/7 voice immersion with AI tutor Emma and live 1-on-1 coaching with Teacher Ivan.'}
                </p>

                {/* Compact Action Strip */}
                <div
                  style={{
                    marginTop: 22,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <button
                    id="hero-primary-cta-btn"
                    type="button"
                    onClick={handleStartVoiceTest}
                    className="bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] transition-all cursor-pointer shadow-lg"
                    style={{
                      fontFamily: "'Montserrat', 'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: '0.04em',
                      borderRadius: 999,
                      padding: '12px 24px',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Mic size={16} />
                    <span>
                      {isEs ? 'Probar Nivel 90s Gratis →' : 'Start Free 90s Test →'}
                    </span>
                  </button>

                  <a
                    id="hero-direct-whatsapp-btn"
                    href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
                    onClick={() => handleWhatsAppClick('hero')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FAFAFA] hover:text-[#E09B30] transition-colors cursor-pointer"
                    style={{
                      fontFamily: "'Montserrat', 'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: 12.5,
                      padding: '11px 18px',
                      borderRadius: 999,
                      background: 'rgba(9, 19, 38, 0.55)',
                      border: '1px solid rgba(167, 199, 231, 0.30)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    <MessageCircle size={15} className="text-[#E09B30]" />
                    <span>WhatsApp +591 72878330</span>
                  </a>

                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      fontSize: 12.5,
                      color: 'rgba(250,250,250,0.78)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      paddingLeft: 4,
                      animation: 'bobUp 2.4s ease-in-out infinite',
                    }}
                  >
                    {isEs ? 'Deslizá para entrar ↓' : 'Scroll to enter ↓'}
                  </span>
                </div>
              </div>

              {/* Column 2 (Hidden on mobile: Large "T." in Mr Dafoe + Concise Bicronic copy) */}
              <div
                className="hidden md:flex"
                style={{
                  flexDirection: 'row',
                  gap: 14,
                  alignItems: 'flex-end',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: "'Mr Dafoe', cursive",
                    fontSize: 64,
                    color: '#FAFAFA',
                    lineHeight: 0.8,
                  }}
                >
                  T.
                </span>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: 'rgba(250,250,250,0.68)',
                    maxWidth: 168,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {isEs
                    ? 'El Método Bicrónico: más del 75% de habla activa en cada sesión.'
                    : 'The Bicronic Method: over 75% active student speaking time.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BELOW-THE-FOLD SECTIONS FLOATING OVER FIXED WORLD_BG (zIndex: 10)      */}
      {/* ========================================================================= */}
      <div
        id="portal-world-content"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
        }}
      >
        {/* ===================================================================== */}
        {/* 3.1 SECTION 2 — "Real fluency. Real results." + <ArcCardCarousel />   */}
        {/* ===================================================================== */}
        <section
          id="section-2-stories"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: isMobile ? '12vh' : '14vh',
            paddingBottom: 60,
            paddingLeft: 20,
            paddingRight: 20,
            overflowX: 'clip',
          }}
        >
          <h2
            style={{
              fontFamily: "'Montserrat', 'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(34px, 4vw, 52px)',
              color: '#FAFAFA',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textShadow: '0 2px 20px rgba(9,19,38,0.45)',
              whiteSpace: 'pre-line',
              margin: 0,
            }}
          >
            {isEs ? 'Fluidez real.\nResultados reales.' : 'Real fluency.\nReal results.'}
          </h2>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 17,
              maxWidth: 440,
              color: '#FAFAFA',
              textShadow: '0 2px 16px rgba(9,19,38,0.35)',
              marginTop: 16,
              lineHeight: 1.55,
            }}
          >
            {isEs
              ? 'Descubrí cómo el Método Bicrónico destraba el inglés de nuestros estudiantes en Bolivia y LATAM.'
              : 'See how the Bicronic Method unlocks confident spoken English for students across LATAM.'}
          </p>

          <ArcCardCarousel isMobile={isMobile} />
        </section>

        {/* ===================================================================== */}
        {/* 3.2 SECTION 3 — THE BICRONIC METHOD & LIVE 24/7 AI VOICE LAB          */}
        {/* ===================================================================== */}
        <section
          id="chapter-1-bicronic"
          className="py-16 lg:py-24 px-4 sm:px-6 lg:px-12"
        >
          <div className="max-w-[1280px] mx-auto space-y-12">
            {/* Compact 2-Engine Bicronic Breakdown in Frosted Deep Navy Glass Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Engine 1: Emma IA 24/7 + Mi Ruta + Recursos & Juegos */}
              <div
                className="p-6 sm:p-10 rounded-[28px] flex flex-col justify-between gap-6"
                style={{
                  background: 'rgba(19, 38, 66, 0.84)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: '1px solid rgba(167, 199, 231, 0.25)',
                }}
              >
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/40 text-[#E09B30] text-[11px] font-montserrat font-bold uppercase tracking-[0.15em]">
                    <Headphones size={13} />
                    <span>{isEs ? 'MOTOR 01 • INMERSIÓN ASINCRÓNICA' : 'ENGINE 01 • ASYNC IMMERSION'}</span>
                  </div>
                  <h3 className="font-montserrat font-bold text-xl sm:text-2xl text-[#FAFAFA]">
                    {isEs
                      ? 'Emma IA 24/7 + Mi Ruta + Recursos & Juegos'
                      : 'Emma AI 24/7 + My Path + Resources & Games'}
                  </h3>
                  <p className="font-inter text-sm text-[#A7C7E7] leading-relaxed">
                    {isEs
                      ? 'Practicá conversación hablada a cualquier hora sin miedo al juicio, completá micro-sprints diarios de 10 minutos y generá fichas personalizadas para tu área profesional.'
                      : 'Practice spoken conversation anytime without fear of judgment, complete 10-minute daily micro-sprints, and generate custom worksheets tailored to your career.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#A7C7E7]/20 flex items-baseline justify-between">
                  <span className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#E09B30] tabular-nums">
                    24/7 • 10 min/día
                  </span>
                  <span className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#A7C7E7]">
                    {isEs ? '95% Retención de Reflejos' : '95% Reflex Retention'}
                  </span>
                </div>
              </div>

              {/* Engine 2: Coaching 1-a-1 en Vivo >75% Habla Activa */}
              <div
                className="p-6 sm:p-10 rounded-[28px] flex flex-col justify-between gap-6"
                style={{
                  background: 'rgba(19, 38, 66, 0.84)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: '1px solid rgba(224, 155, 48, 0.45)',
                }}
              >
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E09B30] text-[#091326] text-[11px] font-montserrat font-extrabold uppercase tracking-[0.15em]">
                    <Calendar size={13} />
                    <span>{isEs ? 'MOTOR 02 • COACHING 1-A-1 EN VIVO' : 'ENGINE 02 • LIVE 1-ON-1 COACHING'}</span>
                  </div>
                  <h3 className="font-montserrat font-bold text-xl sm:text-2xl text-[#FAFAFA]">
                    {isEs
                      ? 'Mentoría 1-a-1 en Vivo con Teacher Ivan'
                      : 'Live 1-on-1 Human Coaching with Teacher Ivan'}
                  </h3>
                  <p className="font-inter text-sm text-[#A7C7E7] leading-relaxed">
                    {isEs
                      ? 'Sesiones privadas de 60 minutos (Lun–Vie 14:00–20:00 BOT) donde hablás más del 75% de la clase con recasting auditivo inmediato para entrevistas, IELTS y liderazgo.'
                      : 'Private 60-minute sessions (Mon–Fri 14:00–20:00 BOT) where you speak over 75% of the class with immediate native recasting for interviews, IELTS, and leadership.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#A7C7E7]/20 flex items-baseline justify-between">
                  <span className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#E09B30] tabular-nums">
                    &gt;75% Habla Activa
                  </span>
                  <span className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#A7C7E7]">
                    {isEs ? 'Lun–Vie 14:00–20:00 BOT' : 'Mon–Fri 14:00–20:00 BOT'}
                  </span>
                </div>
              </div>
            </div>

            {/* Embedded Live 24/7 AI Voice Lab Console */}
            <div
              id="chapter-2-voicelab"
              className="p-6 sm:p-10 rounded-[28px] space-y-6"
              style={{
                background: 'rgba(19, 38, 66, 0.88)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '1px solid rgba(167, 199, 231, 0.28)',
                boxShadow: '0 32px 64px rgba(9, 19, 38, 0.55)',
              }}
            >
              <div id="flagship-simulator-section" className="space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/35 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-[0.15em]">
                    <Sparkles size={13} />
                    <span>{isEs ? 'LABORATORIO DE VOZ 24/7 • EN VIVO' : '24/7 VOICE LAB • LIVE'}</span>
                  </div>
                  <h2 className="font-montserrat font-bold text-2xl sm:text-3xl text-[#FAFAFA] tracking-tight">
                    {isEs
                      ? 'Probá tu fluidez en 90 segundos con Teacher Ivan y Emma'
                      : 'Test your spoken fluency in 90 seconds with Teacher Ivan & Emma'}
                  </h2>
                  <p className="font-inter text-xs sm:text-sm text-[#A7C7E7]">
                    {isEs
                      ? 'Hablá con naturalidad y recibí tu diagnóstico MCER y reformulaciones nativas al instante.'
                      : 'Speak naturally and receive your instant CEFR diagnostic and native recasts.'}
                  </p>
                </div>

                <CompactVoiceSimulator />

                {/* Sign-Up Prompt Strip */}
                <div className="p-5 rounded-2xl bg-[#091326]/75 border border-[#A7C7E7]/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="space-y-1">
                    <span className="text-xs font-montserrat font-bold text-[#E09B30] uppercase tracking-wider block">
                      {isEs
                        ? '¿Querés desbloquear todos los escenarios y tu ruta de 5 días?'
                        : 'Want to unlock all scenarios and your 5-day path?'}
                    </span>
                    <p className="text-xs font-inter text-[#A7C7E7]">
                      {isEs
                        ? 'Creá tu cuenta gratuita de estudiante en 2 pasos para guardar tu progreso y agendar con Teacher Ivan.'
                        : 'Create your free student account in 2 steps to save your progress and book live sessions with Teacher Ivan.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openAuthModal('signup')}
                    className="px-6 py-2.5 rounded-full bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] text-xs font-montserrat font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-md"
                  >
                    {isEs ? 'Crear Cuenta Gratis →' : 'Create Free Account →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 3.3 SECTION 4 — TRANSPARENT 3-TIER PRICING (300 / 580 / 850 BOB)      */}
        {/* ===================================================================== */}
        <PricingSection />

        {/* ===================================================================== */}
        {/* 3.4 SECTION 5 — CONCISE FAQ ACCORDION                                 */}
        {/* ===================================================================== */}
        <section
          id="chapter-4-faq"
          className="py-16 lg:py-20 px-4 sm:px-6 lg:px-12"
        >
          <div
            className="max-w-4xl mx-auto p-6 sm:p-10 rounded-[28px] space-y-8"
            style={{
              background: 'rgba(19, 38, 66, 0.84)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(167, 199, 231, 0.25)',
            }}
          >
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="text-[11px] font-montserrat font-bold tracking-[0.15em] text-[#E09B30] uppercase">
                —— {isEs ? 'PREGUNTAS FRECUENTES' : 'FREQUENTLY ASKED'}
              </div>
              <h2 className="font-montserrat font-bold text-2xl sm:text-3xl text-[#FAFAFA] tracking-tight">
                {isEs ? 'Respuestas directas.' : 'Straight answers.'}
              </h2>
            </div>

            <div className="divide-y divide-[#A7C7E7]/20 border-t border-b border-[#A7C7E7]/20">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full py-5 text-left font-montserrat font-bold text-sm sm:text-base text-[#FAFAFA] hover:text-[#E09B30] flex items-center justify-between gap-4 cursor-pointer transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-[#E09B30] shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-[#A7C7E7] shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="pb-5 text-xs sm:text-sm font-inter text-[#A7C7E7] leading-relaxed pr-6">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <h3 className="font-montserrat font-bold text-sm sm:text-base text-[#FAFAFA]">
                  {isEs
                    ? '¿Tenés una consulta específica sobre tu nivel o disponibilidad?'
                    : 'Have a specific question about your level or schedule?'}
                </h3>
                <p className="font-inter text-xs text-[#A7C7E7]">
                  {isEs
                    ? 'Escribile directamente a Teacher Ivan por WhatsApp y recibí respuesta en minutos.'
                    : 'Message Teacher Ivan directly on WhatsApp and get an answer in minutes.'}
                </p>
              </div>
              <a
                id="faq-direct-whatsapp-btn"
                href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
                onClick={() => handleWhatsAppClick('hero')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] font-montserrat font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-lg"
              >
                <MessageCircle size={15} />
                <span>WhatsApp +591 72878330</span>
              </a>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 3.4 FOOTER — 4-COLUMN AURAGATE-PROPORTIONED FOOTER                    */}
        {/* ===================================================================== */}
        <Footer />
      </div>
    </div>
  );
};

export default PortalLanding;
