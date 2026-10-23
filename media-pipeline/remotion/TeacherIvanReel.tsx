import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Video,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { TeacherIvanReelProps } from './types';
export type { TeacherIvanReelProps };
import { HookDropCounterScene } from './scenes/HookDropCounterScene';
import { PainPointBarScene } from './scenes/PainPointBarScene';
import { BreakthroughCounterScene } from './scenes/BreakthroughCounterScene';
import { LiveRecastScene } from './scenes/LiveRecastScene';
import { HybridFormulaScene } from './scenes/HybridFormulaScene';
import { FinalCTAScene } from './scenes/FinalCTAScene';
import { WordSyncedCaptions } from './WordSyncedCaptions';
import { ChibiAvatarStage } from './ChibiAvatarStage';

const resolveMediaSrc = (src?: string) => {
  if (!src) return undefined;
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('file:///')
  ) {
    return src;
  }
  return staticFile(src);
};

// 6 Fast-Cut Scenes alternating Dark (#1A3153) and Light (#FAFAFA)
// Total frames: 2100 @ 60fps (35.0s)
const SCENE_CONFIGS = [
  { id: 'hookDrop', from: 0, duration: 318 },          // 0.0s – 5.3s (Dark #1A3153)
  { id: 'painPoint', from: 318, duration: 402 },       // 5.3s – 12.0s (Light #FAFAFA)
  { id: 'breakthrough', from: 720, duration: 348 },    // 12.0s – 17.8s (Dark #1A3153)
  { id: 'liveRecast', from: 1068, duration: 330 },     // 17.8s – 23.3s (Light #FAFAFA)
  { id: 'hybridFormula', from: 1398, duration: 300 },  // 23.3s – 28.3s (Dark #1A3153)
  { id: 'finalCta', from: 1698, duration: 402 },       // 28.3s – 35.0s (Light #FAFAFA)
];

const SCENE_TRANSITION_FRAMES = SCENE_CONFIGS.map((s) => s.from);

export const TeacherIvanReel: React.FC<TeacherIvanReelProps> = ({
  title = '¿SABÍAS QUE EN CLASES\nSÓLO HABLAS UN 30%?',
  subtitle = 'DIAGNÓSTICO REAL',
  character = 'ivan',
  videoSrc,
  audioSrc = 'audio/voz.mp3',
  musicSrc = 'audio/sfx/bg-music.wav',
  words = [],
  ctaText = 'TEACHERIVAN.COM — TEST GRATIS',
  hookDurationSeconds = 5.3,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentTime = frame / fps;

  const isCierre = frame >= 1698;

  // Background subtle grid pulse
  const patternOpacity = interpolate(Math.sin(frame * 0.04), [-1, 1], [0.05, 0.10]);

  // SFX Timing:
  // 1. Whoosh sweeps at every scene transition
  const whooshFrames = SCENE_TRANSITION_FRAMES;

  // 2. Crisp UI pops on visual entries
  const popFrames = [
    318 + 15,  // Pain point bar
    318 + 35,  // Pain alarm card
    1068 + 15, // Recast error card
    1068 + 35, // Recast solution card
    1068 + 55, // Scenario pills
    1398 + 15, // Plus symbol
    1398 + 35, // Clase 1-a-1 block
  ];

  // 3. Brand chime dings
  const dingFrames = [
    118,        // Counter drops to 30% impact (Scene 1)
    720 + 125,  // Slot counter hits 78% STT (Scene 3)
    1698 + 35,  // CTA button click (Scene 6)
  ];

  return (
    <AbsoluteFill className="bg-[#FAFAFA] font-montserrat select-none overflow-hidden text-[#1A3153]">
      {/* 1. SUTILE EDUCATIONAL BACKGROUND GRID PATTERN (from DESIGN.md) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: patternOpacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="edu-grid-remotion" width="120" height="120" patternUnits="userSpaceOnUse">
            <path
              d="M18 30 h30 a6 6 0 0 1 6 6 v12 a6 6 0 0 1 -6 6 h-12 l-7 7 v-7 h-11 a6 6 0 0 1 -6 -6 v-12 a6 6 0 0 1 6 -6 z"
              fill="none"
              stroke="#A7C7E7"
              strokeWidth="2.5"
            />
            <path d="M78 24 v18 M85 18 v30 M92 26 v14" stroke="#E09B30" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="90" cy="90" r="14" fill="none" stroke="#1A3153" strokeWidth="2.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#edu-grid-remotion)" />
      </svg>

      {/* 2. TOP HALF (height: 960px) — 6 FAST-CUT ALTERNATING SCENES */}
      <div className="absolute top-0 left-0 w-full h-[960px] z-10 overflow-hidden flex flex-col justify-center items-center">
        {/* Scene 1: 0.0s – 5.3s (Dark #1A3153 Canvas) */}
        <Sequence from={0} durationInFrames={318}>
          <HookDropCounterScene />
        </Sequence>

        {/* Scene 2: 5.3s – 12.0s (Light #FAFAFA Canvas) */}
        <Sequence from={318} durationInFrames={402}>
          <PainPointBarScene />
        </Sequence>

        {/* Scene 3: 12.0s – 17.8s (Dark #1A3153 Canvas) */}
        <Sequence from={720} durationInFrames={348}>
          <BreakthroughCounterScene />
        </Sequence>

        {/* Scene 4: 17.8s – 23.3s (Light #FAFAFA Canvas) */}
        <Sequence from={1068} durationInFrames={330}>
          <LiveRecastScene />
        </Sequence>

        {/* Scene 5: 23.3s – 28.3s (Dark #1A3153 Canvas) */}
        <Sequence from={1398} durationInFrames={300}>
          <HybridFormulaScene />
        </Sequence>

        {/* Scene 6: 28.3s – 35.0s (Light #FAFAFA Canvas) */}
        <Sequence from={1698} durationInFrames={402}>
          <FinalCTAScene />
        </Sequence>
      </div>

      {/* 3. CENTER SEAM DIVIDER & SHADOW (y: 956px to 964px) */}
      <div className="absolute top-[958px] left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-[#A7C7E7]/60 to-transparent z-20" />

      {/* 4. CENTER SEAM (y: 870px to 1040px) — WORD-BY-WORD SYNCED CAPTIONS */}
      <WordSyncedCaptions
        words={words}
        hookTitle={title}
        hookDurationSeconds={hookDurationSeconds}
      />

      {/* 5. BOTTOM HALF (height: 960px) — PROTAGONIST STAGE */}
      <div className="absolute bottom-0 left-0 w-full h-[960px] z-10 overflow-hidden flex flex-col justify-end items-center bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent">
        {videoSrc ? (
          <div className="w-full h-full relative">
            <Video
              src={resolveMediaSrc(videoSrc)!}
              className="w-full h-full object-cover"
              muted
            />
          </div>
        ) : (
          <ChibiAvatarStage
            character={character}
            words={words}
            isCierre={isCierre}
            sceneTransitionFrames={SCENE_TRANSITION_FRAMES}
          />
        )}
      </div>

      {/* 6. AUDIO TRACKS & SYNTHESIZED SFX SUITE */}
      {/* 6A. Energetic Male Voiceover Track */}
      {audioSrc && (
        <Audio
          src={resolveMediaSrc(audioSrc)!}
          volume={1.0}
        />
      )}

      {/* 6B. Background Lo-Fi Ambient Music Loop (mixed at subtle 0.10) */}
      {musicSrc && (
        <Audio
          src={resolveMediaSrc(musicSrc)!}
          volume={0.10}
          loop
        />
      )}

      {/* 6C. Scene Transition Whooshes (at 0s, 4.8s, 11.2s, 17.5s, 23.2s, 26.8s) */}
      {whooshFrames.map((f, i) => (
        <Sequence key={`sfx-whoosh-${i}`} from={f} durationInFrames={Math.round(fps * 0.5)}>
          <Audio
            src={staticFile('audio/sfx/whoosh.wav')}
            volume={0.35}
          />
        </Sequence>
      ))}

      {/* 6D. Crisp UI Pops */}
      {popFrames.map((f, i) => (
        <Sequence key={`sfx-pop-${i}`} from={f} durationInFrames={Math.round(fps * 0.18)}>
          <Audio
            src={staticFile('audio/sfx/pop.wav')}
            volume={0.25}
          />
        </Sequence>
      ))}

      {/* 6E. Warm Harmonic Brand Dings */}
      {dingFrames.map((f, i) => (
        <Sequence key={`sfx-ding-${i}`} from={f} durationInFrames={Math.round(fps * 1.5)}>
          <Audio
            src={staticFile('audio/sfx/ding.wav')}
            volume={0.45}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
