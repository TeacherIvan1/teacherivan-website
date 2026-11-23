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
import { MotivationalShowcase } from './MotivationalShowcase';
import { CompactVoiceSimulator } from '../CompactVoiceSimulator';
import { PricingSection } from '../PricingSection';
import { Footer } from '../Footer';
import { getGeneralWhatsAppUrl, handleWhatsAppClick } from '../../utils/whatsapp';
import { PARALLAX_MAGNITUDES } from '../../config/portalAssets';

// ============================================================================
// Hooks & Math Helpers
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

  // Refs for zero-lag requestAnimationFrame transforms (Desktop only)
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

  // Escape key dismissal for navigation drawer (WCAG 2.1.1)
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Flip uiVisible true shortly after mount (immediately on mobile or reduced motion)
  useEffect(() => {
    if (isMobile || prefersReducedMotion) {
      setUiVisible(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setUiVisible(true);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [isMobile, prefersReducedMotion]);

  // Desktop Pinned Intro Scroll Progress (0 -> 1) — Disabled on Mobile (< 768px)
  useEffect(() => {
    if (typeof window === 'undefined' || isMobile) return;

    const updateScroll = () => {
      const introEl = introRef.current;
      const denom = introEl ? Math.max(1, introEl.offsetHeight - window.innerHeight) : window.innerHeight * 0.6;
      const progress = clamp(window.scrollY / denom, 0, 1);
      scrollProgressRef.current = progress;
      setScrollProgress(progress);

      if (prefersReducedMotion) {
        if (worldRef.current) {
          worldRef.current.style.transform = 'scale(1) translate(0px, 0px)';
        }
        if (portalRef.current) {
          portalRef.current.style.transform = 'scale(1) translate(0px, 0px)';
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

  // Desktop Mouse Parallax + Scroll Zoom requestAnimationFrame Loop (Disabled on Mobile & Reduced Motion)
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

  // Opacity Choreography (Desktop only)
  const portalOpacity =
    scrollProgress <= 0.66 ? 1 : clamp(1 - (scrollProgress - 0.66) / 0.22, 0, 1);
  const scene1Opacity = clamp(1 - scrollProgress / 0.22, 0, 1);

  const isConnected = status === 'connected';

  const handleStartVoiceTest = () => {
    setIsDrawerOpen(false);
    const simulatorElement = document.getElementById('flagship-simulator-section');
    if (simulatorElement) {
      simulatorElement.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
    if (!isConnected) {
      startSession();
    }
  };

  const scrollToSection = (id: string) => {
    setIsDrawerOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };

  // Strict Neutral Spanish (Tuteo) FAQs
  const faqs = [
    {
      q: isEs
        ? '¿Cómo funciona el Método Bicrónico (>75% de habla activa)?'
        : 'How does the Bicronic Method (>75% active speaking) work?',
      a: isEs
        ? 'Combina dos motores: práctica de voz 24/7 con la tutora IA Emma y micro-sprints de 10 minutos en Mi Ruta, más sesiones 1-a-1 en vivo de 60 minutos con Teacher Ivan donde hablas más del 75% del tiempo.'
        : 'It combines two engines: 24/7 voice practice with AI tutor Emma and 10-minute daily sprints in My Path, plus live 60-minute 1-on-1 sessions with Teacher Ivan where you speak over 75% of the class.',
    },
    {
      q: isEs
        ? '¿En qué horarios puedo agendar mis clases 1-a-1 en vivo?'
        : 'What hours are available for live 1-on-1 class scheduling?',
      a: isEs
        ? 'Las sesiones 1-a-1 en vivo con Teacher Ivan se reservan de lunes a viernes entre las 14:00 y las 20:00 (hora de Bolivia, BOT / UTC-4) directamente desde tu calendario en el portal.'
        : 'Live 1-on-1 sessions with Teacher Ivan can be booked Monday through Friday between 14:00 and 20:00 (Bolivia Time, BOT / UTC-4) directly inside your student portal calendar.',
    },
    {
      q: isEs
        ? '¿Qué incluye cada plan mensual (300 / 580 / 850 BOB)?'
        : 'What does each monthly plan (300 / 580 / 850 BOB) include?',
      a: isEs
        ? 'Essential (300 BOB/mes) te da acceso ilimitado 24/7 al Laboratorio de Voz, Generador de Recursos y Mi Ruta (0 clases en vivo). Pro (580 BOB/mes) suma 3 clases 1-a-1 por semana. Executive (850 BOB/mes) suma 5 clases 1-a-1 por semana.'
        : 'Essential (300 BOB/mo) unlocks unlimited 24/7 Voice Lab, Resource Generator, and My Path (0 live classes). Pro (580 BOB/mo) adds 3 live 1-on-1 classes per week. Executive (850 BOB/mo) adds 5 live 1-on-1 classes per week.',
    },
    {
      q: isEs
        ? '¿Cómo funciona el Diagnóstico Hablado gratuito de 90 segundos?'
        : 'How does the free 90-second Spoken Diagnostic work?',
      a: isEs
        ? 'Haz clic en "Probar mi nivel gratis (90s)", activa tu micrófono y conversa en inglés con Teacher Ivan o Emma durante 90 segundos. Al finalizar recibes al instante tu nivel MCER (A1 a C1) y 3 mejoras nativas.'
        : 'Click "Test my level free (90s)", enable your microphone, and speak in English with Teacher Ivan or Emma for 90 seconds. You immediately receive your CEFR band (A1 to C1) and 3 native recasts.',
    },
  ];

  // Theme-aware high-contrast backing styles (WCAG 2.1 AA/AAA)
  const navSurfaceBg = isDark
    ? 'rgba(9, 19, 38, 0.90)'
    : 'rgba(250, 250, 250, 0.94)';
  const navSurfaceBorder = isDark
    ? '1px solid rgba(167, 199, 231, 0.22)'
    : '1px solid rgba(26, 49, 83, 0.14)';

  const cardSurfaceBg = isDark
    ? 'rgba(19, 38, 66, 0.90)'
    : 'rgba(255, 255, 255, 0.96)';
  const cardSurfaceBorder = isDark
    ? '1px solid rgba(167, 199, 231, 0.25)'
    : '1px solid rgba(26, 49, 83, 0.16)';

  return (
    <div
      id="landing-page-view"
      className={`relative w-full max-w-[100vw] overflow-x-clip select-none ${
        isDark ? 'bg-[#091326] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#1A3153]'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. FIXED WORLD BACKGROUND (Desktop >= 768px ONLY; disabled on Mobile)     */}
      {/* ========================================================================= */}
      {!isMobile && <WorldBackdrop worldRef={worldRef} />}

      {/* ========================================================================= */}
      {/* 2. FIXED TOP NAVIGATION (WCAG >= 7:1 Contrast in Both Light & Night Mode) */}
      {/* ========================================================================= */}
      <header
        id="portal-top-navbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
          zIndex: 50,
          background: navSurfaceBg,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: navSurfaceBorder,
          transition: 'background 0.25s ease, border-color 0.25s ease',
        }}
      >
        <nav
          aria-label={isEs ? 'Navegación principal' : 'Primary'}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: isMobile ? 56 : 72,
            padding: isMobile ? '0 14px' : '0 40px',
            maxWidth: 1440,
            margin: '0 auto',
          }}
        >
          {/* Left: BrandWordmark with theme-matched contrast */}
          <BrandWordmark
            isMobile={isMobile}
            surface={isDark ? 'dark' : 'light'}
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })}
          />

          {/* Right Controls: Mobile = ES|EN + 44x44px Menu | Desktop = ES|EN + Login + CTA + Menu */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 8 : 14,
              flexShrink: 0,
            }}
          >
            {/* Compact ES | EN Pill Toggle (44px min height) */}
            <div
              id="portal-lang-toggle"
              role="group"
              aria-label={isEs ? 'Idioma' : 'Language'}
              className={`inline-flex items-center p-0.5 rounded-full border ${
                isDark
                  ? 'bg-[#132642] border-[#A7C7E7]/30'
                  : 'bg-[#EEF3F8] border-[#1A3153]/20'
              }`}
            >
              <button
                type="button"
                id="lang-btn-es"
                aria-pressed={lang === 'es'}
                onClick={() => setLang('es')}
                className={`min-w-[40px] min-h-[40px] px-2.5 rounded-full font-montserrat font-bold text-xs tracking-wider cursor-pointer border-0 transition-colors ${
                  lang === 'es'
                    ? 'bg-[#E09B30] text-[#091326]'
                    : isDark
                    ? 'bg-transparent text-[#FAFAFA] hover:text-[#E09B30]'
                    : 'bg-transparent text-[#1A3153] hover:text-[#9A6515]'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                id="lang-btn-en"
                aria-pressed={lang === 'en'}
                onClick={() => setLang('en')}
                className={`min-w-[40px] min-h-[40px] px-2.5 rounded-full font-montserrat font-bold text-xs tracking-wider cursor-pointer border-0 transition-colors ${
                  lang === 'en'
                    ? 'bg-[#E09B30] text-[#091326]'
                    : isDark
                    ? 'bg-transparent text-[#FAFAFA] hover:text-[#E09B30]'
                    : 'bg-transparent text-[#1A3153] hover:text-[#9A6515]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Desktop-only Login Link */}
            {!isMobile && (
              <button
                id="signin-nav-btn"
                type="button"
                onClick={() => openAuthModal('signin')}
                className={`min-h-[44px] inline-flex items-center gap-1.5 font-montserrat font-bold text-sm transition-colors cursor-pointer px-3 py-2 rounded-full ${
                  isDark
                    ? 'text-[#FAFAFA] hover:text-[#E09B30]'
                    : 'text-[#1A3153] hover:text-[#9A6515]'
                }`}
              >
                <UserIcon size={15} aria-hidden="true" />
                <span>{isEs ? 'Entrar' : 'Login'}</span>
              </button>
            )}

            {/* Desktop-only Primary Nav CTA */}
            {!isMobile && (
              <button
                id="guest-nav-assessment"
                type="button"
                onClick={handleStartVoiceTest}
                className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] font-montserrat font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shadow-sm border-0"
              >
                {isEs ? 'Test 90s Gratis' : 'Free 90s Test'}
              </button>
            )}

            {/* 44x44px Accessible Hamburger Menu Button */}
            <button
              id="mobile-hamburger-btn"
              data-testid="portal-hamburger-btn"
              type="button"
              onClick={() => setIsDrawerOpen((prev) => !prev)}
              aria-label={isDrawerOpen ? (isEs ? 'Cerrar menú' : 'Close menu') : (isEs ? 'Abrir menú' : 'Open menu')}
              aria-expanded={isDrawerOpen}
              aria-controls="mobile-navigation-drawer"
              className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0 border ${
                isDark
                  ? 'bg-[#FAFAFA] text-[#1A3153] border-[#FAFAFA]'
                  : 'bg-[#1A3153] text-[#FAFAFA] border-[#1A3153]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <line
                  x1="3.5"
                  y1="7"
                  x2="16.5"
                  y2="7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="3.5"
                  y1="13"
                  x2="16.5"
                  y2="13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* FULL-HEIGHT NAVIGATION DRAWER (Accessible + Escape Dismissal)             */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <>
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-[#091326]/70 backdrop-blur-sm z-[80]"
            aria-hidden="true"
          />
          <div
            id="mobile-navigation-drawer"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={isEs ? 'Menú de navegación' : 'Navigation Menu'}
            className={`fixed top-0 right-0 w-[86vw] max-w-sm h-full z-[85] p-6 flex flex-col justify-between overflow-y-auto overscroll-contain shadow-2xl ${
              isDark
                ? 'bg-[#132642] text-[#FAFAFA] border-l border-[#A7C7E7]/25'
                : 'bg-[#FFFFFF] text-[#1A3153] border-l border-[#1A3153]/18'
            }`}
          >
            {/* Top Bar */}
            <div
              className={`flex items-center justify-between pb-4 border-b ${
                isDark ? 'border-[#A7C7E7]/20' : 'border-[#1A3153]/14'
              }`}
            >
              <BrandWordmark
                isMobile={true}
                surface={isDark ? 'dark' : 'light'}
                onClick={() => setIsDrawerOpen(false)}
              />
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#091326] text-[#FAFAFA] hover:bg-[#E09B30] hover:text-[#091326]'
                    : 'bg-[#EEF3F8] text-[#1A3153] hover:bg-[#1A3153] hover:text-[#FAFAFA]'
                }`}
                aria-label={isEs ? 'Cerrar menú' : 'Close menu'}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Navigation Links (48px touch targets) */}
            <div className="py-5 flex flex-col gap-2 flex-1">
              {[
                { id: 'section-2-stories', es: 'Oportunidades Reales', en: 'Real Opportunities' },
                { id: 'chapter-1-bicronic', es: 'El Método Bicrónico', en: 'The Bicronic Method' },
                { id: 'chapter-2-voicelab', es: 'Laboratorio de Voz 24/7', en: '24/7 Voice Lab' },
                { id: 'chapter-3-plans', es: 'Planes (300–850 BOB)', en: 'Plans (300–850 BOB)' },
                { id: 'chapter-4-faq', es: 'Preguntas Frecuentes', en: 'FAQ' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full min-h-[48px] px-4 py-3 rounded-2xl text-left font-montserrat font-bold text-base transition-colors flex items-center justify-between cursor-pointer ${
                    isDark
                      ? 'text-[#FAFAFA] hover:bg-[#1A3153]'
                      : 'text-[#1A3153] hover:bg-[#EEF3F8]'
                  }`}
                >
                  <span>{isEs ? item.es : item.en}</span>
                  <ArrowRight size={16} className={isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'} aria-hidden="true" />
                </button>
              ))}

              {/* Light / Night Mode Toggle */}
              <div
                className={`mt-3 pt-4 border-t flex items-center justify-between px-2 ${
                  isDark ? 'border-[#A7C7E7]/20' : 'border-[#1A3153]/14'
                }`}
              >
                <span className={`font-inter text-sm font-medium ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                  {isEs ? 'Tema visual' : 'Visual Theme'}
                </span>
                <button
                  id="drawer-theme-toggle-btn"
                  type="button"
                  onClick={toggleTheme}
                  className={`min-h-[44px] px-4 py-2 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider cursor-pointer border ${
                    isDark
                      ? 'bg-[#091326] border-[#A7C7E7]/35 text-[#E09B30]'
                      : 'bg-[#EEF3F8] border-[#1A3153]/25 text-[#1A3153]'
                  }`}
                >
                  {isDark ? (isEs ? 'Modo Noche' : 'Night Mode') : (isEs ? 'Modo Día' : 'Light Mode')}
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div
              className={`pt-4 border-t space-y-3 ${
                isDark ? 'border-[#A7C7E7]/20' : 'border-[#1A3153]/14'
              }`}
            >
              <button
                id="mobile-drawer-auth-btn"
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  openAuthModal('signin');
                }}
                className="w-full min-h-[50px] py-3 px-4 rounded-full font-montserrat font-extrabold text-sm uppercase tracking-wider bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <UserIcon size={16} aria-hidden="true" />
                <span>{isEs ? 'Entrar / Crear Cuenta' : 'Login / Register'}</span>
              </button>

              <a
                href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
                onClick={() => handleWhatsAppClick('hero')}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full min-h-[48px] py-2.5 px-4 rounded-full font-montserrat font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 border ${
                  isDark
                    ? 'text-[#FAFAFA] border-[#A7C7E7]/35 hover:bg-[#1A3153]'
                    : 'text-[#1A3153] border-[#1A3153]/30 hover:bg-[#EEF3F8]'
                }`}
              >
                <MessageCircle size={16} className={isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'} aria-hidden="true" />
                <span>WhatsApp +591 72878330</span>
              </a>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. HERO STAGE: FAST-LCP MINIMALIST ON MOBILE | PORTAL ZOOM ON DESKTOP     */}
      {/* ========================================================================= */}
      {isMobile ? (
        <section
          id="mobile-hero-section"
          aria-labelledby="hero-main-heading"
          className={`pt-24 pb-12 px-5 ${
            isDark ? 'bg-[#091326] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#1A3153]'
          }`}
        >
          <div className="max-w-lg mx-auto space-y-5">
            <h1
              id="hero-main-heading"
              className={`font-montserrat font-extrabold tracking-tight ${
                isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
              }`}
              style={{
                fontSize: 'clamp(28px, 7.5vw, 36px)',
                lineHeight: 1.12,
              }}
            >
              {isEs ? 'Habla inglés real con total seguridad.' : 'Speak real-world English with confidence.'}
            </h1>

            <p
              className={`font-inter text-base leading-relaxed ${
                isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'
              }`}
            >
              {isEs
                ? 'Práctica de voz 24/7 con Emma y clases 1-a-1 con Teacher Ivan.'
                : '24/7 voice practice with Emma and live 1-on-1 coaching with Teacher Ivan.'}
            </p>

            {/* Primary Full-Width Tactile CTA (52px) + Clean Secondary Outline CTA (48px) */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                id="hero-primary-cta-btn"
                type="button"
                onClick={handleStartVoiceTest}
                className="w-full min-h-[52px] px-6 py-3.5 rounded-full bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] font-montserrat font-bold text-base inline-flex items-center justify-center gap-2.5 shadow-md transition-colors cursor-pointer border-0"
              >
                <Mic size={19} aria-hidden="true" />
                <span>{isEs ? 'Probar mi nivel gratis (90s)' : 'Test my level free (90s)'}</span>
              </button>

              <a
                id="hero-direct-whatsapp-btn"
                href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
                onClick={() => handleWhatsAppClick('hero')}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full min-h-[48px] px-6 py-3 rounded-full font-montserrat font-bold text-base inline-flex items-center justify-center gap-2 border-2 transition-colors cursor-pointer ${
                  isDark
                    ? 'border-[#A7C7E7]/45 text-[#FAFAFA] hover:bg-[#132642]'
                    : 'border-[#1A3153] text-[#1A3153] hover:bg-[#EEF3F8]'
                }`}
              >
                <MessageCircle size={18} className={isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'} aria-hidden="true" />
                <span>{isEs ? 'Hablar por WhatsApp' : 'Chat on WhatsApp'}</span>
              </a>
            </div>
          </div>
        </section>
      ) : (
        /* DESKTOP (>= 768px): 160vh Pinned Intro Track with 1x -> 7.5x Portal Zoom */
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

            {/* Scene 1 Hero Copy (Bottom-anchored over deep dark studio rim -> high contrast #FAFAFA) */}
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
                className="flex flex-row items-end justify-between gap-16 max-w-[1440px] mx-auto"
                style={{
                  padding: '0 44px 52px',
                  opacity: uiVisible ? 1 : 0,
                  transform: uiVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s ease, transform 0.8s ease',
                }}
              >
                {/* Column 1 */}
                <div style={{ maxWidth: 600, textAlign: 'left' }}>
                  <h1
                    id="hero-main-heading"
                    style={{
                      fontFamily: "'Montserrat', 'Inter', sans-serif",
                      fontWeight: 700,
                      color: '#FAFAFA',
                      lineHeight: 1.05,
                      letterSpacing: '-0.02em',
                      fontSize: 'clamp(40px, 4vw, 56px)',
                      margin: 0,
                    }}
                  >
                    <span style={{ display: 'block' }}>
                      <span
                        style={{
                          fontFamily: "'Mr Dafoe', cursive",
                          fontWeight: 400,
                          color: '#E09B30',
                          fontSize: '1.16em',
                          marginRight: '0.14em',
                        }}
                      >
                        {isEs ? 'Habla' : 'Speak'}
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
                      fontSize: 16,
                      lineHeight: 1.6,
                      color: '#FAFAFA',
                      maxWidth: 440,
                      marginTop: 18,
                    }}
                  >
                    {isEs
                      ? 'Combina práctica 24/7 con nuestra tutora de voz IA Emma y mentoría 1-a-1 en vivo con Teacher Ivan.'
                      : 'Combine 24/7 voice immersion with AI tutor Emma and live 1-on-1 coaching with Teacher Ivan.'}
                  </p>

                  {/* Action Strip */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      id="hero-primary-cta-btn"
                      type="button"
                      onClick={handleStartVoiceTest}
                      className="min-h-[48px] px-6 py-3 rounded-full bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] font-montserrat font-bold text-sm inline-flex items-center gap-2 shadow-lg transition-colors cursor-pointer border-0"
                    >
                      <Mic size={17} aria-hidden="true" />
                      <span>{isEs ? 'Probar mi nivel gratis (90s)' : 'Test my level free (90s)'}</span>
                    </button>

                    <a
                      id="hero-direct-whatsapp-btn"
                      href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
                      onClick={() => handleWhatsAppClick('hero')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[48px] px-5 py-3 rounded-full bg-[#091326]/85 hover:bg-[#132642] text-[#FAFAFA] border border-[#A7C7E7]/40 font-montserrat font-semibold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <MessageCircle size={16} className="text-[#E09B30]" aria-hidden="true" />
                      <span>WhatsApp +591 72878330</span>
                    </a>

                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        fontSize: 14,
                        color: '#FAFAFA',
                        paddingLeft: 6,
                        animation: 'bobUp 2.4s ease-in-out infinite',
                      }}
                    >
                      {isEs ? 'Desliza para entrar ↓' : 'Scroll to enter ↓'}
                    </span>
                  </div>
                </div>

                {/* Column 2 (Desktop only) */}
                <div className="flex flex-row gap-3.5 items-end">
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
                      fontSize: 13,
                      color: '#FAFAFA',
                      maxWidth: 185,
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
      )}

      {/* ========================================================================= */}
      {/* 4. BELOW-THE-FOLD SECTIONS                                                */}
      {/* ========================================================================= */}
      <div
        id="portal-world-content"
        className={isMobile ? (isDark ? 'bg-[#091326]' : 'bg-[#FAFAFA]') : ''}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
        }}
      >
        {/* ===================================================================== */}
        {/* SECTION 2 — VISUAL MOTIVATIONAL SHOWCASE (Replaces Testimonials)      */}
        {/* ===================================================================== */}
        <section
          id="section-2-stories"
          aria-labelledby="motivation-section-heading"
          className={isMobile ? 'py-10 px-0 text-center' : 'pt-[12vh] pb-16 px-6 text-center'}
        >
          <div
            className={`mx-auto ${
              isMobile
                ? 'px-5 max-w-lg'
                : 'max-w-2xl px-8 py-6 rounded-[28px] shadow-lg'
            }`}
            style={
              isMobile
                ? undefined
                : {
                    background: cardSurfaceBg,
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    border: cardSurfaceBorder,
                  }
            }
          >
            <h2
              id="motivation-section-heading"
              className={`font-montserrat font-bold tracking-tight ${
                isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
              }`}
              style={{
                fontSize: isMobile ? 'clamp(24px, 6.8vw, 30px)' : 'clamp(32px, 3.6vw, 46px)',
                lineHeight: 1.12,
              }}
            >
              {isEs ? 'Tu inglés abre puertas reales.' : 'Fluent English opens real doors.'}
            </h2>

            <p
              className={`font-inter text-base leading-relaxed mt-3 max-w-xl mx-auto ${
                isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'
              }`}
            >
              {isEs
                ? 'Descubre lo que cambia cuando pasas de traducir en tu mente a comunicarte con seguridad en el mundo real.'
                : 'See what unlocks when you stop translating in your head and start speaking with confidence.'}
            </p>
          </div>

          <MotivationalShowcase isMobile={isMobile} />
        </section>

        {/* ===================================================================== */}
        {/* SECTION 3 — THE BICRONIC METHOD & LIVE 24/7 AI VOICE LAB              */}
        {/* ===================================================================== */}
        <section
          id="chapter-1-bicronic"
          aria-labelledby="bicronic-section-heading"
          className="py-12 md:py-20 px-4 sm:px-6 lg:px-12"
        >
          <div className="max-w-[1280px] mx-auto space-y-8 md:space-y-12">
            <h2 id="bicronic-section-heading" className="visually-hidden">
              {isEs ? 'El Método Bicrónico y Laboratorio de Voz 24/7' : 'The Bicronic Method and 24/7 Voice Lab'}
            </h2>

            {/* 2-Engine Bicronic Breakdown (High-Contrast Backing Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8">
              {/* Engine 1 */}
              <div
                className={`p-6 sm:p-9 rounded-[24px] md:rounded-[28px] flex flex-col justify-between gap-5 shadow-lg ${
                  isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
                }`}
                style={{
                  background: cardSurfaceBg,
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: cardSurfaceBorder,
                }}
              >
                <div className="space-y-3">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-montserrat font-bold uppercase tracking-[0.12em] ${
                      isDark
                        ? 'bg-[#E09B30]/15 border border-[#E09B30]/40 text-[#E09B30]'
                        : 'bg-[#EEF3F8] border border-[#1A3153]/15 text-[#9A6515]'
                    }`}
                  >
                    <Headphones size={14} aria-hidden="true" />
                    <span>{isEs ? 'MOTOR 01 • INMERSIÓN 24/7' : 'ENGINE 01 • 24/7 IMMERSION'}</span>
                  </div>
                  <h3 className={`font-montserrat font-bold text-xl sm:text-2xl ${isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'}`}>
                    {isEs ? 'Emma IA 24/7 + Mi Ruta' : 'Emma AI 24/7 + My Path'}
                  </h3>
                  <p className={`font-inter text-base leading-relaxed ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                    {isEs
                      ? 'Practica conversación hablada a cualquier hora, completa micro-sprints de 10 minutos y genera fichas para tu carrera.'
                      : 'Practice spoken conversation anytime, complete 10-minute daily sprints, and generate custom career worksheets.'}
                  </p>
                </div>

                <div
                  className={`pt-4 border-t flex items-baseline justify-between gap-2 ${
                    isDark ? 'border-[#A7C7E7]/20' : 'border-[#1A3153]/15'
                  }`}
                >
                  <span
                    className={`font-montserrat font-extrabold text-xl sm:text-2xl tabular-nums ${
                      isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'
                    }`}
                  >
                    24/7 • 10 min/día
                  </span>
                  <span
                    className={`font-montserrat font-bold text-xs uppercase tracking-wider ${
                      isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'
                    }`}
                  >
                    {isEs ? '95% Retención' : '95% Retention'}
                  </span>
                </div>
              </div>

              {/* Engine 2 */}
              <div
                className={`p-6 sm:p-9 rounded-[24px] md:rounded-[28px] flex flex-col justify-between gap-5 shadow-lg ${
                  isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
                }`}
                style={{
                  background: cardSurfaceBg,
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: isDark ? '1px solid rgba(224, 155, 48, 0.48)' : '2px solid rgba(26, 49, 83, 0.28)',
                }}
              >
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E09B30] text-[#091326] text-xs font-montserrat font-extrabold uppercase tracking-[0.12em]">
                    <Calendar size={14} aria-hidden="true" />
                    <span>{isEs ? 'MOTOR 02 • COACHING 1-A-1' : 'ENGINE 02 • 1-ON-1 COACHING'}</span>
                  </div>
                  <h3 className={`font-montserrat font-bold text-xl sm:text-2xl ${isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'}`}>
                    {isEs ? 'Mentoría 1-a-1 con Teacher Ivan' : 'Live 1-on-1 with Teacher Ivan'}
                  </h3>
                  <p className={`font-inter text-base leading-relaxed ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                    {isEs
                      ? 'Sesiones privadas de 60 minutos (Lun–Vie 14:00–20:00 BOT) donde hablas más del 75% de la clase con corrección nativa.'
                      : 'Private 60-minute sessions (Mon–Fri 14:00–20:00 BOT) where you speak over 75% of the class with native recasting.'}
                  </p>
                </div>

                <div
                  className={`pt-4 border-t flex items-baseline justify-between gap-2 ${
                    isDark ? 'border-[#A7C7E7]/20' : 'border-[#1A3153]/15'
                  }`}
                >
                  <span
                    className={`font-montserrat font-extrabold text-xl sm:text-2xl tabular-nums ${
                      isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'
                    }`}
                  >
                    &gt;75% {isEs ? 'Habla Activa' : 'Active Talk'}
                  </span>
                  <span
                    className={`font-montserrat font-bold text-xs uppercase tracking-wider ${
                      isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'
                    }`}
                  >
                    {isEs ? 'Lun–Vie 14:00–20:00' : 'Mon–Fri 14:00–20:00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Embedded Live 24/7 AI Voice Lab Console */}
            <div
              id="chapter-2-voicelab"
              className={`p-5 sm:p-10 rounded-[24px] md:rounded-[28px] space-y-6 shadow-xl ${
                isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
              }`}
              style={{
                background: cardSurfaceBg,
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: cardSurfaceBorder,
              }}
            >
              <div id="flagship-simulator-section" className="space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  {!isMobile && (
                    <div
                      className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-montserrat font-bold uppercase tracking-[0.14em] ${
                        isDark
                          ? 'bg-[#E09B30]/15 border border-[#E09B30]/35 text-[#E09B30]'
                          : 'bg-[#EEF3F8] border border-[#1A3153]/15 text-[#9A6515]'
                      }`}
                    >
                      <Sparkles size={13} aria-hidden="true" />
                      <span>{isEs ? 'LABORATORIO DE VOZ 24/7' : '24/7 VOICE LAB'}</span>
                    </div>
                  )}
                  <h2
                    className={`font-montserrat font-bold text-2xl sm:text-3xl tracking-tight ${
                      isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
                    }`}
                  >
                    {isEs
                      ? 'Prueba tu fluidez en 90 segundos'
                      : 'Test your spoken fluency in 90 seconds'}
                  </h2>
                  <p className={`font-inter text-base ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                    {isEs
                      ? 'Habla con naturalidad y recibe tu diagnóstico MCER al instante.'
                      : 'Speak naturally and receive your instant CEFR diagnostic.'}
                  </p>
                </div>

                <CompactVoiceSimulator />

                {/* Sign-Up Prompt Strip */}
                <div
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${
                    isDark
                      ? 'bg-[#091326]/85 border-[#A7C7E7]/25'
                      : 'bg-[#EEF3F8] border-[#1A3153]/16'
                  }`}
                >
                  <div className="space-y-1">
                    <span
                      className={`text-sm font-montserrat font-bold uppercase tracking-wider block ${
                        isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'
                      }`}
                    >
                      {isEs
                        ? '¿Quieres guardar tu progreso y tu ruta de 5 días?'
                        : 'Want to save your progress and 5-day path?'}
                    </span>
                    <p className={`text-sm font-inter ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                      {isEs
                        ? 'Crea tu cuenta gratuita en 2 pasos para agendar con Teacher Ivan.'
                        : 'Create your free student account in 2 steps to book live sessions.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openAuthModal('signup')}
                    className="min-h-[48px] px-6 py-3 rounded-full bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] text-sm font-montserrat font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-md"
                  >
                    {isEs ? 'Crear Cuenta Gratis →' : 'Create Free Account →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SECTION 4 — TRANSPARENT 3-TIER PRICING (300 / 580 / 850 BOB)          */}
        {/* ===================================================================== */}
        <PricingSection />

        {/* ===================================================================== */}
        {/* SECTION 5 — CONCISE FAQ ACCORDION                                     */}
        {/* ===================================================================== */}
        <section
          id="chapter-4-faq"
          aria-labelledby="faq-section-heading"
          className="py-12 md:py-20 px-4 sm:px-6 lg:px-12"
        >
          <div
            className={`max-w-4xl mx-auto p-6 sm:p-10 rounded-[24px] md:rounded-[28px] space-y-6 shadow-lg ${
              isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
            }`}
            style={{
              background: cardSurfaceBg,
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: cardSurfaceBorder,
            }}
          >
            <div className="text-center max-w-2xl mx-auto space-y-2">
              {!isMobile && (
                <div
                  className={`text-xs font-montserrat font-bold tracking-[0.15em] uppercase ${
                    isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'
                  }`}
                >
                  —— {isEs ? 'PREGUNTAS FRECUENTES' : 'FREQUENTLY ASKED'}
                </div>
              )}
              <h2
                id="faq-section-heading"
                className={`font-montserrat font-bold text-2xl sm:text-3xl tracking-tight ${
                  isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
                }`}
              >
                {isEs ? 'Preguntas frecuentes.' : 'Straight answers.'}
              </h2>
            </div>

            <div
              className={`divide-y border-t border-b ${
                isDark
                  ? 'divide-[#A7C7E7]/20 border-[#A7C7E7]/20'
                  : 'divide-[#1A3153]/15 border-[#1A3153]/15'
              }`}
            >
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx}>
                    <h3 className="m-0">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className={`w-full min-h-[52px] py-4 text-left font-montserrat font-bold text-base flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                          isDark
                            ? 'text-[#FAFAFA] hover:text-[#E09B30]'
                            : 'text-[#1A3153] hover:text-[#9A6515]'
                        }`}
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp size={20} className={isDark ? 'text-[#E09B30] shrink-0' : 'text-[#9A6515] shrink-0'} aria-hidden="true" />
                        ) : (
                          <ChevronDown size={20} className={isDark ? 'text-[#A7C7E7] shrink-0' : 'text-[#334155] shrink-0'} aria-hidden="true" />
                        )}
                      </button>
                    </h3>
                    {isOpen && (
                      <div
                        className={`pb-5 text-base font-inter leading-relaxed pr-4 ${
                          isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'
                        }`}
                      >
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
                <h3 className={`font-montserrat font-bold text-base ${isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'}`}>
                  {isEs
                    ? '¿Tienes una consulta sobre tu nivel o horario?'
                    : 'Have a question about your level or schedule?'}
                </h3>
                <p className={`font-inter text-sm ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                  {isEs
                    ? 'Escríbele directamente a Teacher Ivan por WhatsApp y recibe respuesta en minutos.'
                    : 'Message Teacher Ivan directly on WhatsApp and get an answer in minutes.'}
                </p>
              </div>
              <a
                id="faq-direct-whatsapp-btn"
                href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
                onClick={() => handleWhatsAppClick('hero')}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-6 py-3 rounded-full bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] font-montserrat font-extrabold text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-md"
              >
                <MessageCircle size={16} aria-hidden="true" />
                <span>WhatsApp +591 72878330</span>
              </a>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* FOOTER                                                                */}
        {/* ===================================================================== */}
        <Footer />
      </div>
    </div>
  );
};

export default PortalLanding;
