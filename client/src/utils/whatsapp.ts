/**
 * Centralized Pre-Filled WhatsApp Inquiry Links (`+591 72878330`)
 * Path: client/src/utils/whatsapp.ts
 * -------------------------------------------------------------
 * Official Number: 59172878330
 * Automatically URL-encodes pre-filled bilingual messages and wires GA4 `whatsapp_click` tracking.
 */

import { trackEvent } from './analytics';

export const OFFICIAL_WHATSAPP_NUMBER = '59172878330';
export const OFFICIAL_WHATSAPP_DISPLAY = '+591 72878330';
export const OFFICIAL_WHATSAPP_BASE = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}`;

export type WhatsAppSource = 'hero' | 'pricing' | 'footer' | 'portal' | 'report' | 'auth';
export type PlanTierId = 'essential' | 'pro' | 'executive';

/**
 * Builds a properly URL-encoded `https://wa.me/59172878330?text=...` URL.
 */
export function buildWhatsAppUrl(message: string): string {
  const cleanText = message.trim();
  return `${OFFICIAL_WHATSAPP_BASE}?text=${encodeURIComponent(cleanText)}`;
}

/**
 * Default General Inquiry URL (`ES` / `EN`)
 */
export function getGeneralWhatsAppUrl(lang: 'es' | 'en' = 'es'): string {
  const text =
    lang === 'es'
      ? '¡Hola Teacher Ivan! Vi tu plataforma teacherivan.com y me gustaría recibir más información sobre los planes y clases de inglés.'
      : 'Hi Teacher Ivan! I visited teacherivan.com and would like more information about the English plans and 1-on-1 classes.';
  return buildWhatsAppUrl(text);
}

/**
 * Plan-Specific Inquiry URL (`Essential 300 BOB`, `Pro 580 BOB`, `Executive 850 BOB`)
 */
export function getPlanWhatsAppUrl(
  plan: PlanTierId,
  lang: 'es' | 'en' = 'es',
  currency: 'BOB' | 'USD' = 'BOB'
): string {
  const tierLabels: Record<PlanTierId, { es: string; en: string }> = {
    essential: {
      es: currency === 'BOB' ? 'Plan Essential (300 BOB/mes)' : 'Plan Essential ($45 USD/mes)',
      en: currency === 'BOB' ? 'Essential Plan (300 BOB/mo)' : 'Essential Plan ($45 USD/mo)',
    },
    pro: {
      es:
        currency === 'BOB'
          ? 'Plan Pro (580 BOB/mes - 3 clases/sem)'
          : 'Plan Pro ($85 USD/mes - 3 clases/sem)',
      en:
        currency === 'BOB'
          ? 'Pro Plan (580 BOB/mo - 3 classes/wk)'
          : 'Pro Plan ($85 USD/mo - 3 classes/wk)',
    },
    executive: {
      es:
        currency === 'BOB'
          ? 'Plan Executive (850 BOB/mes - 5 clases/sem)'
          : 'Plan Executive ($125 USD/mes - 5 clases/sem)',
      en:
        currency === 'BOB'
          ? 'Executive Plan (850 BOB/mo - 5 classes/wk)'
          : 'Executive Plan ($125 USD/mo - 5 classes/wk)',
    },
  };

  const label = tierLabels[plan][lang];
  const text =
    lang === 'es'
      ? `¡Hola Teacher Ivan! Vi teacherivan.com y me interesa inscribirme al ${label}. ¿Podrías confirmarme disponibilidad?`
      : `Hi Teacher Ivan! I visited teacherivan.com and I'm interested in enrolling in the ${label}. Could you confirm availability?`;

  return buildWhatsAppUrl(text);
}

/**
 * Tracks a WhatsApp click event safely via consent-gated GA4.
 */
export function handleWhatsAppClick(source: WhatsAppSource, plan?: PlanTierId): void {
  trackEvent('whatsapp_click', {
    source,
    ...(plan ? { plan } : {}),
  });
}
