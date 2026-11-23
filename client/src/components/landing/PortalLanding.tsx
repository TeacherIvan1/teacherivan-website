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
  Layers,
  Tag,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useTranslation } from '../../modules/i18n/languageStore';
import { useConversationStore } from '../../modules/conversation/conversationStore';
import { useAuthStore } from '../../modules/auth/authStore';
import { useTheme } from '../../modules/theme/ThemeContext';
import { useCookieConsent } from '../../context/CookieConsentContext';
import { useScrollLock } from '../../hooks/useScrollLock';
import { BrandWordmark } from '../BrandWordmark';
import { WorldBackdrop, PortalGateway } from '../portal/PortalBackdrop';
import { MotivationalShowcase } from './MotivationalShowcase';
import { CompactVoiceSimulator } from '../CompactVoiceSimulator';
import { MobileVoiceCockpit } from '../MobileVoiceCockpit';
import { ChibiAvatar } from '../ChibiAvatar';
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

type MobileSheetType = null | 'plans' | 'method';

export const PortalLanding: React.FC = () => {
  const { lang, setLang, isEs } = useTranslation();
  const { status, startSession } = useConversationStore();
  const { openAuthModal } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const { openLegalModal, openCookiePreferences } = useCookieConsent();

  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Refs for zero-lag requestAnimationFrame transforms (Desktop only)
  const introRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const scrollProgressRef = useRef<number>(0);

  // Desktop scroll & UI state
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [uiVisible, setUiVisible] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Mobile single-screen app state (< 768px)
  const [mobileView, setMobileView] = useState<'home' | 'simulator'>('home');
  const [mobileSheet, setMobileSheet] = useState<MobileSheetType>(null);
  const [heroAvatar, setHeroAvatar] = useState<'emma' | 'teacher-ivan'>('emma');

  useScrollLock(isDrawerOpen || mobileSheet !== null);

  // Escape key dismissal for drawer and mobile sheets (WCAG 2.1.1)
  useEffect(() => {
    if (!isDrawerOpen && !mobileSheet) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setMobileSheet(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, mobileSheet]);

  // Flip uiVisible true shortly after mount
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

  // Desktop Pinned Intro Scroll Progress (0 -> 1)
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

  const portalOpacity =
    scrollProgress <= 0.66 ? 1 : clamp(1 - (scrollProgress - 0.66) / 0.22, 0, 1);
  const scene1Opacity = clamp(1 - scrollProgress / 0.22, 0, 1);

  const isConnected = status === 'connected';

  const handleStartVoiceTest = () => {
    setIsDrawerOpen(false);
    if (isMobile) {
      setMobileView('simulator');
      return;
    }
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
    if (isMobile) {
      if (id === 'chapter-3-plans') setMobileSheet('plans');
      else if (id === 'chapter-2-voicelab') setMobileView('simulator');
      else setMobileSheet('method');
      return;
    }
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
        ? 'Haz clic en "Probar Simulador Gratis (90s)", activa tu micrófono y conversa en inglés con Teacher Ivan o Emma durante 90 segundos. Al finalizar recibes al instante tu nivel MCER (A1 a C1) y 3 mejoras nativas.'
        : 'Click "Test Voice Lab Free (90s)", enable your microphone, and speak in English with Teacher Ivan or Emma for 90 seconds. You immediately receive your CEFR band (A1 to C1) and 3 native recasts.',
    },
  ];

  const navSurfaceBg = isDark ? 'rgba(9, 19, 38, 0.92)' : 'rgba(250, 250, 250, 0.95)';
  const navSurfaceBorder = isDark
    ? '1px solid rgba(167, 199, 231, 0.22)'
    : '1px solid rgba(26, 49, 83, 0.14)';

  const cardSurfaceBg = isDark ? 'rgba(19, 38, 66, 0.90)' : 'rgba(255, 255, 255, 0.96)';
  const cardSurfaceBorder = isDark
    ? '1px solid rgba(167, 199, 231, 0.25)'
    : '1px solid rgba(26, 49, 83, 0.16)';

  // Shared Navigation Drawer (Mobile + Desktop)
  const renderDrawer = () =>
    isDrawerOpen && (
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

          <div className="py-4 flex flex-col gap-1.5 flex-1">
            {[
              { id: 'chapter-2-voicelab', es: 'Simulador de Voz 24/7', en: '24/7 Voice Simulator' },
              { id: 'chapter-3-plans', es: 'Planes (300–850 BOB)', en: 'Plans (300–850 BOB)' },
              { id: 'chapter-1-bicronic', es: 'Método Bicrónico', en: 'Bicronic Method' },
              { id: 'section-2-stories', es: 'Oportunidades Reales', en: 'Real Opportunities' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`w-full min-h-[46px] px-4 py-2.5 rounded-2xl text-left font-montserrat font-bold text-sm transition-colors flex items-center justify-between cursor-pointer ${
                  isDark
                    ? 'text-[#FAFAFA] hover:bg-[#1A3153]'
                    : 'text-[#1A3153] hover:bg-[#EEF3F8]'
                }`}
              >
                <span>{isEs ? item.es : item.en}</span>
                <ArrowRight size={15} className={isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'} aria-hidden="true" />
              </button>
            ))}

            {/* Legal & Cookies Links inside Drawer */}
            <div
              className={`mt-2 pt-3 border-t flex flex-col gap-1 ${
                isDark ? 'border-[#A7C7E7]/20' : 'border-[#1A3153]/14'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  openLegalModal('privacy');
                }}
                className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-left font-inter text-sm flex items-center gap-2.5 cursor-pointer ${
                  isDark ? 'text-[#A7C7E7] hover:text-[#FAFAFA]' : 'text-[#334155] hover:text-[#1A3153]'
                }`}
              >
                <ShieldCheck size={15} className={isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'} aria-hidden="true" />
                <span>{isEs ? 'Política de Privacidad' : 'Privacy Policy'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  openCookiePreferences();
                }}
                className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-left font-inter text-sm flex items-center gap-2.5 cursor-pointer ${
                  isDark ? 'text-[#A7C7E7] hover:text-[#FAFAFA]' : 'text-[#334155] hover:text-[#1A3153]'
                }`}
              >
                <SlidersHorizontal size={15} className={isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'} aria-hidden="true" />
                <span>{isEs ? 'Configurar Cookies' : 'Cookie Settings'}</span>
              </button>
            </div>

            {/* Light / Night Mode Toggle */}
            <div
              className={`mt-2 pt-3 border-t flex items-center justify-between px-2 ${
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

          <div
            className={`pt-4 border-t space-y-2.5 ${
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
              className="w-full min-h-[48px] py-3 px-4 rounded-full font-montserrat font-extrabold text-sm uppercase tracking-wider bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <UserIcon size={16} aria-hidden="true" />
              <span>{isEs ? 'Entrar / Crear Cuenta' : 'Login / Register'}</span>
            </button>

            <a
              href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
              onClick={() => handleWhatsAppClick('hero')}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full min-h-[46px] py-2.5 px-4 rounded-full font-montserrat font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 border ${
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
    );

  // =========================================================================
  // MOBILE SINGLE-SCREEN APP VIEW (< 768px): 100dvh, ZERO VERTICAL SCROLL!
  // =========================================================================
  if (isMobile) {
    return (
      <div
        id="landing-page-view"
        data-testid="mobile-single-screen-app"
        className={`relative h-[100dvh] w-full max-w-[100vw] overflow-hidden flex flex-col select-none ${
          isDark ? 'bg-[#091326] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#1A3153]'
        }`}
      >
        {/* 1. Compact 52px Single-Row Top Bar */}
        <header
          id="portal-top-navbar"
          className="shrink-0 z-50 w-full"
          style={{
            height: 52,
            background: navSurfaceBg,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: navSurfaceBorder,
          }}
        >
          <nav
            aria-label={isEs ? 'Navegación principal' : 'Primary'}
            className="h-full px-3.5 flex items-center justify-between"
          >
            <BrandWordmark
              isMobile={true}
              surface={isDark ? 'dark' : 'light'}
              onClick={() => setMobileView('home')}
            />

            <div className="flex items-center gap-2 shrink-0">
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
                  className={`min-w-[36px] min-h-[36px] px-2 rounded-full font-montserrat font-bold text-xs cursor-pointer border-0 ${
                    lang === 'es'
                      ? 'bg-[#E09B30] text-[#091326]'
                      : isDark
                      ? 'bg-transparent text-[#FAFAFA]'
                      : 'bg-transparent text-[#1A3153]'
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  id="lang-btn-en"
                  aria-pressed={lang === 'en'}
                  onClick={() => setLang('en')}
                  className={`min-w-[36px] min-h-[36px] px-2 rounded-full font-montserrat font-bold text-xs cursor-pointer border-0 ${
                    lang === 'en'
                      ? 'bg-[#E09B30] text-[#091326]'
                      : isDark
                      ? 'bg-transparent text-[#FAFAFA]'
                      : 'bg-transparent text-[#1A3153]'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                id="mobile-hamburger-btn"
                data-testid="portal-hamburger-btn"
                type="button"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                aria-label={isDrawerOpen ? (isEs ? 'Cerrar menú' : 'Close menu') : (isEs ? 'Abrir menú' : 'Open menu')}
                aria-expanded={isDrawerOpen}
                aria-controls="mobile-navigation-drawer"
                className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shrink-0 border ${
                  isDark
                    ? 'bg-[#FAFAFA] text-[#1A3153] border-[#FAFAFA]'
                    : 'bg-[#1A3153] text-[#FAFAFA] border-[#1A3153]'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <line x1="3.5" y1="7" x2="16.5" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3.5" y1="13" x2="16.5" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </nav>
        </header>

        {renderDrawer()}

        {/* 2. Main Single-Screen Body: Either Live Mobile Voice Cockpit OR Single-Screen Hero */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {mobileView === 'simulator' ? (
            <MobileVoiceCockpit onBack={() => setMobileView('home')} />
          ) : (
            <section
              id="mobile-hero-section"
              aria-labelledby="hero-main-heading"
              className="relative h-full w-full flex flex-col justify-between px-5 pt-4 pb-[max(14px,env(safe-area-inset-bottom))] overflow-hidden"
            >
              {/* Luminous Metropolis Skyline Horizon Backdrop + High-Contrast Theme Scrim */}
              <WorldBackdrop isEmbedded scrollProgress={0.5} />
              <div
                aria-hidden="true"
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                  background: isDark
                    ? 'linear-gradient(180deg, rgba(9,19,38,0.68) 0%, rgba(9,19,38,0.52) 48%, rgba(9,19,38,0.92) 100%)'
                    : 'linear-gradient(180deg, rgba(250,250,250,0.92) 0%, rgba(250,250,250,0.86) 58%, rgba(250,250,250,0.97) 100%)',
                }}
              />

              {/* Center Stage: Editorial Emma/Ivan Rig Preview + Punchy 5-Word H1 + 1-Line Prop */}
              <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center text-center gap-3">
                <button
                  type="button"
                  onClick={() => setHeroAvatar((p) => (p === 'emma' ? 'teacher-ivan' : 'emma'))}
                  aria-label={isEs ? 'Cambiar vista entre Emma y Teacher Ivan' : 'Switch preview between Emma and Teacher Ivan'}
                  className="relative rounded-full overflow-hidden border-2 border-[#E09B30] shadow-2xl bg-[#0F203D] cursor-pointer p-0 shrink-0"
                  style={{
                    width: 'clamp(146px, 23dvh, 196px)',
                    height: 'clamp(146px, 23dvh, 196px)',
                  }}
                >
                  <ChibiAvatar
                    character={heroAvatar}
                    mood="happy"
                    className="w-full h-full"
                  />
                </button>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider border ${
                    isDark
                      ? 'bg-[#132642]/90 text-[#E09B30] border-[#E09B30]/40'
                      : 'bg-[#FFFFFF] text-[#9A6515] border-[#1A3153]/18'
                  }`}
                >
                  <Sparkles size={12} aria-hidden="true" />
                  <span>{heroAvatar === 'emma' ? 'Emma IA • 24/7' : 'Teacher Ivan • 1-a-1'}</span>
                </span>

                <h1
                  id="hero-main-heading"
                  className={`font-montserrat font-extrabold tracking-tight max-w-xs ${
                    isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
                  }`}
                  style={{
                    fontSize: 'clamp(26px, 7.2vw, 34px)',
                    lineHeight: 1.1,
                  }}
                >
                  {isEs ? 'Habla inglés real con seguridad.' : 'Speak real English with confidence.'}
                </h1>

                <p
                  className={`font-inter text-base leading-snug max-w-xs ${
                    isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'
                  }`}
                >
                  {isEs
                    ? 'Tutora IA 24/7 y clases 1-a-1 en vivo con Teacher Ivan.'
                    : '24/7 AI voice coach and live 1-on-1 classes with Teacher Ivan.'}
                </p>
              </div>

              {/* Bottom Action Stack (Single-Screen Thumb Zone) */}
              <div className="relative z-10 shrink-0 space-y-2.5 pt-2">
                <button
                  id="hero-primary-cta-btn"
                  type="button"
                  onClick={handleStartVoiceTest}
                  className="w-full min-h-[52px] px-5 py-3 rounded-full bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] font-montserrat font-extrabold text-base inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer border-0"
                >
                  <Mic size={19} aria-hidden="true" />
                  <span>{isEs ? 'Probar Simulador Gratis (90s)' : 'Test Voice Lab Free (90s)'}</span>
                </button>

                {/* Compact Secondary Pill Row: Planes | Método | WhatsApp */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    id="mobile-open-plans-sheet-btn"
                    type="button"
                    onClick={() => setMobileSheet('plans')}
                    className={`min-h-[44px] px-2 rounded-full font-montserrat font-bold text-xs inline-flex items-center justify-center gap-1 cursor-pointer border ${
                      isDark
                        ? 'bg-[#132642]/90 text-[#FAFAFA] border-[#A7C7E7]/30'
                        : 'bg-[#FFFFFF] text-[#1A3153] border-[#1A3153]/25'
                    }`}
                  >
                    <Tag size={13} className={isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'} aria-hidden="true" />
                    <span>{isEs ? 'Planes' : 'Plans'}</span>
                  </button>

                  <button
                    id="mobile-open-method-sheet-btn"
                    type="button"
                    onClick={() => setMobileSheet('method')}
                    className={`min-h-[44px] px-2 rounded-full font-montserrat font-bold text-xs inline-flex items-center justify-center gap-1 cursor-pointer border ${
                      isDark
                        ? 'bg-[#132642]/90 text-[#FAFAFA] border-[#A7C7E7]/30'
                        : 'bg-[#FFFFFF] text-[#1A3153] border-[#1A3153]/25'
                    }`}
                  >
                    <Layers size={13} className={isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'} aria-hidden="true" />
                    <span>{isEs ? 'Método' : 'Method'}</span>
                  </button>

                  <a
                    id="hero-direct-whatsapp-btn"
                    href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
                    onClick={() => handleWhatsAppClick('hero')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`min-h-[44px] px-2 rounded-full font-montserrat font-bold text-xs inline-flex items-center justify-center gap-1 cursor-pointer border ${
                      isDark
                        ? 'bg-[#132642]/90 text-[#FAFAFA] border-[#A7C7E7]/30'
                        : 'bg-[#FFFFFF] text-[#1A3153] border-[#1A3153]/25'
                    }`}
                  >
                    <MessageCircle size={13} className={isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'} aria-hidden="true" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Mobile Bottom-Sheet Modal for Plans (300-850 BOB) or Method & Motivational Showcase */}
        {mobileSheet && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[90] flex items-end justify-center bg-[#091326]/75 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMobileSheet(null);
            }}
          >
            <div
              className={`w-full max-w-lg max-h-[86dvh] rounded-t-3xl overflow-y-auto overscroll-contain shadow-2xl ${
                isDark
                  ? 'bg-[#091326] text-[#FAFAFA] border-t border-[#A7C7E7]/25'
                  : 'bg-[#FAFAFA] text-[#1A3153] border-t border-[#1A3153]/18'
              }`}
            >
              <div
                className={`sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 border-b ${
                  isDark ? 'bg-[#091326]/95 border-[#A7C7E7]/20' : 'bg-[#FAFAFA]/95 border-[#1A3153]/14'
                }`}
              >
                <h2 className="font-montserrat font-bold text-base">
                  {mobileSheet === 'plans'
                    ? isEs
                      ? 'Planes (300–850 BOB)'
                      : 'Plans (300–850 BOB)'
                    : isEs
                    ? 'Método Bicrónico y Oportunidades'
                    : 'Bicronic Method & Opportunities'}
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileSheet(null)}
                  aria-label={isEs ? 'Cerrar' : 'Close'}
                  className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer ${
                    isDark ? 'bg-[#132642] text-[#FAFAFA]' : 'bg-[#EEF3F8] text-[#1A3153]'
                  }`}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {mobileSheet === 'plans' ? (
                <div className="pb-6">
                  <PricingSection />
                </div>
              ) : (
                <div className="py-5 space-y-6">
                  <div className="px-5 space-y-3">
                    <div
                      className={`p-4 rounded-2xl border ${
                        isDark ? 'bg-[#132642] border-[#A7C7E7]/25' : 'bg-[#FFFFFF] border-[#1A3153]/15'
                      }`}
                    >
                      <span className={`text-xs font-montserrat font-bold uppercase ${isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'}`}>
                        {isEs ? 'Motor 01 • Inmersión 24/7' : 'Engine 01 • 24/7 Immersion'}
                      </span>
                      <p className={`text-sm mt-1 ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                        {isEs
                          ? 'Practica conversación hablada 24/7 con Emma IA y micro-sprints de 10 min en Mi Ruta.'
                          : 'Practice spoken conversation 24/7 with Emma AI and 10-min daily sprints in My Path.'}
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-2xl border ${
                        isDark ? 'bg-[#132642] border-[#E09B30]/45' : 'bg-[#FFFFFF] border-[#1A3153]/25'
                      }`}
                    >
                      <span className={`text-xs font-montserrat font-bold uppercase ${isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'}`}>
                        {isEs ? 'Motor 02 • Coaching 1-a-1 (>75% habla)' : 'Engine 02 • Live 1-on-1 (>75% talk)'}
                      </span>
                      <p className={`text-sm mt-1 ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                        {isEs
                          ? 'Sesiones privadas en vivo con Teacher Ivan (Lun–Vie 14:00–20:00 BOT) con recasting nativo.'
                          : 'Private live sessions with Teacher Ivan (Mon–Fri 14:00–20:00 BOT) with native recasting.'}
                      </p>
                    </div>
                  </div>
                  <MotivationalShowcase isMobile={true} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // DESKTOP CINEMATIC PORTAL-TO-METROPOLIS EXPERIENCE (>= 768px)
  // =========================================================================
  return (
    <div
      id="landing-page-view"
      className={`relative w-full max-w-[100vw] overflow-x-clip select-none ${
        isDark ? 'bg-[#091326] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#1A3153]'
      }`}
    >
      {/* 1. FIXED LUMINOUS METROPOLIS BACKDROP (zIndex: 0) */}
      <WorldBackdrop worldRef={worldRef} scrollProgress={scrollProgress} />

      {/* 2. FIXED TOP NAVIGATION (WCAG >= 7:1 Contrast in Both Light & Night Mode) */}
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
            height: 72,
            padding: '0 40px',
            maxWidth: 1440,
            margin: '0 auto',
          }}
        >
          <BrandWordmark
            isMobile={false}
            surface={isDark ? 'dark' : 'light'}
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })}
          />

          <div className="flex items-center gap-3.5 shrink-0">
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

            <button
              id="guest-nav-assessment"
              type="button"
              onClick={handleStartVoiceTest}
              className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] font-montserrat font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shadow-sm border-0"
            >
              {isEs ? 'Test 90s Gratis' : 'Free 90s Test'}
            </button>

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
                <line x1="3.5" y1="7" x2="16.5" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3.5" y1="13" x2="16.5" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {renderDrawer()}

      {/* 3. DESKTOP 160vh PINNED DOORWAY-TO-METROPOLIS PORTAL ZOOM */}
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
          <PortalGateway portalRef={portalRef} opacity={portalOpacity} />

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

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    id="hero-primary-cta-btn"
                    type="button"
                    onClick={handleStartVoiceTest}
                    className="min-h-[48px] px-6 py-3 rounded-full bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] font-montserrat font-bold text-sm inline-flex items-center gap-2 shadow-lg transition-colors cursor-pointer border-0"
                  >
                    <Mic size={17} aria-hidden="true" />
                    <span>{isEs ? 'Probar Simulador Gratis (90s)' : 'Test Voice Lab Free (90s)'}</span>
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

      {/* 4. DESKTOP BELOW-THE-FOLD SECTIONS FLOATING OVER LUMINOUS METROPOLIS */}
      <div
        id="portal-world-content"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
        }}
      >
        <section
          id="section-2-stories"
          aria-labelledby="motivation-section-heading"
          className="pt-[12vh] pb-16 px-6 text-center"
        >
          <div
            className="mx-auto max-w-2xl px-8 py-6 rounded-[28px] shadow-lg"
            style={{
              background: cardSurfaceBg,
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: cardSurfaceBorder,
            }}
          >
            <h2
              id="motivation-section-heading"
              className={`font-montserrat font-bold tracking-tight ${
                isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
              }`}
              style={{ fontSize: 'clamp(32px, 3.6vw, 46px)', lineHeight: 1.12 }}
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

          <MotivationalShowcase isMobile={false} />
        </section>

        <section
          id="chapter-1-bicronic"
          aria-labelledby="bicronic-section-heading"
          className="py-20 px-6 lg:px-12"
        >
          <div className="max-w-[1280px] mx-auto space-y-12">
            <h2 id="bicronic-section-heading" className="visually-hidden">
              {isEs ? 'El Método Bicrónico y Laboratorio de Voz 24/7' : 'The Bicronic Method and 24/7 Voice Lab'}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div
                className={`p-9 rounded-[28px] flex flex-col justify-between gap-5 shadow-lg ${
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
                  <h3 className={`font-montserrat font-bold text-2xl ${isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'}`}>
                    {isEs ? 'Emma IA 24/7 + Mi Ruta' : 'Emma AI 24/7 + My Path'}
                  </h3>
                  <p className={`font-inter text-base leading-relaxed ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                    {isEs
                      ? 'Practica conversación hablada a cualquier hora, completa micro-sprints de 10 minutos y genera fichas para tu carrera.'
                      : 'Practice spoken conversation anytime, complete 10-minute daily sprints, and generate custom career worksheets.'}
                  </p>
                </div>
                <div className={`pt-4 border-t flex items-baseline justify-between gap-2 ${isDark ? 'border-[#A7C7E7]/20' : 'border-[#1A3153]/15'}`}>
                  <span className={`font-montserrat font-extrabold text-2xl tabular-nums ${isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'}`}>
                    24/7 • 10 min/día
                  </span>
                  <span className={`font-montserrat font-bold text-xs uppercase tracking-wider ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                    {isEs ? '95% Retención' : '95% Retention'}
                  </span>
                </div>
              </div>

              <div
                className={`p-9 rounded-[28px] flex flex-col justify-between gap-5 shadow-lg ${
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
                  <h3 className={`font-montserrat font-bold text-2xl ${isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'}`}>
                    {isEs ? 'Mentoría 1-a-1 con Teacher Ivan' : 'Live 1-on-1 with Teacher Ivan'}
                  </h3>
                  <p className={`font-inter text-base leading-relaxed ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                    {isEs
                      ? 'Sesiones privadas de 60 minutos (Lun–Vie 14:00–20:00 BOT) donde hablas más del 75% de la clase con corrección nativa.'
                      : 'Private 60-minute sessions (Mon–Fri 14:00–20:00 BOT) where you speak over 75% of the class with native recasting.'}
                  </p>
                </div>
                <div className={`pt-4 border-t flex items-baseline justify-between gap-2 ${isDark ? 'border-[#A7C7E7]/20' : 'border-[#1A3153]/15'}`}>
                  <span className={`font-montserrat font-extrabold text-2xl tabular-nums ${isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'}`}>
                    &gt;75% {isEs ? 'Habla Activa' : 'Active Talk'}
                  </span>
                  <span className={`font-montserrat font-bold text-xs uppercase tracking-wider ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                    {isEs ? 'Lun–Vie 14:00–20:00' : 'Mon–Fri 14:00–20:00'}
                  </span>
                </div>
              </div>
            </div>

            <div
              id="chapter-2-voicelab"
              className={`p-10 rounded-[28px] space-y-6 shadow-xl ${
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
                  <h2 className={`font-montserrat font-bold text-3xl tracking-tight ${isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'}`}>
                    {isEs ? 'Prueba tu fluidez en 90 segundos' : 'Test your spoken fluency in 90 seconds'}
                  </h2>
                  <p className={`font-inter text-base ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                    {isEs
                      ? 'Habla con naturalidad y recibe tu diagnóstico MCER al instante.'
                      : 'Speak naturally and receive your instant CEFR diagnostic.'}
                  </p>
                </div>

                <CompactVoiceSimulator />

                <div
                  className={`p-5 rounded-2xl border flex flex-row items-center justify-between gap-4 text-left ${
                    isDark ? 'bg-[#091326]/85 border-[#A7C7E7]/25' : 'bg-[#EEF3F8] border-[#1A3153]/16'
                  }`}
                >
                  <div className="space-y-1">
                    <span className={`text-sm font-montserrat font-bold uppercase tracking-wider block ${isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'}`}>
                      {isEs ? '¿Quieres guardar tu progreso y tu ruta de 5 días?' : 'Want to save your progress and 5-day path?'}
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

        <PricingSection />

        <section id="chapter-4-faq" aria-labelledby="faq-section-heading" className="py-20 px-6 lg:px-12">
          <div
            className={`max-w-4xl mx-auto p-10 rounded-[28px] space-y-6 shadow-lg ${
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
              <div className={`text-xs font-montserrat font-bold tracking-[0.15em] uppercase ${isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'}`}>
                —— {isEs ? 'PREGUNTAS FRECUENTES' : 'FREQUENTLY ASKED'}
              </div>
              <h2 id="faq-section-heading" className={`font-montserrat font-bold text-3xl tracking-tight ${isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'}`}>
                {isEs ? 'Preguntas frecuentes.' : 'Straight answers.'}
              </h2>
            </div>

            <div className={`divide-y border-t border-b ${isDark ? 'divide-[#A7C7E7]/20 border-[#A7C7E7]/20' : 'divide-[#1A3153]/15 border-[#1A3153]/15'}`}>
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
                          isDark ? 'text-[#FAFAFA] hover:text-[#E09B30]' : 'text-[#1A3153] hover:text-[#9A6515]'
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
                      <div className={`pb-5 text-base font-inter leading-relaxed pr-4 ${isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'}`}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-row items-center justify-between gap-4 text-left">
              <div>
                <h3 className={`font-montserrat font-bold text-base ${isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'}`}>
                  {isEs ? '¿Tienes una consulta sobre tu nivel o horario?' : 'Have a question about your level or schedule?'}
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

        <Footer />
      </div>
    </div>
  );
};

export default PortalLanding;
