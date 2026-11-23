import React from 'react';
import { TutorAvatar3D, TutorMood3D } from './TutorAvatar3D';

export type RigState = TutorMood3D;
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
 * Universal Tutor Avatar Wrapper
 * Routes all RiggedCharacter surfaces (TutorAvatarStage, CornerCoachWidget, Portal)
 * directly to the animated 3D reference models (<TutorAvatar3D />).
 */
export const RiggedCharacter: React.FC<RiggedCharacterProps> = ({
  persona,
  state = 'idle',
  className = '',
  audioLevel = 0,
  alt,
}) => {
  return (
    <TutorAvatar3D
      character={persona === 'emma' ? 'emma' : 'ivan'}
      mood={state}
      audioLevel={audioLevel}
      className={`rig-character-wrapper ${className}`}
      alt={alt || (persona === 'teacher-ivan' ? 'Teacher Ivan 3D Avatar' : 'Emma 3D Avatar')}
    />
  );
};

export default RiggedCharacter;
