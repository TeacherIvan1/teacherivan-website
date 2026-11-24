import React, { useEffect, useState } from 'react';
import {
  Shield,
  Server,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Headphones,
  BookOpen,
  Calendar,
  User as UserIcon,
  Target,
  LogOut,
  X,
  Menu,
} from 'lucide-react';
import { checkServerHealth } from '../modules/auth/tokenService';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { useDevModeStore } from '../modules/dev/devModeStore';
import { useAssessmentStore } from '../modules/assessment/assessmentStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { useAuthStore } from '../modules/auth/authStore';
import { LanguageToggle } from './LanguageToggle';
import { BrandWordmark } from './BrandWordmark';
import { useTheme } from '../modules/theme/ThemeContext';
import { useScrollLock } from '../hooks/useScrollLock';
import { useCookieConsent } from '../context/CookieConsentContext';
import { getGeneralWhatsAppUrl } from '../utils/whatsapp';
import { ShieldCheck, SlidersHorizontal, MessageCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [keyConfigured, setKeyConfigured] = useState<boolean | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  useScrollLock(isMobileDrawerOpen);
  const { theme, isDark, toggleTheme } = useTheme();

  // Escape key dismissal for mobile navigation drawer (WCAG 2.1.1)
  useEffect(() => {
    if (!isMobileDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen]);
  const status = useConversationStore((s) => s.status);
  const { t, isEs } = useTranslation();
  const openAssessmentModal = useAssessmentStore((s) => s.openAssessmentModal);
  const selectScenario = useTeachingStore((s) => s.selectScenario);
  const { activeView, setActiveView } = useNavigationStore();
  const { user, isAuthenticated, openAuthModal, signOut } = useAuthStore();
  const { isDeveloperMode, toggleDeveloperMode } = useDevModeStore();
  const { openLegalModal, openCookiePreferences } = useCookieConsent();

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const check = () => {
      checkServerHealth()
        .then((data) => {
          if (!mounted) return;
          setServerOk(true);
          setKeyConfigured(data.apiKeyConfigured);
        })
        .catch(() => {
          if (!mounted) return;
          setServerOk(false);
          setKeyConfigured(false);
          timer = setTimeout(() => {
            if (mounted) check();
          }, 5000);
        });
    };

    check();

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const getSessionStatusLabel = (): string => {
    if (status === 'requesting_token') return t.nav.sessionStatus.requesting_token;
    if (status === 'connecting') return t.nav.sessionStatus.connecting;
    if (status === 'connected') return t.nav.sessionStatus.connected;
    if (status === 'error') return t.nav.sessionStatus.error;
    return t.nav.sessionStatus.idle;
  };

  const handleTakeAssessment = () => {
    selectScenario('diagnostic-placement');
    openAssessmentModal();
    setIsMobileDrawerOpen(false);
  };

  const scrollToSection = (id: string) => {
    setIsMobileDrawerOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        id="app-navbar"
        data-theme={theme}
        className={`sticky top-0 z-50 shrink-0 w-full select-none transition-colors duration-250 flex items-center backdrop-blur-md border-b border-[var(--border-hairline)] h-[52px] lg:h-[68px] ${
          isDark
            ? 'bg-[#091326]/90 text-[#FAFAFA]'
            : 'bg-[#FAFAFA]/90 text-[#1A3153]'
        }`}
        style={{
          backdropFilter: 'saturate(1.4) blur(14px)',
          WebkitBackdropFilter: 'saturate(1.4) blur(14px)',
        }}
      >
        {/* ===================================================================== */}
        {/* MOBILE & TABLET HEADER (< 1024px): Fixed 52px height & 0px overflow   */}
        {/* ===================================================================== */}
        <div className="lg:hidden w-full h-[52px] px-3 flex items-center justify-between gap-2 overflow-hidden">
          {/* Left: BrandWordmark (Teacher in Montserrat + Ivan in Mr Dafoe) */}
          <BrandWordmark
            isMobile={true}
            surface={isDark ? 'dark' : 'light'}
            onClick={() => {
              if (isAuthenticated) {
                setActiveView('path');
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />

          {/* Right: Three clean min-w-[44px] min-h-[44px] touch targets */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 1. Theme Toggle */}
            <button
              id="mobile-theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-current hover:bg-current/10 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* 2. Compact ES | EN Toggle */}
            <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
              <LanguageToggle id="mobile-header-lang-toggle" showIcon={false} />
            </div>

            {/* 3. Hamburger Menu Button */}
            <button
              id="mobile-hamburger-btn"
              type="button"
              onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-current hover:bg-current/10 transition-colors cursor-pointer"
              aria-label={isMobileDrawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileDrawerOpen}
            >
              {isMobileDrawerOpen ? (
                <X size={22} className="text-current" />
              ) : (
                <Menu size={22} className="text-current" />
              )}
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* DESKTOP HEADER (>= 1024px): 68px Full Navigation Matrix (Preserved) */}
        {/* ===================================================================== */}
        <div className="hidden lg:flex w-full max-w-[1440px] mx-auto px-6 items-center justify-between gap-4 overflow-hidden">
          {/* Left: BrandWordmark (Teacher in Montserrat + Ivan in Mr Dafoe) */}
          <BrandWordmark
            isMobile={false}
            surface={isDark ? 'dark' : 'light'}
            onClick={() => {
              if (isAuthenticated) {
                setActiveView('path');
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />

          {/* Center: Desktop Navigation Tabs (Authenticated) or Chapter Links (Guests) */}
          {isAuthenticated ? (
            <nav className="flex items-center gap-1 bg-[#1A3153]/80 p-1 rounded-full border border-[#A7C7E7]/30 shadow-inner">
              <button
                id="nav-tab-path"
                onClick={() => setActiveView('path')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeView === 'path'
                    ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30 font-black'
                    : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
                }`}
              >
                <Target size={14} />
                <span>{isEs ? 'Mi Ruta' : 'My Path'}</span>
              </button>

              <button
                id="nav-tab-simulator"
                onClick={() => setActiveView('simulator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeView === 'simulator'
                    ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30 font-black'
                    : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
                }`}
              >
                <Headphones size={14} />
                <span>{isEs ? 'Simulador' : 'Simulator'}</span>
              </button>

              <button
                id="nav-tab-resources"
                onClick={() => setActiveView('resources')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeView === 'resources'
                    ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30 font-black'
                    : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
                }`}
              >
                <BookOpen size={14} />
                <span>{isEs ? 'Recursos & Juegos' : 'Resources & Games'}</span>
              </button>

              <button
                id="nav-tab-schedule"
                onClick={() => setActiveView('schedule')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeView === 'schedule'
                    ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30 font-black'
                    : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
                }`}
              >
                <Calendar size={14} />
                <span>{isEs ? 'Agendar' : 'Schedule'}</span>
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-1.5 bg-[#1A3153]/80 p-1 rounded-full border border-[#A7C7E7]/30 shadow-inner">
              <button
                id="guest-nav-model"
                onClick={() => scrollToSection('chapter-1-bicronic')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5 transition-all cursor-pointer"
              >
                <span>{isEs ? '01 Método' : '01 Method'}</span>
              </button>

              <button
                id="guest-nav-simulator"
                onClick={() => scrollToSection('chapter-2-voicelab')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5 transition-all cursor-pointer"
              >
                <Headphones size={13} />
                <span>{isEs ? '02 Voice Lab' : '02 Voice Lab'}</span>
              </button>

              <button
                id="guest-nav-pricing"
                onClick={() => scrollToSection('chapter-3-plans')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5 transition-all cursor-pointer"
              >
                <BookOpen size={13} />
                <span>{isEs ? '03 Planes' : '03 Plans'}</span>
              </button>

              <button
                id="guest-nav-faq"
                onClick={() => scrollToSection('chapter-4-faq')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5 transition-all cursor-pointer"
              >
                <span>{isEs ? '04 FAQ' : '04 FAQ'}</span>
              </button>
            </nav>
          )}

          {/* Right: Controls, Authentication & Language Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-current/10 transition-colors text-current opacity-80 hover:opacity-100 cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Language Switcher (EN | ES) */}
            <LanguageToggle id="header-lang-toggle" showIcon={false} />

            {/* Technical UI — Developer Mode (strictly gated for Admin) */}
            {(user?.role === 'admin' && isDeveloperMode) && (
              <>
                <div className="status-badge hidden xl:inline-flex" title="Backend Server Status" id="backend-status-badge">
                  <Server size={13} color="#A7C7E7" />
                  <span className="text-[#A7C7E7]">{t.nav.server}</span>
                  {serverOk === null ? (
                    <span style={{ color: '#94a3b8' }}>{t.nav.checking}</span>
                  ) : serverOk ? (
                    <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={12} /> {t.nav.online}
                    </span>
                  ) : (
                    <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} /> {t.nav.offline}
                    </span>
                  )}
                </div>

                <div className="status-badge hidden xl:inline-flex" title="Master API Key guarded on Express server" id="key-security-badge">
                  <Shield size={13} color="#A7C7E7" />
                  <span className="text-[#A7C7E7]">{t.nav.key}</span>
                  {keyConfigured === null ? (
                    <span style={{ color: '#94a3b8' }}>...</span>
                  ) : keyConfigured ? (
                    <span style={{ color: '#A7C7E7' }}>{t.nav.guarded}</span>
                  ) : (
                    <span style={{ color: '#E09B30' }}>{t.nav.missingKey}</span>
                  )}
                </div>

                <div className="status-badge hidden lg:inline-flex" id="session-status-badge">
                  <span className={`status-dot ${status === 'connected' ? 'connected' : status === 'requesting_token' ? 'connecting' : status === 'error' ? 'error' : 'idle'}`} />
                  <span style={{ textTransform: 'capitalize' }}>
                    {getSessionStatusLabel()}
                  </span>
                </div>
              </>
            )}

            {/* Admin Gate Dev Mode */}
            {user?.role === 'admin' && (
              <button
                id="admin-dev-toggle-btn"
                type="button"
                onClick={toggleDeveloperMode}
                className={`text-xs px-2 py-1 rounded-lg font-montserrat font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                  isDeveloperMode
                    ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30'
                    : 'bg-[#1A3153] text-[#A7C7E7] border border-[#A7C7E7]/30 hover:text-[#FAFAFA]'
                }`}
                title="Teacher Ivan Admin Dev Mode"
              >
                <span>Dev</span>
                <span className={`w-1.5 h-1.5 rounded-full ${isDeveloperMode ? 'bg-[#1A3153]' : 'bg-[#10b981]'}`} />
              </button>
            )}

            {/* Auth Badge or Sign In */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  id="student-profile-badge"
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-[#1A3153] border border-[#A7C7E7]/40 rounded-lg text-[#FAFAFA] font-montserrat font-bold whitespace-nowrap shrink-0 shadow-sm"
                  title={user.email || user.username}
                >
                  <span className="text-[#E09B30]">●</span>
                  <span>
                    {user.role === 'admin'
                      ? 'Admin • VIP'
                      : `${(user.fullName ? user.fullName.split(' ')[0] : user.username || 'Student')} • ${
                          user.plan === 'executive'
                            ? '5 CLASES/SEM'
                            : user.plan === 'pro'
                            ? '3 CLASES/SEM'
                            : user.plan === 'essential'
                            ? 'AUTÓNOMO'
                            : 'FREE'
                        }`}
                  </span>
                </div>

                <button
                  id="sign-out-btn"
                  type="button"
                  onClick={signOut}
                  title={t.authModal.signOut}
                  className="text-xs px-2.5 py-1 bg-[#1A3153] border border-[#A7C7E7]/40 rounded-lg shrink-0 text-[#A7C7E7] hover:text-[#FAFAFA] font-montserrat font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <LogOut size={12} className="shrink-0" />
                  <span>{isEs ? 'Salir' : 'Sign Out'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="signin-nav-btn"
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="text-xs px-3 py-1.5 rounded-lg border border-current/25 hover:bg-current/10 font-montserrat font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <UserIcon size={13} />
                  <span>{isEs ? 'Entrar' : 'Sign In'}</span>
                </button>

                <button
                  id="guest-nav-assessment"
                  type="button"
                  onClick={handleTakeAssessment}
                  className="btn-3d-amber px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider cursor-pointer shrink-0 shadow-sm"
                >
                  {isEs ? 'Test 90s' : '90s Test'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-OVER NAVIGATION DRAWER (< 1024px)                            */}
      {/* ========================================================================= */}
      {isMobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 animate-in fade-in"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            id="mobile-navigation-drawer"
            data-lenis-prevent
            className="fixed top-0 right-0 w-[84vw] max-w-sm h-full bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl z-50 p-6 flex flex-col justify-between border-l border-[var(--border-hairline)] overflow-y-auto overscroll-contain lg:hidden animate-in slide-in-from-right duration-250"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Drawer"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Top Bar: Brand + Close button */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-[#1A3153] dark:bg-[#132642] p-1 border border-[#E09B30]/40">
                  <img src="/assets/logo.svg" alt="TI Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="font-montserrat font-bold text-base text-[#1A3153] dark:text-[#FAFAFA]">
                    Teacher <span className="text-[#9A6515] dark:text-[#E09B30]">I</span>van
                  </span>
                  <span className="text-[9px] font-mono uppercase text-[var(--text-secondary)] mt-0.5">
                    {isEs ? 'Método Bicrónico' : 'Bichronous Method'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-current/10 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Authenticated Student Profile in Drawer */}
            {isAuthenticated && user && (
              <div className="mt-4 p-3 rounded-2xl bg-[var(--bg-sunken)] dark:bg-[#132642] border border-[var(--border-hairline)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-8 h-8 rounded-full bg-[#E09B30] text-[#1A3153] font-montserrat font-black text-xs flex items-center justify-center shrink-0">
                    {(user.fullName || user.username || 'S')[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-montserrat font-bold text-xs text-[var(--text-primary)] truncate">
                      {user.fullName || user.username}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-montserrat font-black uppercase tracking-wider bg-[#E09B30] text-[#1A3153] shrink-0">
                  {user.role === 'admin'
                    ? 'ADMIN'
                    : user.plan === 'executive'
                    ? 'EXECUTIVE'
                    : user.plan === 'pro'
                    ? 'PRO'
                    : user.plan === 'essential'
                    ? 'ESSENTIAL'
                    : 'FREE'}
                </span>
              </div>
            )}

            {/* Center: Navigation Links */}
            <div className="py-6 flex flex-col gap-2 flex-1">
              {!isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => scrollToSection('chapter-1-bicronic')}
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm text-[var(--text-primary)] hover:bg-[#E09B30]/10 hover:text-[#9A6515] dark:hover:text-[#E09B30] transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <span className="font-mono text-xs text-[#9A6515] dark:text-[#E09B30]">01</span>
                    <span>{isEs ? 'El Método' : 'The Method'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('chapter-2-voicelab')}
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm text-[var(--text-primary)] hover:bg-[#E09B30]/10 hover:text-[#9A6515] dark:hover:text-[#E09B30] transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <span className="font-mono text-xs text-[#9A6515] dark:text-[#E09B30]">02</span>
                    <span>{isEs ? 'Laboratorio IA' : 'AI Voice Lab'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('chapter-3-plans')}
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm text-[var(--text-primary)] hover:bg-[#E09B30]/10 hover:text-[#9A6515] dark:hover:text-[#E09B30] transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <span className="font-mono text-xs text-[#9A6515] dark:text-[#E09B30]">03</span>
                    <span>{isEs ? 'Planes (300–850 BOB)' : 'Plans (300–850 BOB)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('chapter-4-faq')}
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm text-[var(--text-primary)] hover:bg-[#E09B30]/10 hover:text-[#9A6515] dark:hover:text-[#E09B30] transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <span className="font-mono text-xs text-[#9A6515] dark:text-[#E09B30]">04</span>
                    <span>{isEs ? 'Preguntas Frecuentes' : 'FAQ'}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('path');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm transition-colors flex items-center gap-3 cursor-pointer ${
                      activeView === 'path'
                        ? 'bg-[#E09B30] text-[#1A3153]'
                        : 'text-[var(--text-primary)] hover:bg-current/10'
                    }`}
                  >
                    <Target size={18} />
                    <span>{isEs ? 'Mi Ruta (Micro-Learning)' : 'My Path (Micro-Learning)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('simulator');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm transition-colors flex items-center gap-3 cursor-pointer ${
                      activeView === 'simulator'
                        ? 'bg-[#E09B30] text-[#1A3153]'
                        : 'text-[var(--text-primary)] hover:bg-current/10'
                    }`}
                  >
                    <Headphones size={18} />
                    <span>{isEs ? 'Simulador IA' : 'AI Simulator'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('resources');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm transition-colors flex items-center gap-3 cursor-pointer ${
                      activeView === 'resources'
                        ? 'bg-[#E09B30] text-[#1A3153]'
                        : 'text-[var(--text-primary)] hover:bg-current/10'
                    }`}
                  >
                    <BookOpen size={18} />
                    <span>{isEs ? 'Recursos & Juegos' : 'Resources & Games'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('schedule');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm transition-colors flex items-center gap-3 cursor-pointer ${
                      activeView === 'schedule'
                        ? 'bg-[#E09B30] text-[#1A3153]'
                        : 'text-[var(--text-primary)] hover:bg-current/10'
                    }`}
                  >
                    <Calendar size={18} />
                    <span>{isEs ? 'Agendar Clase (14:00–20:00)' : 'Book Class (14:00–20:00)'}</span>
                  </button>

                  {user?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        toggleDeveloperMode();
                        setIsMobileDrawerOpen(false);
                      }}
                      className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-mono text-xs text-[#1A3153] dark:text-[#FAFAFA] bg-[#EEF3F8] dark:bg-[#132642] border border-[#E09B30]/60 hover:bg-[#E09B30]/10 transition-colors flex items-center justify-between cursor-pointer mt-2"
                    >
                      <span>ADMIN DEV MODE</span>
                      <span className={`w-2 h-2 rounded-full ${isDeveloperMode ? 'bg-[#10b981]' : 'bg-red-400'}`} />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Bottom: Action Buttons */}
            <div className="pt-4 border-t border-[var(--border-hairline)] space-y-3">
              {/* Primary 48px .btn-3d-amber CTA */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  if (isAuthenticated) {
                    setActiveView('simulator');
                  } else {
                    handleTakeAssessment();
                  }
                }}
                className="btn-3d-amber w-full min-h-[48px] py-3 px-4 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                <span>
                  {isAuthenticated
                    ? isEs
                      ? 'Ir al Simulador de Voz →'
                      : 'Open Voice Simulator →'
                    : isEs
                    ? 'Probar Nivel en 90s Gratis →'
                    : 'Test Level in 90s Free →'}
                </span>
              </button>

              {/* Secondary Action */}
              {!isAuthenticated ? (
                <button
                  id="mobile-drawer-auth-btn"
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    openAuthModal('signin');
                  }}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-full font-montserrat font-semibold text-xs border border-[var(--border-hairline)] hover:bg-current/5 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserIcon size={14} />
                  <span>{isEs ? 'Iniciar Sesión / Crear Cuenta' : 'Sign In / Register'}</span>
                </button>
              ) : (
                <div className="space-y-2">
                  {/* Legal, Privacy & WhatsApp Links (Replaces public Footer inside mobile portal) */}
                  <div className="pt-1 pb-2 space-y-1 border-b border-[var(--border-hairline)]">
                    <a
                      href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-inter font-semibold text-[var(--text-primary)] hover:bg-current/5 transition-colors flex items-center gap-2.5"
                    >
                      <MessageCircle size={14} className="text-[#9A6515] dark:text-[#E09B30]" />
                      <span>WhatsApp +591 72878330</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        openLegalModal('privacy');
                      }}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left text-xs font-inter text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-current/5 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <ShieldCheck size={14} className="text-[#9A6515] dark:text-[#E09B30]" />
                      <span>{isEs ? 'Política de Privacidad' : 'Privacy Policy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        openLegalModal('cookies');
                      }}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left text-xs font-inter text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-current/5 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <ShieldCheck size={14} className="text-[#9A6515] dark:text-[#E09B30]" />
                      <span>{isEs ? 'Política de Cookies' : 'Cookie Policy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        openCookiePreferences();
                      }}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left text-xs font-inter text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-current/5 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <SlidersHorizontal size={14} className="text-[#9A6515] dark:text-[#E09B30]" />
                      <span>{isEs ? 'Configurar Cookies' : 'Cookie Settings'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      signOut();
                    }}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-full font-montserrat font-semibold text-xs border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>{isEs ? 'Cerrar Sesión' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
export { Header as Navbar };
