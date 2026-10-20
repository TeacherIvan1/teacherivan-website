import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TutorControls } from './components/TutorControls';
import { SessionReportPanel } from './components/SessionReportPanel';
import { TeachingCard } from './components/TeachingCard';
import { TokenInspector } from './components/TokenInspector';
import { SessionFeed } from './components/SessionFeed';
import { LiveDebugPanel } from './components/LiveDebugPanel';
import { LatencyMetricsPanel } from './components/LatencyMetricsPanel';
import { HowItWorksSection } from './components/HowItWorksSection';
import { PricingPlansSection } from './components/PricingPlansSection';
import { LearningPathsSection } from './components/LearningPathsSection';
import { TrustSection } from './components/TrustSection';
import { MobileBottomBar } from './components/MobileBottomBar';
import { StudentReportModal } from './components/StudentReportModal';
import { SpokenAssessmentModal } from './components/SpokenAssessmentModal';
import { BrandLockup } from './components/BrandLockup';
import { Headphones, Terminal, Sparkles } from 'lucide-react';
import { API_BASE_URL } from './config/api';
import { useTranslation } from './modules/i18n/languageStore';
import { useDevModeStore } from './modules/dev/devModeStore';
import { useAssessmentStore } from './modules/assessment/assessmentStore';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const { isDeveloperMode, toggleDeveloperMode } = useDevModeStore();
  const isAssessmentModalOpen = useAssessmentStore((s) => s.isAssessmentModalOpen);

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
    <div className="min-h-screen bg-[#1A3153] text-[#FAFAFA] flex flex-col font-inter pb-20 md:pb-0">
      {/* Auto-Pop-Up Spoken Assessment Modal on Website Entry */}
      <SpokenAssessmentModal />

      {/* Official Platform Header */}
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Section 1: Outcome-Focused Brand Hero */}
        <HeroSection />

        {/* Section 2: Gemini Voice Tutor Showcase (Directly following Hero) */}
        <section
          id="voice-tutor-showcase"
          className="py-12 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full border-b border-[#A7C7E7]/25"
          aria-label="Real-Time AI Voice Tutor Demo"
        >
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#A7C7E7]/25">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 mb-2">
                <Headphones size={13} className="text-[#E09B30]" />
                <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30]">
                  {t.voiceDemo.badge}
                </span>
              </div>
              <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#FAFAFA] tracking-tight">
                {t.voiceDemo.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#A7C7E7]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>{t.voiceDemo.activeBadge}</span>
            </div>
          </div>

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
                className="text-[#E09B30] hover:underline font-semibold cursor-pointer"
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
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {!isAssessmentModalOpen ? (
                    <TutorControls />
                  ) : (
                    <div
                      id="tutor-controls-docked-notice"
                      className="glass-panel p-6 text-center text-sm text-[#A7C7E7] border border-[#E09B30]/30 rounded-2xl bg-[#1A3153]/40"
                    >
                      <div className="flex items-center justify-center gap-2 text-[#E09B30] font-semibold mb-1">
                        <Sparkles size={16} />
                        <span>Voice Tutor Active in Diagnostic Assessment</span>
                      </div>
                      <p className="text-xs text-[#A7C7E7]">
                        The Voice Tutor is currently docked inside the Spoken English Assessment modal above.
                      </p>
                    </div>
                  )}
                  <SessionReportPanel />
                  <LatencyMetricsPanel />
                  <SessionFeed />
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                  <TeachingCard />
                  <TokenInspector />
                  <LiveDebugPanel />
                </div>
              </>
            ) : (
              /* Student View: Streamlined, distraction-free, 1-click workspace */
              <>
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {!isAssessmentModalOpen ? (
                    <TutorControls />
                  ) : (
                    <div
                      id="tutor-controls-docked-notice"
                      className="glass-panel p-6 text-center text-sm text-[#A7C7E7] border border-[#E09B30]/30 rounded-2xl bg-[#1A3153]/40"
                    >
                      <div className="flex items-center justify-center gap-2 text-[#E09B30] font-semibold mb-1">
                        <Sparkles size={16} />
                        <span>Voice Tutor Active in Diagnostic Assessment</span>
                      </div>
                      <p className="text-xs text-[#A7C7E7]">
                        The Voice Tutor is currently docked inside the Spoken English Assessment modal above.
                      </p>
                    </div>
                  )}
                  <SessionFeed />
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                  <TeachingCard />
                </div>
              </>
            )}
          </div>
        </section>

        {/* Section 3: How It Works (Bichronous Method: 3 steps, talk-time bar, week accordion) */}
        <HowItWorksSection />

        {/* Section 4: Plans & Pricing (Only place prices appear, 3 cards, BOB/USD toggle, 3-row plain comparison) */}
        <PricingPlansSection />

        {/* Section 5: Learning Paths (General Fluency & IELTS Prep, dark navy theme) */}
        <LearningPathsSection />

        {/* Section 6: Trust & Proof + Final CTA (Ivan credentials, philosophy quote, 3 testimonials, final CTA) */}
        <TrustSection />
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

          <div className="flex flex-wrap justify-center gap-8 text-xs text-[#A7C7E7]">
            <a href="#voice-tutor-showcase" className="hover:text-[#E09B30] transition-colors">
              {t.nav.voiceTutor}
            </a>
            <a href="#how-it-works-section" className="hover:text-[#E09B30] transition-colors">
              {t.nav.howItWorks}
            </a>
            <a href="#pricing-plans-section" className="hover:text-[#E09B30] transition-colors">
              {t.nav.pricing}
            </a>
            <a href="#learning-paths-section" className="hover:text-[#E09B30] transition-colors">
              {t.nav.learningPaths}
            </a>
            <a href="#trust-section" className="hover:text-[#E09B30] transition-colors">
              {t.nav.aboutIvan}
            </a>
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

      {/* Sticky Mobile Bottom Bar (Try AI Tutor + WhatsApp) */}
      <MobileBottomBar />
    </div>
  );
};

export default App;
