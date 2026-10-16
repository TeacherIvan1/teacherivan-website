import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculatePercentile,
  calculateLatencyStats,
  LatencyTracker,
  TurnLatencyRecord,
} from './latencyTracker';

describe('Percentile Calculation', () => {
  it('returns null for empty or null array', () => {
    assert.strictEqual(calculatePercentile([], 50), null);
    assert.strictEqual(calculatePercentile([], 95), null);
  });

  it('returns exact value for single element array', () => {
    assert.strictEqual(calculatePercentile([340], 50), 340);
    assert.strictEqual(calculatePercentile([340], 95), 340);
    assert.strictEqual(calculatePercentile([340], 0), 340);
    assert.strictEqual(calculatePercentile([340], 100), 340);
  });

  it('calculates median (50th percentile) correctly for odd-length arrays', () => {
    // Array: [100, 200, 300] -> median is 200
    assert.strictEqual(calculatePercentile([300, 100, 200], 50), 200);

    // Array: [10, 20, 30, 40, 50] -> median is 30
    assert.strictEqual(calculatePercentile([50, 10, 40, 20, 30], 50), 30);
  });

  it('calculates median (50th percentile) using linear interpolation for even-length arrays', () => {
    // Array: [100, 200] -> index = 0.5 * 1 = 0.5 -> average = 150
    assert.strictEqual(calculatePercentile([100, 200], 50), 150);

    // Array: [10, 20, 30, 40] -> index = 0.5 * 3 = 1.5 -> midpoint of 20 and 30 = 25
    assert.strictEqual(calculatePercentile([40, 10, 30, 20], 50), 25);
  });

  it('calculates 95th percentile (P95) accurately', () => {
    // Generate 100 values from 1 to 100
    const values100 = Array.from({ length: 100 }, (_, i) => i + 1);
    // index = 0.95 * 99 = 94.05 -> between 95 and 96
    const p95 = calculatePercentile(values100, 95);
    assert.strictEqual(p95, 95);

    // Small array: [100, 200, 300, 400, 500]
    // index = 0.95 * 4 = 3.8 -> 400 * 0.2 + 500 * 0.8 = 480
    assert.strictEqual(calculatePercentile([100, 200, 300, 400, 500], 95), 480);
  });

  it('clamps percentiles below 0 and above 100', () => {
    const values = [50, 100, 150];
    assert.strictEqual(calculatePercentile(values, -10), 50);
    assert.strictEqual(calculatePercentile(values, 110), 150);
  });
});

describe('Latency Statistics Aggregation', () => {
  it('returns all nulls and zero count when no records exist', () => {
    const stats = calculateLatencyStats([]);
    assert.deepStrictEqual(stats, {
      lastTurnReceivedMs: null,
      lastTurnPlayedMs: null,
      medianReceivedMs: null,
      medianPlayedMs: null,
      p95ReceivedMs: null,
      p95PlayedMs: null,
      totalTurnsMeasured: 0,
    });
  });

  it('computes last turn, median, and P95 across completed turns', () => {
    const records: TurnLatencyRecord[] = [
      {
        turnId: 1,
        endOfSpeechTime: 1000,
        firstChunkReceivedTime: 1200,
        firstChunkPlayedTime: 1250,
        latencyToFirstChunkReceivedMs: 200,
        latencyToFirstChunkPlayedMs: 250,
      },
      {
        turnId: 2,
        endOfSpeechTime: 2000,
        firstChunkReceivedTime: 2300,
        firstChunkPlayedTime: 2350,
        latencyToFirstChunkReceivedMs: 300,
        latencyToFirstChunkPlayedMs: 350,
      },
      {
        turnId: 3,
        endOfSpeechTime: 3000,
        firstChunkReceivedTime: 3400,
        firstChunkPlayedTime: 3450,
        latencyToFirstChunkReceivedMs: 400,
        latencyToFirstChunkPlayedMs: 450,
      },
    ];

    const stats = calculateLatencyStats(records);
    assert.strictEqual(stats.totalTurnsMeasured, 3);
    assert.strictEqual(stats.lastTurnReceivedMs, 400);
    assert.strictEqual(stats.lastTurnPlayedMs, 450);
    assert.strictEqual(stats.medianReceivedMs, 300);
    assert.strictEqual(stats.medianPlayedMs, 350);
    assert.strictEqual(stats.p95ReceivedMs, 390);
    assert.strictEqual(stats.p95PlayedMs, 440);
  });

  it('handles turns interrupted before audio playback started', () => {
    const records: TurnLatencyRecord[] = [
      {
        turnId: 1,
        endOfSpeechTime: 1000,
        firstChunkReceivedTime: 1200,
        firstChunkPlayedTime: 1260,
        latencyToFirstChunkReceivedMs: 200,
        latencyToFirstChunkPlayedMs: 260,
      },
      {
        // Interrupted before first chunk actually played
        turnId: 2,
        endOfSpeechTime: 2000,
        firstChunkReceivedTime: 2250,
        latencyToFirstChunkReceivedMs: 250,
      },
    ];

    const stats = calculateLatencyStats(records);
    assert.strictEqual(stats.totalTurnsMeasured, 2);
    assert.strictEqual(stats.lastTurnReceivedMs, 250);
    assert.strictEqual(stats.lastTurnPlayedMs, null);
    assert.strictEqual(stats.medianReceivedMs, 225);
    assert.strictEqual(stats.medianPlayedMs, 260); // Only 1 completed playback
  });
});

describe('LatencyTracker Instance Tracking', () => {
  it('tracks in-memory turns without throwing and updates subscribers', () => {
    const tracker = new LatencyTracker();
    let emittedStats = tracker.getStats();

    const unsubscribe = tracker.subscribe((s) => {
      emittedStats = s;
    });

    // Start turn 1: EOS
    tracker.markEndOfSpeech();
    // First chunk received
    tracker.markFirstChunkReceived();
    // First chunk played
    tracker.markFirstChunkPlayed();

    const stats = tracker.getStats();
    assert.strictEqual(stats.totalTurnsMeasured, 1);
    assert(stats.lastTurnReceivedMs !== null && stats.lastTurnReceivedMs >= 0);
    assert(stats.lastTurnPlayedMs !== null && stats.lastTurnPlayedMs >= 0);
    assert.strictEqual(emittedStats.totalTurnsMeasured, 1);

    // Cancel / interruption
    tracker.markEndOfSpeech();
    tracker.cancelCurrentTurn();

    // Reset clears memory
    tracker.reset();
    assert.strictEqual(tracker.getStats().totalTurnsMeasured, 0);

    unsubscribe();
  });
});
