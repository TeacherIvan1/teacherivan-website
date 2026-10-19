import React, { useEffect, useState } from 'react';
import { Shield, Server, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { checkServerHealth } from '../modules/auth/tokenService';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { useDevModeStore } from '../modules/dev/devModeStore';
import { useAssessmentStore } from '../modules/assessment/assessmentStore';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { LanguageToggle } from './LanguageToggle';
import { BrandLockup } from './BrandLockup';

export const Header: React.FC = () => {
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [keyConfigured, setKeyConfigured] = useState<boolean | null>(null);
  const status = useConversationStore((s) => s.status);
  const { t } = useTranslation();
  const openAssessmentModal = useAssessmentStore((s) => s.openAssessmentModal);
  const selectScenario = useTeachingStore((s) => s.selectScenario);

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

  return (
    <header className="app-header" id="app-header">
      <div className="flex items-center gap-6">
        {/* Official Brand Lockup with Chibi Mascot & Typography */}
        <a
          href="#app-header"
          className="block py-1.5 px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30] rounded-lg transition-transform hover:scale-[1.01]"
          title="Teacher Ivan - English Classes & AI Voice Tutor"
        >
          <BrandLockup size="md" />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 ml-4 text-sm font-medium">
          <a
            href="#voice-tutor-showcase"
            className="text-[#FAFAFA] hover:text-[#E09B30] transition-colors"
          >
            {t.nav.voiceTutor}
          </a>
          <a
            href="#market-comparison-section"
            className="text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors"
          >
            {t.nav.bichronous}
          </a>
          <a
            href="#pricing-plans-section"
            className="text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors"
          >
            {t.nav.pricing}
          </a>
          <a
            href="#hybrid-method-section"
            className="text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors"
          >
            {t.nav.hybridMethod}
          </a>
        </nav>
      </div>

      <div className="header-meta-group flex items-center gap-3">
        {/* Language Switcher (EN | ES) */}
        <LanguageToggle id="header-lang-toggle" />

        {/* Technical/Engineering UI — ONLY visible in Developer Mode */}
        {isDeveloperMode && (
          <>
            {/* Backend Status Badge */}
            <div className="status-badge hidden sm:inline-flex" title="Backend Server Status" id="backend-status-badge">
              <Server size={14} color="#A7C7E7" />
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
            <div className="status-badge hidden md:inline-flex" title="Master API Key is safely guarded on Express server" id="key-security-badge">
              <Shield size={14} color="#A7C7E7" />
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
            <div className="status-badge" id="session-status-badge">
              <span className={`status-dot ${status === 'connected' ? 'connected' : status === 'requesting_token' ? 'connecting' : status === 'error' ? 'error' : 'idle'}`} />
              <span style={{ textTransform: 'capitalize' }}>
                {getSessionStatusLabel()}
              </span>
            </div>

            {/* Dev Mode Badge Indicator */}
            <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E09B30]/20 border border-[#E09B30] text-[#E09B30]">
              {t.devMode.activeBadge}
            </span>
          </>
        )}

        {/* Take Spoken Assessment Button (Requirement 1) */}
        <button
          id="take-assessment-nav-btn"
          onClick={handleTakeAssessment}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30]"
        >
          <Sparkles size={13} />
          <span>{t.nav.takeAssessment}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
