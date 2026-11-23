/**
 * Static Same-Origin AudioWorklet Processor
 * Path: client/public/worklets/pcm-processor.js
 * -------------------------------------------------------------
 * Runs in the Web Audio rendering thread.
 *
 * Responsibilities:
 * 1. Downsamples incoming Float32 microphone audio from native sampleRate (e.g. 48000 / 44100 Hz)
 *    directly to 16000 Hz mono Int16 PCM inside the worklet thread.
 * 2. Emits low-latency 320-sample (20ms) PCM chunks immediately via zero-copy Transferable ArrayBuffer.
 * 3. Preserves client-side 0.006 RMS noise gate and 300ms trailing silence padding without buffering full utterances.
 */

class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSampleRate = 16000;
    this.bufferSize = 320; // 320 samples = 20ms at 16kHz (ultra-low latency)
    this.outputBuffer = new Int16Array(this.bufferSize);
    this.outputIndex = 0;
    this.resampleRatio = sampleRate / this.targetSampleRate;
    this.resampleIndex = 0;
    this.inputBuffer = [];

    // 0.006 RMS noise gate & 300ms trailing silence padding
    this.noiseThreshold = 0.006;
    this.trailingSilenceLimitMs = 300;
    this.silenceDurationMs = 9999;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const channel = input[0];

    if (Math.abs(this.resampleRatio - 1) < 0.001) {
      // Input is already natively 16000 Hz
      for (let i = 0; i < channel.length; i++) {
        const s = Math.max(-1, Math.min(1, channel[i]));
        this.outputBuffer[this.outputIndex++] = s < 0 ? s * 0x8000 : s * 0x7fff;
        if (this.outputIndex >= this.bufferSize) {
          this.flush();
        }
      }
    } else {
      // Linear interpolation resampling from native sampleRate to 16000 Hz
      for (let i = 0; i < channel.length; i++) {
        this.inputBuffer.push(channel[i]);
      }

      while (this.resampleIndex + 1 < this.inputBuffer.length) {
        const idx = Math.floor(this.resampleIndex);
        const frac = this.resampleIndex - idx;
        const s0 = this.inputBuffer[idx];
        const s1 = this.inputBuffer[idx + 1];
        const interpolated = s0 + frac * (s1 - s0);
        const s = Math.max(-1, Math.min(1, interpolated));

        this.outputBuffer[this.outputIndex++] = s < 0 ? s * 0x8000 : s * 0x7fff;
        this.resampleIndex += this.resampleRatio;

        if (this.outputIndex >= this.bufferSize) {
          this.flush();
        }
      }

      const consumed = Math.floor(this.resampleIndex);
      if (consumed > 0) {
        this.inputBuffer = this.inputBuffer.slice(consumed);
        this.resampleIndex -= consumed;
      }
    }

    return true;
  }

  flush() {
    const copy = new Int16Array(this.outputBuffer);
    const frameDurationMs = (copy.length / this.targetSampleRate) * 1000;

    // Calculate RMS volume level
    let sum = 0;
    for (let i = 0; i < copy.length; i++) {
      const val = copy[i] / 32768;
      sum += val * val;
    }
    const rms = Math.sqrt(sum / copy.length);
    const level = Math.min(100, Math.round(rms * 140));

    if (rms < this.noiseThreshold) {
      this.silenceDurationMs += frameDurationMs;
    } else {
      this.silenceDurationMs = 0;
    }

    const isSilenceGateActive = this.silenceDurationMs > this.trailingSilenceLimitMs;
    let int16Buffer;

    if (isSilenceGateActive) {
      const zeroFrame = new Int16Array(copy.length);
      int16Buffer = zeroFrame.buffer;
    } else {
      int16Buffer = copy.buffer;
    }

    this.port.postMessage(
      {
        pcm: int16Buffer,
        pcm16: int16Buffer,
        rms: rms,
        level: isSilenceGateActive ? 0 : level,
        isSilence: isSilenceGateActive,
      },
      [int16Buffer]
    );

    this.outputIndex = 0;
  }
}

registerProcessor('pcm-processor', PcmCaptureProcessor);
registerProcessor('gemini-audio-processor', PcmCaptureProcessor);
