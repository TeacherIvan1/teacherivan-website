import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const HybridFormulaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  const plusSpring = spring({
    frame: Math.max(0, frame - 20),
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  const classSpring = spring({
    frame: Math.max(0, frame - 40),
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden bg-[#1A3153]"
      style={{ opacity: entrance }}
    >
      {/* Background Radial Glow */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(167, 199, 231, 0.20) 0%, rgba(224, 155, 48, 0.15) 50%, transparent 72%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-[#FAFAFA]/10 border-2 border-[#A7C7E7] shadow-xl mb-8 z-10 backdrop-blur-md">
        <span className="w-3.5 h-3.5 rounded-full bg-[#E09B30]" />
        <span className="font-montserrat font-extrabold text-2xl tracking-[0.2em] uppercase text-[#FAFAFA]">
          LA FÓRMULA HÍBRIDA GANADORA
        </span>
      </div>

      {/* Giant Typography Lockup (84px) */}
      <div className="flex items-center justify-center gap-6 z-10 flex-wrap max-w-[960px] my-2">
        {/* IA 24/7 Block */}
        <div
          className="bg-[#FAFAFA]/10 border-4 border-[#A7C7E7] rounded-3xl px-10 py-6 shadow-2xl backdrop-blur-md flex flex-col items-center"
          style={{ transform: `scale(${entrance})` }}
        >
          <span className="font-montserrat font-black text-[84px] leading-none text-[#FAFAFA] tracking-tight">
            IA 24/7
          </span>
          <span className="font-montserrat font-extrabold text-lg text-[#A7C7E7] uppercase tracking-widest mt-1">
            Simulador de Voz
          </span>
        </div>

        {/* Plus Symbol */}
        <div
          className="font-montserrat font-black text-[72px] text-[#A7C7E7]"
          style={{ transform: `scale(${plusSpring})` }}
        >
          +
        </div>

        {/* CLASE 1-A-1 Block */}
        <div
          className="bg-[#E09B30] border-4 border-[#FAFAFA] rounded-3xl px-10 py-6 shadow-2xl flex flex-col items-center"
          style={{ transform: `scale(${classSpring})` }}
        >
          <span className="font-montserrat font-black text-[84px] leading-none text-[#1A3153] tracking-tight">
            CLASE 1-A-1
          </span>
          <span className="font-montserrat font-black text-lg text-[#1A3153]/80 uppercase tracking-widest mt-1">
            Mentoría con Ivan
          </span>
        </div>
      </div>

      {/* Trust Pill Badge */}
      <div className="mt-8 px-10 py-3.5 rounded-full bg-[#1A3153] border-3 border-[#E09B30] shadow-2xl z-10">
        <span className="font-montserrat font-black text-2xl text-[#E09B30] uppercase tracking-[0.16em]">
          SIN VERGÜENZA • A TU RITMO • RESULTADOS REALES
        </span>
      </div>
    </div>
  );
};
