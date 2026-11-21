import React, { useEffect, useRef, useState } from 'react';
import { withVersion } from '../utils/assetUrl';

export type ChibiCharacter = 'ivan' | 'emma' | 'teacher-ivan';
export type ChibiState = 'idle' | 'listening' | 'speaking';

export interface ChibiAvatarProps {
  character: ChibiCharacter;
  state?: ChibiState;
  className?: string;
  rmsLevel?: number;
  alt?: string;
  style?: React.CSSProperties;
}

const svgCache: Record<string, string> = {};

export const ChibiAvatar: React.FC<ChibiAvatarProps> = ({
  character,
  state = 'idle',
  className = '',
  rmsLevel = 0,
  alt,
  style,
}) => {
  const persona = character === 'emma' ? 'emma' : 'teacher-ivan';
  const assetPath = `/assets/${persona}-rig.svg`;

  const [svgContent, setSvgContent] = useState<string>(() => svgCache[assetPath] || '');
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch & cache SVG markup
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

  // 2. Procedural natural blink timer (every 3.6s for ~140ms)
  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;

    const runBlinkCycle = () => {
      const delay = 3200 + Math.random() * 800; // ~3.6s
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

  // 3. Locked Native SVG Transform Animation (Never style.transform on child <g>)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgContent) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    const bgAura = svg.querySelector<SVGGElement>('#bg-aura');
    const characterBody = svg.querySelector<SVGGElement>('#character-body');
    const rightArm = svg.querySelector<SVGGElement>('#right-arm-gesture');
    const leftArm = svg.querySelector<SVGGElement>('#left-arm-prop');
    const headGroup = svg.querySelector<SVGGElement>('#head-group');
    const mouthIdle = svg.querySelector<SVGGElement>('#mouth-idle');
    const mouthSmile = svg.querySelector<SVGGElement>('#mouth-smile');
    const mouthTalk = svg.querySelector<SVGGElement>('#mouth-talk-open');
    const eyesOpen = svg.querySelector<SVGGElement>('#eyes-open');
    const eyesBlink = svg.querySelector<SVGGElement>('#eyes-blink');

    // Exact pivots from Section 5.3 of Design.md
    const RIGHT_ARM_PIVOT = '358, 332';
    const LEFT_ARM_PIVOT = '242, 332';
    const HEAD_PIVOT = '300, 310';
    const AURA_PIVOT = '300, 320';

    // Reduced motion check
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (characterBody) characterBody.setAttribute('transform', 'translate(0, 0)');
      if (rightArm) rightArm.setAttribute('transform', `rotate(0, ${RIGHT_ARM_PIVOT})`);
      if (leftArm) leftArm.setAttribute('transform', `rotate(0, ${LEFT_ARM_PIVOT})`);
      if (headGroup) headGroup.setAttribute('transform', `rotate(0, ${HEAD_PIVOT})`);
      return;
    }

    let rafId: number;

    const renderFrame = () => {
      const t = performance.now() / 1000;

      // Body gentle breathing (±2.5px)
      const breathY = Math.sin(t * 1.8) * 2.2;
      if (characterBody) {
        characterBody.setAttribute('transform', `translate(0, ${breathY.toFixed(2)})`);
      }

      // Subtle ambient aura pulse
      if (bgAura) {
        const auraScale = 1.0 + Math.sin(t * 1.8) * 0.02;
        bgAura.setAttribute('transform', `scale(${auraScale.toFixed(3)})`);
      }

      // Arm gestures & Head tilt based on state
      if (state === 'speaking') {
        const rightAngle = -3 + Math.sin(t * 4.5) * 3.5; // -2deg to -6deg
        const leftAngle = Math.sin(t * 2.5) * 2.5; // -2.5deg to +2.5deg
        const headTilt = Math.sin(t * 3.0) * 2.0; // subtle nod ±2deg

        if (rightArm) rightArm.setAttribute('transform', `rotate(${rightAngle.toFixed(2)}, ${RIGHT_ARM_PIVOT})`);
        if (leftArm) leftArm.setAttribute('transform', `rotate(${leftAngle.toFixed(2)}, ${LEFT_ARM_PIVOT})`);
        if (headGroup) headGroup.setAttribute('transform', `rotate(${headTilt.toFixed(2)}, ${HEAD_PIVOT})`);
      } else if (state === 'listening') {
        // Inquisitive tilt (-4deg)
        if (rightArm) rightArm.setAttribute('transform', `rotate(-3, ${RIGHT_ARM_PIVOT})`);
        if (leftArm) leftArm.setAttribute('transform', `rotate(1, ${LEFT_ARM_PIVOT})`);
        if (headGroup) headGroup.setAttribute('transform', `rotate(-4, ${HEAD_PIVOT})`);
      } else {
        // Idle
        const idleArm = -3 + Math.sin(t * 1.5) * 1.5;
        if (rightArm) rightArm.setAttribute('transform', `rotate(${idleArm.toFixed(2)}, ${RIGHT_ARM_PIVOT})`);
        if (leftArm) leftArm.setAttribute('transform', `rotate(0, ${LEFT_ARM_PIVOT})`);
        if (headGroup) headGroup.setAttribute('transform', `rotate(0, ${HEAD_PIVOT})`);
      }

      // Eye blink state
      if (eyesOpen && eyesBlink) {
        if (isBlinking) {
          eyesOpen.setAttribute('opacity', '0');
          eyesBlink.setAttribute('opacity', '1');
        } else {
          eyesOpen.setAttribute('opacity', '1');
          eyesBlink.setAttribute('opacity', '0');
        }
      }

      // Real-time mouth swap driven by RMS or speaking cadence
      const isMouthOpen = rmsLevel > 0.015 || (state === 'speaking' && Math.sin(t * 12) > 0);
      if (mouthTalk && mouthIdle && mouthSmile) {
        if (isMouthOpen) {
          mouthTalk.setAttribute('opacity', '1');
          mouthIdle.setAttribute('opacity', '0');
          mouthSmile.setAttribute('opacity', '0');
        } else if (state === 'listening') {
          mouthTalk.setAttribute('opacity', '0');
          mouthIdle.setAttribute('opacity', '0');
          mouthSmile.setAttribute('opacity', '1');
        } else {
          mouthTalk.setAttribute('opacity', '0');
          mouthIdle.setAttribute('opacity', '1');
          mouthSmile.setAttribute('opacity', '0');
        }
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [svgContent, state, isBlinking, rmsLevel]);

  return (
    <div
      ref={containerRef}
      className={`inline-block select-none relative ${className}`}
      style={style}
      aria-label={alt || `${character === 'emma' ? 'Emma' : 'Teacher Ivan'} Avatar`}
      role="img"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
