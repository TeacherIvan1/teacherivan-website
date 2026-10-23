import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WordTimestamp } from './types';
import { ChibiAvatar } from './ChibiAvatar';

export interface ChibiAvatarStageProps {
  character?: 'ivan' | 'emma';
  words?: WordTimestamp[];
  isCierre?: boolean;
  sceneTransitionFrames?: number[];
}

const SCENE_STATUS_PILLS = [
  { startFrame: 0, label: '⏳ 30% Habla', color: '#E09B30' },
  { startFrame: 318, label: '⚠️ Solo 2 Minutos', color: '#EF4444' },
  { startFrame: 720, label: '🚀 78% Habla Activa', color: '#E09B30' },
  { startFrame: 1068, label: '⚡ Recast al Instante', color: '#E09B30' },
  { startFrame: 1398, label: '💎 IA + Clase 1-a-1', color: '#A7C7E7' },
  { startFrame: 1698, label: '🎙️ Test Gratis 90s', color: '#E09B30' },
];

export const ChibiAvatarStage: React.FC<ChibiAvatarStageProps> = ({
  character = 'ivan',
  words = [],
  isCierre = false,
  sceneTransitionFrames = [0, 318, 720, 1068, 1398, 1698],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Determine if character is currently speaking based on words timestamp
  const isSpeaking = useMemo(() => {
    if (!words || words.length === 0) {
      return Math.sin(frame * 0.1) > 0;
    }
    return words.some((w) => {
      const s = w.s ?? w.start ?? 0;
      const e = w.e ?? w.end ?? 0;
      return currentTime >= s && currentTime <= e;
    });
  }, [words, currentTime, frame]);

  // 1. Natural Syllable-Paced Lip Sync (~3.2 Hz):
  // Toggle smoothly using Math.sin(frame * 0.28) > 0.1 ONLY while a word is actively spoken
  // Holding each open/closed viseme for ~11 frames (180ms), returning to #mouth-smile during pauses and after 33.8s
  const isActivelySpeaking = isSpeaking && currentTime < 33.8 && !isCierre;
  const mouthTalkOpen = isActivelySpeaking && Math.sin(frame * 0.28) > 0.1;

  // 2. Eye Blinking: Trigger for 8 frames every 180 frames (3s)
  const isBlinking = frame % 180 < 8;

  // 3. Scene transition timing
  const transitions = sceneTransitionFrames.length > 0 ? sceneTransitionFrames : [0, 318, 720, 1068, 1398, 1698];
  const lastSceneStart = transitions.filter((f) => frame >= f).pop() ?? 0;
  const sceneLocalFrame = frame - lastSceneStart;

  // 4. Softened Camera Beat: subtle 1.025 -> 1.0 over 40 frames
  const punchZoom = interpolate(
    sceneLocalFrame,
    [0, 40],
    [1.025, 1.0],
    { extrapolateRight: 'clamp' }
  );
  const baseScale = 1.12; // 12% scaled up baseline
  const totalScale = baseScale * punchZoom;

  // 5. Gentle Breathing, Head Nod & Arm Rotations (Native SVG coordinates in ChibiAvatar)
  const breathY = Math.sin(frame * 0.05) * 2.5;
  const headTilt = Math.sin(frame * 0.035) * 1.5;
  // rightArmAngle: gently oscillates between 0 and -5 degrees around shoulder joint (358, 332)
  const rightArmAngle = Math.sin(frame * 0.04) * -2.5 - 2;
  // leftArmAngle: subtle oscillation around (242, 332)
  const leftArmAngle = Math.sin(frame * 0.04) * 1.5;

  // 6. Active Status Pill for current scene
  const activePill = SCENE_STATUS_PILLS.filter((p) => frame >= p.startFrame).pop() || SCENE_STATUS_PILLS[0];
  const pillSpring = spring({
    frame: sceneLocalFrame,
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end select-none overflow-hidden pb-4">
      {/* Floating Dynamic Status Pill next to Teacher Ivan's Shoulder */}
      <div
        className="absolute top-16 right-16 z-30 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#1A3153] border-3 shadow-2xl backdrop-blur-md"
        style={{
          borderColor: activePill.color,
          transform: `scale(${pillSpring}) translateY(${Math.sin(frame * 0.1) * 3}px)`,
          boxShadow: `0 12px 35px ${activePill.color}40`,
        }}
      >
        <span
          className="w-3.5 h-3.5 rounded-full animate-ping"
          style={{ backgroundColor: activePill.color }}
        />
        <span className="font-montserrat font-black text-xl text-[#FAFAFA] uppercase tracking-wider">
          {activePill.label}
        </span>
      </div>

      {/* Studio Lighting Podium */}
      <div
        className="absolute bottom-6 w-[750px] h-[95px] rounded-[50%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, rgba(167, 199, 231, 0.55) 0%, rgba(224, 155, 48, 0.15) 45%, rgba(26, 49, 83, 0.05) 70%, transparent 100%)',
          filter: 'blur(10px)',
        }}
      />

      {/* Chibi Character Container (scaled up by 12% + punch zoom) */}
      <div
        className="relative z-10 w-[740px] h-[840px] flex items-center justify-center"
        style={{
          transform: `scale(${totalScale})`,
          filter: 'drop-shadow(0 20px 45px rgba(26, 49, 83, 0.25))',
        }}
      >
        <ChibiAvatar
          character={character}
          isTalking={isActivelySpeaking}
          mouthOpen={mouthTalkOpen}
          isBlinking={isBlinking}
          breathY={breathY}
          headTilt={headTilt}
          rightArmAngle={rightArmAngle}
          leftArmAngle={leftArmAngle}
        />
      </div>
    </div>
  );
};
