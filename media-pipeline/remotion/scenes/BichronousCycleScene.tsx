import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface BichronousCycleSceneProps {
  badge?: string;
  title?: string;
}

const NODES = [
  { step: '01', title: 'Diagnóstico 90s', sub: 'Nivel CEFR Real', angle: -90, icon: '🎯' },
  { step: '02', title: 'Simulador IA 24/7', sub: 'Habla Ilimitada', angle: -18, icon: '🎙️' },
  { step: '03', title: 'Recast en Vivo', sub: 'Corrección Natural', angle: 54, icon: '⚡' },
  { step: '04', title: 'Clase 1-a-1', sub: 'Mentoría con Ivan', angle: 126, icon: '👨‍🏫' },
  { step: '05', title: 'Certificación', sub: 'Metas Logradas', angle: 198, icon: '🏆' },
];

export const BichronousCycleScene: React.FC<BichronousCycleSceneProps> = ({
  badge = 'METODOLOGÍA BICHRONOUS',
  title = 'EL CICLO DE APRENDIZAJE 24H',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const radius = 220;
  const activeIndex = Math.floor(frame / 28) % NODES.length;

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

      <h2 className="font-montserrat font-black text-4xl text-[#1A3153] leading-snug tracking-tight mb-4 z-20">
        {title}
      </h2>

      {/* Circular Orbit Loop Stage */}
      <div className="relative w-[600px] h-[520px] flex items-center justify-center">
        {/* SVG Connecting Loop Circle */}
        <svg className="absolute w-[500px] h-[500px] pointer-events-none" viewBox="0 0 500 500">
          <circle
            cx="250"
            cy="250"
            r={radius}
            fill="none"
            stroke="#A7C7E7"
            strokeWidth="4"
            strokeDasharray="12 10"
            opacity="0.6"
          />
          {/* Animated active energy arc */}
          <circle
            cx="250"
            cy="250"
            r={radius}
            fill="none"
            stroke="#E09B30"
            strokeWidth="6"
            strokeDasharray="80 320"
            style={{
              transform: `rotate(${frame * 2.5}deg)`,
              transformOrigin: '250px 250px',
            }}
          />
        </svg>

        {/* Center Brand Badge */}
        <div className="w-32 h-32 rounded-full bg-[#1A3153] border-4 border-[#E09B30] text-[#FAFAFA] flex flex-col items-center justify-center shadow-2xl z-10">
          <span className="font-montserrat font-black text-xs text-[#E09B30] uppercase tracking-wider">Método</span>
          <span className="font-montserrat font-black text-2xl leading-none">BICHRONOUS</span>
          <span className="font-inter font-semibold text-[10px] text-[#A7C7E7] mt-1">IA + Humano</span>
        </div>

        {/* 5 Orbit Nodes */}
        {NODES.map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          const isActive = i === activeIndex;
          const nodeSpring = spring({
            frame: Math.max(0, frame - i * 6),
            fps,
            config: { damping: 12, stiffness: 130 },
          });

          return (
            <div
              key={node.step}
              className={`absolute flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 z-20 ${
                isActive
                  ? 'bg-[#FFFFFF] border-4 border-[#E09B30] shadow-2xl scale-110'
                  : 'bg-[#FAFAFA] border-2 border-[#A7C7E7] shadow-md'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px) scale(${nodeSpring * (isActive ? 1.08 : 0.95)})`,
                opacity: nodeSpring,
                width: 140,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{node.icon}</span>
                <span className={`text-[10px] font-black font-montserrat px-1.5 py-0.2 rounded ${isActive ? 'bg-[#E09B30] text-[#1A3153]' : 'bg-[#1A3153] text-[#FAFAFA]'}`}>
                  {node.step}
                </span>
              </div>
              <span className="font-montserrat font-extrabold text-xs text-[#1A3153] text-center leading-tight">
                {node.title}
              </span>
              <span className="font-inter font-medium text-[9px] text-[#4A5568] mt-0.5 text-center">
                {node.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
