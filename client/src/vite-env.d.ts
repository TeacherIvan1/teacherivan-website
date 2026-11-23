/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface LenisInstance {
  stop: () => void;
  start: () => void;
  destroy?: () => void;
}

interface Window {
  __TI_VOICE_SESSION_ACTIVE__?: boolean;
  __lenis?: LenisInstance;
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean | undefined;
}
