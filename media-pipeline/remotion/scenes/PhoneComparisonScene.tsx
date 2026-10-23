import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface PhoneComparisonSceneProps {
  badge?: string;
  title?: string;
}

export const PhoneComparisonScene: React.FC<PhoneComparisonSceneProps> = ({
  badge = 'EL CAMBIO RADICAL',
  title = '¿DÓNDE APRENDES MÁS RÁPIDO?',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const card1Spring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const card2Spring = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden"
      style={{ opacity: entrance }}
    >
      {/* Pill Badge */}
      <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#FAFAFA] border-2 border-[#A7C7E7] shadow-lg mb-3 z-20">
        <span className="w-3 h-3 rounded-full bg-[#E09B30]" />
        <span className="font-montserrat font-extrabold text-xl tracking-[0.16em] uppercase text-[#1A3153]">
          {badge}
        </span>
      </div>

      <h2 className="font-montserrat font-black text-4xl text-[#1A3153] leading-snug tracking-tight mb-8 z-20">
        {title}
      </h2>

      {/* Comparison Grid */}
      <div className="w-full max-w-[940px] grid grid-cols-2 gap-6 z-20">
        {/* Card 1: Traditional Academy */}
        <div
          className="bg-[#FAFAFA] border-2 border-[#4A5568]/30 rounded-3xl p-6 text-left shadow-lg flex flex-col justify-between"
          style={{
            transform: `translateY(${(1 - card1Spring) * 30}px) scale(${0.95 + 0.05 * card1Spring})`,
            opacity: card1Spring,
          }}
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#4A5568]/20">
              <span className="font-montserrat font-bold text-xl text-[#4A5568]">
                Academia Común
              </span>
              <span className="px-3 py-1 bg-[#4A5568]/20 text-[#4A5568] font-montserrat font-extrabold text-xs rounded-full uppercase">
                30% Habla
              </span>
            </div>

            <ul className="mt-4 space-y-3 font-inter font-medium text-lg text-[#4A5568]">
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span>15 alumnos por clase</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span>Miedo a hablar en público</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span>Feedback tardío o nulo</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span>Horarios y sedes rígidas</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-[#4A5568]/20 text-center font-montserrat font-extrabold text-sm text-[#4A5568]/70 uppercase">
            Poco progreso real
          </div>
        </div>

        {/* Card 2: Teacher Ivan AI Tutor (Winner) */}
        <div
          className="bg-[#FFFFFF] border-4 border-[#E09B30] rounded-3xl p-6 text-left shadow-2xl relative overflow-hidden flex flex-col justify-between"
          style={{
            transform: `translateY(${(1 - card2Spring) * 30}px) scale(${0.95 + 0.05 * card2Spring})`,
            opacity: card2Spring,
          }}
        >
          {/* Top highlight ribbon */}
          <div className="absolute top-0 right-0 bg-[#E09B30] text-[#1A3153] font-montserrat font-black text-xs px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            Recomendado
          </div>

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#A7C7E7]/40">
              <span className="font-montserrat font-black text-2xl text-[#1A3153]">
                Teacher Ivan AI
              </span>
              <span className="px-3 py-1 bg-[#E09B30] text-[#1A3153] font-montserrat font-black text-sm rounded-full uppercase shadow-sm">
                &gt;75% Habla
              </span>
            </div>

            <ul className="mt-4 space-y-3 font-inter font-bold text-lg text-[#1A3153]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#E09B30] font-black">✓</span>
                <span>Simulador de voz 1-a-1 ilimitado</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#E09B30] font-black">✓</span>
                <span>Recast instantáneo sin juicios</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#E09B30] font-black">✓</span>
                <span>Diagnóstico CEFR automático</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#E09B30] font-black">✓</span>
                <span>Mentoría personalizada con Ivan</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-[#A7C7E7]/40 text-center font-montserrat font-black text-base text-[#E09B30] uppercase tracking-wider">
            Fluidez en tiempo récord
          </div>
        </div>
      </div>
    </div>
  );
};
