import React from 'react';
import { TutorAvatar, TutorMood } from './TutorAvatar';

export type RigState = TutorMood;
export type RigPersona = 'teacher-ivan' | 'emma';

export interface RiggedCharacterProps {
  persona: RigPersona;
  state?: RigState;
  className?: string;
  animateBlink?: boolean;
  audioLevel?: number;
  alt?: string;
  interactive?: boolean;
}

/**
 * Universal Tutor Avatar Wrapper
 * Routes all RiggedCharacter surfaces directly to the spring-physics
 * SVG mascot rigs (Golden Retriever Ivan & Tabby Kitten Emma).
 */
export const RiggedCharacter: React.FC<RiggedCharacterProps> = ({
  persona,
  state = 'idle',
  className = '',
  audioLevel = 0,
  alt,
  interactive = true,
}) => {
  return (
    <TutorAvatar
      character={persona === 'emma' ? 'emma' : 'ivan'}
      mood={state}
      audioLevel={audioLevel}
      className={`rig-character-wrapper ${className}`}
      alt={
        alt ||
        (persona === 'teacher-ivan'
          ? 'Teacher Ivan — Golden Retriever Puppy Tutor'
          : 'Emma — Fluffy Tabby Kitten Tutor')
      }
      interactive={interactive}
    />
  );
};

export default RiggedCharacter;
