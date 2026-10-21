import React, { useState } from 'react';
import { Headphones, PenTool, Mic, Mail, Volume2, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { ChibiSceneShowcase } from './ChibiSceneShowcase';

export const AsyncSprintSection: React.FC = () => {
  const { t } = useTranslation();
  const [activeDay, setActiveDay] = useState(2); // default Day 3 (oral production)

  const days = [
    {
      id: 0,
      label: 'D1',
      title: t.asyncSprint.day1Title,
      time: t.asyncSprint.day1Time,
      desc: t.asyncSprint.day1Desc,
      icon: Headphones,
      highlight: t.asyncSprint.day1Highlight,
    },
    {
      id: 1,
      label: 'D2',
      title: t.asyncSprint.day2Title,
      time: t.asyncSprint.day2Time,
      desc: t.asyncSprint.day2Desc,
      icon: PenTool,
      highlight: t.asyncSprint.day2Highlight,
    },
    {
      id: 2,
      label: 'D3',
      title: t.asyncSprint.day3Title,
      time: t.asyncSprint.day3Time,
      desc: t.asyncSprint.day3Desc,
      icon: Mic,
      highlight: t.asyncSprint.day3Highlight,
    },
    {
      id: 3,
      label: 'D4',
      title: t.asyncSprint.day4Title,
      time: t.asyncSprint.day4Time,
      desc: t.asyncSprint.day4Desc,
      icon: Mail,
      highlight: t.asyncSprint.day4Highlight,
    },
    {
      id: 4,
      label: 'D5',
      title: t.asyncSprint.day5Title,
      time: t.asyncSprint.day5Time,
      desc: t.asyncSprint.day5Desc,
      icon: Volume2,
      highlight: t.asyncSprint.day5Highlight,
    },
  ];

  return (
    <section
      id="async-sprint-section"
      className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full"
      aria-label="5-Day Asynchronous Sprint"
    >
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>{t.asyncSprint.badge}</span>
        </div>
        <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
          {t.asyncSprint.title}
        </h2>
        <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed">
          {t.asyncSprint.subtitle}
        </p>
      </div>

      {/* Visual Showcase: Chibi Classroom & Asynchronous Habit Description */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
        <div className="lg:col-span-5 w-full">
          <ChibiSceneShowcase
            imageSrc="/assets/chibi-classroom.png"
            altText="Teacher Ivan Interactive Classroom and Async Habit Sprint"
            badge1Text={t.asyncSprint.showcaseBadge1}
            badge1Icon="audio"
            badge2Text={t.asyncSprint.showcaseBadge2}
            badge2Icon="star"
            caption={t.asyncSprint.showcaseCaption}
          />
        </div>
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          <div className="p-6 rounded-3xl bg-[#1A3153]/80 border border-[#A7C7E7]/30 shadow-xl space-y-3">
            <h3 className="font-montserrat font-bold text-lg text-[#FAFAFA] flex items-center gap-2">
              <Sparkles size={18} className="text-[#E09B30]" />
              <span>{t.asyncSprint.microLearningTitle}</span>
            </h3>
            <p className="font-inter text-sm text-[#A7C7E7] leading-relaxed">
              {t.asyncSprint.microLearningDesc}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] text-xs font-semibold">
                {t.asyncSprint.badgeDailyRecasts}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-semibold">
                {t.asyncSprint.badgeNeuroplastic}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#A7C7E7]/15 border border-[#A7C7E7]/30 text-[#A7C7E7] text-xs font-semibold">
                {t.asyncSprint.badgeZeroCommute}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Interactive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {days.map((day) => {
          const IconComponent = day.icon;
          const isActive = activeDay === day.id;

          return (
            <div
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className={`cursor-pointer p-5 rounded-3xl transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-b from-[#1A3153] to-[#12223a] border-2 border-[#E09B30] shadow-xl scale-[1.02]'
                  : 'bg-[#1A3153]/60 border border-[#A7C7E7]/25 hover:border-[#A7C7E7]/50 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`font-montserrat font-extrabold text-xs px-2.5 py-1 rounded-full ${
                      isActive
                        ? 'bg-[#E09B30] text-[#1A3153]'
                        : 'bg-[#FAFAFA]/10 text-[#A7C7E7]'
                    }`}
                  >
                    {day.label}
                  </span>

                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#A7C7E7]">
                    <Clock size={11} />
                    <span>{day.time}</span>
                  </span>
                </div>

                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${
                    isActive
                      ? 'bg-[#E09B30]/20 text-[#E09B30] border border-[#E09B30]/40'
                      : 'bg-[#FAFAFA]/10 text-[#A7C7E7]'
                  }`}
                >
                  <IconComponent size={20} />
                </div>

                <h3 className="font-montserrat font-bold text-sm text-[#FAFAFA] mb-2 leading-snug">
                  {day.title}
                </h3>

                <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed mb-3">
                  {day.desc}
                </p>
              </div>

              <div
                className={`pt-3 border-t text-[11px] font-semibold flex items-center gap-1.5 ${
                  isActive
                    ? 'border-[#E09B30]/30 text-[#E09B30]'
                    : 'border-[#A7C7E7]/15 text-[#A7C7E7]'
                }`}
              >
                <CheckCircle size={12} className="flex-shrink-0" />
                <span>{day.highlight}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AsyncSprintSection;
