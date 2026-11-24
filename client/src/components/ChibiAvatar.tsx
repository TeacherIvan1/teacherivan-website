import React from 'react';
import { TutorAvatar, TutorMood } from './TutorAvatar';

export type ChibiCharacter = 'ivan' | 'emma' | 'teacher-ivan';
export type ChibiState = 'idle' | 'listening' | 'speaking';
export type AvatarMood = TutorMood;

export interface ChibiAvatarProps {
  character: ChibiCharacter;
  state?: ChibiState;
  mood?: AvatarMood;
  className?: string;
  rmsLevel?: number;
  audioLevel?: number;
  size?: number;
  alt?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
}

/**
 * Backward-compatible wrapper routing all ChibiAvatar mounts to the
 * animated Golden Retriever Ivan & Tabby Kitten Emma SVG rig (<TutorAvatar />).
 */
export const ChibiAvatar: React.FC<ChibiAvatarProps> = ({
  character,
  state = 'idle',
  mood,
  className = '',
  rmsLevel,
  audioLevel,
  size,
  alt,
  style,
  interactive = true,
}) => {
  const effectiveMood: TutorMood = mood || state;
  const effectiveAudio = audioLevel ?? rmsLevel ?? 0;

  return (
    <TutorAvatar
      character={character === 'emma' ? 'emma' : 'ivan'}
      mood={effectiveMood}
      audioLevel={effectiveAudio}
      size={size}
      className={className}
      alt={alt}
      style={style}
      interactive={interactive}
    />
  );
};

export default ChibiAvatar;
