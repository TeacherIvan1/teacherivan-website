import { AudioStreamConfig, AudioManagerState, AudioStats } from './types';
import { QueuedAudioPlayer } from './queuedAudioPlayer';
import { createAudioWorkletBlobUrl, arrayBufferToBase64 } from './audioWorkletProcessorCode';
import { debugLog, useDebugStore } from '../debug/debugLogger';

/**
 * AudioManager
 * -------------------------------------------------------------
 * Manages full bidirectional audio streaming for Gemini Live API:
 * 1. Captures microphone audio using an AudioWorkletNode.
 * 2. Emits raw 16kHz 16-bit linear PCM little-endian mono base64 chunks.
 * 3. Plays model audio responses (24kHz PCM) using the QueuedAudioPlayer.
 * 4. Provides real-time microphone RMS volume monitoring and barge-in cutoff.
 */
export class AudioManager {
  private state: AudioManagerState = 'idle';
  private config: AudioStreamConfig = {
    inputSampleRate: 16000,
    outputSampleRate: 24000,
    channels: 1,
    chunkSize: 2048,
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
  private workletUrl: string | null = null;

  constructor() {
    this.queuedPlayer.onPlaybackStateChange = (isPlaying) => {
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
   * Initializes playback audio pipeline and prepares AudioWorklet module.
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
   * Starts capturing microphone audio using AudioWorklet.
   * Chunks are resampled to 16kHz linear PCM 16-bit mono and emitted as base64.
   */
  public async startRecording(onAudioChunk?: (pcmBase64: string) => void): Promise<void> {
    try {
      await this.initialize();

      // Check microphone permission if Permissions API is available
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
      // Request microphone access with acoustic echo cancellation
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
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
      this.inputContext = new AudioCtx({ sampleRate: 16000 });

      useDebugStore.getState().setAudioInfo(this.inputContext.state, this.inputContext.sampleRate);
      debugLog('audio', 'info', `Input AudioContext created: state=${this.inputContext.state}, sampleRate=${this.inputContext.sampleRate}Hz`);

      if (this.inputContext.state === 'suspended') {
        debugLog('audio', 'info', 'Resuming suspended AudioContext...');
        await this.inputContext.resume();
        useDebugStore.getState().setAudioInfo(this.inputContext.state, this.inputContext.sampleRate);
        debugLog('audio', 'info', `Input AudioContext resumed: state=${this.inputContext.state}`);
      }

      // Load AudioWorklet module from Blob URL
      if (!this.workletUrl) {
        this.workletUrl = createAudioWorkletBlobUrl();
      }
      debugLog('audio', 'info', 'Loading AudioWorklet module (gemini-audio-processor)...');
      await this.inputContext.audioWorklet.addModule(this.workletUrl);
      debugLog('audio', 'success', 'AudioWorklet module loaded successfully!');

      // Create audio graph
      this.sourceNode = this.inputContext.createMediaStreamSource(this.mediaStream);
      this.workletNode = new AudioWorkletNode(this.inputContext, 'gemini-audio-processor');

      this.workletNode.port.onmessage = (event: MessageEvent) => {
        const { pcm16, level } = event.data as { pcm16: ArrayBuffer; level: number };

        this.currentMicLevel = this.isMuted ? 0 : (level || 0);
        this.notifyStats();

        if (this.isMuted || !onAudioChunk) return;

        const base64Chunk = arrayBufferToBase64(pcm16);
        this.chunksSent++;
        this.notifyStats();
        onAudioChunk(base64Chunk);
      };

      this.sourceNode.connect(this.workletNode);
      debugLog('audio', 'success', 'Audio graph connected: MediaStream -> AudioWorkletNode. Streaming chunks.');
      // Connect to destination through a zero gain or keep worklet active
      // AudioWorkletNode is self-running in modern browsers, but connecting ensures clocking

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
   * If a turnId is passed and matches an old or interrupted turn, it is discarded.
   */
  public async playChunk(pcmBase64: string, turnId?: number): Promise<boolean> {
    this.chunksReceived++;
    this.notifyStats();
    return await this.queuedPlayer.playChunk(pcmBase64, turnId);
  }

  /**
   * Immediately stops playback and rejects future late chunks for the current turn.
   * Invoked on barge-in / interruption.
   */
  public interrupt(): void {
    this.queuedPlayer.interrupt();
    this.notifyStats();
  }

  /**
   * Stops playback immediately.
   */
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

  /**
   * Toggles microphone mute.
   */
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
    if (this.workletUrl) {
      try {
        URL.revokeObjectURL(this.workletUrl);
      } catch {}
      this.workletUrl = null;
    }
    this.chunksSent = 0;
    this.chunksReceived = 0;
    this.currentMicLevel = 0;
    this.isMuted = false;
    this.state = 'idle';
    this.notifyStats();
  }
}

// Singleton audio manager instance ready for export
export const audioManager = new AudioManager();
