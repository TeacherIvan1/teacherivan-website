import React, { useState } from 'react';
import { Target, Headphones, BookOpen, Calendar, Terminal, LogOut, User as UserIcon, Menu, X, Sparkles } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { useAuthStore } from '../modules/auth/authStore';
import { useDevModeStore } from '../modules/dev/devModeStore';
import { useAssessmentStore } from '../modules/assessment/assessmentStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { LanguageToggle } from './LanguageToggle';
import { useTheme } from '../modules/theme/ThemeContext';

export interface NavbarProps {
  theme?: 'light' | 'dark';
}

export const Navbar: React.FC<NavbarProps> = ({ theme: propTheme }) => {
  const { isEs } = useTranslation();
  const { activeView, setActiveView } = useNavigationStore();
  const { user, isAuthenticated, openAuthModal, signOut } = useAuthStore();
  const { isDeveloperMode, toggleDeveloperMode } = useDevModeStore();
  const openAssessmentModal = useAssessmentStore((s) => s.openAssessmentModal);
  const selectScenario = useTeachingStore((s) => s.selectScenario);
  const { theme: contextTheme, isDark, toggleTheme } = useTheme();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const currentTheme = propTheme || contextTheme;

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

  const planBadgeText = (user?.plan || 'free').toUpperCase();
  const isDevUser = user?.email === 'ivan@teacherivan.com';

  return (
    <>
      <header
        id="app-navbar"
        data-theme={currentTheme}
        className={`sticky top-0 inset-x-0 z-50 h-14 lg:h-[68px] transition-colors duration-300 select-none flex items-center border-b ${
          isDark
            ? 'bg-[#091326]/90 text-[#FAFAFA] border-[rgba(167,199,231,0.22)]'
            : 'bg-[#FAFAFA]/90 text-[#1A3153] border-[rgba(26,49,83,0.12)]'
        }`}
        style={{
          backdropFilter: 'saturate(1.4) blur(14px)',
          WebkitBackdropFilter: 'saturate(1.4) blur(14px)',
        }}
      >
        {/* Mobile Header Bar (< 1024px) */}
        <div className="lg:hidden w-full h-14 px-3 flex items-center justify-between gap-2 overflow-hidden">
          <button
            onClick={() => {
              if (isAuthenticated) {
                setActiveView('path');
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 focus:outline-none cursor-pointer shrink-0"
            title="Teacher Ivan - Official English Classes"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-[#1A3153] dark:bg-[#132642] p-1 border border-[#E09B30]/40">
              <img
                src="/assets/logo.svg"
                alt="TI Logo"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <span className="font-montserrat font-bold text-base tracking-tight whitespace-nowrap text-[#1A3153] dark:text-[#FAFAFA]">
              Teacher <span className="text-[#9A6515] dark:text-[#E09B30]">I</span>van
            </span>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              id="navbar-mobile-theme-toggle-btn"
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

            <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
              <LanguageToggle id="navbar-mobile-lang-toggle" showIcon={false} />
            </div>

            <button
              id="navbar-mobile-hamburger-btn"
              type="button"
              onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-current hover:bg-current/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              {isMobileDrawerOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Desktop Header Bar (>= 1024px) */}
        <div className="hidden lg:flex w-full max-w-[1440px] mx-auto items-center justify-between gap-4 px-8">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setActiveView('path');
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2.5 focus:outline-none cursor-pointer group"
              title="Teacher Ivan - Official English Classes"
            >
              <div className="w-10 h-10 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="/assets/logo.svg"
                  alt="Teacher Ivan Logo"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>

              <div className="flex flex-col text-left leading-none">
                <div className="flex items-center gap-1">
                  <span className="font-montserrat font-extrabold tracking-tight text-lg whitespace-nowrap text-[#1A3153] dark:text-[#FAFAFA]">
                    Teacher <span className="text-[#9A6515] dark:text-[#E09B30]">I</span>van
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E09B30]" />
                </div>
                <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-[#4A5568] dark:text-[#A7C7E7]">
                  {isEs ? 'Método Bicrónico' : 'Bichronous Method'}
                </span>
              </div>
            </button>
          </div>

          {isAuthenticated ? (
            <nav className="flex items-center gap-1 p-1 rounded-full border border-current/15 bg-black/10 backdrop-blur-md">
              <button
                onClick={() => setActiveView('path')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeView === 'path'
                    ? 'bg-amber-brand text-navy-midnight shadow-md shadow-amber-brand/30 font-black'
                    : 'hover:bg-white/10 opacity-80 hover:opacity-100'
                }`}
              >
                <Target size={14} />
                <span>{isEs ? 'Mi Ruta' : 'My Path'}</span>
              </button>

              <button
                onClick={() => setActiveView('simulator')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeView === 'simulator'
                    ? 'bg-amber-brand text-navy-midnight shadow-md shadow-amber-brand/30 font-black'
                    : 'hover:bg-white/10 opacity-80 hover:opacity-100'
                }`}
              >
                <Headphones size={14} />
                <span>{isEs ? 'Simulador IA' : 'AI Simulator'}</span>
              </button>

              <button
                onClick={() => setActiveView('resources')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeView === 'resources'
                    ? 'bg-amber-brand text-navy-midnight shadow-md shadow-amber-brand/30 font-black'
                    : 'hover:bg-white/10 opacity-80 hover:opacity-100'
                }`}
              >
                <BookOpen size={14} />
                <span>{isEs ? 'Recursos & Juegos' : 'Resources & Games'}</span>
              </button>

              <button
                onClick={() => setActiveView('schedule')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeView === 'schedule'
                    ? 'bg-amber-brand text-navy-midnight shadow-md shadow-amber-brand/30 font-black'
                    : 'hover:bg-white/10 opacity-80 hover:opacity-100'
                }`}
              >
                <Calendar size={14} />
                <span>{isEs ? 'Agendar Clase' : 'Book Class'}</span>
              </button>

              {isDevUser && (
                <button
                  onClick={toggleDeveloperMode}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wider transition-all cursor-pointer border ${
                    isDeveloperMode
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'border-purple-400/30 text-purple-300 hover:bg-purple-900/30'
                  }`}
                  title="Admin Dev Mode"
                >
                  <Terminal size={12} />
                  <span>DEV</span>
                </button>
              )}
            </nav>
          ) : (
            <nav className="flex items-center gap-6 text-[13px] font-medium font-sans">
              <button
                onClick={() => scrollToSection('chapter-1-bicronic')}
                className="hover:text-amber-brand transition-colors cursor-pointer"
              >
                {isEs ? 'Ch. 1 Método' : 'Ch. 1 Method'}
              </button>
              <button
                onClick={() => scrollToSection('chapter-2-voicelab')}
                className="hover:text-amber-brand transition-colors cursor-pointer"
              >
                {isEs ? 'Ch. 2 Voice Lab' : 'Ch. 2 Voice Lab'}
              </button>
              <button
                onClick={() => scrollToSection('chapter-3-plans')}
                className="hover:text-amber-brand transition-colors cursor-pointer"
              >
                {isEs ? 'Ch. 3 Planes' : 'Ch. 3 Plans'}
              </button>
              <button
                onClick={() => scrollToSection('chapter-4-faq')}
                className="hover:text-amber-brand transition-colors cursor-pointer"
              >
                {isEs ? 'Ch. 4 FAQ' : 'Ch. 4 FAQ'}
              </button>
            </nav>
          )}

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="navbar-desktop-theme-toggle-btn"
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

            <LanguageToggle id="navbar-lang-toggle" showIcon={false} />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 shrink-0">
                <div
                  id="navbar-student-profile-badge"
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
                  onClick={signOut}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-current opacity-70 hover:opacity-100 cursor-pointer"
                  title={isEs ? 'Cerrar sesión' : 'Sign out'}
                  aria-label="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-current/25 hover:bg-current/5 transition-colors cursor-pointer"
              >
                <UserIcon size={13} />
                <span>{isEs ? 'Ingresar' : 'Sign In'}</span>
              </button>
            )}

            <button
              onClick={handleTakeAssessment}
              className="btn-3d-amber px-4 py-2 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider cursor-pointer shrink-0"
            >
              {isEs ? 'Test 90s Gratis' : 'Free 90s Test'}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Drawer for Mobile */}
      {isMobileDrawerOpen && (
        <>
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300"
            aria-hidden="true"
          />
          <div
            id="mobile-nav-slide-drawer"
            className="fixed top-0 right-0 w-[84vw] max-w-sm h-full bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl z-50 p-6 flex flex-col justify-between border-l border-[var(--border-hairline)] overflow-y-auto lg:hidden animate-in slide-in-from-right duration-250"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-[#1A3153] dark:bg-[#132642] p-1 border border-[#E09B30]/40">
                  <img src="/assets/logo.svg" alt="TI Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-montserrat font-bold text-base text-[#1A3153] dark:text-[#FAFAFA]">
                  Teacher <span className="text-[#9A6515] dark:text-[#E09B30]">I</span>van
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-current/10 cursor-pointer"
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

            <div className="py-6 flex flex-col gap-2 flex-1">
              {!isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => scrollToSection('chapter-1-bicronic')}
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm text-[var(--text-primary)] hover:bg-[#E09B30]/10 hover:text-[#9A6515] dark:hover:text-[#E09B30] flex items-center gap-3 cursor-pointer"
                  >
                    <span className="font-mono text-xs text-[#9A6515] dark:text-[#E09B30]">01</span>
                    <span>{isEs ? 'El Método' : 'The Method'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('chapter-2-voicelab')}
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm text-[var(--text-primary)] hover:bg-[#E09B30]/10 hover:text-[#9A6515] dark:hover:text-[#E09B30] flex items-center gap-3 cursor-pointer"
                  >
                    <span className="font-mono text-xs text-[#9A6515] dark:text-[#E09B30]">02</span>
                    <span>{isEs ? 'Laboratorio IA' : 'AI Voice Lab'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('chapter-3-plans')}
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm text-[var(--text-primary)] hover:bg-[#E09B30]/10 hover:text-[#9A6515] dark:hover:text-[#E09B30] flex items-center gap-3 cursor-pointer"
                  >
                    <span className="font-mono text-xs text-[#9A6515] dark:text-[#E09B30]">03</span>
                    <span>{isEs ? 'Planes (300–850 BOB)' : 'Plans (300–850 BOB)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('chapter-4-faq')}
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm text-[var(--text-primary)] hover:bg-[#E09B30]/10 hover:text-[#9A6515] dark:hover:text-[#E09B30] flex items-center gap-3 cursor-pointer"
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
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm flex items-center gap-3 cursor-pointer"
                  >
                    <Target size={18} />
                    <span>{isEs ? 'Mi Ruta' : 'My Path'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('simulator');
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm flex items-center gap-3 cursor-pointer"
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
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm flex items-center gap-3 cursor-pointer"
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
                    className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left font-montserrat font-bold text-sm flex items-center gap-3 cursor-pointer"
                  >
                    <Calendar size={18} />
                    <span>{isEs ? 'Agendar Clase' : 'Book Class'}</span>
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

            <div className="pt-4 border-t border-[var(--border-hairline)] space-y-3">
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

              {!isAuthenticated ? (
                <button
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
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    signOut();
                  }}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-full font-montserrat font-semibold text-xs border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut size={14} />
                  <span>{isEs ? 'Cerrar Sesión' : 'Sign Out'}</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
