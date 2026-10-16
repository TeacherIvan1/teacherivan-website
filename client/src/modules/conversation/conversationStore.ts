import { create } from 'zustand';
import { ConversationState, ConversationMessage } from './types';
import { requestEphemeralToken } from '../auth/tokenService';
import { audioManager } from '../audio/audioManager';
import { geminiLiveClient } from '../live/geminiLiveClient';
import { buildSystemInstruction, useTeachingStore } from '../teaching/teachingStore';
import { useReportStore } from '../report/reportStore';
import { debugLog } from '../debug/debugLogger';
import { latencyTracker } from '../latency/latencyTracker';

let cleanupAudioStats: (() => void) | null = null;

export const useConversationStore = create<ConversationState>((set, get) => {
  // Subscribe to latency metrics updates
  latencyTracker.subscribe((stats) => {
    set({ latencyStats: stats });
  });

  return {
    status: 'idle',
    tokenInfo: null,
    errorMessage: null,
    sessionStartTime: null,
    messages: [],
    micLevel: 0,
    isTutorSpeaking: false,
    isMuted: false,
    latencyStats: latencyTracker.getStats(),

  startSession: async (model?: string) => {
    const currentStatus = get().status;
    if (currentStatus === 'requesting_token' || currentStatus === 'connecting') {
      debugLog('general', 'warn', `startSession ignored: already in ${currentStatus} state.`);
      return;
    }

    // Clean up any lingering connections
    audioManager.close();
    geminiLiveClient.disconnect();
    latencyTracker.reset();
    useReportStore.getState().dismissReport();

    // Pre-initialize and resume playback AudioContext within the synchronous user click event
    audioManager.preparePlaybackContext().catch((err) => {
      console.warn('[startSession] preparePlaybackContext warning:', err);
    });

    // 1. Transition to requesting token
    set({
      status: 'requesting_token',
      errorMessage: null,
    });

    try {
      debugLog('token', 'info', 'Requesting fresh single-use ephemeral token from backend /api/token...');
      // 2. Fetch short-lived ephemeral token from backend
      const tokenData = await requestEphemeralToken(model);

      debugLog('token', 'success', `Ephemeral token minted successfully! Model scope: ${tokenData.model}`, {
        expireTime: tokenData.expireTime,
        connectWindow: tokenData.newSessionExpireTime,
      });

      set({
        status: 'connecting',
        tokenInfo: tokenData,
      });

      // 3. Build personalized tutor system instruction based on level, mode, and scenario, then lock settings
      const teachingSettings = useTeachingStore.getState().getSettings();
      const systemInstruction = buildSystemInstruction(teachingSettings);
      useTeachingStore.getState().lockSettings(systemInstruction);

      // 4. Initialize audio playback pipeline
      await audioManager.initialize();

      // 5. Connect to Gemini Live API WebSocket using ephemeral token
      await geminiLiveClient.connect(
        tokenData.token,
        tokenData.model,
        systemInstruction,
        {
          onSetupComplete: async () => {
            const startTimestamp = Date.now();
            const initialMessage: ConversationMessage = {
              id: `sys-${startTimestamp}`,
              role: 'system',
              content: `Connected to Gemini Live (${tokenData.model}). Microphone active (16kHz PCM), queued player ready (24kHz PCM), live transcriptions enabled.`,
              timestamp: new Date().toLocaleTimeString(),
            };

            set({
              status: 'connected',
              sessionStartTime: startTimestamp,
              messages: [...get().messages, initialMessage],
              errorMessage: null,
            });

            // Hook first audio chunk playback into latency tracker
            audioManager.setOnFirstChunkPlayed(() => {
              latencyTracker.markFirstChunkPlayed();
            });

            // Start capturing microphone audio via AudioWorklet and stream to Gemini Live
            try {
              await audioManager.startRecording((base64Pcm16) => {
                geminiLiveClient.sendRealtimeAudio(base64Pcm16);
              });
            } catch (micErr: unknown) {
              const micMsg = micErr instanceof Error ? micErr.message : 'Microphone access denied';
              console.error('[Microphone Error]:', micMsg);
              set({
                errorMessage: `Microphone error: ${micMsg}. Please grant microphone permissions.`,
              });
            }

            // Sync audio manager metrics with Zustand store
            if (cleanupAudioStats) cleanupAudioStats();
            cleanupAudioStats = audioManager.onStatsUpdate((stats) => {
              set({
                micLevel: stats.micLevel,
                isTutorSpeaking: stats.isPlaying,
                isMuted: stats.isMuted,
              });
            });
          },

          onInputTranscription: (text: string) => {
            get().appendInterimText('user', text);
          },

          onOutputTranscription: (text: string) => {
            get().appendInterimText('assistant', text);
          },

          onAudioChunk: (pcmBase64: string, turnId?: number) => {
            audioManager.playChunk(pcmBase64, turnId).catch((err) => {
              console.warn('[Audio Playback Warning]:', err);
            });
          },

          onInterrupted: (turnId?: number) => {
            // Instant barge-in: flush playback queue and reject late chunks
            audioManager.interrupt();
            get().handleInterruption(turnId);
          },

          onTurnComplete: () => {
            get().finalizeTurn();
          },

          onError: (err: Error | string) => {
            const msg = typeof err === 'string' ? err : err.message;
            console.error('[Gemini Live Error]:', msg);
            set({
              status: 'error',
              errorMessage: msg,
            });
          },

          onClose: (code: number, reason: string) => {
            console.log(`[Gemini Live Closed]: code ${code}, reason: ${reason}`);
            const currentStatus = get().status;
            if (currentStatus === 'connected' || currentStatus === 'connecting') {
              get().stopSession();
            }
          },
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to Live session';
      console.error('[startSession Error]:', msg);
      audioManager.close();
      geminiLiveClient.disconnect();
      useTeachingStore.getState().unlockSettings();
      set({
        status: 'error',
        errorMessage: msg,
      });
    }
  },

  stopSession: () => {
    const { status, sessionStartTime, messages } = get();

    if (cleanupAudioStats) {
      cleanupAudioStats();
      cleanupAudioStats = null;
    }

    // Stop audio capture & playback
    audioManager.close();
    // Disconnect Live WebSocket
    geminiLiveClient.disconnect();
    useTeachingStore.getState().unlockSettings();

    const durationSec = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0;
    const stopMessage: ConversationMessage = {
      id: `sys-stop-${Date.now()}`,
      role: 'system',
      content: `Session ended. Total duration: ${durationSec}s. Microphone closed & audio player cleared.`,
      timestamp: new Date().toLocaleTimeString(),
    };

    const finalizedMessages = messages.map((m) => (m.isInterim ? { ...m, isInterim: false } : m));

    set({
      status: 'stopped',
      sessionStartTime: null,
      micLevel: 0,
      isTutorSpeaking: false,
      messages: [...finalizedMessages, stopMessage],
    });

    // Step 7: Trigger end-of-session pedagogical report generation if enabled
    const reportStore = useReportStore.getState();
    if (reportStore.reportsEnabled) {
      // Send ONLY learner's turns and Emma's turns (labeled)
      const turns = finalizedMessages
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content.trim(),
        }));

      const teachingSettings = useTeachingStore.getState().getSettings();
      reportStore.generateReport({
        turns,
        level: teachingSettings.level,
        correctionMode: teachingSettings.correctionMode,
        scenario: {
          title: teachingSettings.scenario.title,
          category: teachingSettings.scenario.category,
          description: teachingSettings.scenario.description,
          targetVocabulary: teachingSettings.scenario.targetVocabulary,
          targetGrammar: teachingSettings.scenario.targetGrammar,
        },
        durationSeconds: durationSec,
      });
    }
  },

  resetSession: () => {
    if (cleanupAudioStats) {
      cleanupAudioStats();
      cleanupAudioStats = null;
    }
    audioManager.close();
    geminiLiveClient.disconnect();
    useTeachingStore.getState().unlockSettings();
    latencyTracker.reset();
    set({
      status: 'idle',
      tokenInfo: null,
      errorMessage: null,
      sessionStartTime: null,
      messages: [],
      micLevel: 0,
      isTutorSpeaking: false,
      isMuted: false,
      latencyStats: latencyTracker.getStats(),
    });
  },

  toggleMute: () => {
    const newMuted = audioManager.toggleMute();
    set({ isMuted: newMuted });
  },

  addMessage: (role: 'user' | 'assistant' | 'system', content: string) => {
    const msg: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role,
      content,
      timestamp: new Date().toLocaleTimeString(),
      isInterim: false,
    };
    set((state) => ({
      messages: [...state.messages, msg],
    }));
  },

  appendInterimText: (role: 'user' | 'assistant', textChunk: string) => {
    if (!textChunk) return;

    set((state) => {
      const messages = [...state.messages];
      const lastMsg = messages[messages.length - 1];

      // If the last message matches the role and is marked interim, append text
      if (lastMsg && lastMsg.role === role && lastMsg.isInterim) {
        lastMsg.content = lastMsg.content + textChunk;
        return { messages };
      }

      // If there was an interim message from another role, finalize it first
      if (lastMsg && lastMsg.isInterim) {
        lastMsg.isInterim = false;
      }

      // Create new interim message
      const newMsg: ConversationMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        role,
        content: textChunk,
        timestamp: new Date().toLocaleTimeString(),
        isInterim: true,
      };

      return { messages: [...messages, newMsg] };
    });
  },

  finalizeTurn: (role?: 'user' | 'assistant') => {
    set((state) => {
      const messages = state.messages.map((m) => {
        if (m.isInterim && (!role || m.role === role)) {
          return { ...m, isInterim: false };
        }
        return m;
      });
      return { messages };
    });
  },

  handleInterruption: (_turnId?: number) => {
    set((state) => {
      const messages = [...state.messages];
      let marked = false;

      // Find the most recent assistant message (interim or newly finalized by user barge-in)
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
          messages[i] = {
            ...messages[i],
            isInterim: false,
            isInterrupted: true,
            content: messages[i].content.trim() || '[Speech interrupted]',
          };
          marked = true;
          break;
        }
      }

      // If tutor was cut off before any transcript text arrived
      if (!marked) {
        messages.push({
          id: `msg-${Date.now()}-interrupted`,
          role: 'assistant',
          content: '[Speech interrupted]',
          timestamp: new Date().toLocaleTimeString(),
          isInterim: false,
          isInterrupted: true,
        });
      }

      return {
        messages,
        isTutorSpeaking: false,
      };
    });
  },

  sendUserTextMessage: (text: string) => {
    if (!text || text.trim() === '') return;

    const trimmed = text.trim();
    // Add user message to transcript
    get().addMessage('user', trimmed);
    // Send to Gemini Live via WebSocket clientContent
    geminiLiveClient.sendTextMessage(trimmed);
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  clearError: () => {
    set({ errorMessage: null });
  },
};
});
