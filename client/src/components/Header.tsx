import React, { useEffect, useState } from 'react';
import { Shield, Server, CheckCircle2, AlertTriangle, MessageCircle, Calendar } from 'lucide-react';
import { checkServerHealth } from '../modules/auth/tokenService';
import { useConversationStore } from '../modules/conversation/conversationStore';

export const Header: React.FC = () => {
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [keyConfigured, setKeyConfigured] = useState<boolean | null>(null);
  const status = useConversationStore((s) => s.status);

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

  return (
    <header className="app-header" id="app-header">
      <div className="flex items-center gap-6">
        {/* Official Brand Logo with 160px min-width and isolation clear space */}
        <a
          href="#app-header"
          className="block py-2 px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E09B30] rounded-lg transition-transform hover:scale-[1.01]"
          title="Teacher Ivan - English Classes & AI Voice Tutor"
        >
          <img
            src="/assets/logo.svg"
            alt="Teacher Ivan Logo"
            className="min-w-[160px] w-44 md:w-52 h-auto object-contain"
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 ml-4 text-sm font-medium">
          <a
            href="#voice-tutor-showcase"
            className="text-[#FAFAFA] hover:text-[#E09B30] transition-colors"
          >
            AI Voice Tutor
          </a>
          <a
            href="#hybrid-method-section"
            className="text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors"
          >
            The Hybrid Method
          </a>
          <a
            href="#learning-paths-section"
            className="text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors"
          >
            Learning Paths
          </a>
          <a
            href="#session-report-panel"
            className="text-[#A7C7E7] hover:text-[#FAFAFA] transition-colors"
          >
            Pedagogical Reports
          </a>
        </nav>
      </div>

      <div className="header-meta-group flex items-center gap-3">
        {/* Backend Status Badge */}
        <div className="status-badge hidden sm:inline-flex" title="Backend Server Status" id="backend-status-badge">
          <Server size={14} color="#A7C7E7" />
          <span className="text-[#A7C7E7]">Server:</span>
          {serverOk === null ? (
            <span style={{ color: '#94a3b8' }}>Checking...</span>
          ) : serverOk ? (
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={12} /> Online
            </span>
          ) : (
            <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} /> Offline
            </span>
          )}
        </div>

        {/* Master Key Security Badge */}
        <div className="status-badge hidden md:inline-flex" title="Master API Key is safely guarded on Express server" id="key-security-badge">
          <Shield size={14} color="#A7C7E7" />
          <span className="text-[#A7C7E7]">Key:</span>
          {keyConfigured === null ? (
            <span style={{ color: '#94a3b8' }}>...</span>
          ) : keyConfigured ? (
            <span style={{ color: '#A7C7E7' }}>Guarded</span>
          ) : (
            <span style={{ color: '#E09B30' }}>Missing .env</span>
          )}
        </div>

        {/* Live Session Status Badge */}
        <div className="status-badge" id="session-status-badge">
          <span className={`status-dot ${status === 'connected' ? 'connected' : status === 'requesting_token' ? 'connecting' : status === 'error' ? 'error' : 'idle'}`} />
          <span style={{ textTransform: 'capitalize' }}>
            {status === 'requesting_token' ? 'Minting...' : status}
          </span>
        </div>

        {/* 1-on-1 Mentorship Booking CTA */}
        <a
          href="#book-class"
          onClick={(e) => {
            e.preventDefault();
            const tutorEl = document.getElementById('start-session-btn');
            if (tutorEl) {
              tutorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              tutorEl.focus();
            }
          }}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full font-montserrat font-bold text-xs uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FAFAFA]"
        >
          <Calendar size={13} />
          <span>Book Class</span>
        </a>
      </div>
    </header>
  );
};
