/**
 * Official Teacher Ivan Contact Configuration
 *
 * Centralized contact constants for WhatsApp, phone, and messaging across
 * the entire Teacher Ivan platform.
 */

export const TEACHER_PHONE = '+591 72878330';
export const TEACHER_PHONE_CLEAN = '59172878330';
export const WHATSAPP_BASE_URL = 'https://wa.me/59172878330';

/**
 * Generates an official WhatsApp click-to-chat URL with an optional pre-filled message.
 * @param message Optional message to encode into the query string
 * @returns Fully qualified https://wa.me/59172878330?text=... URL
 */
export function getWhatsAppUrl(message?: string): string {
  if (!message || !message.trim()) {
    return WHATSAPP_BASE_URL;
  }
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message.trim())}`;
}
