import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const FinalCTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  // Staggered badges (+20 frames)
  const badgeSpring = spring({
    frame: Math.max(0, frame - 20),
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  // Button click at frame 35
  const isClicked = frame >= 35;
  const clickSpring = spring({
    frame: Math.max(0, frame - 35),
    fps: 60,
    config: { damping: 14, stiffness: 120 },
  });

  const buttonScale = isClicked
    ? interpolate(clickSpring, [0, 0.4, 1], [1, 0.92, 1.05])
    : 1;

  // Ripple effect on click
  const rippleScale = isClicked ? interpolate(frame, [35, 65], [1, 2.5]) : 0;
  const rippleOpacity = isClicked ? interpolate(frame, [35, 65], [0.85, 0]) : 0;

  // Virtual cursor entering and clicking
  const cursorX = interpolate(frame, [0, 35], [180, 0], { extrapolateRight: 'clamp' });
  const cursorY = interpolate(frame, [0, 35], [120, 0], { extrapolateRight: 'clamp' });
  const cursorOpacity = interpolate(frame, [0, 10, 50, 68], [0, 1, 1, 0]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden bg-[#FAFAFA]"
      style={{ opacity: entrance }}
    >
      {/* Top Badge */}
      <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-[#1A3153] border-2 border-[#E09B30] shadow-lg mb-4 z-20">
        <span className="w-3.5 h-3.5 rounded-full bg-[#E09B30] animate-ping" />
        <span className="font-montserrat font-extrabold text-2xl tracking-[0.18em] uppercase text-[#FAFAFA]">
          EVALUACIÓN DE VOZ GRATUITA
        </span>
      </div>

      <h2 className="font-montserrat font-black text-5xl text-[#1A3153] leading-tight tracking-tight mb-6 z-20 max-w-[880px]">
        DESCUBRE TU NIVEL CEFR EN 90S
      </h2>

      {/* Main Interactive Button Container */}
      <div className="relative inline-block z-30 my-4">
        {/* Click ripple burst */}
        {isClicked && (
          <div
            className="absolute inset-0 rounded-full border-6 border-[#E09B30] pointer-events-none"
            style={{
              transform: `scale(${rippleScale})`,
              opacity: rippleOpacity,
            }}
          />
        )}

        {/* The Giant CTA Button */}
        <div
          className="relative inline-flex items-center gap-5 px-14 py-7 rounded-full bg-[#E09B30] text-[#1A3153] border-4 border-[#1A3153] shadow-[0_15px_45px_rgba(224,155,48,0.5)] transition-all"
          style={{
            transform: `scale(${buttonScale})`,
          }}
        >
          <span className="font-montserrat font-black text-4xl tracking-wider uppercase">
            TEACHERIVAN.COM — TEST GRATIS →
          </span>
        </div>

        {/* Animated Hand / Pointer Cursor */}
        <div
          className="absolute top-1/2 left-1/2 pointer-events-none z-40"
          style={{
            transform: `translate(${cursorX + 110}px, ${cursorY + 35}px) scale(${isClicked ? 0.88 : 1})`,
            opacity: cursorOpacity,
          }}
        >
          <svg className="w-20 h-20 drop-shadow-2xl text-[#1A3153]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7.4L7 18V2z" />
          </svg>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center gap-8 mt-6 text-sm font-montserrat font-extrabold text-[#4A5568] uppercase tracking-wider z-20">
        <span className="flex items-center gap-2">
          <span className="text-[#E09B30] text-lg">●</span> Sin tarjeta de crédito
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[#E09B30] text-lg">●</span> Diagnóstico 100% Inmediato
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[#E09B30] text-lg">●</span> Web + App Móvil
        </span>
      </div>
    </div>
  );
};
