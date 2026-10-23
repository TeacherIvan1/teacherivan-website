import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface CTACardSceneProps {
  badge?: string;
  ctaText?: string;
  subText?: string;
}

export const CTACardScene: React.FC<CTACardSceneProps> = ({
  badge = 'TEST DE VOZ IA GRATIS (90S)',
  ctaText = 'TEACHERIVAN.COM',
  subText = 'Descubre tu nivel CEFR real y empieza a hablar hoy mismo',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Button click state at frame 32
  const isClicked = frame >= 32;
  const clickSpring = spring({
    frame: Math.max(0, frame - 32),
    fps,
    config: { damping: 10, stiffness: 180 },
  });

  const buttonScale = isClicked
    ? interpolate(clickSpring, [0, 0.4, 1], [1, 0.92, 1.05])
    : 1;

  // Ripple effect on click
  const rippleScale = isClicked ? interpolate(frame, [32, 60], [1, 2.4]) : 0;
  const rippleOpacity = isClicked ? interpolate(frame, [32, 60], [0.8, 0]) : 0;

  // Virtual cursor entering and clicking
  const cursorX = interpolate(frame, [0, 32], [200, 0], { extrapolateRight: 'clamp' });
  const cursorY = interpolate(frame, [0, 32], [150, 0], { extrapolateRight: 'clamp' });
  const cursorOpacity = interpolate(frame, [0, 10, 45, 55], [0, 1, 1, 0]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden"
      style={{ opacity: entrance }}
    >
      {/* Pill Badge */}
      <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#FAFAFA] border-2 border-[#E09B30] shadow-lg mb-4 z-20">
        <span className="w-3 h-3 rounded-full bg-[#E09B30] animate-ping" />
        <span className="font-montserrat font-extrabold text-xl tracking-[0.16em] uppercase text-[#1A3153]">
          {badge}
        </span>
      </div>

      <h2 className="font-montserrat font-black text-5xl text-[#1A3153] leading-tight tracking-tight mb-3 z-20">
        HABLA INGLÉS<br />
        <span className="text-[#E09B30]">SIN BLOQUEOS</span>
      </h2>

      <p className="font-inter font-medium text-xl text-[#4A5568] max-w-[720px] mb-8 z-20">
        {subText}
      </p>

      {/* Main Interactive Button Container */}
      <div className="relative inline-block z-30 my-4">
        {/* Click ripple */}
        {isClicked && (
          <div
            className="absolute inset-0 rounded-full border-4 border-[#E09B30] pointer-events-none"
            style={{
              transform: `scale(${rippleScale})`,
              opacity: rippleOpacity,
            }}
          />
        )}

        {/* The CTA Button */}
        <div
          className="relative inline-flex items-center gap-4 px-12 py-6 rounded-full bg-[#E09B30] text-[#1A3153] border-4 border-[#FAFAFA] shadow-2xl transition-all"
          style={{
            transform: `scale(${buttonScale})`,
            boxShadow: isClicked
              ? '0 20px 60px rgba(224, 155, 48, 0.65)'
              : '0 12px 35px rgba(26, 49, 83, 0.25)',
          }}
        >
          <span className="font-montserrat font-black text-4xl tracking-wider uppercase">
            {ctaText}
          </span>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>

        {/* Animated Hand / Pointer Cursor */}
        <div
          className="absolute top-1/2 left-1/2 pointer-events-none z-40"
          style={{
            transform: `translate(${cursorX + 80}px, ${cursorY + 30}px) scale(${isClicked ? 0.88 : 1})`,
            opacity: cursorOpacity,
          }}
        >
          <svg className="w-16 h-16 drop-shadow-xl text-[#1A3153]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7.4L7 18V2z" />
          </svg>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center gap-6 mt-8 text-xs font-montserrat font-bold text-[#4A5568] uppercase tracking-wider z-20">
        <span className="flex items-center gap-1.5">
          <span className="text-[#E09B30]">●</span> Sin tarjeta requerida
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[#E09B30]">●</span> Evaluación inmediata
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[#E09B30]">●</span> Web + App Móvil
        </span>
      </div>
    </div>
  );
};
