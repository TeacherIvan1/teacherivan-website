import { AudioStreamConfig, AudioManagerState, AudioStats } from './types';
import { QueuedAudioPlayer } from './queuedAudioPlayer';
import { PCM_WORKLET_PROCESSOR_NAME, arrayBufferToBase64 } from './audioWorkletProcessorCode';
import { debugLog, useDebugStore } from '../debug/debugLogger';

/**
 * AudioManager
 * -------------------------------------------------------------
 * Manages full bidirectional audio streaming for Gemini Live API:
 * 1. Captures microphone audio using a static same-origin AudioWorkletNode (/worklets/pcm-processor.js).
 * 2. Emits raw 16kHz 16-bit linear PCM little-endian mono base64 chunks every 20ms (320 samples).
 * 3. Plays model audio responses (24kHz PCM) using the QueuedAudioPlayer.
 * 4. Provides real-time microphone RMS volume monitoring and barge-in cutoff.
 */
export class AudioManager {
  private state: AudioManagerState = 'idle';
  private config: AudioStreamConfig = {
    inputSampleRate: 16000,
    outputSampleRate: 24000,
    channels: 1,
    chunkSize: 320, // 20ms low-latency frame at 16kHz
  };

  private inputContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private queuedPlayer: QueuedAudioPlayer = new QueuedAudioPlayer();

  private chunksSent: number = 0;
  private chunksReceived: number = 0;
  private currentMicLevel: number = 0;
  private isMuted: boolean = false;
  private statsListeners: Set<(stats: AudioStats) => void> = new Set();

  constructor() {
    this.queuedPlayer.onPlaybackStateChange = () => {
      this.notifyStats();
    };
  }

  public getState(): AudioManagerState {
    return this.state;
  }

  public getConfig(): AudioStreamConfig {
    return { ...this.config };
  }

  /**
   * Synchronously prepares and resumes the playback AudioContext within a user gesture.
   */
  public async preparePlaybackContext(): Promise<void> {
    this.queuedPlayer.initialize();
    await this.queuedPlayer.resume();
  }

  /**
   * Keep-alive method called periodically during active voice sessions.
   * Checks if either input or playback AudioContext is suspended, and resumes them immediately.
   */
  public async ensureAudioContextsActive(): Promise<void> {
    if (this.inputContext && this.inputContext.state === 'suspended') {
      try {
        await this.inputContext.resume();
      } catch (err) {
        console.warn('[AudioManager] inputContext resume warning:', err);
      }
    }
    await this.queuedPlayer.resume();
  }

  /**
   * Initializes playback audio pipeline.
   */
  public async initialize(): Promise<void> {
    if (this.state === 'initializing') return;
    this.state = 'initializing';

    try {
      this.queuedPlayer.initialize();
      await this.queuedPlayer.resume();
      this.state = 'idle';
      debugLog('audio', 'info', 'QueuedAudioPlayer initialized (24kHz playback context ready)');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      debugLog('audio', 'error', `AudioManager initialization error: ${msg}`);
      this.state = 'error';
      throw err;
    }
  }

  /**
   * Starts capturing microphone audio using the static same-origin AudioWorklet.
   * Chunks are resampled to 16kHz linear PCM 16-bit mono (20ms / 320 samples) and emitted immediately.
   */
  public async startRecording(onAudioChunk?: (pcmBase64: string) => void): Promise<void> {
    try {
      await this.initialize();

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          useDebugStore.getState().setMicPermission(perm.state);
          debugLog('audio', 'info', `Microphone permission state: ${perm.state}`);
        } catch {
          // Permissions API for microphone might not be supported on all browsers
        }
      }

      debugLog('audio', 'info', 'Requesting getUserMedia audio stream...');
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const audioTrack = this.mediaStream.getAudioTracks()[0];
      const trackSettings = audioTrack?.getSettings?.();
      useDebugStore.getState().setMicPermission('granted');
      debugLog('audio', 'success', `Microphone stream acquired! Track: "${audioTrack?.label || 'Default'}"`, trackSettings);

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioCtx({ sampleRate: 16000 });
      this.inputContext = audioContext;

      useDebugStore.getState().setAudioInfo(audioContext.state, audioContext.sampleRate);
      debugLog('audio', 'info', `Input AudioContext created: state=${audioContext.state}, sampleRate=${audioContext.sampleRate}Hz`);

      if (audioContext.state === 'suspended') {
        debugLog('audio', 'info', 'Resuming suspended AudioContext...');
        await audioContext.resume();
        useDebugStore.getState().setAudioInfo(audioContext.state, audioContext.sampleRate);
        debugLog('audio', 'info', `Input AudioContext resumed: state=${audioContext.state}`);
      }

      // Load static same-origin AudioWorklet module (zero blob: URL usage)
      const workletUrl = `${import.meta.env.BASE_URL}worklets/pcm-processor.js`;
      debugLog('audio', 'info', `Loading static AudioWorklet module (${workletUrl})...`);
      await audioContext.audioWorklet.addModule(workletUrl);
      debugLog('audio', 'success', 'Static AudioWorklet module loaded successfully!');

      this.sourceNode = audioContext.createMediaStreamSource(this.mediaStream);
      this.workletNode = new AudioWorkletNode(audioContext, PCM_WORKLET_PROCESSOR_NAME);

      this.workletNode.port.onmessage = (event: MessageEvent) => {
        const data = event.data as { pcm?: ArrayBuffer; pcm16?: ArrayBuffer; rms?: number; level?: number };
        const pcmBuffer = data.pcm || data.pcm16;
        const computedLevel =
          typeof data.level === 'number'
            ? data.level
            : typeof data.rms === 'number'
            ? Math.min(100, Math.round(data.rms * 140))
            : 0;

        this.currentMicLevel = this.isMuted ? 0 : computedLevel;
        this.notifyStats();

        if (this.isMuted || !onAudioChunk || !pcmBuffer) return;

        // Stream each 20ms Int16 PCM frame immediately without client-side batch buffering
        const base64Chunk = arrayBufferToBase64(pcmBuffer);
        this.chunksSent++;
        this.notifyStats();
        onAudioChunk(base64Chunk);
      };

      this.sourceNode.connect(this.workletNode);
      debugLog('audio', 'success', 'Audio graph connected: MediaStream -> AudioWorkletNode (20ms low-latency frames).');

      this.state = this.isMuted ? 'muted' : 'recording';
      this.notifyStats();
    } catch (err) {
      console.error('[AudioManager] startRecording failed:', err);
      this.state = 'error';
      this.notifyStats();
      throw err;
    }
  }

  /**
   * Stops recording and releases microphone hardware.
   */
  public stopRecording(): void {
    if (this.workletNode) {
      try {
        this.workletNode.port.onmessage = null;
      } catch {}
    }

    if (this.sourceNode && this.workletNode) {
      try {
        this.sourceNode.disconnect();
        this.workletNode.disconnect();
      } catch {}
      this.sourceNode = null;
      this.workletNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.inputContext && this.inputContext.state !== 'closed') {
      try {
        this.inputContext.close().catch(() => {});
      } catch {}
      this.inputContext = null;
    }

    this.currentMicLevel = 0;
    this.state = 'idle';
    this.notifyStats();
  }

  /**
   * Plays a returned 24kHz PCM chunk through the queued player.
   */
  public async playChunk(pcmBase64: string, turnId?: number): Promise<boolean> {
    this.chunksReceived++;
    this.notifyStats();
    return await this.queuedPlayer.playChunk(pcmBase64, turnId);
  }

  /**
   * Immediately stops playback and rejects future late chunks for the current turn.
   */
  public interrupt(): void {
    this.queuedPlayer.interrupt();
    this.notifyStats();
  }

  public stopPlayback(): void {
    this.queuedPlayer.stop();
    this.notifyStats();
  }

  public setPlaybackTurnId(turnId: number): void {
    this.queuedPlayer.setTurnId(turnId);
  }

  public setOnFirstChunkPlayed(cb: (turnId: number) => void): void {
    this.queuedPlayer.onFirstChunkPlayed = cb;
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
    if (this.state === 'recording' || this.state === 'muted') {
      this.state = muted ? 'muted' : 'recording';
    }
    this.currentMicLevel = muted ? 0 : this.currentMicLevel;
    this.notifyStats();
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  public getStats(): AudioStats {
    return {
      micLevel: this.currentMicLevel,
      chunksSent: this.chunksSent,
      chunksReceived: this.chunksReceived,
      isPlaying: this.queuedPlayer.getIsPlaying(),
      isMuted: this.isMuted,
    };
  }

  public onStatsUpdate(callback: (stats: AudioStats) => void): () => void {
    this.statsListeners.add(callback);
    callback(this.getStats());
    return () => {
      this.statsListeners.delete(callback);
    };
  }

  private notifyStats(): void {
    const stats = this.getStats();
    this.statsListeners.forEach((cb) => {
      try {
        cb(stats);
      } catch {}
    });
  }

  public close(): void {
    this.stopRecording();
    this.queuedPlayer.close();
    this.chunksSent = 0;
    this.chunksReceived = 0;
    this.currentMicLevel = 0;
    this.isMuted = false;
    this.state = 'idle';
    this.notifyStats();
  }
}

export const audioManager = new AudioManager();
