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
import { PlanApprovedModal } from './components/PlanApprovedModal';
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

  // Real-time Plan Approval Polling (8000ms) & on Window Focus
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      syncWithServer().catch(() => {});
    }, 8000);

    const handleFocus = () => {
      syncWithServer().catch(() => {});
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, syncWithServer]);

  return (
    <div className="min-h-screen bg-[#1A3153] text-[#FAFAFA] flex flex-col font-inter">
      {/* Student Plan Approval Celebratory Pop-Up Modal */}
      <PlanApprovedModal />

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

        {/* Official Social Media Channels Row */}
        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-[#A7C7E7]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-montserrat font-semibold text-[#A7C7E7]">
            <span className="text-[#E09B30]">●</span>
            <span>{isEs ? 'Canales Oficiales:' : 'Official Channels:'}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Instagram */}
            <a
              id="footer-social-instagram"
              href="https://www.instagram.com/teacherivan_english.classes/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Teacher Ivan"
              title="Instagram @teacherivan_english.classes"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAFAFA]/5 hover:bg-[#E09B30]/20 border border-[#A7C7E7]/25 hover:border-[#E09B30] text-[#A7C7E7] hover:text-[#FAFAFA] text-xs font-inter font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>

            {/* TikTok */}
            <a
              id="footer-social-tiktok"
              href="https://www.tiktok.com/@teacher_ivan_english_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok Teacher Ivan"
              title="TikTok @teacher_ivan_english_"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAFAFA]/5 hover:bg-[#E09B30]/20 border border-[#A7C7E7]/25 hover:border-[#E09B30] text-[#A7C7E7] hover:text-[#FAFAFA] text-xs font-inter font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43 6.3 6.3 0 0 0 1.88-4.42V8.71a8.31 8.31 0 0 0 4.85 1.56v-3.46a4.85 4.85 0 0 1-1-.12z"/>
              </svg>
              <span>TikTok</span>
            </a>

            {/* YouTube */}
            <a
              id="footer-social-youtube"
              href="https://www.youtube.com/@Teacher_Ivan"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube Teacher Ivan"
              title="YouTube @Teacher_Ivan"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAFAFA]/5 hover:bg-[#E09B30]/20 border border-[#A7C7E7]/25 hover:border-[#E09B30] text-[#A7C7E7] hover:text-[#FAFAFA] text-xs font-inter font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>YouTube</span>
            </a>

            {/* WhatsApp */}
            <a
              id="footer-social-whatsapp"
              href="https://wa.me/59172878330"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Teacher Ivan"
              title="WhatsApp +591 72878330"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/15 hover:bg-[#10b981]/30 border border-[#10b981]/40 hover:border-[#10b981] text-[#34d399] hover:text-white text-xs font-inter font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-[#A7C7E7]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A7C7E7]/70">
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
