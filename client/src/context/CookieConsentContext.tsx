import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  COOKIE_CONSENT_STORAGE_KEY,
  CookieConsentRecord,
  getStoredCookieConsent,
  applyGa4ConsentState,
} from '../utils/analytics';

export type LegalModalTab = 'privacy' | 'cookies' | null;

export interface CookieConsentContextValue {
  consent: CookieConsentRecord | null;
  isBannerVisible: boolean;
  isPreferencesModalOpen: boolean;
  activeLegalModal: LegalModalTab;
  acceptAllCookies: () => void;
  acceptEssentialOnly: () => void;
  saveCustomConsent: (analytics: boolean) => void;
  openCookiePreferences: () => void;
  closeCookiePreferences: () => void;
  openLegalModal: (tab: 'privacy' | 'cookies') => void;
  closeLegalModal: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<CookieConsentRecord | null>(() => getStoredCookieConsent());
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(() => getStoredCookieConsent() === null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState<boolean>(false);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalTab>(null);

  // Sync GA4 state with stored consent on mount and whenever consent changes
  useEffect(() => {
    if (consent) {
      applyGa4ConsentState(consent.analytics);
    } else {
      applyGa4ConsentState(false);
    }
  }, [consent]);

  // Listen to URL hash (#privacy / #cookies) so direct links work on GitHub Pages
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#privacy' || hash === '#/privacy') {
        setActiveLegalModal('privacy');
      } else if (hash === '#cookies' || hash === '#/cookies') {
        setActiveLegalModal('cookies');
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const persistConsent = useCallback((analytics: boolean) => {
    const record: CookieConsentRecord = {
      essential: true,
      analytics,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
    } catch {}
    setConsent(record);
    setIsBannerVisible(false);
    setIsPreferencesModalOpen(false);
    applyGa4ConsentState(analytics);
  }, []);

  const acceptAllCookies = useCallback(() => {
    persistConsent(true);
  }, [persistConsent]);

  const acceptEssentialOnly = useCallback(() => {
    persistConsent(false);
  }, [persistConsent]);

  const saveCustomConsent = useCallback(
    (analytics: boolean) => {
      persistConsent(analytics);
    },
    [persistConsent]
  );

  const openCookiePreferences = useCallback(() => {
    setIsPreferencesModalOpen(true);
  }, []);

  const closeCookiePreferences = useCallback(() => {
    setIsPreferencesModalOpen(false);
  }, []);

  const openLegalModal = useCallback((tab: 'privacy' | 'cookies') => {
    setActiveLegalModal(tab);
  }, []);

  const closeLegalModal = useCallback(() => {
    setActiveLegalModal(null);
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#privacy' || hash === '#/privacy' || hash === '#cookies' || hash === '#/cookies') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        isBannerVisible,
        isPreferencesModalOpen,
        activeLegalModal,
        acceptAllCookies,
        acceptEssentialOnly,
        saveCustomConsent,
        openCookiePreferences,
        closeCookiePreferences,
        openLegalModal,
        closeLegalModal,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return ctx;
}
