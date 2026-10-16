/**
 * Latency Tracker & Metrics Module
 * -------------------------------------------------------------
 * Measures conversational turn latency for the Gemini Live API session.
 *
 * LATENCY DEFINITION & EVENT BOUNDARIES:
 * -------------------------------------------------------------
 * 1. "End of user speech" (EOS):
 *    Defined as the arrival timestamp (performance.now()) of the final
 *    `serverContent.inputTranscription` event received from the Gemini Live API
 *    for the current user turn before the model begins responding (or the send
 *    timestamp if the turn was initiated as a text turn).
 *    Because the Gemini Live API performs server-side Voice Activity Detection
 *    (VAD) on the incoming 16kHz audio stream, the final inputTranscription chunk
 *    marks the point where the server recognized that the user stopped speaking.
 *
 * 2. "First audio chunk received":
 *    Defined as the timestamp (performance.now()) when the first `serverContent.modelTurn.parts`
 *    containing 24kHz PCM audio data arrives over the WebSocket for that turn.
 *    Time to First Chunk Received = (First Audio Chunk Arrival Time) - (EOS Time).
 *
 * 3. "First audio chunk actually played":
 *    Defined as the timestamp when the first audio chunk actually starts playback
 *    in the Web Audio API context (currentTime reaching the scheduled start time).
 *    Time to First Chunk Played = (Playback Start Time) - (EOS Time).
 *
 * Note: Raw per-turn numbers are strictly held in-memory only and never persisted
 * to disk or external storage.
 */

export interface TurnLatencyRecord {
  turnId: number;
  endOfSpeechTime: number; // performance.now()
  firstChunkReceivedTime?: number;
  firstChunkPlayedTime?: number;
  latencyToFirstChunkReceivedMs?: number;
  latencyToFirstChunkPlayedMs?: number;
}

export interface LatencyStats {
  lastTurnReceivedMs: number | null;
  lastTurnPlayedMs: number | null;
  medianReceivedMs: number | null;
  medianPlayedMs: number | null;
  p95ReceivedMs: number | null;
  p95PlayedMs: number | null;
  totalTurnsMeasured: number;
}

/**
 * Calculates a specific percentile (e.g. 50 for median, 95 for P95)
 * from a numeric array using standard linear interpolation.
 */
export function calculatePercentile(values: number[], percentile: number): number | null {
  if (!values || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 1) return Math.round(sorted[0]);

  const p = Math.max(0, Math.min(100, percentile));
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  const interpolated = sorted[lower] * (1 - weight) + sorted[upper] * weight;
  return Math.round(interpolated);
}

/**
 * Computes aggregated latency statistics (last turn, median, P95) from
 * raw turn latency records.
 */
export function calculateLatencyStats(records: TurnLatencyRecord[]): LatencyStats {
  const completedRecords = records.filter(
    (r) => r.latencyToFirstChunkReceivedMs !== undefined
  );

  if (completedRecords.length === 0) {
    return {
      lastTurnReceivedMs: null,
      lastTurnPlayedMs: null,
      medianReceivedMs: null,
      medianPlayedMs: null,
      p95ReceivedMs: null,
      p95PlayedMs: null,
      totalTurnsMeasured: 0,
    };
  }

  const receivedValues = completedRecords
    .map((r) => r.latencyToFirstChunkReceivedMs)
    .filter((v): v is number => v !== undefined && v !== null && !isNaN(v));

  const playedValues = completedRecords
    .map((r) => r.latencyToFirstChunkPlayedMs)
    .filter((v): v is number => v !== undefined && v !== null && !isNaN(v));

  const lastRecord = completedRecords[completedRecords.length - 1];

  return {
    lastTurnReceivedMs: lastRecord?.latencyToFirstChunkReceivedMs ?? null,
    lastTurnPlayedMs: lastRecord?.latencyToFirstChunkPlayedMs ?? null,
    medianReceivedMs: calculatePercentile(receivedValues, 50),
    medianPlayedMs: calculatePercentile(playedValues, 50),
    p95ReceivedMs: calculatePercentile(receivedValues, 95),
    p95PlayedMs: calculatePercentile(playedValues, 95),
    totalTurnsMeasured: completedRecords.length,
  };
}

export class LatencyTracker {
  // In-memory per-turn records only
  private records: TurnLatencyRecord[] = [];
  private currentTurn: TurnLatencyRecord | null = null;
  private currentTurnId: number = 0;
  private listeners: Set<(stats: LatencyStats) => void> = new Set();

  /**
   * Called whenever user speech or input transcription activity occurs.
   * Updates the End of User Speech (EOS) timestamp.
   */
  public markEndOfSpeech(): void {
    const now = performance.now();
    if (!this.currentTurn || this.currentTurn.firstChunkReceivedTime !== undefined) {
      // Begin tracking a new turn
      this.currentTurnId++;
      this.currentTurn = {
        turnId: this.currentTurnId,
        endOfSpeechTime: now,
      };
    } else {
      // Update EOS for the ongoing user speech turn as new transcription chunks arrive
      this.currentTurn.endOfSpeechTime = now;
    }
  }

  /**
   * Called when the first audio chunk from the model turn arrives.
   */
  public markFirstChunkReceived(): void {
    if (!this.currentTurn || this.currentTurn.firstChunkReceivedTime !== undefined) {
      return;
    }

    const now = performance.now();
    this.currentTurn.firstChunkReceivedTime = now;
    this.currentTurn.latencyToFirstChunkReceivedMs = Math.max(
      0,
      Math.round(now - this.currentTurn.endOfSpeechTime)
    );

    this.notify();
  }

  /**
   * Called when the first audio chunk starts actual Web Audio playback.
   */
  public markFirstChunkPlayed(): void {
    if (!this.currentTurn || this.currentTurn.firstChunkPlayedTime !== undefined) {
      return;
    }

    const now = performance.now();
    this.currentTurn.firstChunkPlayedTime = now;
    this.currentTurn.latencyToFirstChunkPlayedMs = Math.max(
      0,
      Math.round(now - this.currentTurn.endOfSpeechTime)
    );

    // Turn is finalized into memory
    this.records.push({ ...this.currentTurn });
    this.notify();
  }

  /**
   * Called if a turn is interrupted before audio plays or finishes.
   */
  public cancelCurrentTurn(): void {
    if (this.currentTurn && this.currentTurn.firstChunkReceivedTime !== undefined && this.currentTurn.firstChunkPlayedTime === undefined) {
      // Record partial turn (received chunk before interruption)
      this.records.push({ ...this.currentTurn });
    }
    this.currentTurn = null;
    this.notify();
  }

  public getStats(): LatencyStats {
    return calculateLatencyStats(this.records);
  }

  public reset(): void {
    this.records = [];
    this.currentTurn = null;
    this.currentTurnId = 0;
    this.notify();
  }

  public subscribe(listener: (stats: LatencyStats) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStats());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const stats = this.getStats();
    this.listeners.forEach((l) => {
      try {
        l(stats);
      } catch {}
    });
  }
}

export const latencyTracker = new LatencyTracker();
