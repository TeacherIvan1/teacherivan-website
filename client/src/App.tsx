import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPageView } from './components/LandingPageView';
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
import { ClassSchedulerView } from './components/ClassSchedulerView';
import { RegisteredStudentsTable } from './components/RegisteredStudentsTable';
import { AdminBookingsTable } from './components/AdminBookingsTable';
import { BrandLockup } from './components/BrandLockup';
import { Terminal, Sparkles, BookOpen, Headphones, Calendar, Target } from 'lucide-react';
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
  const { user, isAuthenticated, openAuthModal, syncWithServer } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const showDevMode = isAdmin && isDeveloperMode;

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
      {/* Student Sign-Up & Authentication Modal (Unified 2-Step Registration Flow) */}
      <StudentAuthModal />

      {/* Spoken Assessment Diagnostic Modal (Non-blocking, triggerable) */}
      <SpokenAssessmentModal />

      {/* Official Platform Header with Auth & View Navigation */}
      <Header />

      <main className="flex-1 flex flex-col">
        {/* ========================================================================= */}
        {/* NON-REGISTERED (GUEST) VIEW: HIGH-CONVERTING LANDING PAGE                */}
        {/* ========================================================================= */}
        {!isAuthenticated ? (
          <LandingPageView />
        ) : (
          /* ========================================================================= */
          /* REGISTERED USERS VIEW: ROUTED STUDENT WORKSPACE                          */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col animate-in fade-in duration-200">
            {/* VIEW 1: 🎯 MI RUTA (MICRO-LEARNING 5-DAY SPRINT DASHBOARD) */}
            {activeView === 'path' ? (
              <div id="view-path" className="flex flex-col animate-in fade-in duration-200">
                <WeeklySprintDashboard />
              </div>
            ) : activeView === 'resources' ? (
              /* VIEW 2: 📚 RECURSOS & JUEGOS */
              <div id="view-resources" className="flex flex-col animate-in fade-in duration-200">
                <EducationalResourcesView />
                <InteractiveGamesView />
              </div>
            ) : activeView === 'schedule' ? (
              /* VIEW 3: 📅 AGENDAR CLASE (14:00 - 20:00 Bolivia Time) */
              <div id="view-schedule" className="flex flex-col animate-in fade-in duration-200">
                <ClassSchedulerView />
              </div>
            ) : (
              /* VIEW 4: 🎙️ SIMULADOR IA (Full Unlocked Simulator Model) */
              <div id="view-simulator" className="py-6 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6 animate-in fade-in duration-200">
                {/* Developer Mode Banner Notification (if active) */}
                {showDevMode && (
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

                {/* Flagship Voice Simulator Console (Fully Unlocked for Registered Student) */}
                <CompactVoiceSimulator />

                {/* In Developer Mode: Registered Students Table, All Booked Classes, Telemetry & Logs */}
                {showDevMode && (
                  <div className="mt-8 pt-8 border-t border-[#A7C7E7]/25 flex flex-col gap-6">
                    {/* (2) Registered Students Database Table */}
                    <RegisteredStudentsTable />

                    {/* (3) All Booked 1-on-1 Classes */}
                    <AdminBookingsTable />

                    {/* (1) Live Audio/Latency Telemetry & Logs */}
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
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveView('path')}
                  className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                    activeView === 'path' ? 'text-[#E09B30] font-bold' : ''
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Target size={13} />
                    <span>{isEs ? 'Mi Ruta' : 'My Path'}</span>
                  </span>
                </button>

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

                <button
                  type="button"
                  onClick={() => setActiveView('resources')}
                  className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                    activeView === 'resources' ? 'text-[#E09B30] font-bold' : ''
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} />
                    <span>{isEs ? 'Recursos & Juegos' : 'Resources & Games'}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('schedule')}
                  className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                    activeView === 'schedule' ? 'text-[#E09B30] font-bold' : ''
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>{t.scheduling.navTab}</span>
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('flagship-simulator-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#E09B30] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Headphones size={13} />
                    <span>{isEs ? 'Simulador IA' : 'AI Simulator'}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('faq-pricing-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#E09B30] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} />
                    <span>{isEs ? 'Planes & Precios' : 'Plans & Pricing'}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="hover:text-[#E09B30] transition-colors cursor-pointer text-[#E09B30] font-bold flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>{isEs ? 'Registrarse Gratis' : 'Sign Up Free'}</span>
                </button>
              </>
            )}

            <a
              id="footer-direct-whatsapp-btn"
              href="https://wa.me/59172878330"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-[#10b981] hover:bg-[#059669] text-white font-montserrat font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <span>{isEs ? '💬 Contactar a Teacher Ivan por WhatsApp' : '💬 Contact Teacher Ivan on WhatsApp'}</span>
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[#A7C7E7]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A7C7E7]/70">
          <p>{t.footer.copyright}</p>
          <p className="font-mono">
            {showDevMode
              ? t.footer.poweredBy
              : 'Teacher Ivan • English Classes • Sucre, Bolivia • Online Worldwide'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
