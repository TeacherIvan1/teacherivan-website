import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const BreakthroughCounterScene: React.FC = () => {
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

  // Smooth 1.9-second rocketing counter progression from 2% up to 78% over frames [10, 125]
  const rocketProgress = interpolate(frame, [10, 125], [2, 78], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const currentCount = Math.round(rocketProgress);

  // Pulse & aura glow when hitting 78%
  const isTargetHit = frame >= 125;
  const pulse = isTargetHit ? Math.sin(frame * 0.12) * 3 : 0;

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden bg-[#1A3153]"
      style={{ opacity: entrance }}
    >
      {/* Background Radial Amber Core */}
      <div
        className="absolute w-[750px] h-[750px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(224, 155, 48, 0.35) 0%, rgba(167, 199, 231, 0.10) 50%, transparent 72%)',
          filter: 'blur(45px)',
          transform: `scale(${1 + Math.sin(frame * 0.08) * 0.08})`,
        }}
      />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#E09B30] text-[#1A3153] shadow-2xl mb-6 z-10 border-2 border-[#FAFAFA]">
        <span className="w-3.5 h-3.5 rounded-full bg-[#1A3153] animate-ping" />
        <span className="font-montserrat font-black text-2xl tracking-[0.16em] uppercase">
          TUTOR DE VOZ IA 24/7 — MÉTODO BICHRONOUS
        </span>
      </div>

      {/* Massive Rocketing Counter: 78% STT */}
      <div
        className="flex items-center justify-center gap-8 bg-[#1A3153] border-6 border-[#E09B30] rounded-3xl px-16 py-8 shadow-[0_20px_70px_rgba(224,155,48,0.4)] z-10 my-4"
        style={{ transform: `translateY(${pulse}px)` }}
      >
        <span
          className="font-montserrat font-black text-[150px] leading-none text-[#FAFAFA] tracking-tight tabular-nums drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
          {currentCount}
        </span>
        <div className="flex flex-col items-start gap-1">
          <span className="bg-[#E09B30] text-[#1A3153] font-montserrat font-black text-5xl px-5 py-2.5 rounded-2xl shadow-xl">
            % STT
          </span>
          <span className="font-montserrat font-extrabold text-sm uppercase tracking-widest text-[#A7C7E7]">
            TIEMPO DE HABLA
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <div
        className="max-w-[880px] mt-6 z-10"
        style={{
          transform: `translateY(${(1 - secondarySpring) * 16}px)`,
          opacity: secondarySpring,
        }}
      >
        <h2 className="font-montserrat font-black text-4xl text-[#FAFAFA] leading-tight uppercase">
          MULTIPLICAS TU PRÁCTICA POR{' '}
          <span className="text-[#E09B30] underline decoration-[#E09B30] decoration-4 underline-offset-8">
            39 VECES
          </span>
        </h2>
        <p className="font-inter font-bold text-2xl text-[#A7C7E7] mt-3 uppercase tracking-wider">
          Hablas más del 75% del tiempo en cada sesión
        </p>
      </div>
    </div>
  );
};
