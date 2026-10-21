import React, { useState, useEffect } from 'react';
import { X, Sparkles, User, Mail, Calendar, Globe, AlertCircle, Loader2, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import { useAuthStore } from '../modules/auth/authStore';
import { SUPPORTED_COUNTRIES, SupportedCountry } from '../modules/auth/types';
import { useTranslation } from '../modules/i18n/languageStore';
import { getEnvVar } from '../config/api';

export const StudentAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    pendingGoogleProfile,
    isLoading,
    error,
    closeAuthModal,
    openAuthModal,
    registerWithEmail,
    authenticateWithGoogle,
    loginWithCredentials,
  } = useAuthStore();

  const { t, isEs } = useTranslation();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState<SupportedCountry | ''>('Bolivia');
  const [validationError, setValidationError] = useState<string | null>(null);

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
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const isCompletingProfile = authModalMode === 'complete_google_profile';
  const isSignInMode = authModalMode === 'signin';

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setValidationError(isEs ? 'Por favor ingresa tu nombre completo.' : 'Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setValidationError(isEs ? 'Por favor ingresa un correo electrónico válido.' : 'Please enter a valid email address.');
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

    try {
      if (isCompletingProfile || pendingGoogleProfile) {
        await authenticateWithGoogle({
          email: trimmedEmail,
          fullName: trimmedName,
          dateOfBirth,
          country,
        });
      } else {
        await registerWithEmail({
          fullName: trimmedName,
          email: trimmedEmail,
          dateOfBirth,
          country,
        });
      }
    } catch {
      // Error handled in store
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setValidationError(isEs ? 'Por favor ingresa un correo válido.' : 'Please enter a valid email.');
      return;
    }

    try {
      await loginWithCredentials({
        email: trimmedEmail,
        password: password ? password.trim() : undefined,
      });
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
                await authenticateWithGoogle({
                  email: gData.email,
                  fullName: gData.name || gData.given_name || 'Student',
                });
              } catch (decErr) {
                console.error('[Google JWT decode error]:', decErr);
              }
            }
          },
        });
        (window as any).google.accounts.id.prompt();
        return;
      } catch (gErr) {
        console.warn('[Google Identity Services warning, falling back to direct prompt]:', gErr);
      }
    }

    // Direct Google Account Selector / Email prompt fallback
    const promptEmail = window.prompt(
      isEs
        ? 'Ingresa tu correo de Google (Gmail):'
        : 'Enter your Google (Gmail) email address:',
      email || 'student@gmail.com'
    );

    if (promptEmail && promptEmail.includes('@')) {
      const promptName = window.prompt(
        isEs ? 'Confirma tu nombre completo:' : 'Confirm your full name:',
        fullName || 'Student'
      );
      await authenticateWithGoogle({
        email: promptEmail.trim(),
        fullName: (promptName || 'Student').trim(),
      });
    }
  };

  return (
    <div
      id="student-auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-[#1A3153]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
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
        className="relative w-full max-w-md bg-[#FAFAFA] text-[#1A3153] border-2 border-[#A7C7E7] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1A3153] to-[#12223a] text-[#FAFAFA] border-b border-[#A7C7E7]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E09B30]/20 border border-[#E09B30] flex items-center justify-center text-[#E09B30]">
              <Sparkles size={16} />
            </div>
            <div>
              <h2
                id="auth-modal-title"
                className="font-montserrat font-extrabold text-base sm:text-lg tracking-tight leading-snug"
              >
                {isCompletingProfile
                  ? t.authModal.titleCompleteProfile
                  : isSignInMode
                  ? t.authModal.titleSignIn
                  : t.authModal.titleSignUp}
              </h2>
              <p className="text-[11px] text-[#A7C7E7]">Teacher Ivan • English Classes</p>
            </div>
          </div>

          <button
            id="close-auth-modal-btn"
            type="button"
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-[#FAFAFA]/10 hover:bg-[#FAFAFA]/20 text-[#FAFAFA] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Mode Switcher Tabs (Sign Up vs Sign In) */}
          {!isCompletingProfile && (
            <div className="flex rounded-2xl bg-[#1A3153]/10 p-1 border border-[#A7C7E7]/30">
              <button
                type="button"
                id="auth-tab-signup"
                onClick={() => {
                  setValidationError(null);
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

          <p className="font-inter text-xs text-[#4A5568] leading-relaxed">
            {isCompletingProfile
              ? t.authModal.subtitleCompleteProfile
              : isSignInMode
              ? t.authModal.subtitleSignIn
              : t.authModal.subtitleSignUp}
          </p>

          {/* Google One-Tap Action (Only in main signup mode) */}
          {!isCompletingProfile && !isSignInMode && (
            <div className="space-y-3">
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
          )}

          {/* Validation or API Error Alert */}
          {(validationError || error) && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SIGN IN FORM (Returning Students & Teacher Ivan Admin Login)              */}
          {/* ========================================================================= */}
          {isSignInMode ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                  {t.authModal.emailLabel} <span className="text-[#E09B30]">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                  <input
                    type="email"
                    id="auth-signin-email-input"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ivan@teacherivan.com or your student email"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-[#1A3153] mb-1">
                  {t.authModal.passwordLabel}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                  <input
                    type="password"
                    id="auth-signin-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.authModal.passwordPlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
                <p className="text-[10px] text-[#4A5568]/80 mt-1 flex items-center gap-1">
                  <KeyRound size={11} className="text-[#E09B30]" />
                  <span>{t.authModal.passwordAdminNote}</span>
                </p>
              </div>

              <button
                type="submit"
                id="submit-signin-form-btn"
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

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="text-xs text-[#E09B30] hover:underline font-semibold cursor-pointer"
                >
                  {t.authModal.needAccount}
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* REGISTRATION / PROFILE COMPLETION FORM                                    */
            /* ========================================================================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                    disabled={Boolean(pendingGoogleProfile?.email)}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.authModal.emailPlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30] disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Date of Birth (<input type="date" />) */}
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30]"
                  />
                </div>
              </div>

              {/* Country Selector Dropdown */}
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#A7C7E7] bg-[#FAFAFA] text-[#1A3153] text-xs font-inter focus:outline-none focus:border-[#E09B30] focus:ring-1 focus:ring-[#E09B30] cursor-pointer"
                  >
                    <option value="" disabled>
                      {t.authModal.selectCountry}
                    </option>
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

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-auth-form-btn"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 shadow-md shadow-[#E09B30]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{isEs ? 'Procesando...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>
                      {isCompletingProfile
                        ? t.authModal.submitCompleteProfile
                        : t.authModal.submitSignUp}
                    </span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="text-xs text-[#E09B30] hover:underline font-semibold cursor-pointer"
                >
                  {t.authModal.alreadyRegistered}
                </button>
              </div>
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
