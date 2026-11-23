import React, { useState, useEffect } from 'react';
import { ShieldCheck, SlidersHorizontal, X, Check } from 'lucide-react';
import { useCookieConsent } from '../context/CookieConsentContext';
import { useTranslation } from '../modules/i18n/languageStore';
import { useScrollLock } from '../hooks/useScrollLock';

export const CookieConsentBanner: React.FC = () => {
  const {
    consent,
    isBannerVisible,
    isPreferencesModalOpen,
    acceptAllCookies,
    acceptEssentialOnly,
    saveCustomConsent,
    openCookiePreferences,
    closeCookiePreferences,
    openLegalModal,
  } = useCookieConsent();
  const { isEs } = useTranslation();

  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(
    consent ? consent.analytics : false
  );

  useEffect(() => {
    if (consent) {
      setAnalyticsEnabled(consent.analytics);
    }
  }, [consent, isPreferencesModalOpen]);

  useScrollLock(isPreferencesModalOpen);

  useEffect(() => {
    if (!isPreferencesModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCookiePreferences();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreferencesModalOpen, closeCookiePreferences]);

  if (!isBannerVisible && !isPreferencesModalOpen) {
    return null;
  }

  return (
    <>
      {/* Sleek Non-Intrusive Bottom Cookie Consent Bar */}
      {isBannerVisible && !isPreferencesModalOpen && (
        <div
          id="cookie-consent-banner"
          role="region"
          aria-label={isEs ? 'Aviso de Cookies' : 'Cookie Consent Banner'}
          className="fixed bottom-0 inset-x-0 z-[90] p-3 sm:p-4 pointer-events-none"
        >
          <div
            className="max-w-5xl mx-auto rounded-2xl p-4 sm:p-5 bg-[#1A3153] text-[#FAFAFA] shadow-2xl pointer-events-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            style={{
              border: '1px solid rgba(167, 199, 231, 0.28)',
              boxShadow: '0 24px 48px rgba(9, 19, 38, 0.65)',
            }}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#E09B30] shrink-0" />
                <h3 className="font-montserrat font-bold text-sm text-[#FAFAFA] tracking-tight">
                  {isEs
                    ? 'Privacidad y Uso Transparente de Cookies'
                    : 'Privacy & Transparent Cookie Usage'}
                </h3>
              </div>
              <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
                {isEs ? (
                  <>
                    Utilizamos cookies de sesión estrictamente necesarias (<code>ti_session</code>) para
                    mantener tu cuenta segura y, solo con tu autorización, cookies analíticas (Google
                    Analytics 4) para mejorar tu experiencia de aprendizaje. Consulta nuestra{' '}
                    <button
                      type="button"
                      onClick={() => openLegalModal('privacy')}
                      className="text-[#FAFAFA] underline hover:text-[#E09B30] font-semibold cursor-pointer"
                    >
                      Política de Privacidad
                    </button>{' '}
                    y{' '}
                    <button
                      type="button"
                      onClick={() => openLegalModal('cookies')}
                      className="text-[#FAFAFA] underline hover:text-[#E09B30] font-semibold cursor-pointer"
                    >
                      Política de Cookies
                    </button>
                    .
                  </>
                ) : (
                  <>
                    We use strictly necessary session cookies (<code>ti_session</code>) to keep your
                    account secure and, only with your consent, analytics cookies (Google Analytics 4)
                    to improve your learning experience. Read our{' '}
                    <button
                      type="button"
                      onClick={() => openLegalModal('privacy')}
                      className="text-[#FAFAFA] underline hover:text-[#E09B30] font-semibold cursor-pointer"
                    >
                      Privacy Policy
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => openLegalModal('cookies')}
                      className="text-[#FAFAFA] underline hover:text-[#E09B30] font-semibold cursor-pointer"
                    >
                      Cookie Policy
                    </button>
                    .
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end shrink-0">
              <button
                id="cookie-manage-btn"
                type="button"
                onClick={openCookiePreferences}
                className="min-h-[44px] px-4 py-2 rounded-full text-xs font-montserrat font-bold text-[#FAFAFA] hover:text-[#E09B30] border border-[#A7C7E7]/45 hover:border-[#E09B30] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal size={13} />
                <span>{isEs ? 'Configurar' : 'Manage Preferences'}</span>
              </button>

              <button
                id="cookie-essential-only-btn"
                type="button"
                onClick={acceptEssentialOnly}
                className="min-h-[42px] px-4 py-2 rounded-full text-xs font-montserrat font-bold text-[#FAFAFA] border border-[#A7C7E7] hover:bg-[#FAFAFA]/10 transition-colors cursor-pointer"
              >
                {isEs ? 'Solo esenciales' : 'Essential Only'}
              </button>

              <button
                id="cookie-accept-all-btn"
                type="button"
                onClick={acceptAllCookies}
                className="min-h-[42px] px-5 py-2 rounded-full text-xs font-montserrat font-extrabold uppercase tracking-wider bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] transition-all shadow-md cursor-pointer"
              >
                {isEs ? 'Aceptar todas' : 'Accept All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Preferences Modal */}
      {isPreferencesModalOpen && (
        <div
          id="cookie-preferences-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#091326]/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeCookiePreferences();
            }
          }}
        >
          <div
            id="cookie-preferences-modal-card"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[88dvh] overflow-y-auto overscroll-contain rounded-3xl bg-[#1A3153] text-[#FAFAFA] border border-[#A7C7E7]/35 p-6 sm:p-7 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#A7C7E7]/20">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-[#E09B30]" />
                <h2
                  id="cookie-preferences-title"
                  className="font-montserrat font-bold text-base sm:text-lg text-[#FAFAFA]"
                >
                  {isEs ? 'Configuración de Cookies' : 'Cookie Preferences'}
                </h2>
              </div>
              <button
                id="close-cookie-preferences-btn"
                type="button"
                onClick={closeCookiePreferences}
                className="w-8 h-8 rounded-full bg-[#091326]/60 hover:bg-[#E09B30]/20 text-[#A7C7E7] hover:text-[#FAFAFA] flex items-center justify-center transition-colors cursor-pointer"
                aria-label={isEs ? 'Cerrar' : 'Close'}
              >
                <X size={16} />
              </button>
            </div>

            <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
              {isEs
                ? 'Personaliza tus preferencias de privacidad en teacherivan.com. Las cookies esenciales permanecen activas para proteger tu sesión autenticada.'
                : 'Customize your privacy preferences on teacherivan.com. Essential cookies remain active to protect your authenticated session.'}
            </p>

            <div className="space-y-3">
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-[#091326]/70 border border-[#A7C7E7]/25 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-montserrat font-bold text-xs text-[#FAFAFA]">
                      {isEs
                        ? '1. Cookies Estrictamente Necesarias (ti_session)'
                        : '1. Strictly Necessary Session Cookies (ti_session)'}
                    </span>
                  </div>
                  <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
                    {isEs
                      ? 'Cookie HttpOnly segura requerida para iniciar sesión, proteger contra ataques CSRF y guardar tus preferencias de idioma y tema.'
                      : 'Secure HttpOnly cookie required for authentication, CSRF protection, and saving your language and theme settings.'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] font-montserrat font-bold text-[10px] uppercase tracking-wider shrink-0">
                  {isEs ? 'Siempre Activas' : 'Always On'}
                </span>
              </div>

              {/* Category 2: Analytics / GA4 */}
              <div className="p-4 rounded-2xl bg-[#091326]/70 border border-[#A7C7E7]/25 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-montserrat font-bold text-xs text-[#FAFAFA] block">
                    {isEs
                      ? '2. Cookies Analíticas Opcionales (Google Analytics 4)'
                      : '2. Optional Analytics Cookies (Google Analytics 4)'}
                  </span>
                  <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
                    {isEs
                      ? 'Nos ayudan a medir de forma anónima qué módulos y planes son más útiles para nuestros estudiantes. Nunca se cargan sin tu consentimiento.'
                      : 'Help us anonymously measure which modules and plans are most useful for students. Never loaded without your explicit consent.'}
                  </p>
                </div>

                <button
                  id="cookie-toggle-analytics-btn"
                  type="button"
                  role="switch"
                  aria-checked={analyticsEnabled}
                  onClick={() => setAnalyticsEnabled((prev) => !prev)}
                  className={`w-12 h-7 rounded-full transition-colors p-1 shrink-0 cursor-pointer flex items-center ${
                    analyticsEnabled ? 'bg-[#E09B30] justify-end' : 'bg-[#4A5568] justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-[#091326] shadow-sm block" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#A7C7E7]/20">
              <button
                type="button"
                onClick={acceptEssentialOnly}
                className="min-h-[42px] px-4 py-2 rounded-full text-xs font-montserrat font-bold text-[#A7C7E7] hover:text-[#FAFAFA] border border-[#A7C7E7]/40 transition-colors cursor-pointer"
              >
                {isEs ? 'Solo esenciales' : 'Essential Only'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="cookie-save-preferences-btn"
                  type="button"
                  onClick={() => saveCustomConsent(analyticsEnabled)}
                  className="min-h-[42px] px-5 py-2 rounded-full text-xs font-montserrat font-bold text-[#FAFAFA] bg-[#1A3153] border border-[#E09B30] hover:bg-[#E09B30] hover:text-[#091326] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{isEs ? 'Guardar selección' : 'Save Preferences'}</span>
                </button>

                <button
                  id="cookie-modal-accept-all-btn"
                  type="button"
                  onClick={acceptAllCookies}
                  className="min-h-[42px] px-5 py-2 rounded-full text-xs font-montserrat font-extrabold uppercase tracking-wider bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] transition-all cursor-pointer"
                >
                  {isEs ? 'Aceptar todas' : 'Accept All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsentBanner;
