import React from 'react';
import { ChibiAvatar, AvatarMood } from './ChibiAvatar';

export type RigState = 'idle' | 'listening' | 'speaking' | 'thinking' | 'happy';
export type RigPersona = 'teacher-ivan' | 'emma';

export interface RiggedCharacterProps {
  persona: RigPersona;
  state?: RigState;
  className?: string;
  animateBlink?: boolean;
  audioLevel?: number;
  alt?: string;
}

/**
 * Universal Editorial Rigged Character Wrapper
 * Delegates to the Live2D-style 2.5D native SVG rig engine in ChibiAvatar
 * so every site surface (Hero, Voice Lab, Corner Coach, Student Portal) shares
 * the exact same showcase02.jpg-inspired Emma & Teacher Ivan vector portraits.
 */
export const RiggedCharacter: React.FC<RiggedCharacterProps> = ({
  persona,
  state = 'idle',
  className = '',
  audioLevel = 0,
  alt,
}) => {
  const mood: AvatarMood = state;

  return (
    <ChibiAvatar
      character={persona === 'emma' ? 'emma' : 'teacher-ivan'}
      mood={mood}
      audioLevel={audioLevel}
      className={`rig-character-wrapper ${className}`}
      alt={alt || (persona === 'teacher-ivan' ? 'Teacher Ivan Editorial Avatar' : 'Coach Emma Editorial Avatar')}
    />
  );
};

export default RiggedCharacter;
