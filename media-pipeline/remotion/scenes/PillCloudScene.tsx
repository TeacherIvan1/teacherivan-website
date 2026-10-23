import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface PillCloudSceneProps {
  badge?: string;
  title?: string;
}

const PILLS = [
  { label: 'Job Interview (Tech & Corporate)', icon: '💼', delay: 8, x: -160, y: -180 },
  { label: 'IELTS 7.0+ Speaking Master', icon: '🎯', delay: 16, x: 170, y: -160 },
  { label: 'Daily Routine & Natural Small-Talk', icon: '☕', delay: 24, x: -190, y: 150 },
  { label: 'Scholarship Admissions Defense', icon: '🎓', delay: 32, x: 180, y: 160 },
  { label: 'Recast Instantáneo sin Juicios', icon: '⚡', delay: 40, x: 0, y: -260 },
];

export const PillCloudScene: React.FC<PillCloudSceneProps> = ({
  badge = 'INMERSIÓN TOTAL POR OBJETIVOS',
  title = 'HABLA EN ESCENARIOS REALES',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Master entrance
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Central microphone pulse
  const centerPulse = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.95, 1.08]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden"
      style={{
        opacity: entrance,
      }}
    >
      {/* Pill Badge at the top */}
      <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#FAFAFA] border-2 border-[#A7C7E7] shadow-lg mb-4 z-20">
        <span className="w-3 h-3 rounded-full bg-[#E09B30]" />
        <span className="font-montserrat font-extrabold text-xl tracking-[0.16em] uppercase text-[#1A3153]">
          {badge}
        </span>
      </div>

      <h2 className="font-montserrat font-black text-4xl text-[#1A3153] leading-snug tracking-tight mb-8 z-20">
        {title}
      </h2>

      {/* Central Visual Orbit Stage */}
      <div className="relative w-[700px] h-[520px] flex items-center justify-center">
        {/* Orbit Rings */}
        <div className="absolute w-[440px] h-[440px] rounded-full border-2 border-dashed border-[#A7C7E7]/50" />
        <div className="absolute w-[620px] h-[620px] rounded-full border border-[#A7C7E7]/30" />

        {/* Central Voice AI Core */}
        <div
          className="w-28 h-28 rounded-full bg-[#E09B30] text-[#1A3153] flex items-center justify-center shadow-2xl z-10 border-4 border-[#FAFAFA]"
          style={{ transform: `scale(${centerPulse})` }}
        >
          {/* Animated Soundwave SVG */}
          <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="22" style={{ transform: `scaleY(${0.6 + 0.4 * Math.sin(frame * 0.2)})`, transformOrigin: 'center' }} />
            <line x1="8" y1="6" x2="8" y2="18" style={{ transform: `scaleY(${0.7 + 0.3 * Math.cos(frame * 0.25)})`, transformOrigin: 'center' }} />
            <line x1="16" y1="6" x2="16" y2="18" style={{ transform: `scaleY(${0.7 + 0.3 * Math.sin(frame * 0.22)})`, transformOrigin: 'center' }} />
            <line x1="4" y1="10" x2="4" y2="14" />
            <line x1="20" y1="10" x2="20" y2="14" />
          </svg>
        </div>

        {/* Floating Scenario Pills */}
        {PILLS.map((pill, i) => {
          const pillSpring = spring({
            frame: Math.max(0, frame - pill.delay),
            fps,
            config: { damping: 12, stiffness: 140 },
          });

          const floatOffset = Math.sin((frame + i * 20) * 0.08) * 6;

          return (
            <div
              key={pill.label}
              className="absolute inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#A7C7E7] shadow-xl z-20"
              style={{
                transform: `translate(${pill.x}px, ${pill.y + floatOffset}px) scale(${pillSpring})`,
                opacity: pillSpring,
              }}
            >
              <span className="w-10 h-10 rounded-full bg-[#1A3153] text-[#FAFAFA] flex items-center justify-center text-lg font-black shrink-0">
                {pill.icon}
              </span>
              <span className="font-montserrat font-extrabold text-xl text-[#1A3153] whitespace-nowrap">
                {pill.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
