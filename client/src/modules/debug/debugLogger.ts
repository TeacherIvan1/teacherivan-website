import { create } from 'zustand';

/**
 * Single DEBUG flag, OFF BY DEFAULT per Step 5 requirements.
 * When false:
 * - Console output is suppressed (except critical errors).
 * - Full speech transcripts are never logged to console or debug buffers.
 * - Sensitive tokens and keys are ALWAYS redacted regardless of flag status.
 */
export const DEBUG_CONFIG = {
  enabled: false,
};

export function isDebugEnabled(): boolean {
  return DEBUG_CONFIG.enabled;
}

export function setDebugEnabled(enabled: boolean): void {
  DEBUG_CONFIG.enabled = enabled;
  useDebugStore.getState().setDebugEnabled(enabled);
}

export interface DebugLogEntry {
  id: string;
  timestamp: string;
  category: 'token' | 'websocket' | 'setup' | 'audio' | 'error' | 'general';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: string;
}

export interface DebugState {
  debugEnabled: boolean;
  logs: DebugLogEntry[];
  wsState: 'CLOSED' | 'CONNECTING' | 'OPEN' | 'CLOSING';
  lastCloseCode: number | null;
  lastCloseReason: string | null;
  audioContextState: string;
  audioSampleRate: number;
  micPermission: string;
  setDebugEnabled: (enabled: boolean) => void;
  addLog: (
    category: DebugLogEntry['category'],
    level: DebugLogEntry['level'],
    message: string,
    details?: unknown
  ) => void;
  setWsState: (state: DebugState['wsState']) => void;
  setCloseInfo: (code: number, reason: string) => void;
  setAudioInfo: (contextState: string, sampleRate: number) => void;
  setMicPermission: (permission: string) => void;
  clearLogs: () => void;
}

/**
 * Strictly redacts sensitive token strings and keys in log messages and URLs.
 * Never outputs full tokens or API keys under any circumstances.
 */
export function redactSensitive(input: string): string {
  if (!input) return '';
  // Redact auth_tokens/xxxxxxxx
  let redacted = input.replace(
    /auth_tokens\/([a-zA-Z0-9_-]{8})[a-zA-Z0-9_-]+/g,
    'auth_tokens/$1...[REDACTED]'
  );
  // Redact access_token query param
  redacted = redacted.replace(/access_token=([^&\s]+)/g, (match, token) => {
    if (token.length > 16) {
      return `access_token=${token.substring(0, 16)}...[REDACTED]`;
    }
    return `access_token=[REDACTED]`;
  });
  // Redact API keys (e.g. AIzaSy..., AQ.Ab...)
  redacted = redacted.replace(
    /(AIzaSy|AQ\.)[a-zA-Z0-9_.-]{16,}/g,
    '[API_KEY_REDACTED]'
  );
  return redacted;
}

export const useDebugStore = create<DebugState>((set) => ({
  debugEnabled: DEBUG_CONFIG.enabled,
  logs: [],
  wsState: 'CLOSED',
  lastCloseCode: null,
  lastCloseReason: null,
  audioContextState: 'uninitialized',
  audioSampleRate: 0,
  micPermission: 'prompt',

  setDebugEnabled: (enabled) => {
    DEBUG_CONFIG.enabled = enabled;
    set({ debugEnabled: enabled });
  },

  addLog: (category, level, message, details) => {
    const formattedDetails = details
      ? typeof details === 'string'
        ? redactSensitive(details)
        : redactSensitive(JSON.stringify(details, null, 2))
      : undefined;

    const entry: DebugLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      category,
      level,
      message: redactSensitive(message),
      details: formattedDetails,
    };

    // Output to browser console ONLY if DEBUG is enabled (or if it's a fatal error)
    if (DEBUG_CONFIG.enabled || level === 'error') {
      const prefix = `[LiveDebug:${category.toUpperCase()}]`;
      if (level === 'error') {
        console.error(prefix, entry.message, formattedDetails || '');
      } else if (level === 'warn') {
        console.warn(prefix, entry.message, formattedDetails || '');
      } else {
        console.log(prefix, entry.message, formattedDetails || '');
      }
    }

    set((state) => ({
      logs: [...state.logs.slice(-60), entry],
    }));
  },

  setWsState: (state) => set({ wsState: state }),
  setCloseInfo: (code, reason) => set({ lastCloseCode: code, lastCloseReason: reason }),
  setAudioInfo: (contextState, sampleRate) =>
    set({ audioContextState: contextState, audioSampleRate: sampleRate }),
  setMicPermission: (permission) => set({ micPermission: permission }),
  clearLogs: () => set({ logs: [] }),
}));

export const debugLog = (
  category: DebugLogEntry['category'],
  level: DebugLogEntry['level'],
  message: string,
  details?: unknown,
  options?: { isTranscript?: boolean }
) => {
  // If this contains full speech transcripts, suppress completely unless DEBUG is explicitly true
  if (options?.isTranscript && !DEBUG_CONFIG.enabled) {
    return;
  }

  // If DEBUG is false and this is not an error, skip logging to reduce overhead and noise
  if (!DEBUG_CONFIG.enabled && level !== 'error') {
    return;
  }

  useDebugStore.getState().addLog(category, level, message, details);
};
