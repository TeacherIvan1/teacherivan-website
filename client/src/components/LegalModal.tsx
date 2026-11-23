import React, { useEffect } from 'react';
import { ShieldCheck, FileText, X, MessageCircle, Mail, SlidersHorizontal } from 'lucide-react';
import { useCookieConsent } from '../context/CookieConsentContext';
import { useTranslation } from '../modules/i18n/languageStore';
import { useScrollLock } from '../hooks/useScrollLock';
import { getGeneralWhatsAppUrl } from '../utils/whatsapp';

export const LegalModal: React.FC = () => {
  const { activeLegalModal, openLegalModal, closeLegalModal, openCookiePreferences } = useCookieConsent();
  const { isEs } = useTranslation();

  const isOpen = activeLegalModal !== null;
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLegalModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLegalModal]);

  if (!isOpen) return null;

  const isPrivacy = activeLegalModal === 'privacy';

  return (
    <div
      id="legal-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#091326]/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeLegalModal();
        }
      }}
    >
      <div
        id="legal-modal-card"
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[88dvh] overflow-y-auto overscroll-contain rounded-3xl bg-[#FAFAFA] dark:bg-[#1A3153] text-[#1A3153] dark:text-[#FAFAFA] border border-[#A7C7E7]/40 p-6 sm:p-8 shadow-2xl flex flex-col gap-5"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A3153]/15 dark:border-[#A7C7E7]/25">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1A3153] dark:bg-[#091326] border border-[#E09B30] flex items-center justify-center text-[#E09B30]">
              {isPrivacy ? <ShieldCheck size={20} /> : <FileText size={20} />}
            </div>
            <div>
              <h2
                id="legal-modal-title"
                className="font-montserrat font-extrabold text-lg sm:text-xl tracking-tight"
              >
                {isPrivacy
                  ? isEs
                    ? 'Política de Privacidad'
                    : 'Privacy Policy'
                  : isEs
                  ? 'Política de Cookies'
                  : 'Cookie Policy'}
              </h2>
              <p className="font-inter text-xs text-[#4A5568] dark:text-[#A7C7E7]">
                teacherivan.com • {isEs ? 'Última actualización: Noviembre 2026' : 'Last updated: November 2026'}
              </p>
            </div>
          </div>

          <button
            id="close-legal-modal-btn"
            type="button"
            onClick={closeLegalModal}
            className="w-11 h-11 rounded-full bg-[#1A3153]/10 dark:bg-[#091326] hover:bg-[#E09B30] hover:text-[#091326] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label={isEs ? 'Cerrar' : 'Close'}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Policy Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-[#1A3153]/10 dark:bg-[#091326] border border-[#1A3153]/15 dark:border-[#A7C7E7]/25 gap-1">
          <button
            id="legal-tab-privacy"
            type="button"
            onClick={() => openLegalModal('privacy')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isPrivacy
                ? 'bg-[#E09B30] text-[#091326] shadow-sm'
                : 'text-[#4A5568] dark:text-[#A7C7E7] hover:text-[#1A3153] dark:hover:text-[#FAFAFA]'
            }`}
          >
            {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
          </button>
          <button
            id="legal-tab-cookies"
            type="button"
            onClick={() => openLegalModal('cookies')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
              !isPrivacy
                ? 'bg-[#E09B30] text-[#091326] shadow-sm'
                : 'text-[#4A5568] dark:text-[#A7C7E7] hover:text-[#1A3153] dark:hover:text-[#FAFAFA]'
            }`}
          >
            {isEs ? 'Política de Cookies' : 'Cookie Policy'}
          </button>
        </div>

        {/* Document Content */}
        {isPrivacy ? (
          <div id="privacy-policy-content" className="space-y-4 font-inter text-xs sm:text-sm text-[#4A5568] dark:text-[#A7C7E7] leading-relaxed">
            <div className="p-4 rounded-2xl bg-[#1A3153]/5 dark:bg-[#091326]/60 border border-[#1A3153]/15 dark:border-[#A7C7E7]/25 space-y-2">
              <h3 className="font-montserrat font-bold text-sm text-[#1A3153] dark:text-[#FAFAFA]">
                {isEs ? '1. Datos Personales que Recopilamos' : '1. Personal Data We Collect'}
              </h3>
              <p>
                {isEs
                  ? 'Para brindarte acceso a tu ruta personalizada de aprendizaje, al Laboratorio de Voz 24/7 y al calendario de clases 1-a-1 con Teacher Ivan, recopilamos únicamente la información necesaria:'
                  : 'To provide your personalized learning roadmap, 24/7 Voice Lab access, and 1-on-1 class scheduling with Teacher Ivan, we collect only essential information:'}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>{isEs ? 'Datos de Perfil:' : 'Account Profile:'}</strong>{' '}
                  {isEs
                    ? 'Nombre completo, correo electrónico, número de celular (WhatsApp), fecha de nacimiento, país de residencia y perfil básico de Google OAuth (si eliges iniciar sesión con Google).'
                    : 'Full name, email address, phone number (WhatsApp), date of birth, country of residence, and basic Google OAuth profile (if you sign in with Google).'}
                </li>
                <li>
                  <strong>{isEs ? 'Metas Académicas:' : 'Learning Goals:'}</strong>{' '}
                  {isEs
                    ? 'Nivel MCER objetivo (A1 a C1 / IELTS), meta principal, habilidad prioritaria y objetivo específico.'
                    : 'Target CEFR level (A1 to C1 / IELTS), primary goal, focus skill, and specific learning objective.'}
                </li>
                <li>
                  <strong>{isEs ? 'Procesamiento de Voz en Tiempo Real:' : 'Real-Time Voice Processing:'}</strong>{' '}
                  {isEs
                    ? 'Durante las sesiones en el Laboratorio de Voz 24/7 con Teacher Ivan y Emma, tu audio se procesa en tiempo real para generar retroalimentación conversacional, corrección natural al instante y reportes de fluidez. No vendemos ni compartimos grabaciones de voz con terceros.'
                    : 'During 24/7 Voice Lab sessions with Teacher Ivan and Emma, your voice audio is processed in real time to generate conversational replies, native recasts, and fluency reports. We never sell or share voice recordings with third parties.'}
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A3153]/5 dark:bg-[#091326]/60 border border-[#1A3153]/15 dark:border-[#A7C7E7]/25 space-y-2">
              <h3 className="font-montserrat font-bold text-sm text-[#1A3153] dark:text-[#FAFAFA]">
                {isEs ? '2. Almacenamiento Seguro y Retención' : '2. Secure Storage & Retention'}
              </h3>
              <p>
                {isEs
                  ? 'Todas las comunicaciones entre tu navegador y nuestros servidores se transmiten mediante cifrado TLS/HTTPS. Tu sesión autenticada se protege mediante cookies HttpOnly (ti_session) inaccesibles desde scripts externos. Los registros académicos y reservas de clases se sincronizan en la base de datos académica privada de Teacher Ivan (Google Sheets protegido) exclusivamente para la gestión pedagógica.'
                  : 'All communications between your browser and our servers are encrypted via TLS/HTTPS. Your authenticated session is protected via HttpOnly cookies (ti_session) inaccessible to third-party scripts. Academic progress and class bookings are synced with Teacher Ivan’s protected Google Sheets coaching roster solely for educational delivery.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A3153]/5 dark:bg-[#091326]/60 border border-[#1A3153]/15 dark:border-[#A7C7E7]/25 space-y-2">
              <h3 className="font-montserrat font-bold text-sm text-[#1A3153] dark:text-[#FAFAFA]">
                {isEs ? '3. Tus Derechos y Eliminación de Datos' : '3. Your Rights & Data Deletion'}
              </h3>
              <p>
                {isEs
                  ? 'Puedes solicitar en cualquier momento la consulta, corrección o eliminación definitiva de tu cuenta y datos académicos escribiendo directamente a Teacher Ivan por WhatsApp (+591 72878330) o al correo ivan@teacherivan.com.'
                  : 'You may request access, correction, or permanent deletion of your account and academic records at any time by contacting Teacher Ivan via WhatsApp (+591 72878330) or email at ivan@teacherivan.com.'}
              </p>
            </div>
          </div>
        ) : (
          <div id="cookie-policy-content" className="space-y-4 font-inter text-xs sm:text-sm text-[#4A5568] dark:text-[#A7C7E7] leading-relaxed">
            <div className="p-4 rounded-2xl bg-[#1A3153]/5 dark:bg-[#091326]/60 border border-[#1A3153]/15 dark:border-[#A7C7E7]/25 space-y-2">
              <h3 className="font-montserrat font-bold text-sm text-[#1A3153] dark:text-[#FAFAFA]">
                {isEs
                  ? '1. Cookies Estrictamente Necesarias (Sesión y Seguridad)'
                  : '1. Strictly Necessary Cookies (Session & Security)'}
              </h3>
              <p>
                {isEs
                  ? 'Utilizamos la cookie de sesión HttpOnly "ti_session" (duración: 7 días) para autenticar tu cuenta de estudiante de forma segura sin exponer tokens en el almacenamiento local del navegador. También guardamos preferencias básicas de interfaz (idioma ES/EN, modo claro/oscuro y tu elección de cookies).'
                  : 'We use the HttpOnly session cookie "ti_session" (7-day duration) to authenticate your student account securely without exposing raw tokens in browser localStorage. We also store non-sensitive UI preferences (ES/EN language, light/dark theme, and your cookie consent choice).'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A3153]/5 dark:bg-[#091326]/60 border border-[#1A3153]/15 dark:border-[#A7C7E7]/25 space-y-2">
              <h3 className="font-montserrat font-bold text-sm text-[#1A3153] dark:text-[#FAFAFA]">
                {isEs
                  ? '2. Cookies Analíticas Opcionales (Google Analytics 4)'
                  : '2. Optional Analytics Cookies (Google Analytics 4)'}
              </h3>
              <p>
                {isEs
                  ? 'Solo si seleccionas "Aceptar todas" o habilitas las cookies analíticas en la configuración, cargamos Google Analytics 4 (con anonimización de IP) para entender métricas generales de uso (registro, selección de planes y apertura del tutor de voz). Si eliges "Solo esenciales", Google Analytics no se carga en absoluto.'
                  : 'Only if you click "Accept All" or enable analytics cookies in preferences, we load Google Analytics 4 (with IP anonymization) to measure aggregate platform engagement (sign-ups, plan selection, and voice tutor launches). If you choose "Essential Only", Google Analytics is never loaded.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A3153]/5 dark:bg-[#091326]/60 border border-[#1A3153]/15 dark:border-[#A7C7E7]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-montserrat font-bold text-sm text-[#1A3153] dark:text-[#FAFAFA]">
                  {isEs ? '3. Modificar o Revocar tu Consentimiento' : '3. Change or Revoke Your Consent'}
                </h3>
                <p className="text-xs">
                  {isEs
                    ? 'Puedes actualizar tus preferencias de cookies en cualquier momento.'
                    : 'You can update your cookie preferences at any time.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeLegalModal();
                  openCookiePreferences();
                }}
                className="px-4 py-2 rounded-full bg-[#E09B30] text-[#091326] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <SlidersHorizontal size={13} />
                <span>{isEs ? 'Configurar Cookies' : 'Cookie Settings'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Contact & Close */}
        <div className="pt-4 border-t border-[#1A3153]/15 dark:border-[#A7C7E7]/25 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-montserrat font-bold text-[#9A6515] dark:text-[#E09B30] hover:underline"
            >
              <MessageCircle size={14} />
              <span>WhatsApp +591 72878330</span>
            </a>
            <a
              href="mailto:ivan@teacherivan.com"
              className="inline-flex items-center gap-1.5 font-inter font-medium text-[#4A5568] dark:text-[#A7C7E7] hover:underline"
            >
              <Mail size={14} />
              <span>ivan@teacherivan.com</span>
            </a>
          </div>

          <button
            id="legal-modal-done-btn"
            type="button"
            onClick={closeLegalModal}
            className="px-6 py-2.5 rounded-full bg-[#1A3153] dark:bg-[#E09B30] text-[#FAFAFA] dark:text-[#091326] font-montserrat font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            {isEs ? 'Entendido' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
