import React from 'react';
import { TutorAvatar3D, TutorMood3D } from './TutorAvatar3D';

export type ChibiCharacter = 'ivan' | 'emma' | 'teacher-ivan';
export type ChibiState = 'idle' | 'listening' | 'speaking';
export type AvatarMood = TutorMood3D;

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
}

/**
 * Backward-compatible wrapper routing all site avatar mounts to the new
 * animated 3D reference avatars (<TutorAvatar3D /> using teacherivan-3d.webp & emma-3d.webp).
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
}) => {
  const effectiveMood: TutorMood3D = mood || state;
  const effectiveAudio = audioLevel ?? rmsLevel ?? 0;

  return (
    <TutorAvatar3D
      character={character === 'emma' ? 'emma' : 'ivan'}
      mood={effectiveMood}
      audioLevel={effectiveAudio}
      size={size}
      className={className}
      alt={alt}
      style={style}
    />
  );
};

export default ChibiAvatar;
