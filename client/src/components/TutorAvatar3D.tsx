import React, { useEffect, useRef, useState } from 'react';
import { withVersion } from '../utils/assetUrl';

export type TutorCharacter3D = 'ivan' | 'emma' | 'teacher-ivan';
export type TutorMood3D = 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy';

export interface TutorAvatar3DProps {
  character: TutorCharacter3D;
  mood?: TutorMood3D;
  audioLevel?: number;
  size?: number;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

interface EyeCalibration {
  left: { left: string; top: string; width: string; height: string; rotate: number };
  right: { left: string; top: string; width: string; height: string; rotate: number };
  lidTop: string;
  lidBottom: string;
  lash: string;
  aspect: string;
}

const AVATAR_SPECS: Record<'ivan' | 'emma', { webp: string; png: string; label: string; eyes: EyeCalibration }> = {
  ivan: {
    webp: '/assets/avatars/teacherivan-3d.webp',
    png: '/assets/avatars/teacherivan-3d.png',
    label: 'Teacher Ivan',
    eyes: {
      left: { left: '34.8%', top: '31.5%', width: '14.8%', height: '7.4%', rotate: -2 },
      right: { left: '56.4%', top: '30.6%', width: '14.8%', height: '7.4%', rotate: 2 },
      lidTop: '#E5AE87',
      lidBottom: '#CE926B',
      lash: '#2D1A12',
      aspect: '475 / 768',
    },
  },
  emma: {
    webp: '/assets/avatars/emma-3d.webp',
    png: '/assets/avatars/emma-3d.png',
    label: 'Emma',
    eyes: {
      left: { left: '30.5%', top: '30.6%', width: '13.8%', height: '7.2%', rotate: -2 },
      right: { left: '53.2%', top: '29.8%', width: '14.2%', height: '7.2%', rotate: 2 },
      lidTop: '#E8B18D',
      lidBottom: '#D29671',
      lash: '#2D1A12',
      aspect: '491 / 768',
    },
  },
};

export const TutorAvatar3D: React.FC<TutorAvatar3DProps> = ({
  character,
  mood = 'idle',
  audioLevel = 0,
  size,
  className = '',
  alt,
  style,
}) => {
  const key: 'ivan' | 'emma' = character === 'emma' ? 'emma' : 'ivan';
  const spec = AVATAR_SPECS[key];

  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const audioRef = useRef<number>(audioLevel);
  audioRef.current = audioLevel;

  const [isBlinking, setIsBlinking] = useState(false);

  // Natural procedural eye blink every 3.4s - 5.5s (130ms duration)
  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      const delay = 3400 + Math.random() * 2100;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        resetTimer = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 130);
      }, delay);
    };

    scheduleBlink();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(resetTimer);
    };
  }, []);

  // Gentle 3D cursor/pointer tilt parallax
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      pointerRef.current = { x: nx, y: ny };
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  // GPU-accelerated living 3D motion loop (respects prefers-reduced-motion)
  useEffect(() => {
    const rigEl = rigRef.current;
    if (!rigEl) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      rigEl.style.transform = 'translate3d(0, 0, 0) scale(1)';
      return;
    }

    let rafId = 0;
    let smoothX = 0;
    let smoothY = 0;

    const tick = () => {
      const t = performance.now() / 1000;
      const rms = Math.max(0, Math.min(1, audioRef.current));

      smoothX += (pointerRef.current.x - smoothX) * 0.08;
      smoothY += (pointerRef.current.y - smoothY) * 0.08;

      const breathWave = (Math.sin(t * 1.75) + 1) * 0.5; // 0..1
      let translateY = -breathWave * 3.0;
      let scaleY = 1.0 + breathWave * 0.015;
      let scaleX = 1.0;
      let rotZ = Math.sin(t * 0.9) * 0.7;
      let rotY = smoothX * 5.5;
      let rotX = -smoothY * 4.0;

      if (mood === 'listening') {
        scaleX = 1.03;
        scaleY = 1.03 + breathWave * 0.012;
        rotZ = -1.6 + Math.sin(t * 1.1) * 0.6;
      } else if (mood === 'thinking') {
        rotZ = Math.sin(t * 1.6) * 2.5;
        translateY = -1.5 - Math.abs(Math.sin(t * 1.6)) * 2.0;
      } else if (mood === 'speaking') {
        const cadence = rms > 0.03 ? rms : (Math.sin(t * 9.2) * 0.5 + 0.5) * 0.55;
        translateY = -2.0 - cadence * 5.0;
        scaleY = 1.015 + cadence * 0.025;
        scaleX = 1.01;
        rotZ = Math.sin(t * 3.4) * (1.2 + cadence * 1.6);
        rotY = smoothX * 4.5 + Math.sin(t * 2.2) * 2.2;
      } else if (mood === 'happy') {
        translateY = -3.0 - Math.abs(Math.sin(t * 2.6)) * 4.5;
        scaleX = 1.02;
        scaleY = 1.025;
        rotZ = Math.sin(t * 2.4) * 1.8;
      }

      rigEl.style.transform = `translate3d(0px, ${translateY.toFixed(2)}px, 0px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scaleX(${scaleX.toFixed(4)}) scaleY(${scaleY.toFixed(4)})`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [mood]);

  const clampedAudio = Math.max(0, Math.min(1, audioLevel));
  const speakingEnergy = mood === 'speaking' ? Math.max(0.35, clampedAudio) : 0;

  return (
    <div
      ref={stageRef}
      data-testid="tutor-avatar-3d"
      data-character={key}
      data-mood={mood}
      className={`relative inline-flex items-end justify-center select-none overflow-visible ${className}`}
      style={{
        perspective: '1000px',
        width: size ? `${size}px` : undefined,
        height: size ? `${size}px` : undefined,
        ...style,
      }}
    >
      <style>{`
        @keyframes ti3dOrbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ti3dWavePulse {
          0% { transform: scale(0.86); opacity: 0.65; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        @keyframes ti3dEqBar {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        .ti-3d-orbit { animation: ti3dOrbitSpin 4.5s linear infinite; }
        .ti-3d-wave { animation: ti3dWavePulse 2.1s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .ti-3d-eq { animation: ti3dEqBar 0.65s ease-in-out infinite; transform-origin: bottom center; }
        @media (prefers-reduced-motion: reduce) {
          .ti-3d-orbit, .ti-3d-wave, .ti-3d-eq { animation: none !important; }
        }
      `}</style>

      {/* Reactive Atmospheric Aura & Orbital Rings Behind 3D Character */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Base Ambient Glow */}
        <div
          className="w-[88%] h-[88%] rounded-full transition-all duration-300"
          style={{
            background:
              mood === 'speaking'
                ? `radial-gradient(circle, rgba(224,155,48,${(0.34 + speakingEnergy * 0.24).toFixed(2)}) 0%, rgba(224,155,48,0) 70%)`
                : mood === 'listening'
                ? 'radial-gradient(circle, rgba(167,199,231,0.34) 0%, rgba(26,49,83,0) 70%)'
                : mood === 'happy'
                ? 'radial-gradient(circle, rgba(224,155,48,0.32) 0%, rgba(167,199,231,0.12) 48%, transparent 72%)'
                : 'radial-gradient(circle, rgba(46,82,125,0.28) 0%, transparent 70%)',
          }}
        />

        {/* Listening: Concentric Soft Denim Acoustic Waves */}
        {mood === 'listening' && (
          <>
            <div className="absolute w-[78%] h-[78%] rounded-full border-2 border-[#A7C7E7]/65 ti-3d-wave" />
            <div
              className="absolute w-[78%] h-[78%] rounded-full border border-[#A7C7E7]/45 ti-3d-wave"
              style={{ animationDelay: '0.9s' }}
            />
          </>
        )}

        {/* Thinking: Rotating 1px Amber Orbital Loader Halo */}
        {mood === 'thinking' && (
          <div className="absolute w-[88%] h-[88%] rounded-full border border-[#E09B30]/30 ti-3d-orbit">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#E09B30] shadow-[0_0_10px_#E09B30]" />
          </div>
        )}

        {/* Happy: Subtle Sparkle Ring */}
        {mood === 'happy' && (
          <div className="absolute w-[86%] h-[86%] rounded-full border border-[#E09B30]/50 shadow-[0_0_24px_rgba(224,155,48,0.25)]" />
        )}
      </div>

      {/* 3D Animated Portrait Container (Preserves Exact Aspect Ratio for Eye-Blink Alignment) */}
      <div
        ref={rigRef}
        className="relative z-10 h-full max-w-full flex items-end justify-center will-change-transform"
        style={{
          aspectRatio: spec.eyes.aspect,
          transformOrigin: '50% 82%',
          filter:
            mood === 'speaking'
              ? 'drop-shadow(0 6px 18px rgba(224, 155, 48, 0.42))'
              : mood === 'listening'
              ? 'drop-shadow(0 6px 16px rgba(167, 199, 231, 0.35))'
              : 'drop-shadow(0 10px 22px rgba(9, 19, 38, 0.45))',
          transition: 'filter 0.25s ease',
        }}
      >
        <picture className="w-full h-full block">
          <source srcSet={withVersion(spec.webp)} type="image/webp" />
          <img
            src={withVersion(spec.png)}
            alt={alt || `${spec.label} 3D Avatar`}
            width={key === 'emma' ? 491 : 475}
            height={768}
            decoding="async"
            className="w-full h-full object-contain block pointer-events-none select-none"
          />
        </picture>

        {/* Natural Skin-Tone-Matched Eye Blink Overlay (Mapped to Model Eye Coordinates) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none transition-opacity duration-75"
          style={{ opacity: isBlinking ? 1 : 0 }}
        >
          {[spec.eyes.left, spec.eyes.right].map((eye, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: eye.left,
                top: eye.top,
                width: eye.width,
                height: eye.height,
                borderRadius: '50%',
                transform: `rotate(${eye.rotate}deg)`,
                background: `linear-gradient(180deg, ${spec.eyes.lidTop} 0%, ${spec.eyes.lidBottom} 82%, ${spec.eyes.lash} 100%)`,
                boxShadow: `0 1px 2px rgba(45, 26, 18, 0.35)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Speaking: Subtle Bottom Warm Amber Voice Equalizer Reflection */}
      {mood === 'speaking' && (
        <div
          aria-hidden="true"
          className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex items-end gap-1 px-2.5 py-1 rounded-full bg-[#091326]/70 border border-[#E09B30]/40 pointer-events-none"
        >
          {[0, 0.14, 0.28, 0.18, 0.08].map((delay, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-[#E09B30] ti-3d-eq"
              style={{
                height: `${Math.round(8 + speakingEnergy * (i === 2 ? 12 : i === 1 || i === 3 ? 9 : 6))}px`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorAvatar3D;
