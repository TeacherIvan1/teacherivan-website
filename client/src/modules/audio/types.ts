/**
 * Audio configuration specifications for Gemini Live API
 * Official Live API specifications:
 * - Input: 16kHz PCM 16-bit little-endian mono (audio/pcm;rate=16000)
 * - Output: 24kHz PCM 16-bit little-endian mono (audio/pcm;rate=24000)
 */
export interface AudioStreamConfig {
  inputSampleRate: number; // 16000
  outputSampleRate: number; // 24000
  channels: number; // 1 (mono)
  chunkSize: number; // 2048 samples = 128ms
}

export type AudioManagerState = 'idle' | 'initializing' | 'recording' | 'muted' | 'error';

export interface AudioStats {
  micLevel: number; // 0 - 100 RMS percentage
  chunksSent: number;
  chunksReceived: number;
  isPlaying: boolean;
  isMuted: boolean;
}
