import React, { useEffect, useState } from 'react';
import {
  Shield,
  Server,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Headphones,
  BookOpen,
  Lock,
  LogOut,
  Calendar,
  User as UserIcon,
  Target,
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
import { BrandLockup } from './BrandLockup';

export const Header: React.FC = () => {
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [keyConfigured, setKeyConfigured] = useState<boolean | null>(null);
  const status = useConversationStore((s) => s.status);
  const { t, isEs } = useTranslation();
  const openAssessmentModal = useAssessmentStore((s) => s.openAssessmentModal);
  const selectScenario = useTeachingStore((s) => s.selectScenario);
  const { activeView, setActiveView } = useNavigationStore();
  const { user, isAuthenticated, openAuthModal, signOut } = useAuthStore();
  const { isDeveloperMode, toggleDeveloperMode } = useDevModeStore();

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
  };

  const getCountryFlag = (country?: string): string => {
    if (!country) return '🌐';
    const c = country.toLowerCase();
    if (c.includes('bolivia')) return '🇧🇴';
    if (c.includes('mexico')) return '🇲🇽';
    if (c.includes('colombia')) return '🇨🇴';
    if (c.includes('peru')) return '🇵🇪';
    if (c.includes('argentina')) return '🇦🇷';
    if (c.includes('chile')) return '🇨🇱';
    if (c.includes('spain') || c.includes('españa')) return '🇪🇸';
    if (c.includes('usa') || c.includes('united states')) return '🇺🇸';
    return '🌐';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#12223a]/95 backdrop-blur-md border-b border-[#A7C7E7]/25 w-full select-none" id="app-header">
      {/* Primary Top Bar */}
      <div className="w-full max-w-full px-2 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-1 sm:gap-2 overflow-hidden">
        {/* Left: Brand Lockup with Chibi Mascot */}
        <button
          onClick={() => {
            if (isAuthenticated) {
              setActiveView('path');
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30] rounded-lg transition-transform hover:scale-[1.01] cursor-pointer"
          title="Teacher Ivan - English Classes"
        >
          <BrandLockup size="sm" className="sm:hidden" />
          <BrandLockup size="md" className="hidden sm:inline-flex" />
        </button>

        {/* Center: Desktop Navigation Tabs */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-1.5 bg-[#1A3153]/80 p-1 rounded-full border border-[#A7C7E7]/30 shadow-inner">
            {/* Tab 1: Mi Ruta (Micro-Learning) */}
            <button
              id="nav-tab-path"
              onClick={() => setActiveView('path')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeView === 'path'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30 font-black'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
              }`}
            >
              <Target size={14} />
              <span>{isEs ? 'Mi Ruta (Micro-Learning)' : 'My Path (Micro-Learning)'}</span>
            </button>

            {/* Tab 2: Simulador IA */}
            <button
              id="nav-tab-simulator"
              onClick={() => setActiveView('simulator')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeView === 'simulator'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30 font-black'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
              }`}
            >
              <Headphones size={14} />
              <span>{isEs ? 'Simulador IA' : 'AI Simulator'}</span>
            </button>

            {/* Tab 3: Recursos & Juegos */}
            <button
              id="nav-tab-resources"
              onClick={() => setActiveView('resources')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeView === 'resources'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30 font-black'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
              }`}
            >
              <BookOpen size={14} />
              <span>{isEs ? 'Recursos & Juegos' : 'Resources & Games'}</span>
            </button>

            {/* Tab 4: Agendar Clase (14:00–20:00) */}
            <button
              id="nav-tab-schedule"
              onClick={() => setActiveView('schedule')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeView === 'schedule'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30 font-black'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
              }`}
            >
              <Calendar size={14} />
              <span>{isEs ? 'Agendar Clase (14:00–20:00)' : 'Book Class (14:00–20:00)'}</span>
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-1.5 bg-[#1A3153]/80 p-1 rounded-full border border-[#A7C7E7]/30 shadow-inner">
            <button
              id="guest-nav-simulator"
              onClick={() => {
                const el = document.getElementById('flagship-simulator-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5 transition-all cursor-pointer"
            >
              <Headphones size={14} />
              <span>{isEs ? 'Simulador IA' : 'AI Simulator'}</span>
            </button>

            <button
              id="guest-nav-pricing"
              onClick={() => {
                const el = document.getElementById('faq-pricing-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5 transition-all cursor-pointer"
            >
              <BookOpen size={14} />
              <span>{isEs ? 'Planes & Precios' : 'Plans & Pricing'}</span>
            </button>

            <button
              id="guest-nav-schedule"
              onClick={() => {
                const el = document.getElementById('faq-pricing-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5 transition-all cursor-pointer"
            >
              <Calendar size={14} />
              <span>{isEs ? 'Clases 1 a 1' : '1-on-1 Classes'}</span>
            </button>
          </nav>
        )}

        {/* Right: Controls, Authentication & Language Switcher (<768px guaranteed fit) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Language Switcher (EN | ES) */}
          <LanguageToggle id="header-lang-toggle" showIcon={false} />

          {/* Technical/Engineering UI — ONLY visible in Developer Mode */}
          {isDeveloperMode && (
            <>
              {/* Backend Status Badge */}
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

              {/* Master Key Security Badge */}
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

              {/* Live Session Status Badge */}
              <div className="status-badge hidden lg:inline-flex" id="session-status-badge">
                <span className={`status-dot ${status === 'connected' ? 'connected' : status === 'requesting_token' ? 'connecting' : status === 'error' ? 'error' : 'idle'}`} />
                <span style={{ textTransform: 'capitalize' }}>
                  {getSessionStatusLabel()}
                </span>
              </div>
            </>
          )}

          {/* Strict Admin Gate: Dev Mode toggle button ONLY rendered when user?.role === 'admin' */}
          {user?.role === 'admin' && (
            <button
              id="admin-dev-toggle-btn"
              type="button"
              onClick={toggleDeveloperMode}
              className={`text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-lg font-montserrat font-bold flex items-center gap-0.5 sm:gap-1 transition-all cursor-pointer shrink-0 ${
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

          {/* Authentication Badge or Always-Visible Sign-In Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1 shrink-0">
              {/* @username badge */}
              <div
                id="student-profile-badge"
                className="flex items-center gap-0.5 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 bg-[#1A3153] border border-[#A7C7E7]/40 rounded-lg text-[#FAFAFA] font-montserrat font-bold truncate max-w-[46px] sm:max-w-[120px] shrink-0 shadow-sm"
                title={`@${user.username || user.fullName.split(' ')[0]}`}
              >
                <span className="text-[#E09B30]">@</span>
                <span className="truncate">{user.username || user.fullName.split(' ')[0].toLowerCase()}</span>
                {user.cefrLevel && (
                  <span className="hidden sm:inline-block px-1 py-0.2 rounded bg-[#E09B30] text-[#1A3153] text-[9px] font-black ml-0.5">
                    {user.cefrLevel}
                  </span>
                )}
              </div>

              {/* Sign Out / Salir Button */}
              <button
                id="sign-out-btn"
                type="button"
                onClick={signOut}
                title={t.authModal.signOut}
                className="text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-[#1A3153] border border-[#A7C7E7]/40 rounded-lg shrink-0 text-[#A7C7E7] hover:text-[#FAFAFA] font-montserrat font-bold flex items-center gap-0.5 sm:gap-1 cursor-pointer transition-colors"
              >
                <LogOut size={11} className="shrink-0" />
                <span>{isEs ? 'Salir' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            <button
              id="signin-nav-btn"
              type="button"
              onClick={() => openAuthModal('signin')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] font-montserrat font-bold transition-all duration-200 shadow-sm cursor-pointer shrink-0 flex items-center gap-1"
            >
              <UserIcon size={12} />
              <span>{isEs ? 'Entrar' : 'Sign In'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Header Tab Bar (<768px): Guaranteed zero overflow */}
      <div className="md:hidden border-t border-[#A7C7E7]/20 bg-[#1A3153]/95 w-full max-w-full px-2 py-1.5 flex items-center justify-around gap-1 overflow-x-auto no-scrollbar">
        {isAuthenticated ? (
          <>
            <button
              id="mobile-nav-tab-path"
              type="button"
              onClick={() => setActiveView('path')}
              className={`flex-1 py-1.5 px-1.5 rounded-xl text-[11px] font-montserrat font-bold uppercase tracking-tight flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeView === 'path'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-sm font-black'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              <Target size={13} />
              <span>{isEs ? 'Ruta' : 'Path'}</span>
            </button>
            <button
              id="mobile-nav-tab-simulator"
              type="button"
              onClick={() => setActiveView('simulator')}
              className={`flex-1 py-1.5 px-1.5 rounded-xl text-[11px] font-montserrat font-bold uppercase tracking-tight flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeView === 'simulator'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-sm font-black'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              <Headphones size={13} />
              <span>{isEs ? 'Simulador' : 'Simulator'}</span>
            </button>
            <button
              id="mobile-nav-tab-resources"
              type="button"
              onClick={() => setActiveView('resources')}
              className={`flex-1 py-1.5 px-1.5 rounded-xl text-[11px] font-montserrat font-bold uppercase tracking-tight flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeView === 'resources'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-sm font-black'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              <BookOpen size={13} />
              <span>{isEs ? 'Recursos' : 'Resources'}</span>
            </button>
            <button
              id="mobile-nav-tab-schedule"
              type="button"
              onClick={() => setActiveView('schedule')}
              className={`flex-1 py-1.5 px-1.5 rounded-xl text-[11px] font-montserrat font-bold uppercase tracking-tight flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeView === 'schedule'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-sm font-black'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              <Calendar size={13} />
              <span>{isEs ? 'Agendar' : 'Book'}</span>
            </button>
          </>
        ) : (
          <>
            <button
              id="mobile-nav-guest-simulator"
              type="button"
              onClick={() => {
                const el = document.getElementById('flagship-simulator-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-montserrat font-bold uppercase tracking-tight flex items-center justify-center gap-1 text-[#A7C7E7] hover:text-[#FAFAFA] cursor-pointer"
            >
              <Headphones size={13} />
              <span>{isEs ? 'Simulador' : 'Simulator'}</span>
            </button>
            <button
              id="mobile-nav-guest-pricing"
              type="button"
              onClick={() => {
                const el = document.getElementById('faq-pricing-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-montserrat font-bold uppercase tracking-tight flex items-center justify-center gap-1 text-[#A7C7E7] hover:text-[#FAFAFA] cursor-pointer"
            >
              <BookOpen size={13} />
              <span>{isEs ? 'Precios' : 'Plans'}</span>
            </button>
            <button
              id="mobile-nav-guest-signup"
              type="button"
              onClick={() => openAuthModal('signup')}
              className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-montserrat font-extrabold uppercase tracking-tight flex items-center justify-center gap-1 bg-[#E09B30] text-[#1A3153] shadow-sm cursor-pointer"
            >
              <Sparkles size={13} />
              <span>{isEs ? 'Registro' : 'Sign Up'}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
