import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { HeroKpiStrip } from './components/HeroKpiStrip';
import { MarketComparisonSection } from './components/MarketComparisonSection';
import { SessionArchitectureSection } from './components/SessionArchitectureSection';
import { AsyncSprintSection } from './components/AsyncSprintSection';
import { PricingPlansSection } from './components/PricingPlansSection';
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
import { StudentReportModal } from './components/StudentReportModal';
import { SpokenAssessmentModal } from './components/SpokenAssessmentModal';
import { BrandLockup } from './components/BrandLockup';
import { Headphones, Terminal } from 'lucide-react';
import { API_BASE_URL } from './config/api';
import { useTranslation } from './modules/i18n/languageStore';
import { useDevModeStore } from './modules/dev/devModeStore';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const { isDeveloperMode, toggleDeveloperMode } = useDevModeStore();

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
      {/* Auto-Pop-Up Spoken Assessment Modal on Website Entry (Requirement 1) */}
      <SpokenAssessmentModal />

      {/* 1. Official Platform Header */}
      <Header />

      {/* 2. High-Converting Brand Hero Section */}
      <HeroSection />

      {/* 3. Hero KPI Strip (Requirement 3.1) */}
      <HeroKpiStrip />

      {/* 4. Market Diagnosis Comparison: Why Bichronous Coaching Wins (Requirement 3.2) */}
      <MarketComparisonSection />

      {/* 5. 60-Minute Synchronous Session Architecture: >75% STT (Requirement 3.3) */}
      <SessionArchitectureSection />

      {/* 6. 5-Day Asynchronous Micro-Learning Sprint (Requirement 3.4) */}
      <AsyncSprintSection />

      {/* 7. Official Pricing & Plans Section with Currency Toggle (Requirement 3.5) */}
      <PricingPlansSection />

      {/* 8. Gemini Voice Tutor Centerpiece Showcase */}
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

        {/* Developer Mode Banner Notification (if active) */}
        {isDeveloperMode && (
          <div
            id="dev-mode-active-banner"
            className="mb-6 p-3 rounded-xl bg-[#E09B30]/15 border border-[#E09B30]/40 flex items-center justify-between gap-3 text-xs text-[#FAFAFA]"
          >
            <div className="flex items-center gap-2">
              <Terminal size={15} className="text-[#E09B30]" />
              <span className="font-semibold text-[#E09B30]">{t.devMode.activeBanner}:</span>
              <span>{t.devMode.notice}</span>
            </div>
            <button
              onClick={toggleDeveloperMode}
              className="text-[#E09B30] hover:underline font-semibold"
            >
              {t.devMode.toggleStudent}
            </button>
          </div>
        )}

        {/* Tutor Console Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {isDeveloperMode ? (
            /* Developer View: Full diagnostics, latency metrics, token inspector, logs, and raw report */
            <>
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
            </>
          ) : (
            /* Student View: Streamlined, distraction-free workspace */
            <>
              {/* Primary Column: Voice Controls & Live Voice Transcript */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <TutorControls />
                <SessionFeed />
              </div>

              {/* Secondary Column: Level & Mode Selector and Scenario Selector */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <TeachingCard />
              </div>
            </>
          )}
        </div>
      </section>

      {/* 9. The Hybrid Method Section */}
      <HybridMethodSection />

      {/* 10. Learning Paths (General Fluency & IELTS Prep) Section */}
      <LearningPathsSection />

      {/* Automatic End-of-Session Student Report Pop-Up Modal (Requirement 2) */}
      <StudentReportModal />

      {/* 11. Official Institutional Footer */}
      <footer className="bg-[#12223a] border-t border-[#A7C7E7]/25 text-[#FAFAFA] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <BrandLockup size="lg" altText="Teacher Ivan Official Platform" />
            <p className="font-inter text-xs text-[#A7C7E7] max-w-sm">
              {t.footer.desc}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs text-[#A7C7E7]">
            <a href="#voice-tutor-showcase" className="hover:text-[#E09B30] transition-colors">
              {t.nav.voiceTutor}
            </a>
            <a href="#market-comparison-section" className="hover:text-[#E09B30] transition-colors">
              {t.nav.bichronous}
            </a>
            <a href="#pricing-plans-section" className="hover:text-[#E09B30] transition-colors">
              {t.nav.pricing}
            </a>
            <a href="#hybrid-method-section" className="hover:text-[#E09B30] transition-colors">
              {t.nav.hybridMethod}
            </a>
            <a href="#learning-paths-section" className="hover:text-[#E09B30] transition-colors">
              {t.nav.learningPaths}
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-[#A7C7E7]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A7C7E7]/70">
          <p>{t.footer.copyright}</p>
          <p className="font-mono">{t.footer.poweredBy}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
