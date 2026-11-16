import { create } from 'zustand';
import { ConversationState, ConversationMessage } from './types';
import { requestEphemeralToken } from '../auth/tokenService';
import { audioManager } from '../audio/audioManager';
import { geminiLiveClient } from '../live/geminiLiveClient';
import { buildSystemInstruction, useTeachingStore } from '../teaching/teachingStore';
import { useReportStore } from '../report/reportStore';
import { debugLog } from '../debug/debugLogger';
import { latencyTracker } from '../latency/latencyTracker';
import { cleanTranscript, mergeTranscriptionChunks } from './transcriptCleaner';

let cleanupAudioStats: (() => void) | null = null;
let turnEndWatchdogTimer: ReturnType<typeof setTimeout> | null = null;
let userInitiatedStop: boolean = true;
let isReconnectingInProgress: boolean = false;
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
let screenWakeLockSentinel: any = null;

function cancelTurnEndWatchdog(): void {
  if (turnEndWatchdogTimer) {
    clearTimeout(turnEndWatchdogTimer);
    turnEndWatchdogTimer = null;
  }
}

function resetTurnEndWatchdog(onTimeout: () => void): void {
  cancelTurnEndWatchdog();
  turnEndWatchdogTimer = setTimeout(() => {
    turnEndWatchdogTimer = null;
    onTimeout();
  }, 1200);
}

async function requestScreenWakeLock(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && (navigator as any).wakeLock?.request) {
      screenWakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      screenWakeLockSentinel?.addEventListener?.('release', () => {
        screenWakeLockSentinel = null;
      });
    }
  } catch {
    // WakeLock is non-essential; fails silently on unsupported browsers/environments
  }
}

function releaseScreenWakeLock(): void {
  try {
    if (screenWakeLockSentinel) {
      screenWakeLockSentinel.release().catch(() => {});
      screenWakeLockSentinel = null;
    }
  } catch {}
}

function startKeepAliveLoop(): void {
  stopKeepAliveLoop();
  requestScreenWakeLock().catch(() => {});
  // Periodically check if audioContext is suspended and resume it every 3s
  keepAliveTimer = setInterval(async () => {
    try {
      await audioManager.ensureAudioContextsActive();
      if (!screenWakeLockSentinel) {
        await requestScreenWakeLock();
      }
    } catch {}
  }, 3000);
}

function stopKeepAliveLoop(): void {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
  releaseScreenWakeLock();
}

/**
 * Re-establishes the WebSocket connection seamlessly without ending the session or popping the report.
 * Injects existing conversation transcript into systemInstruction.
 */
async function attemptAutoReconnect(
  get: () => ConversationState,
  set: (fn: Partial<ConversationState> | ((s: ConversationState) => Partial<ConversationState>)) => void
): Promise<void> {
  if (isReconnectingInProgress || userInitiatedStop) return;
  isReconnectingInProgress = true;

  set({ isReconnecting: true });
  debugLog('websocket', 'warn', 'Unexpected WebSocket drop detected! Initiating seamless auto-reconnect...');

  try {
    // 1. Cleanly disconnect dead socket without touching audio session timers
    geminiLiveClient.disconnect();

    // 2. Mint fresh token
    const tokenData = await requestEphemeralToken();
    set({ tokenInfo: tokenData });

    // 3. Build system instruction with conversation history injected
    const teachingSettings = useTeachingStore.getState().getSettings();
    const baseInstruction = buildSystemInstruction(teachingSettings);
    const messages = get().messages;
    const tutorName = teachingSettings.persona === 'emma' ? 'Emma' : 'Teacher Ivan';

    const conversationTurns = messages
      .filter(
        (m) =>
          (m.role === 'user' || m.role === 'assistant') &&
          m.content &&
          m.content.trim().length > 0 &&
          !m.content.startsWith('[')
      )
      .map((m) => `${m.role === 'user' ? 'Student' : tutorName}: ${m.content.trim()}`);

    const contextInstruction =
      conversationTurns.length > 0
        ? `${baseInstruction}\n\nCONVERSATION SO FAR:\n${conversationTurns.join('\n')}\n\nPlease resume naturally from where the conversation left off.`
        : baseInstruction;

    const voiceName = teachingSettings.persona === 'emma' ? 'Aoede' : 'Puck';

    // 4. Re-connect WebSocket
    await geminiLiveClient.connect(
      tokenData.token,
      tokenData.model,
      contextInstruction,
      {
        onSetupComplete: async () => {
          debugLog('websocket', 'success', 'Auto-reconnect setup complete! Resuming audio streaming.');
          set({
            status: 'connected',
            isReconnecting: false,
            errorMessage: null,
          });
          isReconnectingInProgress = false;

          // Resume audio capture and send to Gemini Live
          try {
            await audioManager.startRecording((base64Pcm16) => {
              geminiLiveClient.sendRealtimeAudio(base64Pcm16);
            });
          } catch (micErr) {
            console.error('[Auto-reconnect mic capture warning]:', micErr);
          }
        },

        onInputTranscription: (text: string) => {
          get().appendInterimText('user', text);
        },

        onOutputTranscription: (text: string) => {
          cancelTurnEndWatchdog();
          set({ isUserSpeaking: false });
          get().finalizeTurn('user');
          get().appendInterimText('assistant', text);
        },

        onAudioChunk: (pcmBase64: string, turnId?: number) => {
          cancelTurnEndWatchdog();
          set({ isUserSpeaking: false });
          get().finalizeTurn('user');
          audioManager.playChunk(pcmBase64, turnId).catch((err) => {
            console.warn('[Audio Playback Warning]:', err);
          });
        },

        onInterrupted: (turnId?: number) => {
          audioManager.interrupt();
          get().handleInterruption(turnId);
        },

        onTurnComplete: () => {
          get().finalizeTurn();
        },

        onError: (err: Error | string) => {
          const msg = typeof err === 'string' ? err : err.message;
          console.error('[Gemini Live Reconnected Socket Error]:', msg);
          if (!userInitiatedStop) {
            setTimeout(() => {
              isReconnectingInProgress = false;
              attemptAutoReconnect(get, set);
            }, 1500);
          }
        },

        onClose: (code: number, reason: string) => {
          console.log(`[Gemini Live Reconnected Socket Closed]: code ${code}, reason: ${reason}`);
          if (!userInitiatedStop) {
            setTimeout(() => {
              isReconnectingInProgress = false;
              attemptAutoReconnect(get, set);
            }, 1000);
          }
        },
      },
      voiceName
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Auto-reconnect error]:', msg);
    isReconnectingInProgress = false;
    if (!userInitiatedStop) {
      setTimeout(() => {
        attemptAutoReconnect(get, set);
      }, 2000);
    }
  }
}

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
    isUserSpeaking: false,
    isMuted: false,
    isReconnecting: false,
    latencyStats: latencyTracker.getStats(),

    startSession: async (model?: string) => {
      const currentStatus = get().status;
      if (currentStatus === 'requesting_token' || currentStatus === 'connecting') {
        debugLog('general', 'warn', `startSession ignored: already in ${currentStatus} state.`);
        return;
      }

      userInitiatedStop = false;
      isReconnectingInProgress = false;

      // Clean up any lingering connections
      stopKeepAliveLoop();
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
        isReconnecting: false,
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

        // Determine voiceName from selected tutor persona: Puck for Teacher Ivan, Aoede for Emma
        const voiceName = teachingSettings.persona === 'emma' ? 'Aoede' : 'Puck';
        const tutorName = teachingSettings.persona === 'emma' ? 'Emma' : 'Teacher Ivan';

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
                content: `Connected to Gemini Live with ${tutorName} (${voiceName} voice). Microphone active (16kHz PCM), queued player ready (24kHz PCM), live transcriptions enabled.`,
                timestamp: new Date().toLocaleTimeString(),
              };

              set({
                status: 'connected',
                sessionStartTime: startTimestamp,
                messages: [...get().messages, initialMessage],
                errorMessage: null,
                isReconnecting: false,
              });

              // Start audio context & wake lock keep-alive loop
              startKeepAliveLoop();

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

                // Turn-End Watchdog: If user is actively speaking and voice energy continues above threshold, keep resetting watchdog
                if (get().isUserSpeaking && !stats.isMuted && stats.micLevel > 15 && !stats.isPlaying) {
                  resetTurnEndWatchdog(() => {
                    debugLog('general', 'info', 'Turn-End Watchdog (1.2s silence) triggered automatic turn completion.');
                    get().forceTurnComplete();
                  });
                }
              });
            },

            onInputTranscription: (text: string) => {
              get().appendInterimText('user', text);
            },

            onOutputTranscription: (text: string) => {
              cancelTurnEndWatchdog();
              set({ isUserSpeaking: false });
              get().finalizeTurn('user');
              get().appendInterimText('assistant', text);
            },

            onAudioChunk: (pcmBase64: string, turnId?: number) => {
              cancelTurnEndWatchdog();
              set({ isUserSpeaking: false });
              get().finalizeTurn('user');
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

              // Seamless auto-reconnect if drop was unexpected
              if (!userInitiatedStop) {
                attemptAutoReconnect(get, set);
              } else {
                set({
                  status: 'error',
                  errorMessage: msg,
                });
              }
            },

            onClose: (code: number, reason: string) => {
              console.log(`[Gemini Live Closed]: code ${code}, reason: ${reason}`);
              // Seamless auto-reconnect if drop was unexpected (userInitiatedStop === false)
              if (!userInitiatedStop) {
                attemptAutoReconnect(get, set);
              } else {
                const currentStatus = get().status;
                if (currentStatus === 'connected' || currentStatus === 'connecting') {
                  get().stopSession();
                }
              }
            },
          },
          voiceName
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
      userInitiatedStop = true;
      isReconnectingInProgress = false;
      stopKeepAliveLoop();
      cancelTurnEndWatchdog();
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
        isReconnecting: false,
        sessionStartTime: null,
        micLevel: 0,
        isTutorSpeaking: false,
        isUserSpeaking: false,
        messages: [...finalizedMessages, stopMessage],
      });

      // Step 7: Trigger end-of-session pedagogical report generation if enabled
      const reportStore = useReportStore.getState();
      if (reportStore.reportsEnabled) {
        const turns = finalizedMessages
          .filter(
            (m) =>
              (m.role === 'user' || m.role === 'assistant') &&
              m.content &&
              m.content.trim().length > 0
          )
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
      userInitiatedStop = true;
      isReconnectingInProgress = false;
      stopKeepAliveLoop();
      cancelTurnEndWatchdog();
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
        isUserSpeaking: false,
        isMuted: false,
        isReconnecting: false,
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

      if (role === 'user') {
        set({ isUserSpeaking: true });
        resetTurnEndWatchdog(() => {
          debugLog('general', 'info', 'Turn-End Watchdog (1.2s silence) triggered automatic turn completion.');
          get().forceTurnComplete();
        });
      }

      set((state) => {
        const messages = [...state.messages];
        const lastMsg = messages[messages.length - 1];

        // If the last message matches the role and is marked interim, merge text chunks
        if (lastMsg && lastMsg.role === role && lastMsg.isInterim) {
          const merged = mergeTranscriptionChunks(lastMsg.content, textChunk);
          lastMsg.content = role === 'user' ? cleanTranscript(merged) : merged;
          return { messages };
        }

        // If there was an interim message from another role, finalize it first
        if (lastMsg && lastMsg.isInterim) {
          lastMsg.isInterim = false;
        }

        // Create new interim message
        const initialContent = role === 'user' ? cleanTranscript(textChunk) : textChunk;
        const newMsg: ConversationMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          role,
          content: initialContent,
          timestamp: new Date().toLocaleTimeString(),
          isInterim: true,
        };

        return { messages: [...messages, newMsg] };
      });
    },

    finalizeTurn: (role?: 'user' | 'assistant') => {
      if (!role || role === 'user') {
        cancelTurnEndWatchdog();
        set({ isUserSpeaking: false });
      }

      set((state) => {
        const messages = state.messages.map((m) => {
          if (m.isInterim && (!role || m.role === role)) {
            const finalContent = m.role === 'user' ? cleanTranscript(m.content) : m.content;
            return { ...m, content: finalContent, isInterim: false };
          }
          return m;
        });
        return { messages };
      });
    },

    forceTurnComplete: () => {
      cancelTurnEndWatchdog();
      const { status, isTutorSpeaking } = get();
      if (status !== 'connected' || isTutorSpeaking) return;

      debugLog(
        'general',
        'info',
        'forceTurnComplete triggered (watchdog or manual Done Speaking button). Sending 400ms digital silence via realtimeInput.'
      );
      get().finalizeTurn('user');
      set({ isUserSpeaking: false });
      // Send 400ms of pure digital silence via realtimeInput to complete turn safely without clientContent frame conflicts
      geminiLiveClient.sendDigitalSilence(400);
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

      cancelTurnEndWatchdog();
      set({ isUserSpeaking: false });
      const trimmed = cleanTranscript(text.trim());
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
