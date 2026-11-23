import React, { useState } from 'react';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useAuthStore } from '../modules/auth/authStore';
import { getPlanWhatsAppUrl, handleWhatsAppClick, PlanTierId } from '../utils/whatsapp';
import { trackEvent } from '../utils/analytics';

export const PricingSection: React.FC = () => {
  const { isEs } = useTranslation();
  const { openAuthModal } = useAuthStore();
  const [currency, setCurrency] = useState<'BOB' | 'USD'>('BOB');

  const lang = isEs ? 'es' : 'en';

  const onSelectPlanClick = (plan: PlanTierId, priceBob: 300 | 580 | 850) => {
    trackEvent('select_plan', { plan, price_bob: priceBob });
    handleWhatsAppClick('pricing', plan);
  };

  return (
    <section
      id="chapter-3-plans"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-12 select-none"
      style={{
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="max-w-[1280px] mx-auto space-y-10">
        {/* Header Controls: Frosted Glass Header Strip + BOB | USD Currency Toggle */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-[28px] text-[#FAFAFA]"
          style={{
            background: 'rgba(19, 38, 66, 0.84)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(167, 199, 231, 0.25)',
          }}
        >
          <div className="text-center md:text-left">
            <div className="text-[11px] font-montserrat font-bold tracking-[0.15em] text-[#E09B30] uppercase mb-1.5">
              —— {isEs ? 'INVERSIÓN TRANSPARENTE' : 'TRANSPARENT TUITION'}
            </div>
            <h2 className="font-montserrat font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-[#FAFAFA]">
              {isEs ? 'Planes claros.' : 'Clear plans.'}{' '}
              <span className="text-[#A7C7E7] font-semibold">
                {isEs ? 'Sin contratos ocultos.' : 'No hidden contracts.'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#A7C7E7] font-inter mt-1.5">
              {isEs
                ? 'Cancelá o cambiá de plan en cualquier momento. Cupos limitados a 10 alumnos por franja horaria (Lun–Vie 14:00–20:00 BOT).'
                : 'Cancel or switch tiers anytime. Strictly capped at 10 students per time window (Mon–Fri 14:00–20:00 BOT).'}
            </p>
          </div>

          {/* BOB | USD Currency Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#091326]/80 border border-[#A7C7E7]/30 shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => setCurrency('BOB')}
              className={`px-4 py-1.5 rounded-full text-xs font-montserrat font-bold tracking-wider transition-all cursor-pointer ${
                currency === 'BOB'
                  ? 'bg-[#E09B30] text-[#091326] shadow-sm'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              BOB (Bs)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 rounded-full text-xs font-montserrat font-bold tracking-wider transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#E09B30] text-[#091326] shadow-sm'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* 3-Column Architectural Pricing Matrix (Essential 300 | Pro 580 | Executive 850 BOB) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* 1. Essential (300 BOB/mes | $45 USD) — Solid #FAFAFA elevated card */}
          <div
            id="plan-card-essential"
            className="p-6 sm:p-8 rounded-[24px] flex flex-col justify-between space-y-6 relative bg-[#FAFAFA] border border-[#A7C7E7] text-[#1A3153] shadow-xl"
          >
            <div className="space-y-4">
              {/* Badge (#9A6515 WCAG AA on #FAFAFA) */}
              <div className="inline-block px-3 py-1 rounded-full bg-[#EEF3F8] text-[#9A6515] text-[11px] font-montserrat font-bold uppercase tracking-[0.15em] border border-[#1A3153]/15">
                {isEs ? '100% AUTÓNOMO • 24/7' : '100% AUTONOMOUS • 24/7'}
              </div>

              <div>
                <h3 className="font-montserrat font-bold text-2xl text-[#1A3153]">
                  Essential
                </h3>
                <p className="text-xs sm:text-sm text-[#4A5568] mt-1 font-inter leading-relaxed">
                  {isEs
                    ? 'Inmersión autónoma 24/7 para profesionales que avanzan a su propio ritmo.'
                    : 'Autonomous 24/7 voice immersion for self-paced professionals.'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="font-montserrat font-extrabold text-3xl sm:text-4xl text-[#1A3153] tabular-nums">
                  {currency === 'BOB' ? '300 BOB' : '$45 USD'}
                </span>
                <span className="text-xs text-[#4A5568] font-inter">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 pt-4 border-t border-[#1A3153]/12 text-xs sm:text-sm text-[#4A5568] font-inter">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1A3153]">0 {isEs ? 'clases en vivo' : 'live classes'}</strong> ({isEs ? '100% autónomo' : '100% self-paced'})
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1A3153]">{isEs ? 'Voice Lab 24/7 Ilimitado' : 'Unlimited 24/7 Voice Lab'}</strong> (Ivan &amp; Emma)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1A3153]">{isEs ? 'Generador Ilimitado' : 'Unlimited Generator'}</strong> {isEs ? 'de Recursos a Medida' : 'of Custom Resources'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] shrink-0 mt-0.5" />
                  <span>
                    {isEs ? 'Ruta Autónoma de 5 Días (Mi Ruta)' : '5-Day Autonomous Sprint (My Path)'}
                  </span>
                </li>
              </ul>
            </div>

            <a
              id="plan-cta-essential"
              href={getPlanWhatsAppUrl('essential', lang, currency)}
              onClick={() => onSelectPlanClick('essential', 300)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider text-[#1A3153] bg-transparent hover:bg-[#1A3153] hover:text-[#FAFAFA] border border-[#1A3153]/30 transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isEs ? 'Elegir Essential' : 'Select Essential'}</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* 2. Pro (580 BOB/mes | $85 USD — Flagship): Deep Navy #1A3153 elevated glass card with 2px solid #E09B30 glow */}
          <div
            id="plan-card-pro"
            className="p-6 sm:p-8 rounded-[24px] flex flex-col justify-between space-y-6 relative text-[#FAFAFA] bg-[#1A3153] border-2 border-[#E09B30] shadow-xl lg:-translate-y-2 z-10"
            style={{
              boxShadow: '0 24px 48px rgba(9, 19, 38, 0.55), 0 0 40px rgba(224, 155, 48, 0.25)',
            }}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center justify-between w-full">
                <span className="px-3.5 py-1 rounded-full bg-[#E09B30] text-[#091326] text-[11px] font-montserrat font-extrabold uppercase tracking-[0.15em]">
                  {isEs ? 'MÁS ELEGIDO • HÍBRIDO' : 'MOST POPULAR • HYBRID'}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
              </div>

              <div>
                <h3 className="font-montserrat font-bold text-2xl text-[#FAFAFA]">
                  Programa Pro
                </h3>
                <p className="text-xs sm:text-sm text-[#A7C7E7] mt-1 font-inter leading-relaxed">
                  {isEs
                    ? 'Todo lo de Essential + 3 horas semanales de coaching 1-a-1 en vivo con Teacher Ivan.'
                    : 'Everything in Essential + 3 weekly hours of live 1-on-1 coaching with Teacher Ivan.'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="font-montserrat font-extrabold text-3xl sm:text-4xl text-[#E09B30] tabular-nums">
                  {currency === 'BOB' ? '580 BOB' : '$85 USD'}
                </span>
                <span className="text-xs text-[#A7C7E7] font-inter">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 pt-4 border-t border-[#A7C7E7]/22 text-xs sm:text-sm text-[#FAFAFA] font-inter">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>3 {isEs ? 'clases 1-a-1 / semana' : '1-on-1 classes / week'}</strong> (1h c/u, Lun–Vie 14:00–20:00 BOT)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Todo lo incluido en Essential' : 'Everything in Essential'}</strong> (Voice Lab 24/7 + Mi Ruta)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Generador Ilimitado' : 'Unlimited Generator'}</strong> {isEs ? 'de Recursos Personalizados' : 'of Custom Resources'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    {isEs
                      ? 'Recasting Nativo en Vivo (>75% habla activa)'
                      : 'Live Native Recasting (>75% active speaking)'}
                  </span>
                </li>
              </ul>
            </div>

            <a
              id="plan-cta-pro"
              href={getPlanWhatsAppUrl('pro', lang, currency)}
              onClick={() => onSelectPlanClick('pro', 580)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full font-montserrat font-extrabold text-xs uppercase tracking-wider bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] transition-all cursor-pointer shadow-lg min-h-[50px]"
            >
              <span>{isEs ? 'Empezar Plan Pro →' : 'Start Pro Plan →'}</span>
            </a>
          </div>

          {/* 3. Executive (850 BOB/mes | $125 USD): Solid #FAFAFA elevated card with #1A3153 top hairline */}
          <div
            id="plan-card-executive"
            className="p-6 sm:p-8 rounded-[24px] flex flex-col justify-between space-y-6 relative bg-[#FAFAFA] border border-[#A7C7E7] text-[#1A3153] shadow-xl overflow-hidden"
          >
            {/* #1A3153 Top Architectural Hairline Accent */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#1A3153]" />

            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-[#1A3153] text-[#FAFAFA] text-[11px] font-montserrat font-bold uppercase tracking-[0.15em]">
                {isEs ? 'INMERSIÓN TOTAL VIP' : 'VIP MAXIMUM IMMERSION'}
              </div>

              <div>
                <h3 className="font-montserrat font-bold text-2xl text-[#1A3153]">
                  Executive VIP
                </h3>
                <p className="text-xs sm:text-sm text-[#4A5568] mt-1 font-inter leading-relaxed">
                  {isEs
                    ? 'Inmersión diaria de lunes a viernes para entrevistas internacionales y liderazgo global.'
                    : 'Daily Mon–Fri immersion for international interviews and global executive roles.'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="font-montserrat font-extrabold text-3xl sm:text-4xl text-[#1A3153] tabular-nums">
                  {currency === 'BOB' ? '850 BOB' : '$125 USD'}
                </span>
                <span className="text-xs text-[#4A5568] font-inter">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 pt-4 border-t border-[#1A3153]/12 text-xs sm:text-sm text-[#4A5568] font-inter">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1A3153]">5 {isEs ? 'clases 1-a-1 / semana' : '1-on-1 classes / week'}</strong> ({isEs ? 'Diario Lun–Vie 14:00–20:00 BOT' : 'Daily Mon–Fri 14:00–20:00 BOT'})
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1A3153]">{isEs ? 'Todo lo incluido en Essential' : 'Everything in Essential'}</strong> (Voice Lab 24/7 + Mi Ruta)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1A3153]">{isEs ? 'Prioridad Ejecutiva' : 'Executive Priority'}</strong> + {isEs ? 'Revisión de CV / Pitch' : 'CV / Pitch Deck Reviews'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] shrink-0 mt-0.5" />
                  <span>
                    {isEs ? 'Simulacros Diarios de Entrevista y IELTS' : 'Daily Mock Interviews & IELTS Rehearsals'}
                  </span>
                </li>
              </ul>
            </div>

            <a
              id="plan-cta-executive"
              href={getPlanWhatsAppUrl('executive', lang, currency)}
              onClick={() => onSelectPlanClick('executive', 850)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider text-[#FAFAFA] bg-[#1A3153] hover:bg-[#091326] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isEs ? 'Aplicar a Executive' : 'Apply to Executive'}</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Bottom Trust Strip */}
        <div
          className="p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs font-inter text-[#A7C7E7]"
          style={{
            background: 'rgba(19, 38, 66, 0.84)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(167, 199, 231, 0.25)',
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#10B981] shrink-0" />
            <span>
              {isEs
                ? 'Reservas de clases en vivo de Lunes a Viernes (14:00–20:00 BOT). Garantía de más del 75% de habla activa por sesión.'
                : 'Live class bookings Monday through Friday (14:00–20:00 BOT). Guaranteed >75% active student speaking time per session.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className="text-[#E09B30] font-montserrat font-bold hover:underline whitespace-nowrap cursor-pointer"
          >
            {isEs ? 'Crear Cuenta Gratis →' : 'Create Free Account →'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
