/**
 * AudioWorklet Utilities
 * -------------------------------------------------------------
 * Static same-origin worklet path resolver and high-performance
 * ArrayBuffer-to-Base64 encoder for 16kHz 16-bit linear PCM streaming.
 */

export const PCM_WORKLET_PROCESSOR_NAME = 'pcm-processor';

/**
 * Returns the static same-origin URL for `worklets/pcm-processor.js`.
 * Never uses dynamic `Blob` or `URL.createObjectURL` to prevent CSP/Safari worklet crashes.
 */
export function getPcmWorkletUrl(): string {
  const baseUrl =
    typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL
      ? (import.meta as unknown as { env: { BASE_URL: string } }).env.BASE_URL
      : '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}worklets/pcm-processor.js`;
}

/**
 * High-performance ArrayBuffer to Base64 encoder for 20-40ms Int16 PCM frames.
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
