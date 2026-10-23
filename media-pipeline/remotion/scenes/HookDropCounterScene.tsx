import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const HookDropCounterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Relaxed entrance spring
  const entrance = spring({
    frame,
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  // Staggered secondary elements (+20 frames delay)
  const secondarySpring = spring({
    frame: Math.max(0, frame - 20),
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  // Smooth 1.8-second counter dropping from 100% down to 30% over frames [10, 118]
  const dropProgress = interpolate(frame, [10, 118], [100, 30], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const currentCount = Math.round(dropProgress);

  // Impact pulse when hitting 30%
  const isImpact = frame >= 118 && frame <= 134;
  const shakeX = isImpact ? (frame % 2 === 0 ? 3.5 : -3.5) : 0;

  // Ambient glow pulse
  const glowScale = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.95, 1.08]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-10 text-center select-none relative overflow-hidden bg-[#1A3153]"
      style={{
        opacity: entrance,
      }}
    >
      {/* Background Radial Amber Burst Glow */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(224, 155, 48, 0.28) 0%, rgba(167, 199, 231, 0.08) 50%, transparent 70%)',
          transform: `scale(${glowScale})`,
          filter: 'blur(40px)',
        }}
      />

      {/* Pill Badge at the top */}
      <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-[#FAFAFA]/10 border-2 border-[#A7C7E7] shadow-xl mb-6 z-10 backdrop-blur-md">
        <span className="w-3.5 h-3.5 rounded-full bg-[#E09B30] animate-ping" />
        <span className="font-montserrat font-extrabold text-2xl tracking-[0.2em] uppercase text-[#FAFAFA]">
          CLASE TRADICIONAL DE 1 HORA
        </span>
      </div>

      {/* Main Massive Counter Display (Drops from 100% -> 30%) */}
      <div
        className="flex items-center justify-center gap-6 bg-[#FAFAFA] border-5 border-[#E09B30] rounded-3xl px-14 py-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)] z-10 my-4"
        style={{ transform: `translateX(${shakeX}px) scale(${1 + (isImpact ? 0.04 : 0)})` }}
      >
        <span
          className="font-montserrat font-black text-[140px] leading-none text-[#1A3153] tracking-tight tabular-nums"
          style={{ textShadow: '0 8px 30px rgba(26, 49, 83, 0.2)' }}
        >
          {currentCount}
        </span>
        <div className="flex flex-col items-start gap-1">
          <span className="bg-[#E09B30] text-[#1A3153] font-montserrat font-black text-5xl px-5 py-2.5 rounded-2xl shadow-lg">
            %
          </span>
          <span className="font-montserrat font-black text-sm uppercase tracking-widest text-[#4A5568]">
            HABLA REAL
          </span>
        </div>
      </div>

      {/* Giant Pattern Interrupt Headline */}
      <div
        className="max-w-[920px] mt-6 z-10"
        style={{
          transform: `translateY(${(1 - secondarySpring) * 16}px)`,
          opacity: secondarySpring,
        }}
      >
        <h1 className="font-montserrat font-black text-5xl text-[#FAFAFA] leading-tight tracking-tight uppercase drop-shadow-md">
          ¿SÓLO HABLAS UN{' '}
          <span className="text-[#E09B30] underline decoration-[#E09B30]/60 decoration-4 underline-offset-8">
            30%
          </span>{' '}
          EN CLASE?
        </h1>
        <p className="font-inter font-bold text-2xl text-[#A7C7E7] mt-3 uppercase tracking-wider">
          El 70% restante se pierde en silencio
        </p>
      </div>
    </div>
  );
};
