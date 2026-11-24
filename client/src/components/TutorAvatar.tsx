import React, { useEffect, useId, useRef, useState } from 'react';
import { withVersion } from '../utils/assetUrl';

export type TutorCharacter = 'ivan' | 'emma' | 'teacher-ivan';
export type TutorMood = 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy';

export interface TutorAvatarProps {
  character: TutorCharacter;
  mood?: TutorMood;
  audioLevel?: number;
  size?: number;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
}

const svgTextCache = new Map<string, Promise<string>>();

function fetchSvgMarkup(url: string): Promise<string> {
  const existing = svgTextCache.get(url);
  if (existing) return existing;
  const p = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .catch((err) => {
      svgTextCache.delete(url);
      throw err;
    });
  svgTextCache.set(url, p);
  return p;
}

/**
 * Scopes internal <defs> IDs (gradients / clipPaths) per component mount so
 * multiple mounted <TutorAvatar /> instances never collide, while preserving
 * canonical rig bone IDs (#head-group, #tail-group, #mouth-visemes, etc.).
 */
function scopeSvgDefs(rawSvg: string, scopeToken: string): string {
  const cleanScope = scopeToken.replace(/[^a-zA-Z0-9_-]/g, '');
  let out = rawSvg;
  const defIdRegex = /id="((?:ivan|emma)-[a-z0-9-]+)"/g;
  const defIds = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = defIdRegex.exec(rawSvg)) !== null) {
    defIds.add(match[1]);
  }
  for (const id of defIds) {
    const scoped = `${id}-${cleanScope}`;
    out = out.split(`id="${id}"`).join(`id="${scoped}"`);
    out = out.split(`url(#${id})`).join(`url(#${scoped})`);
  }
  return out;
}

const VISEME_IDS = [
  'mouth-rest',
  'mouth-parted',
  'mouth-open-sm',
  'mouth-open-md',
  'mouth-open-lg',
  'mouth-smile',
] as const;

export const TutorAvatar: React.FC<TutorAvatarProps> = ({
  character,
  mood = 'idle',
  audioLevel = 0,
  size,
  className = '',
  alt,
  style,
  interactive = true,
}) => {
  const personaKey: 'ivan' | 'emma' = character === 'emma' ? 'emma' : 'ivan';
  const svgUrl = withVersion(
    personaKey === 'emma' ? '/assets/emma-rig.svg' : '/assets/teacher-ivan-rig.svg'
  );
  const label = alt || (personaKey === 'emma' ? 'Emma — Fluffy Tabby Kitten Tutor' : 'Teacher Ivan — Golden Retriever Puppy Tutor');

  const reactId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [loadFailed, setLoadFailed] = useState<boolean>(false);

  // Live reactive refs (read inside requestAnimationFrame without resetting the loop)
  const moodRef = useRef<TutorMood>(mood);
  const audioRef = useRef<number>(audioLevel);
  const tapHappyUntilRef = useRef<number>(0);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  moodRef.current = mood;
  audioRef.current = Math.max(0, Math.min(1, Number.isFinite(audioLevel) ? audioLevel : 0));

  // Fetch & cache canonical rigged SVG
  useEffect(() => {
    let active = true;
    setLoadFailed(false);
    fetchSvgMarkup(svgUrl)
      .then((markup) => {
        if (!active) return;
        setSvgHtml(scopeSvgDefs(markup, reactId));
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, [svgUrl, reactId]);

  // Pointer/touch subtle gaze tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const handleMove = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      pointerRef.current.x = Math.max(-1, Math.min(1, (e.clientX - cx) / Math.max(180, rect.width * 1.4)));
      pointerRef.current.y = Math.max(-1, Math.min(1, (e.clientY - cy) / Math.max(180, rect.height * 1.4)));
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  // Spring-physics native SVG transform animation loop
  useEffect(() => {
    if (!svgHtml || !containerRef.current) return;
    const root = containerRef.current;
    const svg = root.querySelector('svg');
    if (!svg) return;

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';
    svg.style.overflow = 'visible';

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const q = (id: string) => svg.querySelector<SVGGElement>(`#${id}`);

    const elAuraAmbient = q('aura-ambient');
    const elAuraSpeaking = q('aura-speaking');
    const elAuraRing1 = q('aura-ring-1');
    const elAuraRing2 = q('aura-ring-2');
    const elShadow = q('ground-shadow');
    const elTail = q('tail-group');
    const elBody = q('character-body');
    const elLeftPaw = q('left-paw');
    const elRightPaw = q('right-paw');
    const elHead = q('head-group');
    const elEarLeft = q('ear-left');
    const elEarRight = q('ear-right');
    const elFaceBase = q('face-base');
    const elWhiskersLeft = q('whiskers-left');
    const elWhiskersRight = q('whiskers-right');
    const elBrowLeft = q('eyebrows-left');
    const elBrowRight = q('eyebrows-right');
    const elEyesOpen = q('eyes-open');
    const elEyesBlink = q('eyes-blink');
    const elEyesHappy = q('eyes-happy');
    const elIrisLeft = q('eye-left-iris');
    const elIrisRight = q('eye-right-iris');
    const elBlushLeft = q('cheek-blush-left');
    const elBlushRight = q('cheek-blush-right');

    const visemeEls: Record<string, SVGGElement | null> = {};
    for (const vId of VISEME_IDS) {
      visemeEls[vId] = q(vId);
    }

    if (reducedMotion) {
      // Static calm neutral pose when prefers-reduced-motion is enabled
      return;
    }

    // Pivot coordinates matched strictly to SVG rig architecture
    const isCat = personaKey === 'emma';
    const earLPivot = isCat ? { x: 226, y: 178 } : { x: 212, y: 188 };
    const earRPivot = isCat ? { x: 374, y: 178 } : { x: 388, y: 188 };

    // Spring state & schedulers
    let rafId = 0;
    let lastTs = performance.now();
    let headTilt = 0;
    let headNod = 0;
    let earLagTilt = 0;
    let earLagNod = 0;
    let smoothPx = 0;
    let smoothPy = 0;
    let smoothAudio = 0;
    let tailPhase = 0;

    // Blink scheduler (3.2–5.4s + occasional double-blink)
    let nextBlinkAt = performance.now() + 2600 + Math.random() * 2000;
    let blinkEndAt = 0;
    let doubleBlinkQueued = false;

    // Natural ear twitch scheduler (4–7s)
    let nextEarTwitchAt = performance.now() + 3800 + Math.random() * 3200;
    let earTwitchEndAt = 0;
    let earTwitchSide: 'left' | 'right' = 'left';

    // Eye micro-saccade scheduler (2.2–4.5s)
    let nextSaccadeAt = performance.now() + 2400;
    let saccadeX = 0;
    let saccadeY = 0;

    let activeViseme: string = 'mouth-rest';

    const setViseme = (target: string) => {
      if (target === activeViseme) return;
      activeViseme = target;
      for (const id of VISEME_IDS) {
        const node = visemeEls[id];
        if (node) node.setAttribute('opacity', id === target ? '1' : '0');
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      const t = now / 1000;

      const isTapHappy = now < tapHappyUntilRef.current;
      const effectiveMood: TutorMood = isTapHappy ? 'happy' : moodRef.current;
      const rawAudio = audioRef.current;
      smoothAudio += (rawAudio - smoothAudio) * Math.min(1, dt * 16);

      // Smooth pointer tracking
      smoothPx += (pointerRef.current.x - smoothPx) * Math.min(1, dt * 6);
      smoothPy += (pointerRef.current.y - smoothPy) * Math.min(1, dt * 6);

      // Update eye micro-saccades
      if (now >= nextSaccadeAt) {
        saccadeX = (Math.random() - 0.5) * 4.5;
        saccadeY = (Math.random() - 0.5) * 2.8;
        nextSaccadeAt = now + 2200 + Math.random() * 2300;
      }

      // Update natural blink state
      let isBlinking = false;
      if (now >= nextBlinkAt) {
        blinkEndAt = now + 130;
        if (!doubleBlinkQueued && Math.random() < 0.24) {
          doubleBlinkQueued = true;
          nextBlinkAt = now + 250;
        } else {
          doubleBlinkQueued = false;
          nextBlinkAt = now + 3200 + Math.random() * 2200;
        }
      }
      if (now < blinkEndAt) {
        isBlinking = true;
      }

      // Update ear twitch state
      let earTwitchDeg = 0;
      if (now >= nextEarTwitchAt) {
        earTwitchEndAt = now + 260;
        earTwitchSide = Math.random() < 0.5 ? 'left' : 'right';
        nextEarTwitchAt = now + 4000 + Math.random() * 3000;
      }
      if (now < earTwitchEndAt) {
        const p = 1 - (earTwitchEndAt - now) / 260;
        earTwitchDeg = Math.sin(p * Math.PI * 2) * (isCat ? 9 : 7);
      }

      // 1. TAIL PHYSICS (Dog joyful wag vs Cat figure-8 swish)
      const tailFreq = isCat
        ? effectiveMood === 'happy'
          ? 7.2
          : effectiveMood === 'thinking'
          ? 1.5
          : effectiveMood === 'speaking'
          ? 3.4
          : 2.1
        : effectiveMood === 'happy'
        ? 10.5
        : effectiveMood === 'listening'
        ? 7.8
        : effectiveMood === 'speaking'
        ? 6.2 + smoothAudio * 3.5
        : 3.1;

      tailPhase += dt * tailFreq;
      let tailDeg = 0;
      if (isCat) {
        const amp =
          effectiveMood === 'happy'
            ? 14
            : effectiveMood === 'thinking'
            ? 5
            : effectiveMood === 'listening'
            ? 10
            : 8;
        // Graceful figure-8 / dual-harmonic feline swish
        tailDeg = Math.sin(tailPhase) * amp + Math.sin(tailPhase * 2) * (amp * 0.24);
      } else {
        const amp =
          effectiveMood === 'happy'
            ? 16
            : effectiveMood === 'listening'
            ? 15
            : effectiveMood === 'speaking'
            ? 11 + smoothAudio * 5
            : 6;
        tailDeg = Math.sin(tailPhase) * amp;
      }
      if (elTail) {
        elTail.setAttribute('transform', `rotate(${tailDeg.toFixed(2)}, 398, 468)`);
      }

      // 2. ORGANIC BREATHING & BOUNCE (#character-body + inverse #ground-shadow)
      const breathWave = Math.sin(t * 2.1);
      const bounceWave =
        effectiveMood === 'happy'
          ? -Math.abs(Math.sin(t * 6.5)) * 7.5
          : effectiveMood === 'speaking'
          ? -Math.abs(Math.sin(t * 5.2)) * (2.5 + smoothAudio * 4.5)
          : 0;
      const bodyY = breathWave * 2.6 + bounceWave;
      const bodyScaleY = 1 + breathWave * 0.008 + (effectiveMood === 'speaking' ? smoothAudio * 0.012 : 0);

      if (elBody) {
        elBody.setAttribute(
          'transform',
          `translate(0, ${bodyY.toFixed(2)}) translate(300, 440) scale(1, ${bodyScaleY.toFixed(4)}) translate(-300, -440)`
        );
      }
      if (elShadow) {
        const shadowScale = Math.max(0.88, 1 + bodyY * 0.009);
        elShadow.setAttribute(
          'transform',
          `translate(300, 518) scale(${shadowScale.toFixed(4)}, 1) translate(-300, -518)`
        );
      }

      // 3. PAW TAPS (Alternating joyful micro-lift during speaking & happy)
      const pawActive = effectiveMood === 'happy' ? 1 : effectiveMood === 'speaking' ? 0.55 + smoothAudio * 0.45 : 0;
      const leftPawY = pawActive > 0 ? -Math.max(0, Math.sin(t * 7.2)) * 5.5 * pawActive : 0;
      const rightPawY = pawActive > 0 ? -Math.max(0, Math.sin(t * 7.2 + Math.PI)) * 5.5 * pawActive : 0;
      if (elLeftPaw) {
        elLeftPaw.setAttribute(
          'transform',
          `translate(0, ${leftPawY.toFixed(2)}) rotate(${(leftPawY * 0.6).toFixed(2)}, 246, 468)`
        );
      }
      if (elRightPaw) {
        elRightPaw.setAttribute(
          'transform',
          `translate(0, ${rightPawY.toFixed(2)}) rotate(${(-rightPawY * 0.6).toFixed(2)}, 322, 468)`
        );
      }

      // 4. HEAD TILT, NOD & 2.5D TRACKING (#head-group + #face-base)
      let targetTilt = smoothPx * 4.2 + Math.sin(t * 1.15) * 1.6;
      let targetNod = smoothPy * 3.5;

      if (effectiveMood === 'listening') {
        targetTilt += 5.5 + Math.sin(t * 1.6) * 1.2;
        targetNod += -1.5;
      } else if (effectiveMood === 'thinking') {
        targetTilt += -6.2 + Math.sin(t * 0.9) * 1.4;
        targetNod += -2.5;
      } else if (effectiveMood === 'speaking') {
        targetTilt += Math.sin(t * 3.1) * (2.4 + smoothAudio * 2.4);
        targetNod += Math.sin(t * 6.4) * (1.8 + smoothAudio * 3.2);
      } else if (effectiveMood === 'happy') {
        targetTilt += Math.sin(t * 5.4) * 5.5;
        targetNod += -3.2;
      }

      headTilt += (targetTilt - headTilt) * Math.min(1, dt * 8.5);
      headNod += (targetNod - headNod) * Math.min(1, dt * 9.5);

      // 80ms secondary-motion lag for ears
      earLagTilt += (headTilt - earLagTilt) * Math.min(1, dt * 5.2);
      earLagNod += (headNod - earLagNod) * Math.min(1, dt * 5.2);

      const hx = smoothPx * 5.2;
      const hy = headNod;
      if (elHead) {
        elHead.setAttribute(
          'transform',
          `translate(${(hx * 0.55).toFixed(2)}, ${(hy * 0.65).toFixed(2)}) rotate(${headTilt.toFixed(2)}, 300, 328)`
        );
      }
      if (elFaceBase) {
        elFaceBase.setAttribute(
          'transform',
          `translate(${(hx * 0.35).toFixed(2)}, ${(hy * 0.25).toFixed(2)})`
        );
      }

      // 5. INDEPENDENT EAR PHYSICS (Perk on listening/happy + follow-through lag + twitch)
      const perkDeg =
        effectiveMood === 'listening'
          ? 8.5
          : effectiveMood === 'happy'
          ? 11
          : effectiveMood === 'speaking'
          ? 3.5 + smoothAudio * 4.5
          : effectiveMood === 'thinking'
          ? -3
          : 0;
      const followThrough = (headTilt - earLagTilt) * 1.35 + (headNod - earLagNod) * 0.8;
      const leftEarDeg = perkDeg + followThrough + (earTwitchSide === 'left' ? earTwitchDeg : 0);
      const rightEarDeg = -perkDeg + followThrough + (earTwitchSide === 'right' ? -earTwitchDeg : 0);

      if (elEarLeft) {
        elEarLeft.setAttribute('transform', `rotate(${leftEarDeg.toFixed(2)}, ${earLPivot.x}, ${earLPivot.y})`);
      }
      if (elEarRight) {
        elEarRight.setAttribute('transform', `rotate(${rightEarDeg.toFixed(2)}, ${earRPivot.x}, ${earRPivot.y})`);
      }

      // 6. EMMA WHISKERS TWITCH
      if (elWhiskersLeft && elWhiskersRight) {
        const whiskerAmp =
          effectiveMood === 'happy'
            ? 5.5
            : effectiveMood === 'speaking'
            ? 2.2 + smoothAudio * 4.2
            : effectiveMood === 'listening'
            ? 2.4
            : 0.9;
        const wDeg = Math.sin(t * 8.5) * whiskerAmp;
        elWhiskersLeft.setAttribute('transform', `rotate(${wDeg.toFixed(2)}, 228, 286)`);
        elWhiskersRight.setAttribute('transform', `rotate(${(-wDeg).toFixed(2)}, 372, 286)`);
      }

      // 7. EYEBROWS EXPRESSION
      const browY =
        effectiveMood === 'happy'
          ? -5.5
          : effectiveMood === 'listening'
          ? -4
          : effectiveMood === 'speaking'
          ? -2.5 - smoothAudio * 3.5
          : effectiveMood === 'thinking'
          ? 2.2
          : 0;
      const browRot = effectiveMood === 'thinking' ? 7 : effectiveMood === 'happy' ? -5 : 0;
      if (elBrowLeft) {
        elBrowLeft.setAttribute(
          'transform',
          `translate(${(hx * 0.4).toFixed(2)}, ${browY.toFixed(2)}) rotate(${browRot.toFixed(1)}, 248, 196)`
        );
      }
      if (elBrowRight) {
        elBrowRight.setAttribute(
          'transform',
          `translate(${(hx * 0.4).toFixed(2)}, ${browY.toFixed(2)}) rotate(${(-browRot).toFixed(1)}, 334, 196)`
        );
      }

      // 8. EYES: OPEN / BLINK / HAPPY + GAZE TRACKING + ROSY BLUSH
      const showHappyEyes = effectiveMood === 'happy';
      if (elEyesOpen && elEyesBlink && elEyesHappy) {
        elEyesOpen.setAttribute('opacity', !showHappyEyes && !isBlinking ? '1' : '0');
        elEyesBlink.setAttribute('opacity', !showHappyEyes && isBlinking ? '1' : '0');
        elEyesHappy.setAttribute('opacity', showHappyEyes ? '1' : '0');
      }

      const gazeX =
        effectiveMood === 'thinking'
          ? 4.5 + Math.sin(t * 1.4) * 1.5
          : Math.max(-5.5, Math.min(5.5, smoothPx * 4.8 + saccadeX * 0.55));
      const gazeY =
        effectiveMood === 'thinking'
          ? -4.2
          : Math.max(-4.5, Math.min(4.5, smoothPy * 3.8 + saccadeY * 0.55));

      if (elIrisLeft) elIrisLeft.setAttribute('transform', `translate(${gazeX.toFixed(2)}, ${gazeY.toFixed(2)})`);
      if (elIrisRight) elIrisRight.setAttribute('transform', `translate(${gazeX.toFixed(2)}, ${gazeY.toFixed(2)})`);

      const blushOpacity = showHappyEyes ? '0.68' : effectiveMood === 'speaking' ? '0.36' : '0.22';
      if (elBlushLeft) elBlushLeft.setAttribute('opacity', blushOpacity);
      if (elBlushRight) elBlushRight.setAttribute('opacity', blushOpacity);

      // 9. REAL-TIME AUDIO-DRIVEN MOUTH VISEMES
      if (effectiveMood === 'happy') {
        setViseme('mouth-smile');
      } else if (effectiveMood === 'speaking') {
        // Modulate real audio RMS with natural syllabic envelope so mouth shapes flow organically
        const syllableMod = 0.55 + 0.45 * Math.sin(t * 14.5) * Math.cos(t * 6.2);
        const energy = Math.max(0.18, smoothAudio) * (0.65 + 0.55 * syllableMod);
        if (energy > 0.72) setViseme('mouth-open-lg');
        else if (energy > 0.46) setViseme('mouth-open-md');
        else if (energy > 0.28) setViseme('mouth-open-sm');
        else if (energy > 0.14) setViseme('mouth-parted');
        else setViseme('mouth-rest');
      } else if (effectiveMood === 'listening' && smoothAudio > 0.25) {
        setViseme('mouth-parted');
      } else {
        setViseme('mouth-rest');
      }

      // 10. REACTIVE ACOUSTIC AURA
      if (elAuraAmbient && elAuraSpeaking && elAuraRing1 && elAuraRing2) {
        const isSpk = effectiveMood === 'speaking';
        const isLst = effectiveMood === 'listening';
        const isThk = effectiveMood === 'thinking';
        elAuraAmbient.setAttribute('opacity', isSpk ? '0.25' : isLst ? '0.88' : '0.55');
        elAuraSpeaking.setAttribute(
          'opacity',
          isSpk ? (0.55 + smoothAudio * 0.45).toFixed(2) : effectiveMood === 'happy' ? '0.65' : '0'
        );
        const ring1Rot = (t * (isThk ? 34 : isLst ? 18 : 8)) % 360;
        const ring2Rot = (-t * (isSpk ? 26 : 12)) % 360;
        elAuraRing1.setAttribute('transform', `rotate(${ring1Rot.toFixed(1)}, 300, 320)`);
        elAuraRing1.setAttribute('stroke-opacity', isLst || isThk ? '0.55' : '0.22');
        elAuraRing2.setAttribute('transform', `rotate(${ring2Rot.toFixed(1)}, 300, 320)`);
        elAuraRing2.setAttribute('stroke-opacity', isSpk || effectiveMood === 'happy' ? '0.55' : '0');
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [svgHtml, personaKey]);

  const handleTapDelight = () => {
    if (!interactive) return;
    tapHappyUntilRef.current = performance.now() + 850;
  };

  return (
    <div
      ref={containerRef}
      data-testid="tutor-avatar-svg"
      data-character={personaKey}
      data-mood={mood}
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : undefined}
      aria-label={label}
      onClick={handleTapDelight}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleTapDelight();
        }
      }}
      className={`relative inline-flex items-center justify-center select-none overflow-visible ${
        interactive ? 'cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E09B30] rounded-full' : ''
      } ${className}`}
      style={{
        width: size ? `${size}px` : undefined,
        height: size ? `${size}px` : undefined,
        ...style,
      }}
    >
      {svgHtml ? (
        <div
          className="w-full h-full flex items-center justify-center pointer-events-none"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      ) : (
        <img
          src={svgUrl}
          alt={label}
          width={600}
          height={600}
          className={`w-full h-full object-contain pointer-events-none ${loadFailed ? 'opacity-60' : ''}`}
        />
      )}
    </div>
  );
};

export default TutorAvatar;
