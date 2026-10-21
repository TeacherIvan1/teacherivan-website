import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { CompactVoiceSimulator } from './components/CompactVoiceSimulator';
import { SessionReportPanel } from './components/SessionReportPanel';
import { TeachingCard } from './components/TeachingCard';
import { TokenInspector } from './components/TokenInspector';
import { SessionFeed } from './components/SessionFeed';
import { LiveDebugPanel } from './components/LiveDebugPanel';
import { LatencyMetricsPanel } from './components/LatencyMetricsPanel';
import { StudentReportModal } from './components/StudentReportModal';
import { SpokenAssessmentModal } from './components/SpokenAssessmentModal';
import { StudentAuthModal } from './components/StudentAuthModal';
import { WeeklyReportModal } from './components/WeeklyReportModal';
import { WeeklySprintDashboard } from './components/WeeklySprintDashboard';
import { EducationalResourcesView } from './components/EducationalResourcesView';
import { InteractiveGamesView } from './components/InteractiveGamesView';
import { RegisteredStudentsTable } from './components/RegisteredStudentsTable';
import { BrandLockup } from './components/BrandLockup';
import { Terminal, Sparkles, BookOpen, Headphones, Lock } from 'lucide-react';
import { API_BASE_URL } from './config/api';
import { TEACHER_PHONE, getWhatsAppUrl } from './config/contact';
import { useTranslation } from './modules/i18n/languageStore';
import { useDevModeStore } from './modules/dev/devModeStore';
import { useNavigationStore } from './modules/navigation/navigationStore';
import { useAuthStore } from './modules/auth/authStore';

export const App: React.FC = () => {
  const { t, isEs } = useTranslation();
  const { isDeveloperMode, toggleDeveloperMode } = useDevModeStore();
  const { activeView, setActiveView } = useNavigationStore();
  const { isAuthenticated, openAuthModal, syncWithServer } = useAuthStore();

  useEffect(() => {
    // 1. Silently wake up the Render backend instance on page load
    try {
      fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        keepalive: true,
      }).catch(() => {});
    } catch {}

    // 2. Re-sync returning student profile with server database
    syncWithServer().catch(() => {});
  }, [syncWithServer]);

  return (
    <div className="min-h-screen bg-[#1A3153] text-[#FAFAFA] flex flex-col font-inter">
      {/* Student Sign-Up & Authentication Modal */}
      <StudentAuthModal />

      {/* Spoken Assessment Diagnostic Modal */}
      <SpokenAssessmentModal />

      {/* Official Platform Header with Auth & View Navigation */}
      <Header />

      <main className="flex-1 flex flex-col">
        {/* ========================================================================= */}
        {/* NON-REGISTERED (GUEST) VIEW: MINIMALIST SIMULATOR & DIAGNOSTIC WORKSPACE  */}
        {/* ========================================================================= */}
        {!isAuthenticated ? (
          <div
            id="guest-simulator-landing"
            className="py-6 px-4 sm:px-6 max-w-4xl mx-auto w-full flex-1 flex flex-col gap-6 animate-in fade-in duration-200"
          >
            {/* Dedicated Voice Simulator & Spoken Diagnostic */}
            <CompactVoiceSimulator />

            {/* Reassurance & Educational Resources Teaser Card */}
            <div
              id="unlock-resources-teaser-card"
              className="p-6 rounded-3xl bg-gradient-to-r from-[#12223a] to-[#1A3153] border-2 border-[#E09B30]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5"
            >
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 text-xs font-montserrat font-bold text-[#E09B30] uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>{isEs ? 'Recursos Educativos y Práctica Asincrónica' : 'Educational Resources & Async Practice'}</span>
                </span>
                <p className="text-xs text-[#FAFAFA] font-inter max-w-xl leading-relaxed">
                  {isEs
                    ? 'Prueba el simulador de voz de Gemini Live libremente. Al registrarte gratis, guardas tu puntaje CEFR y desbloqueas lecturas interactivas, video lecciones, juegos y el reporte semanal para Teacher Ivan.'
                    : 'Test the Gemini Live AI voice tutor freely. Sign up free to save your CEFR score and unlock interactive readings, video lessons, games, and weekly progress reporting for Teacher Ivan.'}
                </p>
              </div>

              <button
                id="unlock-resources-guest-cta"
                type="button"
                onClick={() => openAuthModal('signup')}
                className="shrink-0 px-7 py-3.5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 shadow-lg shadow-[#E09B30]/30 cursor-pointer flex items-center gap-2"
              >
                <Sparkles size={14} />
                <span>{isEs ? 'Registrarse Gratis' : 'Sign Up Free'}</span>
              </button>
            </div>

            {/* Developer Mode Diagnostics Grid (If ?dev=true is active) */}
            {isDeveloperMode && (
              <div className="mt-8 pt-8 border-t border-[#A7C7E7]/25 flex flex-col gap-6">
                <RegisteredStudentsTable />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* REGISTERED USERS VIEW: UNLOCKED SIMULATOR + EDUCATIONAL RESOURCES PORTAL  */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col animate-in fade-in duration-200">
            {/* VIEW A: RECURSOS EDUCATIVOS (Interactive Readings, Video Lessons, Games & Progress Generator) */}
            {activeView === 'resources' ? (
              <div id="view-resources" className="flex flex-col animate-in fade-in duration-200">
                <WeeklySprintDashboard />
                <EducationalResourcesView />
                <InteractiveGamesView />
              </div>
            ) : (
              /* VIEW B: SIMULADOR IA & DIAGNÓSTICO (Dedicated Voice Simulator) */
              <div id="view-simulator" className="py-6 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6 animate-in fade-in duration-200">
                {/* Developer Mode Banner Notification (if active) */}
                {isDeveloperMode && (
                  <div
                    id="dev-mode-active-banner"
                    className="p-3 rounded-xl bg-[#E09B30]/15 border border-[#E09B30]/40 flex items-center justify-between gap-3 text-xs text-[#FAFAFA]"
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

                {/* Compact 5-Day Sprint Tracker for registered student */}
                <div className="rounded-3xl overflow-hidden border border-[#A7C7E7]/25 shadow-xl">
                  <WeeklySprintDashboard compact />
                </div>

                {/* Ultra-Compact Voice Simulator Console */}
                <CompactVoiceSimulator />

                {/* In Developer Mode: Registered Students Database Table + Diagnostics Grid */}
                {isDeveloperMode && (
                  <div className="mt-8 pt-8 border-t border-[#A7C7E7]/25 flex flex-col gap-6">
                    <RegisteredStudentsTable />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Automatic End-of-Session Student Report Pop-Up Modal */}
      <StudentReportModal />

      {/* End-of-Week Teacher Pedagogical Report Modal */}
      <WeeklyReportModal />

      {/* Clean Institutional Footer */}
      <footer className="bg-[#12223a] border-t border-[#A7C7E7]/25 text-[#FAFAFA] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2.5">
            <BrandLockup size="lg" altText="Teacher Ivan Official Platform" />
            <p className="font-inter text-xs text-[#A7C7E7] max-w-sm">
              {t.footer.desc}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-5 sm:gap-6 text-xs text-[#A7C7E7]">
            <button
              type="button"
              onClick={() => setActiveView('simulator')}
              className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                activeView === 'simulator' ? 'text-[#E09B30] font-bold' : ''
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Headphones size={13} />
                <span>{isEs ? 'Simulador IA' : 'AI Simulator'}</span>
              </span>
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setActiveView('resources')}
                className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                  activeView === 'resources' ? 'text-[#E09B30] font-bold' : ''
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} />
                  <span>{isEs ? 'Recursos Educativos' : 'Educational Resources'}</span>
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="hover:text-[#E09B30] transition-colors cursor-pointer text-[#E09B30] font-bold flex items-center gap-1.5"
              >
                <Sparkles size={13} />
                <span>{isEs ? 'Registrarse Gratis' : 'Sign Up Free'}</span>
              </button>
            )}

            <a
              href={getWhatsAppUrl('Hola Teacher Ivan! Me gustaría consultar por clases 1 a 1 de inglés.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#10b981] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              💬 WhatsApp ({TEACHER_PHONE})
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[#A7C7E7]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A7C7E7]/70">
          <p>{t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleDeveloperMode}
              className="text-[10px] text-[#A7C7E7]/60 hover:text-[#E09B30] underline cursor-pointer"
            >
              {isDeveloperMode ? 'Disable Dev Mode' : 'Dev Mode'}
            </button>
            <p className="font-mono">
              {isDeveloperMode
                ? t.footer.poweredBy
                : 'Teacher Ivan • English Classes • Sucre, Bolivia • Online Worldwide'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
