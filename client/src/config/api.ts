/**
 * Application API and WebSocket configuration.
 *
 * In production (e.g. deployed to https://teacherivan.com on GitHub Pages),
 * the frontend connects to the deployed Express backend configured via:
 *   - VITE_API_URL: e.g. "https://api.teacherivan.com" (or your deployed backend host)
 *   - VITE_WS_URL: Optional WebSocket URL (if using a custom proxy/gateway for Live API)
 *
 * In local development:
 *   - VITE_API_URL falls back to "http://localhost:3001"
 *   - Live WebSocket connects directly to Google Gemini Live API with the minted ephemeral token
 */

/**
 * Universal environment variable accessor safe in Vite browser, SSR, and Node.js test runners.
 */
export function getEnvVar(key: string): string | undefined {
  try {
    // Vite / modern browser environment
    if (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env) {
      const val = (import.meta as unknown as { env: Record<string, string> }).env[key];
      if (typeof val === 'string' && val.trim() !== '') return val.trim();
    }
  } catch {
    // Ignore meta access error in non-module environments
  }

  try {
    // Node.js test environment
    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[key];
      if (typeof val === 'string' && val.trim() !== '') return val.trim();
    }
  } catch {
    // Ignore process access error
  }

  return undefined;
}

const envApiUrl = getEnvVar('VITE_API_URL');

export const API_BASE_URL: string = (
  envApiUrl || 'http://localhost:3001'
).replace(/\/+$/, '');

/**
 * Returns a fully qualified URL for an API endpoint.
 * Handles paths with or without leading slashes.
 * e.g. getApiUrl('/api/token') -> 'https://api.teacherivan.com/api/token' (or 'http://localhost:3001/api/token')
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

/**
 * Returns the WebSocket endpoint for Gemini Live API session.
 * If VITE_WS_URL or VITE_LIVE_WS_URL is configured, uses that base URL.
 * Otherwise, defaults to the official Gemini Live API WebSocket endpoint.
 */
export function getLiveWebSocketUrl(token: string): string {
  const envWsUrl = getEnvVar('VITE_WS_URL') || getEnvVar('VITE_LIVE_WS_URL');
  if (envWsUrl) {
    const base = envWsUrl.replace(/\/+$/, '');
    return base.includes('access_token=') ? base : `${base}?access_token=${token}`;
  }

  return `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token=${token}`;
}
