import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { QueuedAudioPlayer } from './queuedAudioPlayer';

interface MockSource {
  buffer: unknown;
  startTime?: number;
  stopped: boolean;
  stopTime?: number;
  disconnected: boolean;
  onended: (() => void) | null;
  start: (time: number) => void;
  stop: (time: number) => void;
  disconnect: () => void;
  connect: (dest: unknown) => void;
}

function createMockAudioContext() {
  const sources: MockSource[] = [];
  let currentTime = 1.0;

  const mockCtx = {
    state: 'running',
    currentTime,
    destination: {},
    resume: async () => {
      mockCtx.state = 'running';
    },
    close: async () => {
      mockCtx.state = 'closed';
    },
    createGain: () => ({
      gain: { value: 1.0 },
      connect: () => {},
    }),
    createBuffer: (_channels: number, length: number, sampleRate: number) => ({
      duration: length / sampleRate,
      getChannelData: () => new Float32Array(length),
    }),
    createBufferSource: (): MockSource => {
      const source: MockSource = {
        buffer: null,
        stopped: false,
        disconnected: false,
        onended: null,
        start(time: number) {
          this.startTime = time;
        },
        stop(time: number) {
          this.stopped = true;
          this.stopTime = time;
        },
        disconnect() {
          this.disconnected = true;
        },
        connect() {},
      };
      sources.push(source);
      return source;
    },
  };

  return {
    context: mockCtx as unknown as AudioContext,
    sources,
    advanceTime: (delta: number) => {
      currentTime += delta;
      mockCtx.currentTime = currentTime;
    },
  };
}

// 4 bytes of base64 representing two 16-bit linear PCM mono samples (zero amplitude)
const SAMPLE_PCM_BASE64 = 'AAAAAA==';

describe('QueuedAudioPlayer Interruption & Queue Flush', () => {
  it('enqueues multiple audio chunks and flushes all queued sources immediately on interrupt()', async () => {
    const { context, sources } = createMockAudioContext();
    const player = new QueuedAudioPlayer();
    player.initialize(context);

    // Play 3 chunks in the current turn
    const res1 = await player.playChunk(SAMPLE_PCM_BASE64, 1);
    const res2 = await player.playChunk(SAMPLE_PCM_BASE64, 1);
    const res3 = await player.playChunk(SAMPLE_PCM_BASE64, 1);

    assert.strictEqual(res1, true);
    assert.strictEqual(res2, true);
    assert.strictEqual(res3, true);

    assert.strictEqual(sources.length, 3);
    assert.strictEqual(player.getQueueLength(), 3);
    assert.strictEqual(player.getIsPlaying(), true);

    // Trigger barge-in / interruption
    player.interrupt();

    // 1. All active sources must be stopped with stop(0)
    for (const source of sources) {
      assert.strictEqual(source.stopped, true);
      assert.strictEqual(source.stopTime, 0);
      assert.strictEqual(source.disconnected, true);
    }

    // 2. Playback queue must be immediately empty
    assert.strictEqual(player.getQueueLength(), 0);

    // 3. Playback state must be false
    assert.strictEqual(player.getIsPlaying(), false);

    player.close();
  });

  it('rejects stale audio chunks from an old/interrupted turn', async () => {
    const { context, sources } = createMockAudioContext();
    const player = new QueuedAudioPlayer();
    player.initialize(context);

    // Initial turn 1: enqueue a chunk
    await player.playChunk(SAMPLE_PCM_BASE64, 1);
    assert.strictEqual(sources.length, 1);

    // User interrupts turn 1: advances turn generation to 2
    player.interrupt();
    assert.strictEqual(player.getCurrentTurnId(), 2);

    // A late chunk from turn 1 arrives in flight over the network buffer
    const lateChunkResult = await player.playChunk(SAMPLE_PCM_BASE64, 1);

    // Must be rejected
    assert.strictEqual(lateChunkResult, false);
    // No new source node should have been created for the stale chunk
    assert.strictEqual(sources.length, 1);
    assert.strictEqual(player.getQueueLength(), 0);

    // Even older chunk from turn 0
    const olderChunkResult = await player.playChunk(SAMPLE_PCM_BASE64, 0);
    assert.strictEqual(olderChunkResult, false);
    assert.strictEqual(sources.length, 1);

    player.close();
  });

  it('accepts fresh chunks for the current or new turn after interruption', async () => {
    const { context, sources } = createMockAudioContext();
    const player = new QueuedAudioPlayer();
    player.initialize(context);

    // Start at turn 1 and interrupt
    player.setTurnId(1);
    player.interrupt(); // turnId becomes 2

    // Chunks matching the active turnId (2) must play normally
    const turn2Result = await player.playChunk(SAMPLE_PCM_BASE64, 2);
    assert.strictEqual(turn2Result, true);
    assert.strictEqual(player.getQueueLength(), 1);
    assert.strictEqual(player.getIsPlaying(), true);

    // Next turn 3 begins and syncs player
    const turn3Result = await player.playChunk(SAMPLE_PCM_BASE64, 3);
    assert.strictEqual(turn3Result, true);
    assert.strictEqual(player.getCurrentTurnId(), 3);

    // A delayed chunk from turn 2 arrives after turn 3 has begun
    const delayedTurn2Result = await player.playChunk(SAMPLE_PCM_BASE64, 2);
    assert.strictEqual(delayedTurn2Result, false);

    player.close();
  });

  it('handles multi-session lifecycle: start, enqueue, stop, start, enqueue again, and schedules audio in second session', async () => {
    const player = new QueuedAudioPlayer();

    // --- SESSION 1 ---
    const session1 = createMockAudioContext();
    player.initialize(session1.context);

    // Enqueue chunks in session 1
    const s1Turn0Res = await player.playChunk(SAMPLE_PCM_BASE64, 0);
    const s1Turn1Res = await player.playChunk(SAMPLE_PCM_BASE64, 1);
    assert.strictEqual(s1Turn0Res, true, 'Session 1 Turn 0 chunk must be accepted');
    assert.strictEqual(s1Turn1Res, true, 'Session 1 Turn 1 chunk must be accepted');
    assert.strictEqual(session1.sources.length, 2);
    assert.strictEqual(player.getQueueLength(), 2);
    assert.strictEqual(player.getIsPlaying(), true);

    // End / stop session 1
    player.close();
    assert.strictEqual(player.getQueueLength(), 0);
    assert.strictEqual(player.getIsPlaying(), false);

    // --- SESSION 2 ---
    // Start session 2 with fresh context and turnId 0
    const session2 = createMockAudioContext();
    player.initialize(session2.context);

    // Turn ID must be reset to 0 for the fresh session
    assert.strictEqual(player.getCurrentTurnId(), 0, 'Turn ID must be reset to 0 in new session');

    // In session 2, the tutor's opening response starts at turn 0
    const s2Turn0Res = await player.playChunk(SAMPLE_PCM_BASE64, 0);
    assert.strictEqual(
      s2Turn0Res,
      true,
      'Session 2 Turn 0 chunk MUST NOT be dropped as a stale chunk from session 1'
    );

    // Verify audio is scheduled in the second session
    assert.strictEqual(session2.sources.length, 1, 'Audio source must be created in session 2 context');
    assert.strictEqual(player.getQueueLength(), 1, 'Queue must contain the scheduled chunk');
    assert.strictEqual(player.getIsPlaying(), true, 'Player must be marked as playing');

    // Enqueue second chunk in session 2
    const s2Turn1Res = await player.playChunk(SAMPLE_PCM_BASE64, 1);
    assert.strictEqual(s2Turn1Res, true, 'Session 2 subsequent turn chunk must be accepted');
    assert.strictEqual(session2.sources.length, 2);
    assert.strictEqual(player.getQueueLength(), 2);

    player.close();
  });
});
