import React, { useEffect, useState } from 'react';
import { Shield, Server, CheckCircle2, AlertTriangle, Sparkles, Home, Headphones, BookOpen, Gamepad2 } from 'lucide-react';
import { checkServerHealth } from '../modules/auth/tokenService';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { useDevModeStore } from '../modules/dev/devModeStore';
import { useAssessmentStore } from '../modules/assessment/assessmentStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { useNavigationStore, AppView } from '../modules/navigation/navigationStore';
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
          // If server is spinning up from cold sleep on Render, retry in 5s
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

  const isDeveloperMode = useDevModeStore((s) => s.isDeveloperMode);

  const handleTakeAssessment = () => {
    selectScenario('diagnostic-placement');
    openAssessmentModal();
  };

  const navTabs: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t.nav.overview, icon: <Home size={14} /> },
    { id: 'simulator', label: t.nav.simulator, icon: <Headphones size={14} /> },
    { id: 'resources', label: t.nav.resources, icon: <BookOpen size={14} /> },
    { id: 'games', label: t.nav.games, icon: <Gamepad2 size={14} /> },
    { id: 'methodology', label: t.nav.methodology, icon: <Sparkles size={14} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#12223a]/95 backdrop-blur-md border-b border-[#A7C7E7]/25 w-full select-none" id="app-header">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Left: Brand Lockup with Chibi Mascot (w-9 h-9 on mobile, zero line wrap) */}
        <button
          onClick={() => setActiveView('overview')}
          className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30] rounded-lg transition-transform hover:scale-[1.01] cursor-pointer"
          title="Teacher Ivan - English Classes"
        >
          <BrandLockup size="sm" className="sm:hidden" />
          <BrandLockup size="md" className="hidden sm:inline-flex" />
        </button>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#1A3153]/80 p-1 rounded-full border border-[#A7C7E7]/30 shadow-inner">
          {navTabs.map((tab) => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-montserrat font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#E09B30] text-[#1A3153] shadow-md shadow-[#E09B30]/30'
                    : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Controls & Language Switcher */}
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
              <div className="status-badge hidden xl:inline-flex" title="Master API Key is safely guarded on Express server" id="key-security-badge">
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

          {/* Desktop-only Assessment Trigger Button (prevents mobile overflow) */}
          <button
            id="take-assessment-nav-btn"
            onClick={handleTakeAssessment}
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30] cursor-pointer"
          >
            <Sparkles size={13} />
            <span>{t.nav.takeAssessment}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Header Tab Bar (<768px): Guaranteed zero overflow */}
      <div className="md:hidden border-t border-[#A7C7E7]/20 bg-[#1A3153]/95 px-1.5 py-1.5 overflow-x-auto scrollbar-none">
        <nav className="flex items-center justify-between gap-1 w-full min-w-0">
          {navTabs.map((tab) => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-nav-tab-${tab.id}`}
                onClick={() => setActiveView(tab.id)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 px-1 rounded-xl text-[10px] font-montserrat font-bold uppercase tracking-tight transition-all duration-150 cursor-pointer min-w-0 ${
                  isActive
                    ? 'bg-[#E09B30] text-[#1A3153] shadow-sm font-extrabold'
                    : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
                }`}
              >
                {tab.icon}
                <span className="truncate max-w-[68px]">
                  {tab.id === 'simulator' ? (isEs ? 'Simulador' : 'Simulator') : tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
