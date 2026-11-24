import React from 'react';
import { TutorAvatar, TutorCharacter, TutorMood, TutorAvatarProps } from './TutorAvatar';

export type TutorCharacter3D = TutorCharacter;
export type TutorMood3D = TutorMood;
export type TutorAvatar3DProps = TutorAvatarProps;

/**
 * Backward-compatible re-export delegating to the animated SVG mascot rig (<TutorAvatar />).
 */
export const TutorAvatar3D: React.FC<TutorAvatar3DProps> = (props) => {
  return <TutorAvatar {...props} />;
};

export default TutorAvatar3D;
