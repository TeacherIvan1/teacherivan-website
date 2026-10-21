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
  User as UserIcon,
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
  const isDeveloperMode = useDevModeStore((s) => s.isDeveloperMode);

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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Left: Brand Lockup with Chibi Mascot */}
        <button
          onClick={() => setActiveView('simulator')}
          className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30] rounded-lg transition-transform hover:scale-[1.01] cursor-pointer"
          title="Teacher Ivan - English Classes"
        >
          <BrandLockup size="sm" className="sm:hidden" />
          <BrandLockup size="md" className="hidden sm:inline-flex" />
        </button>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#1A3153]/80 p-1 rounded-full border border-[#A7C7E7]/30 shadow-inner">
          {/* Tab 1: Simulator & Diagnostic */}
          <button
            id="nav-tab-simulator"
            onClick={() => setActiveView('simulator')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeView === 'simulator'
                ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30'
                : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
            }`}
          >
            <Headphones size={14} />
            <span>{isEs ? 'Simulador IA & Diagnóstico' : 'AI Simulator & Diagnostic'}</span>
          </button>

          {/* Tab 2: Educational Resources (Unlocked if authenticated, locked badge if guest) */}
          {isAuthenticated ? (
            <button
              id="nav-tab-resources"
              onClick={() => setActiveView('resources')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeView === 'resources'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
              }`}
            >
              <BookOpen size={14} />
              <span>{isEs ? 'Recursos Educativos' : 'Educational Resources'}</span>
            </button>
          ) : (
            <button
              id="nav-tab-resources-locked"
              onClick={() => openAuthModal('signup')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider text-[#A7C7E7]/70 hover:text-[#E09B30] hover:bg-[#FAFAFA]/5 transition-all cursor-pointer"
              title={isEs ? 'Regístrate gratis para desbloquear' : 'Sign up free to unlock'}
            >
              <Lock size={13} className="text-[#E09B30]" />
              <span>{isEs ? 'Recursos Educativos' : 'Educational Resources'}</span>
              <span className="px-1.5 py-0.2 rounded bg-[#E09B30]/20 text-[#E09B30] text-[9px] font-extrabold">
                LOCKED
              </span>
            </button>
          )}
        </nav>

        {/* Right: Controls, Authentication & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
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

          {/* Authentication Badge or Free Sign-Up CTA */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div
                id="student-profile-badge"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A3153] border border-[#A7C7E7]/40 text-xs font-montserrat font-bold text-[#FAFAFA] shadow-sm"
              >
                <span>{getCountryFlag(user.country)}</span>
                <span className="truncate max-w-[110px]">{user.fullName.split(' ')[0]}</span>
                {user.cefrLevel && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#E09B30] text-[#1A3153] text-[10px] font-black">
                    {user.cefrLevel}
                  </span>
                )}
              </div>

              <button
                id="sign-out-btn"
                type="button"
                onClick={signOut}
                title={t.authModal.signOut}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-montserrat text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/10 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut size={13} />
                <span className="hidden md:inline">{t.authModal.signOut}</span>
              </button>
            </div>
          ) : (
            <button
              id="signup-free-nav-btn"
              type="button"
              onClick={() => openAuthModal('signup')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 shadow-md shadow-[#E09B30]/25 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>{isEs ? 'Registrarse Gratis' : 'Sign Up Free'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Header Tab Bar (<768px): Guaranteed zero overflow */}
      <div className="md:hidden border-t border-[#A7C7E7]/20 bg-[#1A3153]/95 px-2 py-1.5 flex items-center justify-around gap-2">
        <button
          id="mobile-nav-tab-simulator"
          type="button"
          onClick={() => setActiveView('simulator')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-montserrat font-bold uppercase tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'simulator'
              ? 'bg-[#E09B30] text-[#1A3153] shadow-sm font-extrabold'
              : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
          }`}
        >
          <Headphones size={13} />
          <span>{isEs ? 'Simulador' : 'Simulator'}</span>
        </button>

        {isAuthenticated ? (
          <button
            id="mobile-nav-tab-resources"
            type="button"
            onClick={() => setActiveView('resources')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-montserrat font-bold uppercase tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'resources'
                ? 'bg-[#E09B30] text-[#1A3153] shadow-sm font-extrabold'
                : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
            }`}
          >
            <BookOpen size={13} />
            <span>{isEs ? 'Recursos' : 'Resources'}</span>
          </button>
        ) : (
          <button
            id="mobile-nav-tab-resources-locked"
            type="button"
            onClick={() => openAuthModal('signup')}
            className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-montserrat font-bold uppercase tracking-tight flex items-center justify-center gap-1 text-[#A7C7E7]/70 hover:text-[#E09B30] cursor-pointer"
          >
            <Lock size={12} className="text-[#E09B30]" />
            <span>{isEs ? 'Recursos' : 'Resources'}</span>
            <span className="text-[9px] text-[#E09B30]">🔒</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
