import React from 'react';
import { Clock, MessageSquare, Play, Sparkles, CheckCircle2, Flame, Wrench, Target } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';

export const SessionArchitectureSection: React.FC = () => {
  const { t } = useTranslation();

  const phases = [
    {
      time: t.sessionArchitecture.phase1Time,
      title: t.sessionArchitecture.phase1Title,
      desc: t.sessionArchitecture.phase1Desc,
      icon: Flame,
      color: 'border-[#A7C7E7]/40 text-[#A7C7E7]',
    },
    {
      time: t.sessionArchitecture.phase2Time,
      title: t.sessionArchitecture.phase2Title,
      desc: t.sessionArchitecture.phase2Desc,
      icon: Play,
      color: 'border-[#E09B30] text-[#E09B30] bg-[#E09B30]/10',
      badge: '>75% STT Active Oral Production',
    },
    {
      time: t.sessionArchitecture.phase3Time,
      title: t.sessionArchitecture.phase3Title,
      desc: t.sessionArchitecture.phase3Desc,
      icon: Wrench,
      color: 'border-[#A7C7E7]/40 text-[#A7C7E7]',
    },
    {
      time: t.sessionArchitecture.phase4Time,
      title: t.sessionArchitecture.phase4Title,
      desc: t.sessionArchitecture.phase4Desc,
      icon: Target,
      color: 'border-[#A7C7E7]/40 text-[#FAFAFA]',
    },
  ];

  return (
    <section
      id="session-architecture-section"
      className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full"
      aria-label="60-Minute Session Architecture"
    >
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
          <Clock size={14} />
          <span>{t.sessionArchitecture.badge}</span>
        </div>
        <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
          {t.sessionArchitecture.title}
        </h2>
        <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed">
          {t.sessionArchitecture.subtitle}
        </p>
      </div>

      {/* Horizontal STT vs TTT Comparison Bars */}
      <div className="p-6 rounded-3xl bg-[#1A3153]/80 border border-[#A7C7E7]/30 shadow-xl mb-12 space-y-6">
        <h3 className="font-montserrat font-bold text-sm uppercase tracking-wider text-[#FAFAFA] flex items-center gap-2">
          <MessageSquare size={16} className="text-[#E09B30]" />
          <span>{t.sessionArchitecture.comparisonTitle}</span>
        </h3>

        {/* Bar 1: Teacher Ivan Bichronous Coaching (75% STT / 25% Coach) */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-[#FAFAFA]">
            <span className="text-[#E09B30] flex items-center gap-1.5 font-bold">
              <CheckCircle2 size={14} />
              {t.sessionArchitecture.sttTeacherIvan}
            </span>
            <span className="text-[#A7C7E7]">
              {t.sessionArchitecture.tttTeacherIvan}
            </span>
          </div>
          <div className="w-full h-8 rounded-xl bg-slate-800 flex overflow-hidden border border-[#E09B30]/40 p-1">
            <div
              className="h-full bg-gradient-to-r from-[#E09B30] to-[#f5b85a] rounded-lg flex items-center justify-center text-[#1A3153] font-montserrat font-extrabold text-xs tracking-wider transition-all duration-700"
              style={{ width: '75%' }}
            >
              75% STT (Student Speaking)
            </div>
            <div
              className="h-full bg-[#A7C7E7]/25 rounded-lg flex items-center justify-center text-[#A7C7E7] font-montserrat font-bold text-xs"
              style={{ width: '25%' }}
            >
              25% Coach
            </div>
          </div>
        </div>

        {/* Bar 2: Traditional Class (30% STT / 70% TTT Lecture) */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#A7C7E7]">
            <span>{t.sessionArchitecture.sttTraditional}</span>
            <span>{t.sessionArchitecture.tttTraditional}</span>
          </div>
          <div className="w-full h-7 rounded-xl bg-slate-800/80 flex overflow-hidden border border-slate-700 p-0.5 opacity-75">
            <div
              className="h-full bg-slate-600 rounded-lg flex items-center justify-center text-[#FAFAFA] font-medium text-[11px]"
              style={{ width: '30%' }}
            >
              30% STT
            </div>
            <div
              className="h-full bg-slate-700/60 rounded-lg flex items-center justify-center text-slate-400 font-medium text-[11px]"
              style={{ width: '70%' }}
            >
              70% Teacher Lecture
            </div>
          </div>
        </div>
      </div>

      {/* 4-Phase Visual Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {phases.map((phase, idx) => {
          const IconComponent = phase.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl bg-[#1A3153]/70 border ${phase.color} shadow-lg flex flex-col justify-between hover:translate-y-[-2px] transition-all`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-montserrat font-extrabold text-xs px-3 py-1 rounded-full bg-[#FAFAFA]/10 border border-[#A7C7E7]/30 text-[#FAFAFA]">
                    {phase.time}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#FAFAFA]/10 flex items-center justify-center">
                    <IconComponent size={18} />
                  </div>
                </div>

                {phase.badge && (
                  <span className="inline-block text-[10px] font-montserrat font-extrabold uppercase tracking-wider text-[#E09B30] mb-2 bg-[#E09B30]/15 px-2 py-0.5 rounded-full border border-[#E09B30]/30">
                    {phase.badge}
                  </span>
                )}

                <h3 className="font-montserrat font-bold text-base text-[#FAFAFA] mb-2 leading-snug">
                  {phase.title}
                </h3>

                <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
                  {phase.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SessionArchitectureSection;
