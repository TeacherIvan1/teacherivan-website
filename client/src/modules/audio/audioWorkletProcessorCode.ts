/**
 * AudioWorklet Processor Source Code
 * -------------------------------------------------------------
 * Runs in the Web Audio rendering thread.
 *
 * Responsibilities:
 * 1. Takes microphone audio samples from input channel (Float32).
 * 2. Downsamples from any browser AudioContext sample rate (e.g. 48kHz, 44.1kHz)
 *    to the official Gemini Live API specification: 16,000 Hz.
 * 3. Converts linear Float32 values [-1.0, 1.0] to signed 16-bit PCM little-endian.
 * 4. Buffers samples into chunks of 2048 samples (128ms at 16kHz).
 * 5. Computes RMS mic volume level (0-100) for UI visualization.
 * 6. Transfers the Int16Array ArrayBuffer to the main thread with zero copy.
 */

export const AUDIO_WORKLET_PROCESSOR_CODE = `
class GeminiAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSampleRate = 16000;
    this.bufferSize = 2048; // 2048 samples = ~128ms at 16kHz
    this.outputBuffer = new Int16Array(this.bufferSize);
    this.outputIndex = 0;
    this.resampleRatio = sampleRate / this.targetSampleRate;
    this.resampleIndex = 0;
    this.inputBuffer = [];
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const channel = input[0];

    if (Math.abs(this.resampleRatio - 1) < 0.001) {
      // Input is natively 16kHz
      for (let i = 0; i < channel.length; i++) {
        const s = Math.max(-1, Math.min(1, channel[i]));
        this.outputBuffer[this.outputIndex++] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        if (this.outputIndex >= this.bufferSize) {
          this.flush();
        }
      }
    } else {
      // Linear interpolation resampling to 16kHz
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

        this.outputBuffer[this.outputIndex++] = s < 0 ? s * 0x8000 : s * 0x7FFF;
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

    // Calculate RMS volume level
    let sum = 0;
    for (let i = 0; i < copy.length; i++) {
      const val = copy[i] / 32768;
      sum += val * val;
    }
    const rms = Math.sqrt(sum / copy.length);
    const level = Math.min(100, Math.round(rms * 130));

    this.port.postMessage(
      {
        pcm16: copy.buffer,
        level: level,
      },
      [copy.buffer]
    );

    this.outputIndex = 0;
  }
}

registerProcessor('gemini-audio-processor', GeminiAudioProcessor);
`;

/**
 * Creates an object URL containing the AudioWorklet processor definition.
 */
export function createAudioWorkletBlobUrl(): string {
  const blob = new Blob([AUDIO_WORKLET_PROCESSOR_CODE], {
    type: 'application/javascript; charset=utf-8',
  });
  return URL.createObjectURL(blob);
}

/**
 * High-performance ArrayBuffer to Base64 encoder.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 8192;
  let binary = '';

  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }

  return btoa(binary);
}
