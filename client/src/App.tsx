import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { LandingPageView } from './components/LandingPageView';
import { CompactVoiceSimulator } from './components/CompactVoiceSimulator';
import { MobileVoiceCockpit } from './components/MobileVoiceCockpit';
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
import { VersionWatcher } from './components/VersionWatcher';
import { Footer } from './components/Footer';
import { CookieConsentProvider } from './context/CookieConsentContext';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { LegalModal } from './components/LegalModal';
import { Terminal, Headphones, Target, BookOpen, Calendar } from 'lucide-react';
import { API_BASE_URL } from './config/api';
import { useTranslation } from './modules/i18n/languageStore';
import { useDevModeStore } from './modules/dev/devModeStore';
import { useNavigationStore } from './modules/navigation/navigationStore';
import { useAuthStore, purgeLegacyAuthTokens } from './modules/auth/authStore';

export const App: React.FC = () => {
  const { t, lang, isEs } = useTranslation();
  const { isDeveloperMode, toggleDeveloperMode } = useDevModeStore();
  const { activeView, setActiveView } = useNavigationStore();
  const { user, isAuthenticated, syncWithServer } = useAuthStore();
  const [resourcesTab, setResourcesTab] = useState<'generator' | 'games'>('generator');

  const isAdmin = user?.role === 'admin';
  const showDevMode = isAdmin && isDeveloperMode;

  // Keep <html lang="...">, document.title & SEO/OG metadata synchronized with active bilingual locale
  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'es';
    document.title = t.seo.title;

    const setMeta = (selector: string, value: string) => {
      const el = document.querySelector<HTMLMetaElement>(selector);
      if (el) el.setAttribute('content', value);
    };
    setMeta('meta[name="description"]', t.seo.description);
    setMeta('meta[property="og:title"]', t.seo.ogTitle);
    setMeta('meta[property="og:description"]', t.seo.ogDescription);
    setMeta('meta[name="twitter:title"]', t.seo.ogTitle);
    setMeta('meta[name="twitter:description"]', t.seo.ogDescription);
  }, [lang, t.seo]);

  useEffect(() => {
    // 0. Scrub any legacy auth/JWT tokens from localStorage/sessionStorage immediately on boot
    purgeLegacyAuthTokens();

    // 1. Silently wake up the Render backend instance on page load
    try {
      fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        keepalive: true,
      }).catch(() => {});
    } catch {}

    // 2. Re-sync returning student profile with server database using HttpOnly session cookie
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
    <CookieConsentProvider>
      <div
        className={`bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-inter transition-colors duration-200 ${
          isAuthenticated
            ? 'fixed inset-0 h-[100dvh] w-full overflow-hidden md:static md:inset-auto md:h-auto md:min-h-screen md:overflow-visible'
            : 'min-h-screen'
        }`}
      >
        {/* WCAG 2.4.1 Bypass Blocks: Visible-on-focus skip link */}
        <a href="#main-content" className="skip-to-main-link">
          {isEs ? 'Saltar al contenido principal' : 'Skip to main content'}
        </a>

        {/* Forced Client-Side Auto-Update for Returning Devices */}
        <VersionWatcher />

        {/* Student Plan Approval Celebratory Pop-Up Modal */}
        <PlanApprovedModal />

        {/* Student Sign-Up & Authentication Modal (Unified 2-Step Registration Flow) */}
        <StudentAuthModal />

        {/* Spoken Assessment Diagnostic Modal (Non-blocking, triggerable) */}
        <SpokenAssessmentModal />

        {/* Bilingual Privacy Policy & Cookie Policy Modal (#privacy / #cookies) */}
        <LegalModal />

        {/* Authenticated Student Workspace Header (Fixed 52px mobile / 68px desktop) */}
        {isAuthenticated && <Header />}

        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-1 flex flex-col focus:outline-none ${
            isAuthenticated ? 'min-h-0 overflow-hidden md:overflow-visible' : ''
          }`}
        >
          {/* ========================================================================= */}
          {/* NON-REGISTERED (GUEST) VIEW: AURAGATE-INSPIRED PORTAL ZOOM LANDING PAGE   */}
          {/* ========================================================================= */}
          {!isAuthenticated ? (
            <LandingPageView />
          ) : (
            /* ========================================================================= */
            /* REGISTERED USERS VIEW: ROUTED STUDENT WORKSPACE                          */
            /* Mobile (< 768px): Zero-Scroll 100dvh App Shell | Desktop: Full Workspace */
            /* ========================================================================= */
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden md:overflow-visible animate-in fade-in duration-200">
              {/* VIEW 1: MI RUTA (MICRO-LEARNING 5-DAY SPRINT DASHBOARD) */}
              {activeView === 'path' ? (
                <div
                  id="view-path"
                  className="flex-1 min-h-0 flex flex-col overflow-hidden md:overflow-visible animate-in fade-in duration-200"
                >
                  <WeeklySprintDashboard />
                </div>
              ) : activeView === 'resources' ? (
                /* VIEW 2: RECURSOS & JUEGOS */
                <div
                  id="view-resources"
                  className="flex-1 min-h-0 flex flex-col overflow-hidden md:overflow-visible animate-in fade-in duration-200"
                >
                  {/* Mobile Sub-Tab Switcher (< 768px) */}
                  <div className="md:hidden shrink-0 px-3.5 pt-2 pb-1.5">
                    <div className="flex p-1 rounded-2xl bg-[var(--bg-sunken)] border border-[var(--border-hairline)] max-w-md mx-auto w-full gap-1">
                      <button
                        id="mobile-resources-tab-generator"
                        type="button"
                        onClick={() => setResourcesTab('generator')}
                        className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center ${
                          resourcesTab === 'generator'
                            ? 'bg-[#E09B30] text-[#091326] shadow-sm font-extrabold'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {isEs ? 'Generador IA' : 'AI Generator'}
                      </button>
                      <button
                        id="mobile-resources-tab-games"
                        type="button"
                        onClick={() => setResourcesTab('games')}
                        className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center ${
                          resourcesTab === 'games'
                            ? 'bg-[#E09B30] text-[#091326] shadow-sm font-extrabold'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {isEs ? 'Micro-Juegos' : 'Micro-Games'}
                      </button>
                    </div>
                  </div>

                  {/* Desktop: Stacks both views. Mobile: Shows selected sub-tab in 100dvh frame */}
                  <div
                    className={
                      resourcesTab === 'generator'
                        ? 'flex-1 min-h-0 flex flex-col overflow-hidden md:block md:overflow-visible'
                        : 'hidden md:block'
                    }
                  >
                    <EducationalResourcesView />
                  </div>
                  <div
                    className={
                      resourcesTab === 'games'
                        ? 'flex-1 min-h-0 flex flex-col overflow-hidden md:block md:overflow-visible'
                        : 'hidden md:block'
                    }
                  >
                    <InteractiveGamesView />
                  </div>
                </div>
              ) : activeView === 'schedule' ? (
                /* VIEW 3: AGENDAR CLASE (14:00 - 20:00 Bolivia Time) */
                <div
                  id="view-schedule"
                  className="flex-1 min-h-0 flex flex-col overflow-hidden md:overflow-visible animate-in fade-in duration-200"
                >
                  <ClassSchedulerView />
                </div>
              ) : (
                /* VIEW 4: SIMULADOR IA (Mobile: 100dvh Zero-Scroll Cockpit | Desktop: Full Simulator) */
                <div
                  id="view-simulator"
                  className="flex-1 min-h-0 flex flex-col overflow-hidden md:overflow-visible animate-in fade-in duration-200"
                >
                  {/* Mobile Single-Screen Zero-Scroll Cockpit (< 768px) */}
                  <div className="md:hidden flex-1 min-h-0 overflow-hidden">
                    <MobileVoiceCockpit />
                  </div>

                  {/* Desktop Full Simulator (>= 768px) */}
                  <div className="hidden md:flex py-6 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1 flex-col gap-6">
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

                  {/* Flagship Voice Simulator Console */}
                  <CompactVoiceSimulator />

                  {/* In Developer Mode: Registered Students Table, All Booked Classes, Telemetry & Logs */}
                  {showDevMode && (
                    <div className="mt-8 pt-8 border-t border-[#A7C7E7]/25 flex flex-col gap-6">
                      <RegisteredStudentsTable />
                      <AdminBookingsTable />

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
                </div>
              )}
            </div>
          )}
        </main>

        {/* Authenticated Mobile Bottom App Tab Bar (60px fixed flex footer, >= 44px touch targets) */}
        {isAuthenticated && (
          <nav
            id="mobile-portal-bottom-tabs"
            aria-label={isEs ? 'Navegación del portal' : 'Portal Navigation'}
            className="md:hidden shrink-0 z-40 h-[60px] pb-[env(safe-area-inset-bottom)] bg-[var(--bg-surface)] border-t border-[var(--border-hairline)] grid grid-cols-4 items-center px-1.5 shadow-lg"
          >
            {(
              [
                { id: 'simulator', labelEs: 'Simulador', labelEn: 'Voice Lab', icon: Headphones },
                { id: 'path', labelEs: 'Mi Ruta', labelEn: 'My Path', icon: Target },
                { id: 'resources', labelEs: 'Recursos', labelEn: 'Resources', icon: BookOpen },
                { id: 'schedule', labelEs: 'Clases', labelEn: 'Classes', icon: Calendar },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`mobile-tab-${tab.id}`}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl font-montserrat font-bold text-[10px] cursor-pointer transition-colors ${
                    active
                      ? 'text-[#9A6515] dark:text-[#E09B30]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{isEs ? tab.labelEs : tab.labelEn}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Automatic End-of-Session Student Report Pop-Up Modal */}
        <StudentReportModal />

        {/* End-of-Week Teacher Pedagogical Report Modal */}
        <WeeklyReportModal />

        {/* 4-Column Architectural Footer: Desktop Authenticated Portal ONLY (Hidden on Mobile < 768px to guarantee 0-scroll 100dvh app shell) */}
        {isAuthenticated && (
          <div className="hidden md:block">
            <Footer />
          </div>
        )}

        {/* Brand-Aligned Cookie Consent Banner & Preferences Modal */}
        <CookieConsentBanner />
      </div>
    </CookieConsentProvider>
  );
};

export default App;
