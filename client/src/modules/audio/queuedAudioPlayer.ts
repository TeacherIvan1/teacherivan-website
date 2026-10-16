/**
 * Queued Audio Player for Gemini Live API
 * -------------------------------------------------------------
 * Plays returned 24kHz 16-bit linear PCM little-endian mono audio chunks
 * received from the Gemini Live API via WebSockets.
 *
 * Uses precise Web Audio API timeline scheduling (AudioContext.currentTime)
 * to ensure gapless, glitch-free continuous voice playback, and provides
 * instant cancellation (barge-in / interruption) support when the learner
 * speaks over the tutor.
 *
 * Interruption Guarantees:
 * 1. Halts currently playing audio immediately.
 * 2. Flushes all queued future audio chunks.
 * 3. Generation tracking (currentTurnId) rejects late/stale chunks from old turns.
 */

export function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit PCM little endian
  const dataView = new DataView(bytes.buffer);
  const numSamples = Math.floor(len / 2);
  const float32 = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
  }

  return float32;
}

export class QueuedAudioPlayer {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private scheduledEndTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isPlaying: boolean = false;
  private readonly sampleRate: number = 24000;

  // Turn ID generation counter to invalidate stale / late-arriving chunks
  private currentTurnId: number = 0;
  private playedFirstChunkForTurn: Set<number> = new Set();
  private pendingTimeouts: number[] = [];

  public onPlaybackStateChange?: (isPlaying: boolean) => void;
  public onFirstChunkPlayed?: (turnId: number) => void;

  /**
   * Initializes the 24kHz Web Audio playback context.
   * Can accept a custom AudioContext (e.g. for testing or mocks).
   * Resets playback timeline and turn counters for a fresh session.
   */
  public initialize(customContext?: AudioContext): void {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      if (customContext) {
        this.audioContext = customContext;
      } else {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioCtx({ sampleRate: this.sampleRate });
      }

      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;
      this.gainNode.connect(this.audioContext.destination);
    }

    // Always reset playback timeline and turn generator for a fresh session
    this.scheduledEndTime = 0;
    this.currentTurnId = 0;
    this.playedFirstChunkForTurn.clear();
    this.isPlaying = false;
  }

  /**
   * Resumes the AudioContext to ensure it is running (captures user gesture).
   */
  public async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (err) {
        console.warn('[QueuedAudioPlayer] resume error:', err);
      }
    }
  }

  /**
   * Sets or updates the active turn generation ID.
   */
  public setTurnId(turnId: number): void {
    this.currentTurnId = turnId;
  }

  public getCurrentTurnId(): number {
    return this.currentTurnId;
  }

  /**
   * Enqueues a base64-encoded 24kHz 16-bit PCM chunk for gapless playback.
   * If a turnId is passed and matches an old or interrupted turn, it is dropped.
   */
  public async playChunk(base64Pcm: string, turnId?: number): Promise<boolean> {
    if (!base64Pcm || base64Pcm.length === 0) return false;

    // Reject stale chunks from previous or interrupted turns
    if (turnId !== undefined && turnId < this.currentTurnId) {
      return false;
    }

    // Sync currentTurnId if a higher turnId arrives
    if (turnId !== undefined) {
      this.currentTurnId = Math.max(this.currentTurnId, turnId);
    }

    const assignedTurnId = turnId !== undefined ? turnId : this.currentTurnId;

    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.initialize();
    }

    if (this.audioContext!.state === 'suspended') {
      await this.audioContext!.resume();
    }

    // Check again after async resume in case interruption arrived while resuming
    if (assignedTurnId < this.currentTurnId) {
      return false;
    }

    const float32Data = base64ToFloat32Array(base64Pcm);
    if (float32Data.length === 0) return false;

    const audioBuffer = this.audioContext!.createBuffer(1, float32Data.length, this.sampleRate);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = this.audioContext!.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.gainNode!);

    const now = this.audioContext!.currentTime;
    // Schedule and play the very first incoming chunk immediately (now + 0.02)
    if (this.scheduledEndTime < now) {
      this.scheduledEndTime = now + 0.02;
    }

    const startTime = this.scheduledEndTime;
    source.start(startTime);
    this.scheduledEndTime += audioBuffer.duration;
    this.activeSources.push(source);

    // Track when the first chunk of this turn actually begins playback
    if (!this.playedFirstChunkForTurn.has(assignedTurnId)) {
      this.playedFirstChunkForTurn.add(assignedTurnId);
      const delayMs = Math.max(0, Math.round((startTime - now) * 1000));
      const timeoutId = (globalThis.setTimeout || setTimeout)(() => {
        if (assignedTurnId === this.currentTurnId) {
          this.onFirstChunkPlayed?.(assignedTurnId);
        }
      }, delayMs) as unknown as number;
      this.pendingTimeouts.push(timeoutId);
    }

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.onPlaybackStateChange?.(true);
    }

    source.onended = () => {
      const index = this.activeSources.indexOf(source);
      if (index !== -1) {
        this.activeSources.splice(index, 1);
      }
      if (this.activeSources.length === 0) {
        this.isPlaying = false;
        this.onPlaybackStateChange?.(false);
      }
    };

    return true;
  }

  /**
   * Invoked on user barge-in / interruption:
   * 1. Increments currentTurnId so any in-flight chunks are dropped.
   * 2. Immediately stops all active and queued audio sources.
   * 3. Clears playback timeline and pending timeouts.
   */
  public interrupt(): void {
    this.currentTurnId++;
    this.stop();
  }

  /**
   * Immediately stops all currently playing and queued audio.
   */
  public stop(): void {
    this.pendingTimeouts.forEach((id) => (globalThis.clearTimeout || clearTimeout)(id));
    this.pendingTimeouts = [];

    for (const source of this.activeSources) {
      try {
        source.stop(0);
        source.disconnect();
      } catch {
        // Source might have already ended
      }
    }
    this.activeSources = [];
    if (this.audioContext) {
      this.scheduledEndTime = this.audioContext.currentTime;
    } else {
      this.scheduledEndTime = 0;
    }

    if (this.isPlaying) {
      this.isPlaying = false;
      this.onPlaybackStateChange?.(false);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getQueueLength(): number {
    return this.activeSources.length;
  }

  /**
   * Resets all internal player state, flushes the queue, resets turnId to 0,
   * and cleanly closes and releases the audio context.
   */
  public reset(): void {
    this.stop();
    this.currentTurnId = 0;
    this.playedFirstChunkForTurn.clear();
    this.scheduledEndTime = 0;
    this.isPlaying = false;
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close().catch(() => {});
      } catch {}
    }
    this.audioContext = null;
    this.gainNode = null;
  }

  public close(): void {
    this.reset();
  }
}
