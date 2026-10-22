import React, { useEffect, useState } from 'react';

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

export const RiggedCharacter: React.FC<RiggedCharacterProps> = ({
  persona,
  state = 'idle',
  className = '',
  animateBlink = true,
  alt,
}) => {
  const [svgMarkup, setSvgMarkup] = useState<string>(() => {
    const assetPath = persona === 'teacher-ivan' ? '/assets/teacher-ivan-rig.svg' : '/assets/emma-rig.svg';
    return svgMarkupCache[assetPath] || '';
  });
  const [isBlinking, setIsBlinking] = useState(false);

  const assetPath = persona === 'teacher-ivan' ? '/assets/teacher-ivan-rig.svg' : '/assets/emma-rig.svg';

  // 1. Fetch & cache SVG markup
  useEffect(() => {
    let isMounted = true;
    if (svgMarkupCache[assetPath]) {
      setSvgMarkup(svgMarkupCache[assetPath]);
      return;
    }

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

  // 2. Natural procedural blinking interval (every 3.2 to 4.2 seconds)
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

  const stateClass = `rig-state-${state}`;
  const blinkClass = isBlinking ? 'rig-blinking' : '';

  return (
    <div
      className={`rig-character-wrapper relative inline-block select-none ${stateClass} ${blinkClass} ${className}`}
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
          transition: transform 0.22s ease-out, opacity 0.15s ease-in-out;
        }

        /* ------------------------------------------------------------------ */
        /* SPEAKING STATE DYNAMICS                                            */
        /* ------------------------------------------------------------------ */
        .rig-character-wrapper.rig-state-speaking #mouth-talk-open {
          opacity: 1 !important;
          animation: rigMouthViseme 0.24s ease-in-out infinite alternate !important;
        }
        .rig-character-wrapper.rig-state-speaking #mouth-smile,
        .rig-character-wrapper.rig-state-speaking #mouth-idle {
          opacity: 0 !important;
        }
        .rig-character-wrapper.rig-state-speaking #right-arm-gesture {
          animation: rigArmTalk 1.6s ease-in-out infinite alternate !important;
        }
        .rig-character-wrapper.rig-state-speaking #head-group {
          animation: rigHeadTalk 1.1s ease-in-out infinite alternate !important;
        }
        .rig-character-wrapper.rig-state-speaking #bg-aura {
          animation: rigAuraActive 1.4s ease-in-out infinite alternate !important;
        }

        /* ------------------------------------------------------------------ */
        /* LISTENING STATE DYNAMICS                                           */
        /* ------------------------------------------------------------------ */
        .rig-character-wrapper.rig-state-listening #mouth-talk-open {
          opacity: 0 !important;
        }
        .rig-character-wrapper.rig-state-listening #mouth-smile {
          opacity: 1 !important;
        }
        .rig-character-wrapper.rig-state-listening #mouth-idle {
          opacity: 0 !important;
        }
        .rig-character-wrapper.rig-state-listening #head-group {
          transform: rotate(3deg) translateY(-2px) !important;
        }
        .rig-character-wrapper.rig-state-listening #bg-aura {
          animation: rigAuraListening 2.2s ease-in-out infinite alternate !important;
        }

        /* ------------------------------------------------------------------ */
        /* IDLE STATE DYNAMICS                                                */
        /* ------------------------------------------------------------------ */
        .rig-character-wrapper.rig-state-idle #mouth-talk-open {
          opacity: 0 !important;
        }
        .rig-character-wrapper.rig-state-idle #mouth-smile {
          opacity: 1 !important;
        }
        .rig-character-wrapper.rig-state-idle #mouth-idle {
          opacity: 0 !important;
        }
        .rig-character-wrapper.rig-state-idle #head-group {
          animation: rigHeadIdle 3.8s ease-in-out infinite alternate !important;
        }

        /* ------------------------------------------------------------------ */
        /* BLINKING OVERRIDE                                                  */
        /* ------------------------------------------------------------------ */
        .rig-character-wrapper.rig-blinking #eyes-open {
          opacity: 0 !important;
        }
        .rig-character-wrapper.rig-blinking #eyes-blink {
          opacity: 1 !important;
        }

        /* ------------------------------------------------------------------ */
        /* KEYFRAME ANIMATIONS                                                */
        /* ------------------------------------------------------------------ */
        @keyframes rigMouthViseme {
          0% {
            transform: scaleY(0.7) translateY(1px);
            transform-origin: 300px 285px;
          }
          100% {
            transform: scaleY(1.18) translateY(-1px);
            transform-origin: 300px 285px;
          }
        }

        @keyframes rigArmTalk {
          0% {
            transform: rotate(0deg);
            transform-origin: 358px 332px;
          }
          100% {
            transform: rotate(-9deg) translateY(-4px);
            transform-origin: 358px 332px;
          }
        }

        @keyframes rigHeadTalk {
          0% {
            transform: rotate(-1deg) translateY(0);
            transform-origin: 300px 310px;
          }
          100% {
            transform: rotate(1.5deg) translateY(-2px);
            transform-origin: 300px 310px;
          }
        }

        @keyframes rigHeadIdle {
          0% {
            transform: translateY(0);
            transform-origin: 300px 310px;
          }
          100% {
            transform: translateY(-3px);
            transform-origin: 300px 310px;
          }
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
