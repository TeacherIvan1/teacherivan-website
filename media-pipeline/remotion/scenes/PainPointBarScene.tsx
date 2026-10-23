import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const PainPointBarScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Relaxed entrance spring
  const entrance = spring({
    frame,
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  // Staggered bar progress spring (+20 frames delay)
  const barSpring = spring({
    frame: Math.max(0, frame - 20),
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  // Staggered alarm card spring (+40 frames delay)
  const alarmSpring = spring({
    frame: Math.max(0, frame - 40),
    fps: 60,
    config: { damping: 24, stiffness: 52, mass: 1.35 },
  });

  // Flash pill animation
  const isFlashing = Math.sin(frame * 0.25) > 0;

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden bg-[#FAFAFA]"
      style={{ opacity: entrance }}
    >
      {/* Top Badge */}
      <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-[#1A3153] border-2 border-[#A7C7E7] shadow-lg mb-6 z-10">
        <span className="w-3.5 h-3.5 rounded-full bg-[#E09B30]" />
        <span className="font-montserrat font-extrabold text-2xl tracking-[0.18em] uppercase text-[#FAFAFA]">
          LA ANATOMÍA DE UNA CLASE DE 60 MINUTOS
        </span>
      </div>

      <h2 className="font-montserrat font-black text-5xl text-[#1A3153] leading-tight tracking-tight mb-8 z-10 max-w-[880px]">
        ¿ADÓNDE SE VA TU TIEMPO?
      </h2>

      {/* Oversized Visual Time-Split Card (scale 1.15x for mobile impact) */}
      <div className="w-full max-w-[940px] bg-[#FFFFFF] border-4 border-[#A7C7E7] rounded-3xl p-8 shadow-2xl z-10 flex flex-col gap-6">
        {/* Visual Progress Bar (60 Minutes) */}
        <div className="w-full">
          <div className="flex justify-between items-center text-lg font-montserrat font-black text-[#4A5568] mb-2 px-1">
            <span>Inicio de Clase (0 min)</span>
            <span>Fin de Clase (60 min)</span>
          </div>

          <div className="h-14 w-full bg-[#E2E8F0] rounded-2xl overflow-hidden flex shadow-inner border-2 border-[#A7C7E7]/60">
            {/* Profesor explica: 40 min (66.6%) */}
            <div
              className="h-full bg-[#1A3153] flex items-center justify-center text-[#FAFAFA] font-montserrat font-black text-lg px-2"
              style={{ width: `${66.6 * barSpring}%` }}
            >
              Profesor explica (40m)
            </div>

            {/* Compañeros se equivocan: 18 min (30%) */}
            <div
              className="h-full bg-[#A7C7E7] flex items-center justify-center text-[#1A3153] font-montserrat font-black text-lg px-2"
              style={{ width: `${30.0 * barSpring}%` }}
            >
              Compañeros (18m)
            </div>

            {/* Tu turno: 2 min (3.3%) */}
            <div
              className="h-full bg-[#EF4444] flex items-center justify-center text-[#FAFAFA] font-montserrat font-black text-base"
              style={{ width: `${3.4 * barSpring}%` }}
            />
          </div>
        </div>

        {/* Flashing Red Alarm Card: THE 2-MINUTE PAIN POINT */}
        <div
          className={`flex items-center justify-center gap-4 px-8 py-5 rounded-2xl border-4 transition-all shadow-xl ${
            isFlashing
              ? 'bg-[#EF4444] text-[#FAFAFA] border-[#B91C1C]'
              : 'bg-[#FEF2F2] text-[#DC2626] border-[#EF4444]'
          }`}
          style={{
            transform: `scale(${0.92 + 0.08 * alarmSpring})`,
            opacity: alarmSpring,
          }}
        >
          <span className="text-4xl">⚠️</span>
          <span className="font-montserrat font-black text-3xl uppercase tracking-wider">
            TÚ: SOLO 2 MINUTOS (CON MIEDO AL JUICIO)
          </span>
        </div>

        {/* Bullet explanation */}
        <div className="grid grid-cols-2 gap-4 text-left font-inter font-bold text-lg text-[#4A5568] pt-2 border-t border-[#A7C7E7]/40">
          <div className="flex items-center gap-2">
            <span className="text-[#EF4444] text-xl">✕</span>
            <span>Vergüenza frente a 15 personas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#EF4444] text-xl">✕</span>
            <span>Feedback tardío o inexistente</span>
          </div>
        </div>
      </div>
    </div>
  );
};
