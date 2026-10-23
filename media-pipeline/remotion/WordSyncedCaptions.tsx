import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { WordTimestamp } from './types';

export interface WordSyncedCaptionsProps {
  words: WordTimestamp[];
  hookTitle?: string;
  hookDurationSeconds?: number;
}

interface PhraseGroup {
  s: number;
  e: number;
  words: WordTimestamp[];
}

const getWordText = (w: WordTimestamp): string => w.w || w.word || '';
const getWordStart = (w: WordTimestamp): number => (typeof w.s === 'number' ? w.s : w.start ?? 0);
const getWordEnd = (w: WordTimestamp): number => (typeof w.e === 'number' ? w.e : w.end ?? 0);

export const WordSyncedCaptions: React.FC<WordSyncedCaptionsProps> = ({
  words = [],
  hookTitle = '¿SABÍAS QUE EN CLASES\nSÓLO HABLAS UN 30%?',
  hookDurationSeconds = 5.3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Group individual words into readable phrases (max 5 words or punctuation)
  const phrases = useMemo<PhraseGroup[]>(() => {
    if (!words || words.length === 0) return [];
    const groups: PhraseGroup[] = [];
    let current: WordTimestamp[] = [];

    for (const w of words) {
      current.push(w);
      const text = getWordText(w).trim();
      const isPunctuation = /[.,;:?!]$/.test(text);
      if (isPunctuation || current.length >= 5) {
        const firstStart = getWordStart(current[0]);
        const lastEnd = getWordEnd(current[current.length - 1]);
        groups.push({
          s: firstStart,
          e: lastEnd + 0.20,
          words: current,
        });
        current = [];
      }
    }

    if (current.length > 0) {
      const firstStart = getWordStart(current[0]);
      const lastEnd = getWordEnd(current[current.length - 1]);
      groups.push({
        s: firstStart,
        e: lastEnd + 0.20,
        words: current,
      });
    }

    return groups;
  }, [words]);

  // Check if we are in the initial hook title phase (Scene 1)
  const isHook = currentTime < hookDurationSeconds;

  // If in hook phase, render the iconic split-color hook banner
  if (isHook) {
    const lines = hookTitle.split('\n');
    return (
      <div
        className="absolute left-0 right-0 flex flex-col items-center justify-center gap-3 px-8 z-50 select-none pointer-events-none"
        style={{ top: '870px', height: '170px' }}
      >
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={`font-montserrat font-black text-4xl lg:text-5xl uppercase tracking-tight px-8 py-3 rounded-2xl shadow-2xl border-3 ${
              idx === 0
                ? 'bg-[#1A3153] text-[#FAFAFA] border-[#A7C7E7]'
                : 'bg-[#E09B30] text-[#1A3153] border-[#1A3153]'
            }`}
            style={{
              boxShadow: '0 16px 40px rgba(26, 49, 83, 0.35)',
              transform: `scale(${1 + Math.sin(frame * 0.08) * 0.015})`,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    );
  }

  // Find active phrase based on current playback time
  const activePhrase = phrases.find(
    (p) => currentTime >= p.s && currentTime < p.e
  );

  if (!activePhrase) {
    return null;
  }

  return (
    <div
      className="absolute left-0 right-0 flex items-center justify-center px-10 z-50 select-none pointer-events-none"
      style={{ top: '870px', height: '170px' }}
    >
      <div
        className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-10 py-5 rounded-3xl bg-[#1A3153]/95 border-3 border-[#A7C7E7] shadow-2xl backdrop-blur-md max-w-[960px]"
        style={{
          boxShadow: '0 20px 50px rgba(26, 49, 83, 0.55)',
        }}
      >
        {activePhrase.words.map((wordObj, i) => {
          const text = getWordText(wordObj);
          const start = getWordStart(wordObj);
          const end = getWordEnd(wordObj);
          const isActiveWord = currentTime >= start && currentTime <= end;

          return (
            <React.Fragment key={`${text}-${i}`}>
              <span
                className={`inline-block font-montserrat text-3xl lg:text-4xl uppercase tracking-wider px-1.5 transition-transform duration-75 ${
                  isActiveWord
                    ? 'font-black text-[#E09B30] scale-110 drop-shadow-[0_0_20px_rgba(224,155,48,0.9)]'
                    : 'font-extrabold text-[#FAFAFA]'
                }`}
              >
                {text}
              </span>
              {/* Guaranteed non-breaking space between subtitle words */}
              {i < activePhrase.words.length - 1 && <span className="text-transparent w-1"> </span>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
