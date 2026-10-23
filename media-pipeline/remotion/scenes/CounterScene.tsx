import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface CounterSceneProps {
  badge?: string;
  targetPercent?: number;
  label?: string;
  subLabel?: string;
}

export const CounterScene: React.FC<CounterSceneProps> = ({
  badge = 'RATIO DE HABLA ACTIVA',
  targetPercent = 78,
  label = 'CON EL TUTOR DE VOZ IA DE TEACHER IVAN',
  subLabel = 'En academias tradicionales sólo hablas 30%',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  // Animated counter progression (runs over first 45 frames)
  const countProgress = interpolate(frame, [10, 50], [0, targetPercent], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const currentCount = Math.round(countProgress);

  // Subtle floating pulse
  const floatY = Math.sin(frame * 0.08) * 8;
  const glowOpacity = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.15, 0.35]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-12 text-center select-none relative"
      style={{
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 40 + floatY}px) scale(${0.9 + 0.1 * entrance})`,
      }}
    >
      {/* Background Radial Glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(224, 155, 48, 0.22) 0%, rgba(167, 199, 231, 0.08) 55%, transparent 75%)',
          opacity: glowOpacity,
          filter: 'blur(35px)',
        }}
      />

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#FAFAFA] border-2 border-[#A7C7E7] shadow-lg mb-6 z-10">
        <span className="w-3 h-3 rounded-full bg-[#E09B30] animate-pulse" />
        <span className="font-montserrat font-extrabold text-xl tracking-[0.18em] uppercase text-[#1A3153]">
          {badge}
        </span>
      </div>

      {/* Main Counter Display */}
      <div className="flex items-center justify-center gap-4 bg-[#FFFFFF] border-4 border-[#A7C7E7] rounded-3xl px-10 py-6 shadow-2xl z-10 my-4">
        <span
          className="font-montserrat font-black text-[120px] leading-none text-[#1A3153] tracking-tight tabular-nums"
          style={{ textShadow: '0 8px 24px rgba(26, 49, 83, 0.12)' }}
        >
          {currentCount}
        </span>
        <div className="flex flex-col items-start gap-1">
          <span className="bg-[#E09B30] text-[#1A3153] font-montserrat font-black text-4xl px-4 py-2 rounded-xl shadow-md">
            % STT
          </span>
          <span className="font-inter font-bold text-xs uppercase tracking-widest text-[#4A5568]">
            Tiempo de Habla
          </span>
        </div>
      </div>

      {/* Headline & Comparison */}
      <div className="max-w-[800px] mt-4 z-10">
        <h2 className="font-montserrat font-black text-4xl text-[#1A3153] leading-snug tracking-tight">
          {label}
        </h2>
        <p className="font-inter font-semibold text-2xl text-[#E09B30] mt-3 uppercase tracking-wider">
          {subLabel}
        </p>
      </div>

      {/* Visual Comparison Bar */}
      <div className="w-[680px] mt-8 bg-[#1A3153]/10 p-2 rounded-2xl border border-[#A7C7E7]/40 z-10">
        <div className="flex justify-between text-xs font-montserrat font-bold text-[#4A5568] px-2 mb-1">
          <span>Clase Grupal (30%)</span>
          <span className="text-[#E09B30] font-black">Teacher Ivan AI ({targetPercent}%)</span>
        </div>
        <div className="h-6 w-full bg-[#FAFAFA] rounded-xl overflow-hidden flex shadow-inner">
          <div className="h-full bg-[#4A5568]/40 w-[30%]" />
          <div
            className="h-full bg-[#E09B30] transition-all duration-300"
            style={{ width: `${Math.max(0, currentCount - 30)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
