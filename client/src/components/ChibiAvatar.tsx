import React, { useEffect, useRef, useState } from 'react';
import { withVersion } from '../utils/assetUrl';

export type ChibiCharacter = 'ivan' | 'emma' | 'teacher-ivan';
export type ChibiState = 'idle' | 'listening' | 'speaking';
export type AvatarMood = 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy';

export interface ChibiAvatarProps {
  character: ChibiCharacter;
  state?: ChibiState;
  mood?: AvatarMood;
  className?: string;
  rmsLevel?: number;
  audioLevel?: number;
  alt?: string;
  style?: React.CSSProperties;
}

const svgCache: Record<string, string> = {};

// Eagerly preload both canonical editorial rigs
if (typeof window !== 'undefined') {
  ['/assets/teacher-ivan-rig.svg', '/assets/emma-rig.svg'].forEach((path) => {
    fetch(withVersion(path))
      .then((res) => (res.ok ? res.text() : ''))
      .then((markup) => {
        if (markup) svgCache[path] = markup;
      })
      .catch(() => {});
  });
}

export const ChibiAvatar: React.FC<ChibiAvatarProps> = ({
  character,
  state = 'idle',
  mood,
  className = '',
  rmsLevel,
  audioLevel,
  alt,
  style,
}) => {
  const persona = character === 'emma' ? 'emma' : 'teacher-ivan';
  const assetPath = `/assets/${persona}-rig.svg`;
  const effectiveMood: AvatarMood = mood || state;
  const effectiveAudio = audioLevel ?? rmsLevel ?? 0;

  const [svgContent, setSvgContent] = useState<string>(() => svgCache[assetPath] || '');
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const audioRef = useRef<number>(effectiveAudio);
  audioRef.current = effectiveAudio;

  // 1. Fetch & cache canonical editorial SVG rig
  useEffect(() => {
    let mounted = true;
    if (svgCache[assetPath]) {
      setSvgContent(svgCache[assetPath]);
      return;
    }

    fetch(withVersion(assetPath))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        svgCache[assetPath] = text;
        if (mounted) setSvgContent(text);
      })
      .catch((err) => {
        console.warn(`[ChibiAvatar] Failed to load ${assetPath}:`, err);
      });

    return () => {
      mounted = false;
    };
  }, [assetPath]);

  // 2. Natural procedural blink timer (every 3.2s - 5.5s for 140ms)
  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;

    const runBlinkCycle = () => {
      const delay = 3200 + Math.random() * 2300;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        resetTimer = setTimeout(() => {
          setIsBlinking(false);
          runBlinkCycle();
        }, 140);
      }, delay);
    };

    runBlinkCycle();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(resetTimer);
    };
  }, []);

  // 3. Subtle cursor gaze tracking (desktop only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      pointerRef.current = { x: nx, y: ny };
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // 4. Live2D-Style 2.5D Native SVG Transform Animation Loop (Pivot-Locked)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgContent) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    const hairBack = svg.querySelector<SVGGElement>('#hair-back');
    const torsoGroup = svg.querySelector<SVGGElement>('#torso-group');
    const headGroup = svg.querySelector<SVGGElement>('#head-group');
    const hairFrontBangs = svg.querySelector<SVGGElement>('#hair-front-bangs');
    const eyeLeftIris = svg.querySelector<SVGGElement>('#eye-left-iris');
    const eyeRightIris = svg.querySelector<SVGGElement>('#eye-right-iris');
    const eyelidsOpen = svg.querySelector<SVGGElement>('#eyelids-open');
    const eyelidsRelaxed = svg.querySelector<SVGGElement>('#eyelids-relaxed');
    const eyelidsBlink = svg.querySelector<SVGGElement>('#eyelids-blink');
    const eyebrowLeft = svg.querySelector<SVGGElement>('#eyebrows-left');
    const eyebrowRight = svg.querySelector<SVGGElement>('#eyebrows-right');

    const visemes = {
      rest: svg.querySelector<SVGGElement>('#mouth-rest'),
      parted: svg.querySelector<SVGGElement>('#mouth-parted'),
      sm: svg.querySelector<SVGGElement>('#mouth-open-sm'),
      md: svg.querySelector<SVGGElement>('#mouth-open-md'),
      lg: svg.querySelector<SVGGElement>('#mouth-open-lg'),
      smile: svg.querySelector<SVGGElement>('#mouth-smile'),
    };

    const setActiveViseme = (activeKey: keyof typeof visemes) => {
      (Object.keys(visemes) as Array<keyof typeof visemes>).forEach((k) => {
        const el = visemes[k];
        if (el) el.setAttribute('opacity', k === activeKey ? '1' : '0');
      });
    };

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (torsoGroup) torsoGroup.setAttribute('transform', 'translate(0, 0)');
      if (headGroup) headGroup.setAttribute('transform', 'translate(0, 0) rotate(0, 300, 320)');
      if (hairBack) hairBack.setAttribute('transform', 'translate(0, 0)');
      if (hairFrontBangs) hairFrontBangs.setAttribute('transform', 'translate(0, 0)');
      setActiveViseme(effectiveMood === 'happy' ? 'smile' : 'rest');
      return;
    }

    let rafId = 0;
    let smoothGx = 0;
    let smoothGy = 0;

    const renderFrame = () => {
      const t = performance.now() / 1000;
      const breathY = Math.sin(t * 1.7) * 2.2;

      // Smooth gaze interpolation
      const idleGazeX = Math.sin(t * 0.65) * 1.8;
      const idleGazeY = Math.cos(t * 0.5) * 1.1;
      const targetGx = Math.max(-4.5, Math.min(4.5, pointerRef.current.x * 3.8 + idleGazeX));
      const targetGy = Math.max(-3.0, Math.min(3.0, pointerRef.current.y * 2.4 + idleGazeY));
      smoothGx += (targetGx - smoothGx) * 0.08;
      smoothGy += (targetGy - smoothGy) * 0.08;

      // Head tilt & micro-shift by mood
      let headTilt = Math.sin(t * 1.1) * 1.1;
      let hx = smoothGx * 0.7;
      let hy = breathY * 0.55;
      let browLift = 0;

      if (effectiveMood === 'speaking') {
        headTilt = Math.sin(t * 2.8) * 2.2;
        hy = breathY * 0.7 + Math.sin(t * 5.2) * 0.8;
        browLift = -1.6 + Math.sin(t * 3.2) * 1.1;
      } else if (effectiveMood === 'listening' || effectiveMood === 'thinking') {
        headTilt = -3.0 + Math.sin(t * 1.2) * 0.8;
        browLift = 0.8;
      } else if (effectiveMood === 'happy') {
        headTilt = 2.0 + Math.sin(t * 2.0) * 1.2;
        browLift = -2.4;
      }

      // Apply native SVG pivot-locked transforms (2.5D parallax depth!)
      if (torsoGroup) {
        torsoGroup.setAttribute('transform', `translate(0, ${breathY.toFixed(2)})`);
      }
      if (headGroup) {
        headGroup.setAttribute(
          'transform',
          `translate(${hx.toFixed(2)}, ${hy.toFixed(2)}) rotate(${headTilt.toFixed(2)}, 300, 320)`
        );
      }
      if (hairBack) {
        hairBack.setAttribute(
          'transform',
          `translate(${(-hx * 0.45).toFixed(2)}, ${(-hy * 0.3).toFixed(2)})`
        );
      }
      if (hairFrontBangs) {
        hairFrontBangs.setAttribute(
          'transform',
          `translate(${(hx * 0.35).toFixed(2)}, ${(hy * 0.2).toFixed(2)})`
        );
      }
      if (eyeLeftIris) {
        eyeLeftIris.setAttribute('transform', `translate(${smoothGx.toFixed(2)}, ${smoothGy.toFixed(2)})`);
      }
      if (eyeRightIris) {
        eyeRightIris.setAttribute('transform', `translate(${smoothGx.toFixed(2)}, ${smoothGy.toFixed(2)})`);
      }
      if (eyebrowLeft) {
        eyebrowLeft.setAttribute('transform', `translate(0, ${browLift.toFixed(2)}) rotate(${(browLift * 0.8).toFixed(2)}, 242, 232)`);
      }
      if (eyebrowRight) {
        eyebrowRight.setAttribute('transform', `translate(0, ${browLift.toFixed(2)}) rotate(${(-browLift * 0.8).toFixed(2)}, 358, 232)`);
      }

      // Eyelid state: blink > relaxed (thinking/listening) > open
      const useRelaxed = !isBlinking && effectiveMood === 'thinking';
      if (eyelidsOpen) eyelidsOpen.setAttribute('opacity', !isBlinking && !useRelaxed ? '1' : '0');
      if (eyelidsRelaxed) eyelidsRelaxed.setAttribute('opacity', useRelaxed ? '1' : '0');
      if (eyelidsBlink) eyelidsBlink.setAttribute('opacity', isBlinking ? '1' : '0');

      // Real-time 6-viseme mouth lip-sync driven by audioLevel / RMS or speaking cadence
      const rms = audioRef.current;
      if (effectiveMood === 'speaking') {
        const energy = rms > 0.01 ? rms : Math.abs(Math.sin(t * 10.5)) * 0.55 + Math.abs(Math.cos(t * 6.3)) * 0.35;
        if (energy > 0.65) setActiveViseme('lg');
        else if (energy > 0.4) setActiveViseme('md');
        else if (energy > 0.2) setActiveViseme('sm');
        else if (energy > 0.08) setActiveViseme('parted');
        else setActiveViseme('rest');
      } else if (effectiveMood === 'happy') {
        setActiveViseme('smile');
      } else if (effectiveMood === 'listening') {
        setActiveViseme('parted');
      } else {
        setActiveViseme('rest');
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [svgContent, effectiveMood, isBlinking]);

  return (
    <div
      ref={containerRef}
      className={`inline-block select-none relative [&_svg]:w-full [&_svg]:h-full [&_svg]:block ${className}`}
      style={style}
      aria-label={alt || `${character === 'emma' ? 'Emma' : 'Teacher Ivan'} Avatar`}
      role="img"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export default ChibiAvatar;
