import React from 'react';
import { Sparkles, MessageSquare, Award, Volume2 } from 'lucide-react';

export interface ChibiSceneShowcaseProps {
  imageSrc: string;
  altText: string;
  badge1Text?: string;
  badge1Icon?: 'recast' | 'sparkle' | 'audio';
  badge2Text?: string;
  badge2Icon?: 'cefr' | 'star' | 'audio';
  badge1Position?: 'top-left' | 'top-right';
  badge2Position?: 'bottom-left' | 'bottom-right';
  caption?: string;
  className?: string;
}

export const ChibiSceneShowcase: React.FC<ChibiSceneShowcaseProps> = ({
  imageSrc,
  altText,
  badge1Text = 'Quick Recast! 💡',
  badge1Icon = 'recast',
  badge2Text = 'CEFR B2+ 🎯',
  badge2Icon = 'cefr',
  badge1Position = 'top-left',
  badge2Position = 'bottom-right',
  caption,
  className = '',
}) => {
  return (
    <div
      className={`relative rounded-2xl border border-[#A7C7E7]/30 shadow-lg bg-[#12223a]/80 p-3 sm:p-4 overflow-hidden group ${className}`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#E09B30]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#A7C7E7]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Illustration Container */}
      <div className="relative rounded-xl overflow-hidden bg-[#1A3153]/40 border border-[#A7C7E7]/20">
        <img
          src={imageSrc}
          alt={altText}
          className="w-full h-auto object-cover max-h-[380px] sm:max-h-[440px] mx-auto transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          loading="lazy"
        />

        {/* Animated Floating Overlay 1 */}
        {badge1Text && (
          <div
            className={`absolute z-10 animate-float-slow pointer-events-none ${
              badge1Position === 'top-left' ? 'top-3 left-3' : 'top-3 right-3'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A3153]/90 backdrop-blur-md border border-[#E09B30]/60 shadow-lg shadow-[#E09B30]/25 text-xs font-montserrat font-bold text-[#E09B30]">
              {badge1Icon === 'recast' ? (
                <MessageSquare size={13} className="text-[#E09B30]" />
              ) : badge1Icon === 'sparkle' ? (
                <Sparkles size={13} className="text-[#E09B30]" />
              ) : (
                <Volume2 size={13} className="text-[#E09B30]" />
              )}
              <span>{badge1Text}</span>
            </div>
          </div>
        )}

        {/* Animated Floating Overlay 2 */}
        {badge2Text && (
          <div
            className={`absolute z-10 animate-float-delayed pointer-events-none ${
              badge2Position === 'bottom-left' ? 'bottom-3 left-3' : 'bottom-3 right-3'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A3153]/90 backdrop-blur-md border border-[#A7C7E7]/50 shadow-lg shadow-[#1A3153]/50 text-xs font-montserrat font-bold text-[#FAFAFA]">
              {badge2Icon === 'cefr' ? (
                <Award size={13} className="text-[#10b981]" />
              ) : badge2Icon === 'star' ? (
                <Sparkles size={13} className="text-[#E09B30]" />
              ) : (
                <Volume2 size={13} className="text-[#A7C7E7]" />
              )}
              <span>{badge2Text}</span>
            </div>
          </div>
        )}

        {/* Floating Glowing Star & Pulsing Audio Waves Overlay */}
        <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#12223a]/80 backdrop-blur-sm border border-[#A7C7E7]/20 text-[10px] text-[#A7C7E7]">
          {/* Animated SVG Audio Waves */}
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 h-2 bg-[#10b981] rounded-full animate-pulse" />
            <span className="w-0.5 h-3 bg-[#E09B30] rounded-full animate-pulse [animation-delay:200ms]" />
            <span className="w-0.5 h-1.5 bg-[#10b981] rounded-full animate-pulse [animation-delay:400ms]" />
            <span className="w-0.5 h-2.5 bg-[#A7C7E7] rounded-full animate-pulse [animation-delay:150ms]" />
          </div>
          <span className="font-mono text-[9px] text-[#A7C7E7]/90 font-medium">Native Audio</span>
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-center text-xs text-[#A7C7E7] font-inter">
          {caption}
        </p>
      )}
    </div>
  );
};

export default ChibiSceneShowcase;
