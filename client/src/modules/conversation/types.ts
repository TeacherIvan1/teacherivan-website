import { EphemeralTokenPayload } from '../auth/tokenService';
import { LatencyStats } from '../latency/latencyTracker';

export type SessionStatus =
  | 'idle'
  | 'requesting_token'
  | 'connecting'
  | 'connected'
  | 'stopped'
  | 'error';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isInterim?: boolean;
  isInterrupted?: boolean; // True if this message was interrupted by user speech
}

export interface ConversationState {
  status: SessionStatus;
  tokenInfo: EphemeralTokenPayload | null;
  errorMessage: string | null;
  sessionStartTime: number | null;
  messages: ConversationMessage[];
  micLevel: number; // 0 - 100 RMS volume
  isTutorSpeaking: boolean;
  isUserSpeaking: boolean;
  isMuted: boolean;
  latencyStats: LatencyStats;

  // Actions
  startSession: (model?: string) => Promise<void>;
  stopSession: () => void;
  resetSession: () => void;
  toggleMute: () => void;
  addMessage: (role: 'user' | 'assistant' | 'system', content: string) => void;
  appendInterimText: (role: 'user' | 'assistant', textChunk: string) => void;
  finalizeTurn: (role?: 'user' | 'assistant') => void;
  forceTurnComplete: () => void;
  handleInterruption: (turnId?: number) => void;
  sendUserTextMessage: (text: string) => void;
  clearMessages: () => void;
  clearError: () => void;
}
