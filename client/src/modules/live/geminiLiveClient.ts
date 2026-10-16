/**
 * Gemini Live API WebSocket Client
 * -------------------------------------------------------------
 * Direct client-to-model WebSocket connection for bidirectional streaming
 * voice interaction using ephemeral single-use authentication tokens.
 *
 * Protocol:
 * - Endpoint: BidiGenerateContentConstrained?access_token={token}
 * - Audio Input: 16kHz linear PCM 16-bit little-endian mono (audio/pcm;rate=16000)
 * - Audio Output: 24kHz linear PCM 16-bit little-endian mono (audio/pcm;rate=24000)
 * - Transcriptions: Real-time user input and model output transcriptions
 */

import { debugLog, useDebugStore, redactSensitive } from '../debug/debugLogger';
import { latencyTracker } from '../latency/latencyTracker';
import { getLiveWebSocketUrl } from '../../config/api';

export interface GeminiLiveCallbacks {
  onSetupComplete?: () => void;
  onAudioChunk?: (pcmBase64: string, turnId?: number) => void;
  onInputTranscription?: (text: string) => void;
  onOutputTranscription?: (text: string) => void;
  onInterrupted?: (newTurnId?: number) => void;
  onTurnComplete?: () => void;
  onError?: (error: Error) => void;
  onClose?: (code: number, reason: string) => void;
}

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private isSetupDone: boolean = false;
  private isConnecting: boolean = false;
  private callbacks: GeminiLiveCallbacks = {};
  private connectionTimeoutId: number | null = null;
  private currentTurnId: number = 0;
  private isInterrupted: boolean = false;
  private currentSessionId: number = 0;

  /**
   * Connects to the Gemini Live API WebSocket endpoint using an ephemeral token.
   * Enforces a 10-second connection timeout and safe binary/text message decoding.
   */
  public async connect(
    token: string,
    model: string,
    systemPrompt: string,
    callbacks: GeminiLiveCallbacks = {}
  ): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      debugLog('websocket', 'warn', 'connect() called while already connecting/connected. Disconnecting prior socket first.');
      this.disconnect();
    }

    this.currentSessionId++;
    const sessionId = this.currentSessionId;

    this.callbacks = callbacks;
    this.isSetupDone = false;
    this.isConnecting = true;
    this.currentTurnId = 0;
    this.isInterrupted = false;
    useDebugStore.getState().setWsState('CONNECTING');

    // WebSocket endpoint with ephemeral access token (supports VITE_WS_URL or defaults to Gemini Live API)
    const url = getLiveWebSocketUrl(token);

    debugLog('websocket', 'info', `Connecting to WebSocket: ${redactSensitive(url)} (Session #${sessionId})`);

    return new Promise((resolve, reject) => {
      let settled = false;

      const finishReject = (err: Error) => {
        if (settled || sessionId !== this.currentSessionId) return;
        settled = true;
        this.clearTimeout();
        this.isConnecting = false;
        useDebugStore.getState().setWsState('CLOSED');
        this.callbacks.onError?.(err);
        reject(err);
      };

      const finishResolve = () => {
        if (settled || sessionId !== this.currentSessionId) return;
        settled = true;
        this.clearTimeout();
        this.isConnecting = false;
        useDebugStore.getState().setWsState('OPEN');
        resolve();
      };

      // 10-second timeout guard
      this.connectionTimeoutId = window.setTimeout(() => {
        if (sessionId !== this.currentSessionId) return;
        const timeoutError = new Error(
          'Connection timed out after 10 seconds. The Live API WebSocket did not complete the setup handshake. Please retry.'
        );
        debugLog('websocket', 'error', timeoutError.message);
        this.disconnect();
        finishReject(timeoutError);
      }, 10000);

      try {
        this.ws = new WebSocket(url);
        // Important: set binaryType so incoming binary packets can be converted via ArrayBuffer
        this.ws.binaryType = 'arraybuffer';
      } catch (err: unknown) {
        const createErr = err instanceof Error ? err : new Error(String(err));
        debugLog('websocket', 'error', `Failed to create WebSocket: ${createErr.message}`);
        finishReject(createErr);
        return;
      }

      this.ws.onopen = () => {
        if (sessionId !== this.currentSessionId) return;
        this.isConnected = true;
        useDebugStore.getState().setWsState('OPEN');
        debugLog('websocket', 'success', `WebSocket opened successfully (Session #${sessionId})! Sending initial setup frame...`);

        // Ensure model name has 'models/' prefix
        const modelIdentifier = model.startsWith('models/') ? model : `models/${model}`;

        // 1. Send mandatory setup frame as the initial message
        const setupMessage = {
          setup: {
            model: modelIdentifier,
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Aoede', // Aoede, Puck, Charon, Kore, Fenrir
                  },
                },
              },
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            realtimeInputConfig: {
              automaticActivityDetection: {
                disabled: false,
                startOfSpeechSensitivity: 'START_SENSITIVITY_HIGH',
                endOfSpeechSensitivity: 'END_SENSITIVITY_HIGH',
                prefixPaddingMs: 200,
                silenceDurationMs: 500,
              },
            },
          },
        };

        debugLog('setup', 'info', `Sending setup frame for model: ${modelIdentifier}`, setupMessage);
        this.sendMessage(setupMessage);
      };

      this.ws.onmessage = async (event: MessageEvent) => {
        if (sessionId !== this.currentSessionId) return;
        try {
          // Robust message decoding: Gemini Live API delivers frames as binary ArrayBuffer or Blob
          let rawData: string = '';

          if (typeof event.data === 'string') {
            rawData = event.data;
          } else if (event.data instanceof ArrayBuffer) {
            rawData = new TextDecoder('utf-8').decode(event.data);
          } else if (event.data instanceof Blob) {
            rawData = await event.data.text();
          } else {
            rawData = new TextDecoder('utf-8').decode(new Uint8Array(event.data));
          }

          if (!rawData || rawData.trim() === '') {
            debugLog('websocket', 'warn', 'Received empty message frame from Live API');
            return;
          }

          const response = JSON.parse(rawData);
          const topKeys = Object.keys(response);

          // Check for API errors in response
          if (response.error) {
            const errMsg = response.error.message || JSON.stringify(response.error);
            debugLog('websocket', 'error', `Gemini Live API Error: ${errMsg}`, response.error);
            const apiError = new Error(`Live API Error: ${errMsg}`);
            this.callbacks.onError?.(apiError);
            if (!this.isSetupDone) {
              finishReject(apiError);
            }
            return;
          }

          // Setup completion acknowledgment
          if (response.setupComplete) {
            this.isSetupDone = true;
            debugLog('setup', 'success', 'Setup Complete acknowledged by Gemini Live API! Ready for bidirectional audio.', response.setupComplete);
            this.callbacks.onSetupComplete?.();
            finishResolve();
            return;
          }

          // Handle incoming server stream content
          if (response.serverContent) {
            const sc = response.serverContent;
            const contentKeys = Object.keys(sc);

            // 1. User speech transcription from Live API
            if (sc.inputTranscription?.text) {
              // User speech arriving clears interrupted state and updates End-of-Speech timestamp
              this.isInterrupted = false;
              latencyTracker.markEndOfSpeech();

              debugLog('websocket', 'info', `[Input Transcription]: "${sc.inputTranscription.text}"`, undefined, {
                isTranscript: true,
              });
              this.callbacks.onInputTranscription?.(sc.inputTranscription.text);
            }

            // 2. User barge-in / speech interruption
            if (sc.interrupted) {
              this.isInterrupted = true;
              this.currentTurnId++;
              debugLog(
                'websocket',
                'warn',
                `⚡ User barge-in detected! Model output interrupted. In-flight chunks invalidated (turnId: ${this.currentTurnId}).`
              );
              latencyTracker.cancelCurrentTurn();
              this.callbacks.onInterrupted?.(this.currentTurnId);
            }

            // 3. Model response transcription from Live API
            if (sc.outputTranscription?.text) {
              if (!this.isInterrupted) {
                debugLog('websocket', 'info', `[Output Transcription]: "${sc.outputTranscription.text}"`, undefined, {
                  isTranscript: true,
                });
                this.callbacks.onOutputTranscription?.(sc.outputTranscription.text);
              }
            }

            // 4. Model audio chunks (24kHz PCM)
            if (sc.modelTurn?.parts) {
              if (this.isInterrupted) {
                debugLog('websocket', 'info', 'Discarded late audio chunk from interrupted turn.');
              } else {
                for (const part of sc.modelTurn.parts) {
                  if (part.inlineData && part.inlineData.data) {
                    latencyTracker.markFirstChunkReceived();
                    this.callbacks.onAudioChunk?.(part.inlineData.data, this.currentTurnId);
                  }
                }
              }
            }

            // 5. Turn completion flag
            if (sc.turnComplete) {
              this.isInterrupted = false;
              this.currentTurnId++;
              debugLog('websocket', 'info', 'Turn complete.');
              this.callbacks.onTurnComplete?.();
            }
          } else {
            debugLog('websocket', 'info', `Received server message: [${topKeys.join(', ')}]`);
          }
        } catch (parseError: unknown) {
          const errMessage = parseError instanceof Error ? parseError.message : String(parseError);
          debugLog('websocket', 'error', `Error parsing incoming message frame: ${errMessage}`);
        }
      };

      this.ws.onerror = (event: Event) => {
        if (sessionId !== this.currentSessionId) return;
        debugLog('websocket', 'error', 'WebSocket error event triggered', event);
        const err = new Error('WebSocket connection error encountered during communication.');
        if (!this.isSetupDone) {
          finishReject(err);
        } else {
          this.callbacks.onError?.(err);
        }
      };

      this.ws.onclose = (event: CloseEvent) => {
        if (sessionId !== this.currentSessionId) return;
        this.isConnected = false;
        useDebugStore.getState().setWsState('CLOSED');
        useDebugStore.getState().setCloseInfo(event.code, event.reason);

        const closeMsg = `WebSocket closed: Code ${event.code} (${this.getCloseCodeDescription(event.code)}), Reason: "${event.reason || 'None provided'}"`;
        debugLog('websocket', event.code === 1000 ? 'info' : 'warn', closeMsg);

        if (!this.isSetupDone) {
          finishReject(new Error(closeMsg));
        } else {
          this.callbacks.onClose?.(event.code, event.reason);
        }
      };
    });
  }

  /**
   * Streams a microphone audio chunk (16kHz linear PCM 16-bit mono base64) to Gemini.
   */
  public sendRealtimeAudio(pcmBase64: string): void {
    if (!this.isConnected || !this.isSetupDone || !this.ws) {
      return;
    }

    const audioMessage = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: 'audio/pcm;rate=16000',
            data: pcmBase64,
          },
        ],
      },
    };

    this.sendMessage(audioMessage);
  }

  /**
   * Sends a user text turn over the WebSocket session.
   */
  public sendTextMessage(text: string): void {
    if (!this.isConnected || !this.isSetupDone || !this.ws) {
      return;
    }

    const textTurnMessage = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    };

    this.isInterrupted = false;
    latencyTracker.markEndOfSpeech();

    debugLog('websocket', 'info', `Sending text turn: "${text}"`);
    this.sendMessage(textTurnMessage);
  }

  /**
   * Gracefully terminates the WebSocket session.
   */
  public disconnect(): void {
    this.clearTimeout();
    this.currentSessionId++; // Invalidate any delayed events from the closing session
    this.isConnecting = false;
    this.currentTurnId = 0;
    this.isInterrupted = false;

    if (this.ws) {
      const socket = this.ws;
      this.ws = null;
      try {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close(1000, 'Session stopped by user');
        }
      } catch {}
    }
    this.callbacks = {};
    this.isConnected = false;
    this.isSetupDone = false;
    useDebugStore.getState().setWsState('CLOSED');
  }

  public getIsReady(): boolean {
    return this.isConnected && this.isSetupDone;
  }

  private clearTimeout(): void {
    if (this.connectionTimeoutId !== null) {
      window.clearTimeout(this.connectionTimeoutId);
      this.connectionTimeoutId = null;
    }
  }

  private sendMessage(obj: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  private getCloseCodeDescription(code: number): string {
    switch (code) {
      case 1000:
        return 'Normal Closure';
      case 1001:
        return 'Going Away';
      case 1006:
        return 'Abnormal Closure (TCP dropped/handshake rejected)';
      case 1008:
        return 'Policy Violation (Invalid auth token or disallowed model/options)';
      case 1011:
        return 'Internal Server Error';
      default:
        return 'Standard WebSocket Code';
    }
  }
}

export const geminiLiveClient = new GeminiLiveClient();
