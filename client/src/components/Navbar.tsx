import React, { useEffect, useState } from 'react';
import { Target, Headphones, BookOpen, Calendar, Terminal, LogOut, User as UserIcon } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { useAuthStore } from '../modules/auth/authStore';
import { useDevModeStore } from '../modules/dev/devModeStore';
import { useAssessmentStore } from '../modules/assessment/assessmentStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { LanguageToggle } from './LanguageToggle';

export interface NavbarProps {
  theme?: 'light' | 'dark';
}

export const Navbar: React.FC<NavbarProps> = ({ theme }) => {
  const { t, isEs } = useTranslation();
  const { activeView, setActiveView } = useNavigationStore();
  const { user, isAuthenticated, openAuthModal, signOut } = useAuthStore();
  const { isDeveloperMode, toggleDeveloperMode } = useDevModeStore();
  const openAssessmentModal = useAssessmentStore((s) => s.openAssessmentModal);
  const selectScenario = useTeachingStore((s) => s.selectScenario);

  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(theme || 'light');

  // Automatic scroll-tied theme detection if theme prop is not explicitly forced
  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme);
      return;
    }

    const handleScroll = () => {
      // Find whether we are in a dark chapter
      const darkSections = ['chapter-1-bicronic', 'chapter-2-voicelab', 'chapter-4-faq', 'flagship-simulator-section'];
      let isDark = false;
      const scrollY = window.scrollY + 70;

      for (const id of darkSections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            isDark = true;
            break;
          }
        }
      }

      // If in student authenticated portal view, keep dark slate theme
      if (isAuthenticated && activeView !== 'path') {
        isDark = true;
      }

      setCurrentTheme(isDark ? 'dark' : 'light');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [theme, isAuthenticated, activeView]);

  const handleTakeAssessment = () => {
    selectScenario('diagnostic-placement');
    openAssessmentModal();
  };

  const isLight = currentTheme === 'light';

  // Plan badge styling based on user plan
  const planBadgeText = (user?.plan || 'free').toUpperCase();
  const isDevUser = user?.email === 'ivan@teacherivan.com';

  return (
    <header
      id="app-navbar"
      data-theme={currentTheme}
      className={`fixed top-0 inset-x-0 z-50 h-[68px] transition-colors duration-300 select-none flex items-center px-4 md:px-8 border-b ${
        isLight
          ? 'bg-[#FAFAFA]/75 text-[#1A3153] border-[rgba(26,49,83,0.12)]'
          : 'bg-[#1A3153]/75 text-[#FAFAFA] border-[rgba(167,199,231,0.22)]'
      }`}
      style={{
        backdropFilter: 'saturate(1.4) blur(14px)',
        WebkitBackdropFilter: 'saturate(1.4) blur(14px)',
      }}
    >
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between gap-2 md:gap-4">
        {/* Left Zone: Master Bicronic Logo Lockup */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
            {/* SVG Logo Mark */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/assets/logo.svg"
                alt="Teacher Ivan Logo"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>

            {/* Typography Lockup: Teacher Ivan strictly on single line */}
            <div className="flex flex-col text-left leading-none">
              <div className="flex items-center gap-1">
                <span
                  className={`font-montserrat font-extrabold tracking-tight text-base sm:text-lg whitespace-nowrap ${
                    isLight ? 'text-[#1A3153]' : 'text-[#FAFAFA]'
                  }`}
                >
                  Teacher Ivan
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E09B30]" />
              </div>
              <span
                className={`text-[9px] sm:text-[10px] font-mono tracking-wider uppercase font-semibold ${
                  isLight ? 'text-[#4A5568]' : 'text-[#A7C7E7]'
                }`}
              >
                {isEs ? 'Método Bicrónico' : 'Bichronous Method'}
              </span>
            </div>
          </button>
        </div>

        {/* Center Zone: Chapter Links (Guests) or Portal Tabs (Students) */}
        {isAuthenticated ? (
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full border border-current/15 bg-black/10 backdrop-blur-md">
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

            {/* Hidden Dev Mode Tab for ivan@teacherivan.com */}
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
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium font-sans">
            <button
              onClick={() => {
                const el = document.getElementById('chapter-1-bicronic');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-amber-brand transition-colors cursor-pointer"
            >
              {isEs ? 'Ch. 1 Método' : 'Ch. 1 Method'}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('chapter-2-voicelab');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-amber-brand transition-colors cursor-pointer"
            >
              {isEs ? 'Ch. 2 Voice Lab' : 'Ch. 2 Voice Lab'}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('chapter-3-plans');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-amber-brand transition-colors cursor-pointer"
            >
              {isEs ? 'Ch. 3 Planes' : 'Ch. 3 Plans'}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('chapter-4-faq');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-amber-brand transition-colors cursor-pointer"
            >
              {isEs ? 'Ch. 4 FAQ' : 'Ch. 4 FAQ'}
            </button>
          </nav>
        )}

        {/* Right Zone: Lang Toggle + Tier Badge + CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* ES | EN Toggle */}
          <LanguageToggle id="navbar-lang-toggle" showIcon={false} />

          {/* Student Status or Guest Sign In */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                id="header-plan-status-badge"
                className={`text-[10px] sm:text-xs font-montserrat font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                  user?.plan === 'executive'
                    ? 'bg-amber-brand/20 text-amber-brand border-amber-brand/50'
                    : user?.plan === 'pro'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                    : 'bg-slate-500/20 text-slate-300 border-slate-400/30'
                }`}
              >
                {planBadgeText}
              </span>

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
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-current/25 hover:bg-current/5 transition-colors cursor-pointer"
            >
              <UserIcon size={13} />
              <span>{isEs ? 'Ingresar' : 'Sign In'}</span>
            </button>
          )}

          {/* Single Compact Primary .btn-3d-amber CTA */}
          <button
            onClick={handleTakeAssessment}
            className="btn-3d-amber px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider cursor-pointer shrink-0"
          >
            {isEs ? 'Test 90s Gratis' : 'Free 90s Test'}
          </button>
        </div>
      </div>
    </header>
  );
};
