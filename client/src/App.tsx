import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { OverviewCorePillars } from './components/OverviewCorePillars';
import { CompactVoiceSimulator } from './components/CompactVoiceSimulator';
import { HowItWorksSection } from './components/HowItWorksSection';
import { SessionArchitectureSection } from './components/SessionArchitectureSection';
import { MarketComparisonSection } from './components/MarketComparisonSection';
import { AsyncSprintSection } from './components/AsyncSprintSection';
import { PricingPlansSection } from './components/PricingPlansSection';
import { LearningPathsSection } from './components/LearningPathsSection';
import { TrustSection } from './components/TrustSection';
import { SessionReportPanel } from './components/SessionReportPanel';
import { TeachingCard } from './components/TeachingCard';
import { TokenInspector } from './components/TokenInspector';
import { SessionFeed } from './components/SessionFeed';
import { LiveDebugPanel } from './components/LiveDebugPanel';
import { LatencyMetricsPanel } from './components/LatencyMetricsPanel';
import { StudentReportModal } from './components/StudentReportModal';
import { SpokenAssessmentModal } from './components/SpokenAssessmentModal';
import { BrandLockup } from './components/BrandLockup';
import { Terminal } from 'lucide-react';
import { API_BASE_URL } from './config/api';
import { useTranslation } from './modules/i18n/languageStore';
import { useDevModeStore } from './modules/dev/devModeStore';
import { useNavigationStore } from './modules/navigation/navigationStore';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const { isDeveloperMode, toggleDeveloperMode } = useDevModeStore();
  const { activeView, setActiveView } = useNavigationStore();

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
      {/* Auto-Pop-Up Spoken Assessment Welcome Sheet on Website Entry */}
      <SpokenAssessmentModal />

      {/* Official Platform Header with View Navigation Tabs */}
      <Header />

      <main className="flex-1 flex flex-col">
        {/* VIEW 1: INICIO / OVERVIEW (Clean, Scannable Landing Page) */}
        {activeView === 'overview' && (
          <div id="view-overview" className="flex flex-col animate-in fade-in duration-200">
            {/* Section 1: Outcome-Focused Brand Hero */}
            <HeroSection />

            {/* Section 2: Visual Feature Cards (3 Core Pillars with Custom Chibi Showcase) */}
            <OverviewCorePillars />

            {/* Section 3: Plans & Pricing (3 cards, BOB/USD toggle) */}
            <PricingPlansSection />

            {/* Section 4: Trust, Credentials, Testimonials & WhatsApp CTA */}
            <TrustSection />
          </div>
        )}

        {/* VIEW 2: SIMULADOR IA / AI VOICE SIMULATOR (Dedicated Interactive Section) */}
        {activeView === 'simulator' && (
          <div id="view-simulator" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1 flex flex-col animate-in fade-in duration-200">
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
                  type="button"
                  onClick={toggleDeveloperMode}
                  className="text-[#E09B30] hover:underline font-semibold cursor-pointer"
                >
                  {t.devMode.toggleStudent}
                </button>
              </div>
            )}

            {/* Ultra-Compact Voice Simulator Console */}
            <CompactVoiceSimulator />

            {/* In Developer Mode: Diagnostics Grid */}
            {isDeveloperMode && (
              <div className="mt-8 pt-8 border-t border-[#A7C7E7]/25 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <SessionReportPanel />
                  <LatencyMetricsPanel />
                  <SessionFeed />
                </div>
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <TeachingCard />
                  <TokenInspector />
                  <LiveDebugPanel />
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: MÉTODO / METHODOLOGY (Detailed Bichronous Architecture View) */}
        {activeView === 'methodology' && (
          <div id="view-methodology" className="flex flex-col animate-in fade-in duration-200">
            {/* Step 1: Bichronous Method Overview */}
            <HowItWorksSection />

            {/* Step 2: 60-Minute Synchronous Session Timeline (>75% STT) with Chibi Online Coach */}
            <SessionArchitectureSection />

            {/* Step 3: Market Comparison (Traditional vs Private vs Teacher Ivan) */}
            <MarketComparisonSection />

            {/* Step 4: 5-Day Asynchronous Sprint with Chibi Classroom Scene */}
            <AsyncSprintSection />

            {/* Step 5: Learning Paths (General Fluency vs IELTS Prep) */}
            <LearningPathsSection />
          </div>
        )}
      </main>

      {/* Automatic End-of-Session Student Report Pop-Up Modal */}
      <StudentReportModal />

      {/* Clean Institutional Footer */}
      <footer className="bg-[#12223a] border-t border-[#A7C7E7]/25 text-[#FAFAFA] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <BrandLockup size="lg" altText="Teacher Ivan Official Platform" />
            <p className="font-inter text-xs text-[#A7C7E7] max-w-sm">
              {t.footer.desc}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-xs text-[#A7C7E7]">
            <button
              type="button"
              onClick={() => setActiveView('overview')}
              className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                activeView === 'overview' ? 'text-[#E09B30] font-bold' : ''
              }`}
            >
              {t.nav.overview}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('simulator')}
              className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                activeView === 'simulator' ? 'text-[#E09B30] font-bold' : ''
              }`}
            >
              {t.nav.simulator}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('methodology')}
              className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                activeView === 'methodology' ? 'text-[#E09B30] font-bold' : ''
              }`}
            >
              {t.nav.methodology}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('overview');
                setTimeout(() => {
                  document.getElementById('pricing-plans-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-[#E09B30] transition-colors cursor-pointer"
            >
              {t.nav.pricing}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-[#A7C7E7]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A7C7E7]/70">
          <p>{t.footer.copyright}</p>
          <p className="font-mono">
            {isDeveloperMode
              ? t.footer.poweredBy
              : 'Teacher Ivan - English Classes • Sucre, Bolivia • Online Worldwide'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
