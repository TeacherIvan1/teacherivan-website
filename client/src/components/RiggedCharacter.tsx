import React, { useEffect, useRef, useState } from 'react';

export type RigState = 'idle' | 'listening' | 'speaking';
export type RigPersona = 'teacher-ivan' | 'emma';

export interface RiggedCharacterProps {
  persona: RigPersona;
  state?: RigState;
  className?: string;
  animateBlink?: boolean;
  alt?: string;
}

// In-memory cache for loaded SVG markup
const svgMarkupCache: Record<string, string> = {};

// Eagerly preload both rigs in browser environments
if (typeof window !== 'undefined') {
  ['/assets/teacher-ivan-rig.svg', '/assets/emma-rig.svg'].forEach((path) => {
    fetch(path)
      .then((res) => (res.ok ? res.text() : ''))
      .then((markup) => {
        if (markup) svgMarkupCache[path] = markup;
      })
      .catch(() => {});
  });
}

export const RiggedCharacter: React.FC<RiggedCharacterProps> = ({
  persona,
  state = 'idle',
  className = '',
  animateBlink = true,
  alt,
}) => {
  const assetPath = persona === 'teacher-ivan' ? '/assets/teacher-ivan-rig.svg' : '/assets/emma-rig.svg';
  const [svgMarkup, setSvgMarkup] = useState<string>(() => svgMarkupCache[assetPath] || '');
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch & cache SVG markup with immediate persona synchronisation
  useEffect(() => {
    let isMounted = true;
    if (svgMarkupCache[assetPath]) {
      setSvgMarkup(svgMarkupCache[assetPath]);
      return;
    }

    // Immediately clear stale previous persona markup while loading
    setSvgMarkup('');

    fetch(assetPath)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((markup) => {
        svgMarkupCache[assetPath] = markup;
        if (isMounted) {
          setSvgMarkup(markup);
        }
      })
      .catch((err) => {
        console.warn(`[RiggedCharacter] Failed to fetch SVG ${assetPath}:`, err);
      });

    return () => {
      isMounted = false;
    };
  }, [assetPath]);

  // 2. Natural procedural blinking interval (every 3.2 to 4.5 seconds)
  useEffect(() => {
    if (!animateBlink) return;
    let blinkTimer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;

    const scheduleNextBlink = () => {
      const delay = 3000 + Math.random() * 1500;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        resetTimer = setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 160);
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(resetTimer);
    };
  }, [animateBlink]);

  // 3. Locked Native SVG Transform Procedural Loop
  // Uses native SVG transform="rotate(deg, cx, cy)" to guarantee zero arm detachment across all browser rendering engines
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgMarkup) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    const rightArm = svg.querySelector<SVGGElement>('#right-arm-gesture');
    const leftArm = svg.querySelector<SVGGElement>('#left-arm-prop');
    const headGroup = svg.querySelector<SVGGElement>('#head-group');
    const mouthSmile = svg.querySelector<SVGGElement>('#mouth-smile');
    const mouthIdle = svg.querySelector<SVGGElement>('#mouth-idle');
    const mouthTalk = svg.querySelector<SVGGElement>('#mouth-talk-open');
    const eyesOpen = svg.querySelector<SVGGElement>('#eyes-open');
    const eyesBlink = svg.querySelector<SVGGElement>('#eyes-blink');

    // Pivot points verified from SVG viewBox 0 0 600 600
    const RIGHT_ARM_PIVOT = '358, 332';
    const LEFT_ARM_PIVOT = '242, 332';
    const HEAD_PIVOT = '300, 310';

    // Check reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (rightArm) rightArm.setAttribute('transform', `rotate(0, ${RIGHT_ARM_PIVOT})`);
      if (leftArm) leftArm.setAttribute('transform', `rotate(0, ${LEFT_ARM_PIVOT})`);
      if (headGroup) headGroup.setAttribute('transform', `rotate(0, ${HEAD_PIVOT})`);
      return;
    }

    let rafId: number;

    const animateFrame = () => {
      const t = performance.now() / 1000;
      const breathY = Math.sin(t * 1.5) * 1.5;

      if (state === 'speaking') {
        // Natural cadence arm gesture: rotate between -2deg and -6deg around locked shoulder pivot
        const armAngle = -2 + Math.sin(t * 3.8) * -3.5;
        if (rightArm) rightArm.setAttribute('transform', `rotate(${armAngle.toFixed(2)}, ${RIGHT_ARM_PIVOT})`);
        
        // Left arm holding prop subtle follow-through
        const leftAngle = Math.sin(t * 2.1) * 1.2;
        if (leftArm) leftArm.setAttribute('transform', `rotate(${leftAngle.toFixed(2)}, ${LEFT_ARM_PIVOT})`);

        // Head tilt with conversational rhythm
        const headTilt = Math.sin(t * 2.6) * 1.6;
        if (headGroup) {
          headGroup.setAttribute(
            'transform',
            `translate(0, ${(breathY * 0.7).toFixed(2)}) rotate(${headTilt.toFixed(2)}, ${HEAD_PIVOT})`
          );
        }

        // Speaking viseme sync
        if (mouthTalk) mouthTalk.style.opacity = '1';
        if (mouthSmile) mouthSmile.style.opacity = '0';
        if (mouthIdle) mouthIdle.style.opacity = '0';
      } else if (state === 'listening') {
        // Attentive tilt towards listener
        if (rightArm) rightArm.setAttribute('transform', `rotate(0, ${RIGHT_ARM_PIVOT})`);
        if (leftArm) leftArm.setAttribute('transform', `rotate(0, ${LEFT_ARM_PIVOT})`);
        if (headGroup) {
          headGroup.setAttribute(
            'transform',
            `translate(0, ${(breathY * 0.5).toFixed(2)}) rotate(2.5, ${HEAD_PIVOT})`
          );
        }

        if (mouthTalk) mouthTalk.style.opacity = '0';
        if (mouthSmile) mouthSmile.style.opacity = '1';
        if (mouthIdle) mouthIdle.style.opacity = '0';
      } else {
        // Idle gentle breathing
        const headTilt = Math.sin(t * 1.2) * 0.9;
        if (rightArm) rightArm.setAttribute('transform', `rotate(0, ${RIGHT_ARM_PIVOT})`);
        if (leftArm) leftArm.setAttribute('transform', `rotate(0, ${LEFT_ARM_PIVOT})`);
        if (headGroup) {
          headGroup.setAttribute(
            'transform',
            `translate(0, ${breathY.toFixed(2)}) rotate(${headTilt.toFixed(2)}, ${HEAD_PIVOT})`
          );
        }

        if (mouthTalk) mouthTalk.style.opacity = '0';
        if (mouthSmile) mouthSmile.style.opacity = '1';
        if (mouthIdle) mouthIdle.style.opacity = '0';
      }

      // Eye blink state sync
      if (eyesOpen && eyesBlink) {
        eyesOpen.style.opacity = isBlinking ? '0' : '1';
        eyesBlink.style.opacity = isBlinking ? '1' : '0';
      }

      rafId = requestAnimationFrame(animateFrame);
    };

    rafId = requestAnimationFrame(animateFrame);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [svgMarkup, state, isBlinking]);

  const stateClass = `rig-state-${state}`;

  return (
    <div
      ref={containerRef}
      className={`rig-character-wrapper relative inline-block select-none ${stateClass} ${className}`}
      role="img"
      aria-label={alt || (persona === 'teacher-ivan' ? 'Teacher Ivan Chibi Avatar' : 'Coach Emma Chibi Avatar')}
    >
      <style>{`
        .rig-character-wrapper svg {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }

        .rig-character-wrapper .rig-layer {
          transform-box: view-box;
          transition: opacity 0.15s ease-in-out;
        }

        .rig-character-wrapper.rig-state-speaking #bg-aura {
          animation: rigAuraActive 1.4s ease-in-out infinite alternate !important;
        }

        .rig-character-wrapper.rig-state-listening #bg-aura {
          animation: rigAuraListening 2.2s ease-in-out infinite alternate !important;
        }

        @keyframes rigAuraActive {
          0% {
            transform: scale(1);
            opacity: 0.85;
          }
          100% {
            transform: scale(1.04);
            opacity: 1;
          }
        }

        @keyframes rigAuraListening {
          0% {
            transform: scale(0.99);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.02);
            opacity: 0.95;
          }
        }
      `}</style>

      {svgMarkup ? (
        <div
          className="w-full h-full flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      ) : (
        <img
          src={assetPath}
          alt={alt || persona}
          className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
        />
      )}
    </div>
  );
};

export default RiggedCharacter;
