/**
 * Consent-Gated Google Analytics 4 (GA4) Integration
 * Path: client/src/utils/analytics.ts
 * -------------------------------------------------------------
 * STRICT CONSENT GATE:
 * - Never injects googletagmanager.com/gtag/js in index.html.
 * - Dynamically injects gtag.js ONLY AFTER consent.analytics === true.
 * - Immediately sets window['ga-disable-' + id] = true when unconsented or revoked.
 */

import { getEnvVar } from '../config/api';

export const GA4_SCRIPT_ID = 'ti-ga4-gtag-script';
export const COOKIE_CONSENT_STORAGE_KEY = 'ti_cookie_consent_v1';

export interface CookieConsentRecord {
  essential: true;
  analytics: boolean;
  timestamp: string;
}

export type ConversionEventName =
  | 'sign_up'
  | 'select_plan'
  | 'voice_tutor_launch'
  | 'whatsapp_click';

let isGa4Initialized = false;

export function getGa4MeasurementId(): string {
  return getEnvVar('VITE_GA4_MEASUREMENT_ID') || '';
}

export function getStoredCookieConsent(): CookieConsentRecord | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.essential === true && typeof parsed.analytics === 'boolean') {
      return parsed as CookieConsentRecord;
    }
  } catch {}
  return null;
}

export function isAnalyticsConsented(): boolean {
  const consent = getStoredCookieConsent();
  return Boolean(consent && consent.analytics === true);
}

/**
 * Dynamically initializes GA4 ONLY if `consent.analytics === true`.
 * If `analytics === false`, disables GA4 tracking and removes any injected script.
 */
export function applyGa4ConsentState(analyticsConsented: boolean): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const measurementId = getGa4MeasurementId();

  if (!analyticsConsented) {
    if (measurementId) {
      window[`ga-disable-${measurementId}`] = true;
    }
    const existingScript = document.getElementById(GA4_SCRIPT_ID);
    if (existingScript && existingScript.parentNode) {
      existingScript.parentNode.removeChild(existingScript);
    }
    isGa4Initialized = false;
    return;
  }

  // User explicitly consented to analytics
  if (!measurementId) {
    // Even if measurementId is empty in dev, prepare window.dataLayer safely without injecting external script
    window.dataLayer = window.dataLayer || [];
    return;
  }

  window[`ga-disable-${measurementId}`] = false;

  if (isGa4Initialized || document.getElementById(GA4_SCRIPT_ID)) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  const script = document.createElement('script');
  script.id = GA4_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
  isGa4Initialized = true;
}

/**
 * Tracks a conversion event (`sign_up`, `select_plan`, `voice_tutor_launch`, `whatsapp_click`)
 * strictly when analytics consent has been granted. Safe no-op otherwise.
 */
export function trackEvent(
  eventName: ConversionEventName,
  params: Record<string, string | number | boolean | undefined> = {}
): void {
  try {
    if (!isAnalyticsConsented()) return;
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    } else if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...params });
    }
  } catch {
    // Never block user interaction on analytics error
  }
}
