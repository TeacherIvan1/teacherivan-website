import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const LiveRecastScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  const card1Spring = spring({
    frame: Math.max(0, frame - 15),
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  const card2Spring = spring({
    frame: Math.max(0, frame - 35),
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  const pillsSpring = spring({
    frame: Math.max(0, frame - 55),
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden bg-[#FAFAFA]"
      style={{ opacity: entrance }}
    >
      {/* Top Badge */}
      <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-[#1A3153] border-2 border-[#A7C7E7] shadow-lg mb-4 z-10">
        <span className="w-3.5 h-3.5 rounded-full bg-[#E09B30]" />
        <span className="font-montserrat font-extrabold text-2xl tracking-[0.16em] uppercase text-[#FAFAFA]">
          CORRECCIÓN NATURAL EN TIEMPO REAL
        </span>
      </div>

      <h2 className="font-montserrat font-black text-5xl text-[#1A3153] leading-tight tracking-tight mb-6 z-10">
        RECASTING NATIVO AL INSTANTE
      </h2>

      {/* Recast Comparison Flow */}
      <div className="w-full max-w-[940px] flex flex-col gap-4 z-10">
        {/* Step 1: The Typical Mistake */}
        <div
          className="flex items-center justify-between px-8 py-4 bg-[#FEF2F2] border-3 border-[#EF4444] rounded-2xl shadow-md text-left"
          style={{
            transform: `translateY(${(1 - card1Spring) * 20}px)`,
            opacity: card1Spring,
          }}
        >
          <div className="flex items-center gap-4">
            <span className="w-10 h-10 rounded-full bg-[#EF4444] text-[#FAFAFA] flex items-center justify-center text-2xl font-black">
              ✕
            </span>
            <span className="font-montserrat font-extrabold text-3xl text-[#4A5568] line-through decoration-[#EF4444] decoration-4">
              "I have 25 years..."
            </span>
          </div>
          <span className="font-montserrat font-black text-sm uppercase text-[#EF4444] bg-[#EF4444]/10 px-3 py-1 rounded-lg">
            Error común
          </span>
        </div>

        {/* Step 2: Instant Native Recast */}
        <div
          className="flex items-center justify-between px-8 py-5 bg-[#FFFFFF] border-4 border-[#E09B30] rounded-2xl shadow-2xl text-left"
          style={{
            transform: `translateY(${(1 - card2Spring) * 20}px) scale(${0.96 + 0.04 * card2Spring})`,
            opacity: card2Spring,
            boxShadow: '0 16px 40px rgba(224, 155, 48, 0.35)',
          }}
        >
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-[#E09B30] text-[#1A3153] flex items-center justify-center text-3xl font-black shadow-md">
              ⚡
            </span>
            <div className="flex flex-col">
              <span className="font-montserrat font-black text-xs uppercase tracking-widest text-[#E09B30]">
                Recast Nativo sin Juicios
              </span>
              <span className="font-montserrat font-black text-4xl text-[#1A3153]">
                "I am 25 years old!"
              </span>
            </div>
          </div>
          <span className="font-montserrat font-black text-base uppercase bg-[#E09B30] text-[#1A3153] px-4 py-2 rounded-xl shadow-md">
            ✓ Natural
          </span>
        </div>

        {/* Real Scenarios Pills */}
        <div
          className="grid grid-cols-2 gap-4 mt-2"
          style={{
            transform: `translateY(${(1 - pillsSpring) * 20}px)`,
            opacity: pillsSpring,
          }}
        >
          <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-[#FFFFFF] border-3 border-[#A7C7E7] shadow-lg">
            <span className="text-2xl">💼</span>
            <span className="font-montserrat font-black text-xl text-[#1A3153] uppercase">
              Entrevistas de Trabajo
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-[#FFFFFF] border-3 border-[#A7C7E7] shadow-lg">
            <span className="text-2xl">🎯</span>
            <span className="font-montserrat font-black text-xl text-[#1A3153] uppercase">
              Certificación IELTS 7.0+
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
