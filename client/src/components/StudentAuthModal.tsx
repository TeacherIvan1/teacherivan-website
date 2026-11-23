import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  User,
  Mail,
  Calendar,
  Globe,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Award,
  Compass,
  BookOpen,
  Target,
} from 'lucide-react';
import { useAuthStore } from '../modules/auth/authStore';
import { SUPPORTED_COUNTRIES, SupportedCountry, LearningGoals } from '../modules/auth/types';
import { useTranslation } from '../modules/i18n/languageStore';
import { useSprintStore } from '../modules/sprint/sprintStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { getApiUrl } from '../config/api';
import { GOOGLE_CLIENT_ID } from '../config/auth';
import { useTheme } from '../modules/theme/ThemeContext';
import { useScrollLock } from '../hooks/useScrollLock';
import { useCookieConsent } from '../context/CookieConsentContext';
import { buildWhatsAppUrl, handleWhatsAppClick } from '../utils/whatsapp';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1 / IELTS'] as const;

const PRIMARY_GOALS = [
  'Tech & Job Interviews',
  'University Scholarship',
  'IELTS Exam Prep',
  'Business & Executive English',
  'Daily Conversational Fluency',
] as const;

const FOCUS_SKILLS = [
  'Speaking Fluency & Pronunciation',
  'Grammar & Syntax Accuracy',
  'Professional Vocabulary & Collocations',
  'Listening Comprehension',
] as const;

export const StudentAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    authModalBanner,
    pendingGoogleProfile,
    isLoading,
    error,
    closeAuthModal,
    openAuthModal,
    registerWithEmail,
    authenticateWithGoogle,
    loginWithCredentials,
    recoverPassword,
  } = useAuthStore();
  const syncWithServer = useAuthStore((s) => s.syncWithServer);

  const { t, isEs } = useTranslation();
  const { isDark } = useTheme();
  const { openLegalModal } = useCookieConsent();
  const setPersonalizedSprint = useSprintStore((s) => s.setPersonalizedSprint);
  const setActiveView = useNavigationStore((s) => s.setActiveView);

  // Lock background page scroll (DOM + Lenis) whenever AuthModal is open
  useScrollLock(isAuthModalOpen);

  // Escape key dismissal for StudentAuthModal (WCAG 2.1.1)
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Wizard Step (1: Account Credentials, 2: Learning Goals)
  const [step, setStep] = useState<1 | 2>(1);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Step 1 Form fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState<SupportedCountry | ''>('Bolivia');

  // Mandatory Legal Consent Checkbox (starts unchecked)
  const [legalAccepted, setLegalAccepted] = useState<boolean>(false);

  // Recover Password fields
  const [recoverUsername, setRecoverUsername] = useState('');
  const [recoverContact, setRecoverContact] = useState('');
  const [recoverNewPassword, setRecoverNewPassword] = useState('');
  const [recoverSuccess, setRecoverSuccess] = useState<string | null>(null);

  // Step 2 Form fields (Learning Goals)
  const [targetLevel, setTargetLevel] = useState<string>('B1');
  const [primaryGoal, setPrimaryGoal] = useState<string>('Tech & Job Interviews');
  const [focusSkill, setFocusSkill] = useState<string>('Speaking Fluency & Pronunciation');
  const [personalObjective, setPersonalObjective] = useState<string>('');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset step to 1 when modal opens or mode changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep(1);
      setValidationError(null);
      setRecoverSuccess(null);
      setLegalAccepted(false);
    }
  }, [isAuthModalOpen, authModalMode]);

  // Sync state when pending Google profile changes
  useEffect(() => {
    if (pendingGoogleProfile) {
      if (pendingGoogleProfile.fullName) setFullName(pendingGoogleProfile.fullName);
      if (pendingGoogleProfile.email) setEmail(pendingGoogleProfile.email);
    }
  }, [pendingGoogleProfile]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen && !isLoading) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal, isLoading]);

  const isCompletingProfile = authModalMode === 'complete_google_profile';
  const isSignInMode = authModalMode === 'signin';
  const isRecoverMode = authModalMode === 'recover_password';

  // Advance from Step 1 to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedUsername = username.trim().toLowerCase().replace(/^@/, '');
    const trimmedPassword = password.trim();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedUsername || trimmedUsername.length < 3) {
      setValidationError(
        isEs
          ? 'Por favor ingresa un nombre de usuario (mínimo 3 caracteres).'
          : 'Please enter a username (min 3 characters).'
      );
      return;
    }
    if (!trimmedPassword || trimmedPassword.length < 6) {
      setValidationError(
        isEs
          ? 'Por favor ingresa una contraseña (mínimo 6 caracteres).'
          : 'Please enter a password (min 6 characters).'
      );
      return;
    }
    if (!trimmedName) {
      setValidationError(isEs ? 'Por favor ingresa tu nombre completo.' : 'Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setValidationError(isEs ? 'Por favor ingresa un correo electrónico válido.' : 'Please enter a valid email address.');
      return;
    }
    if (!trimmedPhone) {
      setValidationError(isEs ? 'Por favor ingresa tu número de celular.' : 'Please enter your phone number.');
      return;
    }
    if (!dateOfBirth) {
      setValidationError(isEs ? 'Por favor selecciona tu fecha de nacimiento.' : 'Please select your date of birth.');
      return;
    }
    if (!country) {
      setValidationError(isEs ? 'Por favor selecciona tu país de residencia.' : 'Please select your country of residence.');
      return;
    }
    if (!legalAccepted) {
      setValidationError(
        isEs
          ? 'Debes aceptar la Política de Privacidad y la Política de Cookies para continuar.'
          : 'You must agree to the Privacy Policy and Cookie Policy to continue.'
      );
      return;
    }

    setStep(2);
  };

  // Submit complete 2-step registration
  const handleFinalRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedUsername = username.trim().toLowerCase().replace(/^@/, '');
    const trimmedPassword = password.trim();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedObjective = personalObjective.trim();

    if (!trimmedPhone) {
      setValidationError(isEs ? 'Por favor ingresa tu número de celular.' : 'Please enter your phone number.');
      setStep(1);
      return;
    }

    if (!trimmedObjective) {
      setValidationError(
        isEs
          ? 'Por favor escribe tu objetivo personal específico (ej: Preparar entrevista de beca o trabajo).'
          : 'Please enter your specific personal goal (e.g. Prepare for job or scholarship interview).'
      );
      return;
    }

    if (!legalAccepted) {
      setValidationError(
        isEs
          ? 'Debes aceptar la Política de Privacidad y la Política de Cookies para completar tu registro.'
          : 'You must agree to the Privacy Policy and Cookie Policy to complete registration.'
      );
      return;
    }

    const learningGoals: LearningGoals = {
      targetLevel,
      primaryGoal,
      focusSkill,
      personalObjective: trimmedObjective,
    };

    try {
      if (isCompletingProfile || pendingGoogleProfile) {
        await authenticateWithGoogle({
          email: trimmedEmail,
          fullName: trimmedName,
          phoneNumber: trimmedPhone,
          dateOfBirth: dateOfBirth || '2000-01-01',
          country: country || 'Bolivia',
          learningGoals,
          profileCompleted: true,
        });
      } else {
        await registerWithEmail({
          username: trimmedUsername,
          password: trimmedPassword,
          fullName: trimmedName,
          email: trimmedEmail,
          phoneNumber: trimmedPhone,
          dateOfBirth,
          country,
          learningGoals,
          profileCompleted: true,
        });
      }

      // Immediately generate tailored 5-day sprint
      try {
        const res = await fetch(getApiUrl('/api/curriculum/generate-sprint'), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ learningGoals }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.sprint) {
            setPersonalizedSprint(data.sprint);
          }
        }
      } catch (genErr) {
        console.warn('[StudentAuthModal] Sprint generator warning:', genErr);
      }

      setActiveView('path' as any);
    } catch {
      // Error handled in store
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      setValidationError(isEs ? 'Por favor ingresa tu nombre de usuario.' : 'Please enter your username.');
      return;
    }
    if (!trimmedPassword) {
      setValidationError(isEs ? 'Por favor ingresa tu contraseña.' : 'Please enter your password.');
      return;
    }

    try {
      const signedInUser = await loginWithCredentials({
        username: trimmedUsername,
        password: trimmedPassword,
      });

      if (signedInUser?.role !== 'admin') {
        setActiveView('path' as any);
      }
    } catch {
      // Error handled in store
    }
  };

  const handleRecoverPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setRecoverSuccess(null);

    const trimmedUser = recoverUsername.trim();
    const trimmedContact = recoverContact.trim();
    const trimmedPass = recoverNewPassword.trim();

    if (!trimmedUser) {
      setValidationError(isEs ? 'Por favor ingresa tu nombre de usuario.' : 'Please enter your username.');
      return;
    }
    if (!trimmedContact) {
      setValidationError(
        isEs
          ? 'Por favor ingresa tu correo o celular registrado.'
          : 'Please enter your registered email or phone.'
      );
      return;
    }
    if (!trimmedPass || trimmedPass.length < 6) {
      setValidationError(
        isEs
          ? 'La nueva contraseña debe tener al menos 6 caracteres.'
          : 'The new password must be at least 6 characters.'
      );
      return;
    }

    try {
      await recoverPassword({
        username: trimmedUser,
        verificationContact: trimmedContact,
        newPassword: trimmedPass,
      });
      setRecoverSuccess(t.authModal.recoverySuccess);
    } catch {
      // Error handled in store
    }
  };

  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    if (!response || !response.credential) return;
    setValidationError(null);

    let decodedEmail = '';
    let decodedName = '';
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const gData = JSON.parse(jsonPayload);
      decodedEmail = gData.email || '';
      decodedName = gData.name || gData.given_name || 'Google Student';
    } catch (e) {
      console.warn('[StudentAuthModal] Pre-decode notice:', e);
    }

    try {
      const result = await authenticateWithGoogle({
        credential: response.credential,
        email: decodedEmail,
        fullName: decodedName,
      });

      if (result.needsProfileCompletion) {
        if (decodedEmail) setEmail(decodedEmail);
        if (decodedName) setFullName(decodedName);
        setStep(2);
      } else {
        await syncWithServer();
        closeAuthModal();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setValidationError(msg);
    }
  };

  // Initialize Google Identity Services (GIS) button with retry
  useEffect(() => {
    if (!isAuthModalOpen || step !== 1 || isRecoverMode) return;

    let retryCount = 0;
    const maxRetries = 20;
    let intervalId: any = null;

    const renderGis = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
          });
          googleBtnContainerRef.current.innerHTML = '';
          (window as any).google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: isDark ? 'filled_black' : 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            locale: isEs ? 'es' : 'en',
          });
          if (intervalId) clearInterval(intervalId);
          return true;
        } catch (e) {
          console.warn('[StudentAuthModal] GIS render notice:', e);
        }
      }
      return false;
    };

    if (!renderGis()) {
      intervalId = setInterval(() => {
        retryCount++;
        if (renderGis() || retryCount >= maxRetries) {
          clearInterval(intervalId);
        }
      }, 250);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthModalOpen, step, isSignInMode, isRecoverMode, isDark, isEs]);

  if (!isAuthModalOpen) return null;

  const renderLegalConsentCheckbox = (idSuffix: string) => (
    <div className="pt-2">
      <label
        htmlFor={`auth-legal-consent-checkbox-${idSuffix}`}
        className="flex items-start gap-2.5 cursor-pointer select-none text-xs font-inter text-[var(--text-secondary)] leading-relaxed"
      >
        <input
          type="checkbox"
          id={`auth-legal-consent-checkbox-${idSuffix}`}
          data-testid="auth-legal-consent-checkbox"
          checked={legalAccepted}
          onChange={(e) => setLegalAccepted(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border border-[var(--border-hairline)] accent-[#E09B30] cursor-pointer shrink-0"
        />
        <span>
          {isEs ? (
            <>
              Acepto la{' '}
              <button
                type="button"
                id={`auth-open-privacy-link-${idSuffix}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openLegalModal('privacy');
                }}
                className="font-bold text-[#9A6515] dark:text-[#E09B30] underline hover:opacity-80 cursor-pointer"
              >
                Política de Privacidad
              </button>{' '}
              y la{' '}
              <button
                type="button"
                id={`auth-open-cookies-link-${idSuffix}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openLegalModal('cookies');
                }}
                className="font-bold text-[#9A6515] dark:text-[#E09B30] underline hover:opacity-80 cursor-pointer"
              >
                Política de Cookies
              </button>{' '}
              de teacherivan.com.
            </>
          ) : (
            <>
              I agree to teacherivan.com&apos;s{' '}
              <button
                type="button"
                id={`auth-open-privacy-link-${idSuffix}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openLegalModal('privacy');
                }}
                className="font-bold text-[#9A6515] dark:text-[#E09B30] underline hover:opacity-80 cursor-pointer"
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button
                type="button"
                id={`auth-open-cookies-link-${idSuffix}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openLegalModal('cookies');
                }}
                className="font-bold text-[#9A6515] dark:text-[#E09B30] underline hover:opacity-80 cursor-pointer"
              >
                Cookie Policy
              </button>
              .
            </>
          )}
        </span>
      </label>
    </div>
  );

  return (
    <div
      id="student-auth-modal-backdrop"
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#091326]/80 backdrop-blur-md overflow-hidden overscroll-contain animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          closeAuthModal();
        }
      }}
    >
      <div
        id="student-auth-modal-card"
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[88dvh] overflow-y-auto overscroll-contain rounded-[var(--radius-container)] p-5 sm:p-6 pb-6 sm:pb-8 box-border bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-hairline)] shadow-2xl flex flex-col my-auto transition-colors duration-200"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)] text-[var(--text-primary)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E09B30]/20 border border-[#E09B30] flex items-center justify-center text-[#E09B30]">
              <Sparkles size={18} />
            </div>
            <div>
              <h2
                id="auth-modal-title"
                className="font-montserrat font-extrabold text-base sm:text-lg tracking-tight leading-snug text-[var(--text-primary)]"
              >
                {isRecoverMode
                  ? t.authModal.titleRecover
                  : isSignInMode
                  ? t.authModal.titleSignIn
                  : step === 1
                  ? t.authModal.step1Title
                  : t.authModal.step2Title}
              </h2>
              <p className="text-[11px] font-inter text-[var(--text-secondary)]">Teacher Ivan • English Classes</p>
            </div>
          </div>

          <button
            id="close-auth-modal-btn"
            type="button"
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-[var(--bg-sunken)] hover:bg-[#E09B30]/20 text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          id="student-auth-modal-body"
          data-lenis-prevent
          className="pt-4 space-y-4"
        >
          {/* Custom Banner if opened from locked feature */}
          {authModalBanner && (
            <div
              id="auth-modal-tier-banner"
              className="p-3.5 rounded-2xl bg-[#E09B30]/15 border border-[#E09B30] text-xs font-montserrat font-bold text-[var(--text-primary)] flex items-center gap-2.5 shadow-sm"
            >
              <Sparkles size={16} className="text-[#E09B30] shrink-0" />
              <span>{authModalBanner}</span>
            </div>
          )}

          {/* Mode Switcher Tabs (Sign Up vs Sign In) */}
          {!isCompletingProfile && !isRecoverMode && (
            <div className="flex rounded-2xl bg-[var(--bg-sunken)] p-1 border border-[var(--border-hairline)]">
              <button
                type="button"
                id="auth-tab-signup"
                onClick={() => {
                  setValidationError(null);
                  setStep(1);
                  openAuthModal('signup');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  !isSignInMode
                    ? 'bg-[#E09B30] text-[#1A3153] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t.authModal.tabSignUp}
              </button>
              <button
                type="button"
                id="auth-tab-signin"
                onClick={() => {
                  setValidationError(null);
                  openAuthModal('signin');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isSignInMode
                    ? 'bg-[#E09B30] text-[#1A3153] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t.authModal.tabSignIn}
              </button>
            </div>
          )}

          {/* Stepper Indicator for Sign Up */}
          {!isSignInMode && !isRecoverMode && (
            <div className="flex items-center justify-between gap-2 px-1">
              <div
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  step >= 1 ? 'bg-[#E09B30]' : 'bg-[var(--border-hairline)]'
                }`}
              />
              <span className="text-[11px] font-montserrat font-bold text-[var(--text-secondary)]">
                {step === 1 ? '1 / 2' : '2 / 2'}
              </span>
              <div
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  step === 2 ? 'bg-[#E09B30]' : 'bg-[var(--border-hairline)]'
                }`}
              />
            </div>
          )}

          {/* Validation or API Error Alert */}
          {(validationError || error) && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* RECOVER PASSWORD VIEW                                                     */}
          {/* ========================================================================= */}
          {isRecoverMode ? (
            <form onSubmit={handleRecoverPasswordSubmit} className="space-y-4">
              {recoverSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-montserrat font-bold">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{recoverSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoverSuccess(null);
                      openAuthModal('signin');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1A3153] text-[#FAFAFA] font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-[#091326] cursor-pointer"
                  >
                    {t.authModal.backToSignIn}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs font-inter text-[var(--text-secondary)] leading-relaxed">
                    {t.authModal.subtitleRecover}
                  </p>

                  <div>
                    <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                      {t.authModal.usernameLabel} <span className="text-[#E09B30]">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      <input
                        type="text"
                        id="auth-recover-username-input"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        value={recoverUsername}
                        onChange={(e) => setRecoverUsername(e.target.value)}
                        placeholder={t.authModal.usernamePlaceholder}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                      {t.authModal.verificationContactLabel} <span className="text-[#E09B30]">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      <input
                        type="text"
                        id="auth-recover-contact-input"
                        required
                        value={recoverContact}
                        onChange={(e) => setRecoverContact(e.target.value)}
                        placeholder={t.authModal.verificationContactPlaceholder}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                      {t.authModal.newPasswordLabel} <span className="text-[#E09B30]">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      <input
                        type="password"
                        id="auth-recover-newpassword-input"
                        required
                        minLength={6}
                        value={recoverNewPassword}
                        onChange={(e) => setRecoverNewPassword(e.target.value)}
                        placeholder={t.authModal.newPasswordPlaceholder}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="auth-recover-submit-btn"
                    disabled={isLoading}
                    className="w-full mt-2 py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#ECAA41] transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{isEs ? 'Restableciendo...' : 'Resetting...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>{t.authModal.submitRecover}</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <a
                      id="auth-recover-whatsapp-link"
                      href={buildWhatsAppUrl(
                        isEs
                          ? '¡Hola Teacher Ivan! Necesito ayuda para recuperar mi cuenta en teacherivan.com.'
                          : 'Hi Teacher Ivan! I need help recovering my account on teacherivan.com.'
                      )}
                      onClick={() => handleWhatsAppClick('auth')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#9A6515] dark:text-[#E09B30] hover:underline font-semibold block"
                    >
                      {t.authModal.whatsappHelp}
                    </a>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      id="auth-recover-back-btn"
                      onClick={() => {
                        setValidationError(null);
                        openAuthModal('signin');
                      }}
                      className="text-xs text-[var(--text-secondary)] hover:text-[#9A6515] dark:hover:text-[#E09B30] hover:underline font-semibold cursor-pointer"
                    >
                      {t.authModal.backToSignIn}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : isSignInMode ? (
            /* ========================================================================= */
            /* SIGN IN FORM                                                              */
            /* ========================================================================= */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                  {t.authModal.usernameLabel} <span className="text-[#E09B30]">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    id="auth-signin-username-input"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.authModal.usernamePlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                  {t.authModal.passwordLabel} <span className="text-[#E09B30]">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="password"
                    id="auth-signin-password-input"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.authModal.passwordPlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="auth-signin-submit-btn"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#ECAA41] transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{isEs ? 'Verificando...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{t.authModal.submitSignIn}</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  id="auth-forgot-password-link"
                  onClick={() => {
                    setValidationError(null);
                    setRecoverSuccess(null);
                    setRecoverUsername(username || '');
                    openAuthModal('recover_password');
                  }}
                  className="text-xs text-[var(--text-secondary)] hover:text-[#9A6515] dark:hover:text-[#E09B30] hover:underline font-semibold cursor-pointer"
                >
                  {t.authModal.forgotPassword}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="text-xs text-[#9A6515] dark:text-[#E09B30] hover:underline font-semibold cursor-pointer"
                >
                  {t.authModal.needAccount}
                </button>
              </div>
            </form>
          ) : step === 1 ? (
            /* ========================================================================= */
            /* STEP 1: ACCOUNT CREDENTIALS + MANDATORY PRIVACY/COOKIE CONSENT            */
            /* ========================================================================= */
            <form onSubmit={handleProceedToStep2} className="space-y-3.5">
              {/* Google Identity Services Button */}
              <div className="space-y-3 mb-2">
                <div
                  ref={googleBtnContainerRef}
                  id="google-signin-btn-container"
                  className="w-full flex justify-center min-h-[44px]"
                />
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[var(--border-hairline)]" />
                  <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    {t.authModal.orDivider}
                  </span>
                  <div className="flex-1 h-px bg-[var(--border-hairline)]" />
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                    {t.authModal.usernameLabel} <span className="text-[#E09B30]">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      id="auth-username-input"
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t.authModal.usernamePlaceholder}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                    {t.authModal.passwordLabel} <span className="text-[#E09B30]">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                      type="password"
                      id="auth-password-input"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.authModal.passwordPlaceholder}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                    />
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                  {t.authModal.fullNameLabel} <span className="text-[#E09B30]">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    id="auth-full-name-input"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.authModal.fullNamePlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                  {t.authModal.emailLabel} <span className="text-[#E09B30]">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="email"
                    id="auth-email-input"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.authModal.emailPlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                  {t.authModal.phoneLabel} <span className="text-[#E09B30]">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="tel"
                    id="auth-phone-input"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t.authModal.phonePlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              {/* Date of Birth & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                    {t.authModal.dobLabel} <span className="text-[#E09B30]">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                      type="date"
                      id="auth-dob-input"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-10 pr-2.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                    {t.authModal.countryLabel} <span className="text-[#E09B30]">*</span>
                  </label>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <select
                      id="auth-country-select"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value as SupportedCountry)}
                      className="w-full pl-10 pr-2.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30] cursor-pointer"
                    >
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c === 'Bolivia'
                            ? 'Bolivia (BO)'
                            : c === 'Mexico'
                            ? 'Mexico (MX)'
                            : c === 'Colombia'
                            ? 'Colombia (CO)'
                            : c === 'Peru'
                            ? 'Peru (PE)'
                            : c === 'Argentina'
                            ? 'Argentina (AR)'
                            : c === 'Chile'
                            ? 'Chile (CL)'
                            : c === 'Spain'
                            ? 'Spain (ES)'
                            : c === 'USA'
                            ? 'United States (US)'
                            : 'Other (Global)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Mandatory Privacy & Cookie Policy Consent Checkbox */}
              {renderLegalConsentCheckbox('step1')}

              {/* Next Button: Disabled until consent checkbox is checked */}
              <button
                type="submit"
                id="auth-next-step-btn"
                disabled={!legalAccepted}
                className="w-full mt-3 py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#ECAA41] transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{t.authModal.nextGoalsBtn}</span>
                <ArrowRight size={15} />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="text-xs text-[#9A6515] dark:text-[#E09B30] hover:underline font-semibold cursor-pointer"
                >
                  {t.authModal.alreadyRegistered}
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* STEP 2: LEARNING GOALS & CEFR TARGET WIZARD                               */
            /* ========================================================================= */
            <form onSubmit={handleFinalRegisterSubmit} className="space-y-4">
              {!isCompletingProfile && (
                <button
                  type="button"
                  id="auth-back-step1-btn"
                  onClick={() => setStep(1)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-montserrat font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>{t.authModal.backBtn}</span>
                </button>
              )}

              {/* If Google First-Time Profile Completion, also allow phone/country input */}
              {(isCompletingProfile || pendingGoogleProfile) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                      {t.authModal.phoneLabel} <span className="text-[#E09B30]">*</span>
                    </label>
                    <input
                      type="tel"
                      id="auth-google-phone-input"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={t.authModal.phonePlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
                      {t.authModal.dobLabel} <span className="text-[#E09B30]">*</span>
                    </label>
                    <input
                      type="date"
                      id="auth-google-dob-input"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30]"
                    />
                  </div>
                </div>
              )}

              {/* 1. Current / Target CEFR Level */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                  <Award size={14} className="text-[#E09B30]" />
                  <span>{t.mandatoryGoalsModal.levelLabel}</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {CEFR_LEVELS.map((lvl) => {
                    const isSelected = targetLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTargetLevel(lvl)}
                        className={`py-2 px-2 rounded-xl border text-xs font-montserrat font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#1A3153] dark:bg-[#1E3A5F] text-[#E09B30] border-[#E09B30] shadow-sm ring-1 ring-[#E09B30]'
                            : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:bg-[var(--bg-sunken)]'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Primary Learning Goal */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                  <Compass size={14} className="text-[#E09B30]" />
                  <span>{t.mandatoryGoalsModal.primaryGoalLabel}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {PRIMARY_GOALS.map((goal) => {
                    const isSelected = primaryGoal === goal;
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setPrimaryGoal(goal)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-montserrat font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#1A3153] dark:bg-[#1E3A5F] text-[#FAFAFA] border-[#E09B30] shadow-sm ring-1 ring-[#E09B30]'
                            : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:bg-[var(--bg-sunken)]'
                        }`}
                      >
                        <span className="truncate">{goal}</span>
                        {isSelected && <CheckCircle2 size={14} className="text-[#E09B30] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Priority Skill Focus */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-[#E09B30]" />
                  <span>{t.mandatoryGoalsModal.focusSkillLabel}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {FOCUS_SKILLS.map((skill) => {
                    const isSelected = focusSkill === skill;
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => setFocusSkill(skill)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-montserrat font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#1A3153] dark:bg-[#1E3A5F] text-[#FAFAFA] border-[#E09B30] shadow-sm ring-1 ring-[#E09B30]'
                            : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:bg-[var(--bg-sunken)]'
                        }`}
                      >
                        <span className="truncate">{skill}</span>
                        {isSelected && <CheckCircle2 size={14} className="text-[#E09B30] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Specific Personal Goal */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                  <Target size={14} className="text-[#E09B30]" />
                  <span>{t.mandatoryGoalsModal.personalObjectiveLabel}</span>
                  <span className="text-[#E09B30]">*</span>
                </label>
                <textarea
                  id="auth-personal-objective-input"
                  required
                  rows={2}
                  value={personalObjective}
                  onChange={(e) => setPersonalObjective(e.target.value)}
                  placeholder={
                    isEs
                      ? 'ej., Preparar mi entrevista de beca internacional / Pasar entrevistas técnicas'
                      : 'e.g., Prepare for my international scholarship interview / Pass tech interviews'
                  }
                  className="w-full p-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30] leading-relaxed"
                />
              </div>

              {/* Mandatory Privacy & Cookie Policy Consent Checkbox */}
              {renderLegalConsentCheckbox('step2')}

              {/* Complete Registration Button */}
              <button
                type="submit"
                id="submit-auth-form-btn"
                disabled={isLoading || !personalObjective.trim() || !legalAccepted}
                className="w-full mt-2 py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#ECAA41] transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{isEs ? 'Creando cuenta y plan...' : 'Creating account & plan...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>{t.authModal.completeRegistrationBtn}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAuthModal;
