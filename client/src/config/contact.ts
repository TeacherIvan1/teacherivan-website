/**
 * Official Teacher Ivan Contact Configuration
 *
 * Centralized contact constants for WhatsApp, phone, and messaging across
 * the entire Teacher Ivan platform. Always returns a pre-filled `text=` query string.
 */

import {
  OFFICIAL_WHATSAPP_NUMBER,
  OFFICIAL_WHATSAPP_DISPLAY,
  OFFICIAL_WHATSAPP_BASE,
  buildWhatsAppUrl,
  getGeneralWhatsAppUrl,
} from '../utils/whatsapp';

export const TEACHER_PHONE = OFFICIAL_WHATSAPP_DISPLAY;
export const TEACHER_PHONE_CLEAN = OFFICIAL_WHATSAPP_NUMBER;
export const WHATSAPP_BASE_URL = OFFICIAL_WHATSAPP_BASE;

/**
 * Generates an official WhatsApp click-to-chat URL with a pre-filled message.
 * If no custom message is passed, uses the official default inquiry message.
 */
export function getWhatsAppUrl(message?: string, lang: 'es' | 'en' = 'es'): string {
  if (!message || !message.trim()) {
    return getGeneralWhatsAppUrl(lang);
  }
  return buildWhatsAppUrl(message);
}
