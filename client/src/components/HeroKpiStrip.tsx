import React from 'react';
import { MessageSquare, CalendarClock, UserCheck, Award } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';

export const HeroKpiStrip: React.FC = () => {
  const { t } = useTranslation();

  const kpis = [
    {
      id: 'kpi-stt',
      metric: t.kpiStrip.sttMetric,
      label: t.kpiStrip.sttLabel,
      desc: t.kpiStrip.sttDesc,
      icon: MessageSquare,
      accent: 'border-[#E09B30]/40',
      metricColor: 'text-[#E09B30]',
    },
    {
      id: 'kpi-async',
      metric: t.kpiStrip.asyncMetric,
      label: t.kpiStrip.asyncLabel,
      desc: t.kpiStrip.asyncDesc,
      icon: CalendarClock,
      accent: 'border-[#A7C7E7]/40',
      metricColor: 'text-[#A7C7E7]',
    },
    {
      id: 'kpi-coach',
      metric: t.kpiStrip.coachMetric,
      label: t.kpiStrip.coachLabel,
      desc: t.kpiStrip.coachDesc,
      icon: UserCheck,
      accent: 'border-[#A7C7E7]/40',
      metricColor: 'text-[#FAFAFA]',
    },
    {
      id: 'kpi-plan',
      metric: t.kpiStrip.planMetric,
      subMetric: t.kpiStrip.planMetricUsd,
      label: t.kpiStrip.planLabel,
      desc: t.kpiStrip.planDesc,
      icon: Award,
      accent: 'border-[#E09B30]/60 bg-[#E09B30]/10',
      metricColor: 'text-[#E09B30]',
    },
  ];

  return (
    <section
      id="hero-kpi-strip"
      className="max-w-7xl mx-auto px-4 sm:px-6 w-full -mt-6 sm:-mt-8 mb-12 relative z-10"
      aria-label="Core Performance Metrics"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <div
              key={kpi.id}
              className={`p-5 rounded-2xl bg-[#1A3153]/90 backdrop-blur-md border ${kpi.accent} shadow-xl hover:translate-y-[-2px] transition-all duration-200 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className={`font-montserrat font-extrabold text-2xl sm:text-3xl tracking-tight ${kpi.metricColor}`}>
                  {kpi.metric}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#FAFAFA]/10 flex items-center justify-center text-[#E09B30] flex-shrink-0">
                  <IconComponent size={20} />
                </div>
              </div>

              {kpi.subMetric && (
                <div className="text-[11px] font-semibold text-[#A7C7E7] -mt-2 mb-2">
                  {kpi.subMetric}
                </div>
              )}

              <div>
                <h3 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#FAFAFA] mb-1">
                  {kpi.label}
                </h3>
                <p className="font-inter text-xs text-[#A7C7E7] leading-relaxed">
                  {kpi.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HeroKpiStrip;
