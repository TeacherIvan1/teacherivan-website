import React from 'react';
import { Sparkles, Calendar, CheckCircle2, ArrowRight, X, Headphones, BookOpen, MessageSquare, Award } from 'lucide-react';
import { useAuthStore } from '../modules/auth/authStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { StudentPlan } from '../modules/auth/types';

export const PlanApprovedModal: React.FC = () => {
  const { user, pendingPlanModal, ackPlanNotification, dismissPlanModal } = useAuthStore();
  const { setActiveView } = useNavigationStore();
  const { isEs } = useTranslation();

  if (!pendingPlanModal || !user) return null;

  const plan: StudentPlan = pendingPlanModal.plan || user.plan || 'free';
  const studentName = user.fullName || user.username || (isEs ? 'Estudiante' : 'Student');

  const planTitles: Record<StudentPlan, { en: string; es: string }> = {
    free: { en: 'Free Plan', es: 'Plan Gratuito' },
    essential: { en: 'Essential Plan', es: 'Plan Essential' },
    pro: { en: 'Pro Plan', es: 'Plan Pro' },
    executive: { en: 'Executive Partner Plan', es: 'Plan Executive Partner' },
  };

  const currentPlanName = isEs ? planTitles[plan].es : planTitles[plan].en;

  const handleScheduleClick = async () => {
    await ackPlanNotification();
    setActiveView('schedule');
  };

  const handleStartPracticingClick = async () => {
    await ackPlanNotification();
  };

  const handleClose = async () => {
    await ackPlanNotification();
  };

  // Benefits by plan
  const getPerks = () => {
    if (plan === 'executive') {
      return [
        {
          icon: <Calendar className="text-[#E09B30] shrink-0" size={18} />,
          en: '3 Live 1-on-1 Classes/Week (Mon–Fri 14:00–20:00)',
          es: '3 Clases en Vivo 1-a-1 por Semana (Lun–Vie 14:00–20:00)',
        },
        {
          icon: <Headphones className="text-[#E09B30] shrink-0" size={18} />,
          en: 'Unlimited 24/7 AI Voice Simulator Sessions',
          es: 'Sesiones Ilimitadas 24/7 en el Simulador de Voz con IA',
        },
        {
          icon: <Award className="text-[#E09B30] shrink-0" size={18} />,
          en: 'Executive Presentation, Negotiation & Email Coaching',
          es: 'Coaching Ejecutivo en Presentaciones, Negociación y Redacción',
        },
      ];
    }

    if (plan === 'pro') {
      return [
        {
          icon: <Calendar className="text-[#E09B30] shrink-0" size={18} />,
          en: '2 Live 1-on-1 Classes/Week (Mon–Fri 14:00–20:00)',
          es: '2 Clases en Vivo 1-a-1 por Semana (Lun–Vie 14:00–20:00)',
        },
        {
          icon: <Headphones className="text-[#E09B30] shrink-0" size={18} />,
          en: 'Unlimited 24/7 AI Voice Simulator Sessions',
          es: 'Sesiones Ilimitadas 24/7 en el Simulador de Voz con IA',
        },
        {
          icon: <MessageSquare className="text-[#E09B30] shrink-0" size={18} />,
          en: 'Daily Micro-Learning & WhatsApp Audio Feedback',
          es: 'Micro-Aprendizaje Diario y Feedback de Audio por WhatsApp',
        },
      ];
    }

    // Default to essential perks
    return [
      {
        icon: <Calendar className="text-[#E09B30] shrink-0" size={18} />,
        en: '1 Live 1-on-1 Class/Week (Mon–Fri 14:00–20:00)',
        es: '1 Clase en Vivo 1-a-1 por Semana (Lun–Vie 14:00–20:00)',
      },
      {
        icon: <Headphones className="text-[#E09B30] shrink-0" size={18} />,
        en: '10 AI Voice Simulator Sessions/Day',
        es: '10 Sesiones Diarias en el Simulador de Voz con IA',
      },
      {
        icon: <BookOpen className="text-[#E09B30] shrink-0" size={18} />,
        en: 'Personalized Micro-Learning Route (D1–D5)',
        es: 'Ruta Personalizada de Micro-Aprendizaje (D1–D5)',
      },
    ];
  };

  const perks = getPerks();

  return (
    <div
      role="dialog"
      aria-modal="true"
      id="plan-approved-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1526]/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="plan-approved-modal-card"
        className="relative w-full max-w-lg bg-[#1A3153] border border-[#A7C7E7]/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-5 overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 25px 50px -12px rgba(224, 155, 48, 0.25)',
        }}
      >
        {/* Close Icon Button */}
        <button
          id="close-plan-modal-btn"
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/10 rounded-full transition-colors cursor-pointer"
          title={isEs ? 'Cerrar' : 'Close'}
        >
          <X size={20} />
        </button>

        {/* Ambient Warm Amber Glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-44 rounded-full pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle, #E09B30 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        {/* Visual Header: Chibi Teacher Ivan Mascot + Amber Badge */}
        <div className="relative flex flex-col items-center">
          <div className="w-32 h-32 sm:w-36 sm:h-36 relative flex items-center justify-center rounded-2xl p-1">
            <img
              src="/assets/characters/teacher-ivan-rig.svg"
              alt="Teacher Ivan Mascot"
              className="w-full h-full object-contain drop-shadow-lg"
              onError={(e) => {
                // Fallback to /assets/teacher-ivan-rig.svg if characters directory path differs
                (e.target as HTMLImageElement).src = '/assets/teacher-ivan-rig.svg';
              }}
            />
          </div>

          <div
            id="plan-activated-badge"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E09B30] text-[#1A3153] font-montserrat font-black text-xs uppercase tracking-wider shadow-md mt-1"
          >
            <Sparkles size={13} className="text-[#1A3153]" />
            <span>{isEs ? 'PLAN HABILITADO' : 'PLAN ACTIVATED'}</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <h2 className="font-montserrat font-bold text-xl sm:text-2xl text-[#FAFAFA] leading-tight">
            {isEs
              ? `¡Felicidades, ${studentName}! Tu ${currentPlanName} ha sido Habilitado`
              : `Congratulations, ${studentName}! Your ${currentPlanName} is Now Active`}
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#A7C7E7]">
            {isEs
              ? 'Teacher Ivan ha aprobado tu plan. Ya tienes acceso inmediato a todas tus herramientas pedagógicas y clases en vivo.'
              : 'Teacher Ivan has approved your plan. You now have immediate access to all your pedagogical tools and live sessions.'}
          </p>
        </div>

        {/* Unlocked Benefits Summary Card */}
        <div className="w-full bg-[#12223a] border border-[#A7C7E7]/25 rounded-2xl p-4 text-left flex flex-col gap-3">
          <span className="font-montserrat font-bold text-[11px] uppercase tracking-wider text-[#E09B30] flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>{isEs ? 'BENEFICIOS ACTIVADOS' : 'UNLOCKED BENEFITS'}</span>
          </span>

          <ul className="flex flex-col gap-2.5">
            {perks.map((perk, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#FAFAFA] font-inter">
                <span className="mt-0.5">{perk.icon}</span>
                <span className="leading-snug">{isEs ? perk.es : perk.en}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Primary CTA Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 pt-1">
          {/* Button 1: Schedule Live Class Now */}
          <button
            id="modal-schedule-class-btn"
            type="button"
            onClick={handleScheduleClick}
            className="flex-1 py-3 px-4 rounded-xl bg-[#E09B30] hover:bg-[#c88624] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-[#E09B30]/30 cursor-pointer"
          >
            <Calendar size={15} />
            <span>{isEs ? 'Agendar Mi Clase 1-a-1 Ahora' : 'Schedule My Live Class Now'}</span>
            <ArrowRight size={14} />
          </button>

          {/* Button 2: Start Practicing */}
          <button
            id="modal-start-practicing-btn"
            type="button"
            onClick={handleStartPracticingClick}
            className="py-3 px-4 rounded-xl bg-transparent hover:bg-[#FAFAFA]/5 text-[#A7C7E7] hover:text-[#FAFAFA] border border-[#A7C7E7]/40 font-montserrat font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            <span>{isEs ? 'Comenzar a Practicar' : 'Start Practicing'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
