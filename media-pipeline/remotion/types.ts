export interface WordTimestamp {
  w?: string;
  word?: string;
  s?: number; // start time in seconds
  start?: number;
  e?: number; // end time in seconds
  end?: number;
}

export type SceneId =
  | 'hookDrop'
  | 'painPoint'
  | 'breakthrough'
  | 'liveRecast'
  | 'hybridFormula'
  | 'finalCta'
  | 'counter'
  | 'pills'
  | 'phoneComparison'
  | 'bichronous'
  | 'cta'
  | string;

export interface SceneConfig {
  id: SceneId;
  durationInSeconds?: number;
  badge?: string;
  title?: string;
  subtitle?: string;
}

export interface TeacherIvanReelProps {
  /** Main hook title displayed in the center seam / top stage */
  title?: string;
  /** Sub-badge for the scene */
  subtitle?: string;
  /** Protagonist character avatar */
  character?: 'ivan' | 'emma';
  /** Path to an optional real-world video clip (e.g. tomas/t1.mp4) */
  videoSrc?: string;
  /** Path or URL to speech audio (voz.mp3) */
  audioSrc?: string;
  /** Path or URL to background music (musica/opcion1.mp3) */
  musicSrc?: string;
  /** Word-level timestamps from Whisper / Gemini control */
  words?: WordTimestamp[];
  /** Final CTA button text */
  ctaText?: string;
  /** Total duration in seconds (optional override) */
  durationInSeconds?: number;
  /** Active scene identifiers in order */
  activeScenes?: SceneId[];
  /** Initial hook duration before full scenes transition (seconds) */
  hookDurationSeconds?: number;
  [key: string]: unknown;
}
