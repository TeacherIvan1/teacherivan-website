import React from 'react';
import { Check, Lock, UserCheck } from 'lucide-react';
import { useTeachingStore } from '../modules/teaching/teachingStore';
import { TutorPersona } from '../modules/teaching/types';
import { useTranslation } from '../modules/i18n/languageStore';

export interface TutorPersonaSelectorProps {
  className?: string;
  compact?: boolean;
}

export const TutorPersonaSelector: React.FC<TutorPersonaSelectorProps> = ({
  className = '',
  compact = false,
}) => {
  const { persona, setPersona, isLocked } = useTeachingStore();
  const { t } = useTranslation();

  const personas: Array<{
    id: TutorPersona;
    name: string;
    voiceBadge: string;
    role: string;
    desc: string;
    avatarSrc: string;
    voiceName: string;
    genderLabel: string;
  }> = [
      {
        id: 'teacher-ivan',
        name: t.persona.teacherIvan.name,
        voiceBadge: t.persona.teacherIvan.voiceLabel,
        role: t.persona.teacherIvan.role,
        desc: t.persona.teacherIvan.desc,
        avatarSrc: '/assets/logo.svg',
        voiceName: 'Puck',
        genderLabel: 'Male',
      },
      {
        id: 'emma',
        name: t.persona.emma.name,
        voiceBadge: t.persona.emma.voiceLabel,
        role: t.persona.emma.role,
        desc: t.persona.emma.desc,
        avatarSrc: '/assets/emma.svg',
        voiceName: 'Aoede',
        genderLabel: 'Female',
      },
    ];

  return (
    <div className={`w-full ${className}`} data-testid="tutor-persona-selector">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <UserCheck size={16} className="text-[#E09B30]" />
          <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#A7C7E7]">
            {t.persona.heading}
          </span>
        </div>
        {isLocked && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/25 px-2 py-0.5 rounded-full">
            <Lock size={10} />
            <span>{t.pedagogy.lockedBadge}</span>
          </span>
        )}
      </div>

      <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-1 sm:grid-cols-2 gap-3'}`}>
        {personas.map((p) => {
          const isSelected = persona === p.id;

          return (
            <button
              key={p.id}
              id={`persona-btn-${p.id}`}
              type="button"
              disabled={isLocked}
              onClick={() => setPersona(p.id)}
              title={isLocked ? t.pedagogy.lockedNotice : `${p.name} - ${p.voiceBadge}`}
              className={`relative text-left p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${isSelected
                ? 'bg-[#1A3153]/90 border-[#E09B30] shadow-[0_0_18px_rgba(224,155,48,0.22)] ring-1 ring-[#E09B30]'
                : 'bg-[#12223a]/75 border-[#A7C7E7]/25 hover:border-[#A7C7E7]/50 hover:bg-[#1A3153]/60'
                } ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-[1.01]'}`}
            >
              {/* Top Row: Avatar thumbnail + Name + Active badge */}
              <div className="flex items-start gap-3 w-full">
                <div
                  className={`w-11 h-11 rounded-lg p-1 flex-shrink-0 flex items-center justify-center border transition-colors ${isSelected
                    ? 'bg-[#E09B30]/15 border-[#E09B30]/50'
                    : 'bg-[#1A3153] border-[#A7C7E7]/20'
                    }`}
                >
                  <img
                    src={p.avatarSrc}
                    alt={p.name}
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-montserrat font-bold text-sm text-[#FAFAFA] truncate">
                      {p.name}
                    </h3>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#E09B30] text-[#1A3153] flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  <span className="inline-block mt-0.5 text-[11px] font-semibold text-[#E09B30] tracking-wide">
                    {p.voiceBadge}
                  </span>
                </div>
              </div>

              {/* Tagline / Pedagogical Role */}
              {!compact && (
                <div className="mt-2.5 pt-2 border-t border-[#A7C7E7]/15">
                  <p className="text-[11px] text-[#A7C7E7] line-clamp-2 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TutorPersonaSelector;
