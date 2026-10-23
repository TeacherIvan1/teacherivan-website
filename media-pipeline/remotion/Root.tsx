import React from 'react';
import { Composition } from 'remotion';
import { TeacherIvanReel } from './TeacherIvanReel';
import { TeacherIvanReelProps, WordTimestamp } from './types';
import defaultWordsJson from '../public/audio/palabras.json';
import './style.css';

const defaultWords = defaultWordsJson as WordTimestamp[];

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="TeacherIvanReel"
        component={TeacherIvanReel}
        durationInFrames={2100} // Exactly 35.0 seconds at 60fps
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          title: '¿SABÍAS QUE EN CLASES\nSÓLO HABLAS UN 30%?',
          subtitle: 'DIAGNÓSTICO REAL',
          character: 'ivan',
          ctaText: 'TEACHERIVAN.COM — TEST GRATIS',
          audioSrc: 'audio/voz.mp3',
          musicSrc: 'audio/sfx/bg-music.wav',
          words: defaultWords,
          activeScenes: ['hookDrop', 'painPoint', 'breakthrough', 'liveRecast', 'hybridFormula', 'finalCta'],
          hookDurationSeconds: 5.3,
          durationInSeconds: 35.0,
        }}
        calculateMetadata={async ({ props }: { props: TeacherIvanReelProps }) => {
          const fps = 60;
          if (props.durationInSeconds && props.durationInSeconds > 0) {
            return {
              durationInFrames: Math.round(props.durationInSeconds * fps),
              props,
            };
          }

          // Exact 35.0-second reel (2100 frames @ 60fps)
          return {
            durationInFrames: 2100,
            props: {
              ...props,
              words: (props.words && props.words.length > 0) ? props.words : defaultWords,
            },
          };
        }}
      />
    </>
  );
};
