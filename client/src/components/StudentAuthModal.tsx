import React, { useState, useEffect } from 'react';
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
  KeyRound,
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
import { getEnvVar, getApiUrl } from '../config/api';

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

  const { t, isEs } = useTranslation();
  const setPersonalizedSprint = useSprintStore((s) => s.setPersonalizedSprint);
  const setActiveView = useNavigationStore((s) => s.setActiveView);

  // Wizard Step (1: Account Credentials, 2: Learning Goals)
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 Form fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState<SupportedCountry | ''>('Bolivia');

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

  if (!isAuthModalOpen) return null;

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
          dateOfBirth,
          country,
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

      // Automatically navigate to My Path tab
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

  const handleGoogleClick = async () => {
    setValidationError(null);
    const googleClientId = getEnvVar('VITE_GOOGLE_CLIENT_ID');

    if (googleClientId && typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
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
                const gEmail = gData.email;
                const gName = gData.name || gData.given_name || 'Student';

                setFullName(gName);
                setEmail(gEmail);
                setStep(2);
              } catch (decErr) {
                console.error('[Google JWT decode error]:', decErr);
              }
            }
          },
        });
        (window as any).google.accounts.id.prompt();
        return;
      } catch (gErr) {
        console.warn('[Google Identity Services warning]:', gErr);
      }
    }

    // Direct Google prompt fallback
    const promptEmail = window.prompt(
      isEs ? 'Ingresa tu correo de Google (Gmail):' : 'Enter your Google (Gmail) email address:',
      email || 'student@gmail.com'
    );

    if (promptEmail && promptEmail.includes('@')) {
      const promptName = window.prompt(
        isEs ? 'Confirma tu nombre completo:' : 'Confirm your full name:',
        fullName || 'Student'
      );
      setFullName((promptName || 'Student').trim());
      setEmail(promptEmail.trim());
      setStep(2);
    }
  };

  return (
    <div
      id="student-auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A3153]/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
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
        className="relative w-full max-w-md max-h-[88dvh] overflow-y-auto rounded-2xl p-5 box-border bg-[#FAFAFA] text-[#1A3153] border-2 border-[#A7C7E7] shadow-2xl flex flex-col my-auto"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#A7C7E7]/30 text-[#1A3153]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E09B30]/20 border border-[#E09B30] flex items-center justify-center text-[#E09B30]">
              <Sparkles size={18} />
            </div>
            <div>
              <h2
                id="auth-modal-title"
                className="font-montserrat font-extrabold text-base sm:text-lg tracking-tight leading-snug text-[#1A3153]"
              >
                {isRecoverMode
                  ? t.authModal.titleRecover
                  : isSignInMode
                  ? t.authModal.titleSignIn
                  : step === 1
                  ? t.authModal.step1Title
                  : t.authModal.step2Title}
              </h2>
              <p className="text-[11px] text-[#4A5568]">Teacher Ivan • English Classes</p>
            </div>
          </div>

          <button
            id="close-auth-modal-btn"
            type="button"
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-[#1A3153]/10 hover:bg-[#1A3153]/20 text-[#1A3153] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="pt-4 overflow-y-auto space-y-4">
          {/* Custom Banner if opened from locked feature */}
          {authModalBanner && (
            <div
              id="auth-modal-tier-banner"
              className="p-3.5 rounded-2xl bg-[#E09B30]/15 border border-[#E09B30] text-xs font-montserrat font-bold text-[#1A3153] flex items-center gap-2.5 shadow-sm"
            >
              <Sparkles size={16} className="text-[#E09B30] shrink-0" />
              <span>{authModalBanner}</span>
            </div>
          )}

          {/* Mode Switcher Tabs (Sign Up vs Sign In) - Hidden in Recover & Google Complete Profile */}
          {!isCompletingProfile && !isRecoverMode && (
            <div className="flex rounded-2xl bg-[#1A3153]/10 p-1 border border-[#A7C7E7]/30">
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
                    : 'text-[#4A5568] hover:text-[#1A3153]'
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
                    : 'text-[#4A5568] hover:text-[#1A3153]'
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
                  step >= 1 ? 'bg-[#E09B30]' : 'bg-[#A7C7E7]/40'
                }`}
              />
              <span className="text-[11px] font-montserrat font-bold text-[#4A5568]">
                {step === 1 ? '1 / 2' : '2 / 2'}
              </span>
              <div
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  step === 2 ? 'bg-[#E09B30]' : 'bg-[#A7C7E7]/40'
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
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1A3153] text-[#FAFAFA] font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-[#12223a] cursor-pointer"
                  >
                    {t.authModal.backToSignIn}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-[#4A5568] leading-relaxed">
                    {t.authModal.subtitleRecover}
                  </p>

                  <div>
                    <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                      {t.authModal.usernameLabel} <span className="text-[#E09B30]">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                      <input
                        type="text"
                        id="auth-recover-username-input"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        value={recoverUsername}
                        onChange={(e) => setRecoverUsername(e.target.value)}
                        placeholder={t.authModal.usernamePlaceholder}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                      {t.authModal.verificationContactLabel} <span className="text-[#E09B30]">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                      <input
                        type="text"
                        id="auth-recover-contact-input"
                        required
                        value={recoverContact}
                        onChange={(e) => setRecoverContact(e.target.value)}
                        placeholder={t.authModal.verificationContactPlaceholder}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                      {t.authModal.newPasswordLabel} <span className="text-[#E09B30]">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                      <input
                        type="password"
                        id="auth-recover-newpassword-input"
                        required
                        minLength={6}
                        value={recoverNewPassword}
                        onChange={(e) => setRecoverNewPassword(e.target.value)}
                        placeholder={t.authModal.newPasswordPlaceholder}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="auth-recover-submit-btn"
                    disabled={isLoading}
                    className="w-full mt-2 py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 shadow-md shadow-[#E09B30]/25 flex items-center justify-center gap-2 cursor-pointer"
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
                      href="https://wa.me/59172878330?text=Hola%20Teacher%20Ivan,%20necesito%20ayuda%20para%20recuperar%20mi%20cuenta"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#10b981] hover:underline font-semibold block"
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
                      className="text-xs text-[#4A5568] hover:text-[#1A3153] hover:underline font-semibold cursor-pointer"
                    >
                      {t.authModal.backToSignIn}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : isSignInMode ? (
            /* ========================================================================= */
            /* SIGN IN FORM (ONLY Username and Password)                                 */
            /* ========================================================================= */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                  {t.authModal.usernameLabel} <span className="text-[#E09B30]">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                  <input
                    type="text"
                    id="auth-signin-username-input"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.authModal.usernamePlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                  {t.authModal.passwordLabel} <span className="text-[#E09B30]">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                  <input
                    type="password"
                    id="auth-signin-password-input"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.authModal.passwordPlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="auth-signin-submit-btn"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 shadow-md shadow-[#E09B30]/25 flex items-center justify-center gap-2 cursor-pointer"
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

              {/* Forgot password link directly underneath */}
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
                  className="text-xs text-[#4A5568] hover:text-[#E09B30] hover:underline font-semibold cursor-pointer"
                >
                  {t.authModal.forgotPassword}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="text-xs text-[#E09B30] hover:underline font-semibold cursor-pointer"
                >
                  {t.authModal.needAccount}
                </button>
              </div>
            </form>
          ) : step === 1 ? (
            /* ========================================================================= */
            /* STEP 1: ACCOUNT CREDENTIALS (Username, Password, Name, Email, Phone, etc) */
            /* ========================================================================= */
            <form onSubmit={handleProceedToStep2} className="space-y-3.5">
              {/* Google One-Tap Action */}
              <div className="space-y-3 mb-2">
                <button
                  type="button"
                  id="continue-with-google-btn"
                  disabled={isLoading}
                  onClick={handleGoogleClick}
                  className="w-full py-3 px-4 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] hover:bg-slate-50 text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>{t.authModal.googleBtn}</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#A7C7E7]/40" />
                  <span className="text-[11px] font-medium text-[#4A5568] uppercase tracking-wider">
                    {t.authModal.orDivider}
                  </span>
                  <div className="flex-1 h-px bg-[#A7C7E7]/40" />
                </div>
              </div>

              {/* Username & Password (2-column on sm) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                    {t.authModal.usernameLabel} <span className="text-[#E09B30]">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                    <input
                      type="text"
                      id="auth-username-input"
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t.authModal.usernamePlaceholder}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                    {t.authModal.passwordLabel} <span className="text-[#E09B30]">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                    <input
                      type="password"
                      id="auth-password-input"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.authModal.passwordPlaceholder}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                    />
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                  {t.authModal.fullNameLabel} <span className="text-[#E09B30]">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                  <input
                    type="text"
                    id="auth-full-name-input"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.authModal.fullNamePlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                  {t.authModal.emailLabel} <span className="text-[#E09B30]">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                  <input
                    type="email"
                    id="auth-email-input"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.authModal.emailPlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                  {t.authModal.phoneLabel} <span className="text-[#E09B30]">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                  <input
                    type="tel"
                    id="auth-phone-input"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t.authModal.phonePlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              {/* Date of Birth & Country (2-column on sm) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                    {t.authModal.dobLabel} <span className="text-[#E09B30]">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                    <input
                      type="date"
                      id="auth-dob-input"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-10 pr-2.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                    {t.authModal.countryLabel} <span className="text-[#E09B30]">*</span>
                  </label>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                    <select
                      id="auth-country-select"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value as SupportedCountry)}
                      className="w-full pl-10 pr-2.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30] cursor-pointer"
                    >
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c === 'Bolivia' ? '🇧🇴 Bolivia' :
                           c === 'Mexico' ? '🇲🇽 Mexico' :
                           c === 'Colombia' ? '🇨🇴 Colombia' :
                           c === 'Peru' ? '🇵🇪 Peru' :
                           c === 'Argentina' ? '🇦🇷 Argentina' :
                           c === 'Chile' ? '🇨🇱 Chile' :
                           c === 'Spain' ? '🇪🇸 Spain' :
                           c === 'USA' ? '🇺🇸 United States' :
                           '🌐 Other'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Button: Next: Set Your English Goal → */}
              <button
                type="submit"
                id="auth-next-step-btn"
                className="w-full mt-3 py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 shadow-md shadow-[#E09B30]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.authModal.nextGoalsBtn}</span>
                <ArrowRight size={15} />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="text-xs text-[#E09B30] hover:underline font-semibold cursor-pointer"
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
              {/* Back to Step 1 Button */}
              <button
                type="button"
                id="auth-back-step1-btn"
                onClick={() => setStep(1)}
                className="text-xs text-[#4A5568] hover:text-[#1A3153] font-montserrat font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>{t.authModal.backBtn}</span>
              </button>

              {/* 1. Current / Target CEFR Level */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1.5 flex items-center gap-1.5">
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
                            ? 'bg-[#1A3153] text-[#E09B30] border-[#E09B30] shadow-sm ring-1 ring-[#E09B30]'
                            : 'bg-[#FAFAFA] text-[#1A3153] border-[#A7C7E7]/60 hover:bg-slate-100'
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
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1.5 flex items-center gap-1.5">
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
                            ? 'bg-[#1A3153] text-[#FAFAFA] border-[#E09B30] shadow-sm ring-1 ring-[#E09B30]'
                            : 'bg-[#FAFAFA] text-[#1A3153] border-[#A7C7E7]/60 hover:bg-slate-100'
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
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1.5 flex items-center gap-1.5">
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
                            ? 'bg-[#1A3153] text-[#FAFAFA] border-[#E09B30] shadow-sm ring-1 ring-[#E09B30]'
                            : 'bg-[#FAFAFA] text-[#1A3153] border-[#A7C7E7]/60 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{skill}</span>
                        {isSelected && <CheckCircle2 size={14} className="text-[#E09B30] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Specific Personal Goal (Required Input) */}
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1 flex items-center gap-1.5">
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
                  className="w-full p-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30] leading-relaxed"
                />
              </div>

              {/* Complete Registration Button */}
              <button
                type="submit"
                id="submit-auth-form-btn"
                disabled={isLoading || !personalObjective.trim()}
                className="w-full mt-2 py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 shadow-md shadow-[#E09B30]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

          <p className="text-[11px] text-center text-[#4A5568]/80 pt-1">
            {t.authModal.termsNote}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentAuthModal;
