import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { HowToUseGuide } from './components/HowToUseGuide';
import { TutorControls } from './components/TutorControls';
import { SessionReportPanel } from './components/SessionReportPanel';
import { TeachingCard } from './components/TeachingCard';
import { TokenInspector } from './components/TokenInspector';
import { SessionFeed } from './components/SessionFeed';
import { LiveDebugPanel } from './components/LiveDebugPanel';
import { LatencyMetricsPanel } from './components/LatencyMetricsPanel';
import { HybridMethodSection } from './components/HybridMethodSection';
import { LearningPathsSection } from './components/LearningPathsSection';
import { Headphones } from 'lucide-react';
import { API_BASE_URL } from './config/api';
import { useTranslation } from './modules/i18n/languageStore';

export const App: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // Silently wake up the free Render backend instance immediately as page loads
    // so it is primed and ready when the student interacts with the voice tutor
    try {
      fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        keepalive: true,
      }).catch(() => {
        // Non-blocking background warm-up: ignore transient network or cold-start errors
      });
    } catch {
      // Non-blocking catch
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#1A3153] text-[#FAFAFA] flex flex-col font-inter">
      {/* 1. Official Platform Header */}
      <Header />

      {/* 2. High-Converting Brand Hero Section */}
      <HeroSection />

      {/* 3. Gemini Voice Tutor Centerpiece Showcase */}
      <section
        id="voice-tutor-showcase"
        className="py-12 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full"
      >
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#A7C7E7]/25 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 mb-2">
              <Headphones size={13} className="text-[#E09B30]" />
              <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30]">
                {t.tutorConsole.badge}
              </span>
            </div>
            <h2 className="font-montserrat font-bold text-2xl sm:text-3xl text-[#FAFAFA]">
              {t.tutorConsole.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#A7C7E7]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>{t.tutorConsole.statusReady}</span>
          </div>
        </div>

        {/* 4-Step "How to Use the Simulator" Guide */}
        <HowToUseGuide />

        {/* Tutor Console Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Column: Voice Controls, Pedagogical Report, Latency & Live Feed */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <TutorControls />
            <SessionReportPanel />
            <LatencyMetricsPanel />
            <SessionFeed />
          </div>

          {/* Secondary Column: Pedagogical Settings, Token Inspector & Live Diagnostics */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <TeachingCard />
            <TokenInspector />
            <LiveDebugPanel />
          </div>
        </div>
      </section>

      {/* 4. The Hybrid Method Section */}
      <HybridMethodSection />

      {/* 5. Learning Paths (General Fluency & IELTS Prep) Section */}
      <LearningPathsSection />

      {/* 6. Official Institutional Footer */}
      <footer className="bg-[#12223a] border-t border-[#A7C7E7]/25 text-[#FAFAFA] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <img
              src="/assets/logo.svg"
              alt="Teacher Ivan Official Platform"
              className="min-w-[160px] w-48 h-auto object-contain"
            />
            <p className="font-inter text-xs text-[#A7C7E7] max-w-sm">
              {t.footer.desc}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs text-[#A7C7E7]">
            <a href="#voice-tutor-showcase" className="hover:text-[#E09B30] transition-colors">
              {t.nav.voiceTutor}
            </a>
            <a href="#hybrid-method-section" className="hover:text-[#E09B30] transition-colors">
              {t.nav.hybridMethod}
            </a>
            <a href="#learning-paths-section" className="hover:text-[#E09B30] transition-colors">
              {t.nav.learningPaths}
            </a>
            <a href="#session-report-panel" className="hover:text-[#E09B30] transition-colors">
              {t.nav.pedagogicalReports}
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-[#A7C7E7]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A7C7E7]/70">
          <div>
            © {new Date().getFullYear()} {t.footer.copyright}
          </div>
          <div>
            {t.footer.poweredBy}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
