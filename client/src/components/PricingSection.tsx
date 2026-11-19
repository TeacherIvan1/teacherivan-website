import React, { useState } from 'react';
import { Check, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useAuthStore } from '../modules/auth/authStore';
import { getWhatsAppUrl } from '../config/contact';

export const PricingSection: React.FC = () => {
  const { isEs } = useTranslation();
  const { openAuthModal } = useAuthStore();
  const [currency, setCurrency] = useState<'BOB' | 'USD'>('BOB');

  const getWhatsAppPlanLink = (tier: string, priceStr: string) => {
    const text = isEs
      ? `Hola Teacher Ivan! Me interesa inscribirme al Plan ${tier} (${priceStr}). ¿Podrías confirmarme disponibilidad?`
      : `Hi Teacher Ivan! I'm interested in enrolling in the ${tier} Plan (${priceStr}). Could you confirm availability?`;
    return getWhatsAppUrl(text);
  };

  return (
    <section
      id="chapter-3-plans"
      className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 bg-[var(--bg-canvas)] text-[var(--text-primary)] border-b border-[var(--border-hairline)] select-none transition-colors duration-200"
    >
      <div className="max-w-[1280px] mx-auto space-y-12">
        {/* Header Controls: Two-tone H2 + Currency Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[var(--border-hairline)]">
          <div>
            <div className="text-[11px] font-montserrat font-bold tracking-[0.15em] text-[#9A6515] dark:text-[#E09B30] uppercase mb-1">
              —— CH. 03 • {isEs ? 'INVERSIÓN TRANSPARENTE' : 'TRANSPARENT TUITION'}
            </div>
            <h2 className="font-montserrat font-black text-2xl sm:text-3xl md:text-4xl tracking-tight text-[var(--text-primary)]">
              {isEs ? 'Planes claros.' : 'Clear plans.'}{' '}
              <span className="text-[var(--text-secondary)] font-bold">
                {isEs ? 'Sin contratos ocultos.' : 'No hidden contracts.'}
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans mt-1">
              {isEs
                ? 'Cancelá o cambiá de plan en cualquier momento. Cupos limitados a 10 alumnos por franja horaria.'
                : 'Cancel or switch tiers anytime. Strictly capped at 10 students per time window.'}
            </p>
          </div>

          {/* BOB | USD Currency Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--bg-sunken)] border border-[var(--border-hairline)] shadow-inner shrink-0">
            <button
              onClick={() => setCurrency('BOB')}
              className={`px-4 py-1.5 rounded-full text-xs font-montserrat font-bold tracking-wider transition-all cursor-pointer ${
                currency === 'BOB'
                  ? 'bg-[#1A3153] dark:bg-[#E09B30] text-[#FAFAFA] dark:text-[#1A3153] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              BOB (Bs)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 rounded-full text-xs font-montserrat font-bold tracking-wider transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#1A3153] dark:bg-[#E09B30] text-[#FAFAFA] dark:text-[#1A3153] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* 3-Column Architectural Hairline Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* 1. Essential (Autonomous) */}
          <div
            id="plan-card-essential"
            className="slab-3d-light p-6 sm:p-8 rounded-[24px] flex flex-col justify-between space-y-6 relative bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] shadow-sm"
          >
            <div className="space-y-4">
              {/* Badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-[var(--bg-sunken)] text-[var(--text-primary)] text-[10px] font-montserrat font-extrabold uppercase tracking-[0.15em] border border-[var(--border-hairline)]">
                {isEs ? 'AUTÓNOMO 24/7' : '24/7 AUTONOMOUS'}
              </div>

              <div>
                <h3 className="font-montserrat font-bold text-2xl text-[var(--text-primary)]">
                  Essential
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
                  {isEs
                    ? 'Inmersión autónoma con IA para profesionales que avanzan a su propio ritmo.'
                    : 'Autonomous AI immersion for self-paced professionals.'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 pt-2">
                <span className="font-montserrat font-black text-3xl sm:text-4xl text-[var(--text-primary)] tabular-nums">
                  {currency === 'BOB' ? '300 BOB' : '$45 USD'}
                </span>
                <span className="text-xs text-[var(--text-secondary)] font-sans">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              {/* Features List */}
              <ul className="space-y-3 pt-4 border-t border-[var(--border-hairline)] text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>0 {isEs ? 'clases en vivo' : 'live classes'}</strong> ({isEs ? '100% autónomo' : '100% self-paced'})
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Ilimitado 24/7' : 'Unlimited 24/7'}</strong> {isEs ? 'Voice Lab (Ivan & Emma)' : 'Voice Lab (Ivan & Emma)'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Generador Ilimitado' : 'Unlimited'}</strong> {isEs ? 'de Recursos a Medida' : 'Custom Resource Generator'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    {isEs ? 'Ruta Autónoma de 5 Días + Fichas' : '5-Day Autonomous Route + Worksheets'}
                  </span>
                </li>
              </ul>
            </div>

            <a
              href={getWhatsAppPlanLink('Essential', currency === 'BOB' ? '300 BOB/mes' : '$45 USD/mo')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] bg-transparent hover:bg-[#1A3153] hover:text-[#FAFAFA] dark:hover:bg-[#E09B30] dark:hover:text-[#1A3153] border border-[var(--border-hairline)] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isEs ? 'Elegir Essential' : 'Select Essential'}</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* 2. Pro (Flagship — Elevated 3D Dark Slab) */}
          <div
            id="plan-card-pro"
            className="slab-3d-dark p-6 sm:p-8 rounded-[24px] flex flex-col justify-between space-y-6 relative text-[#FAFAFA] bg-[#132642] border-2 border-[#E09B30] lg:-translate-y-3 z-10"
            style={{
              boxShadow: 'var(--shadow-slab-3d)',
            }}
          >
            {/* Top Recommended Tag */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#E09B30] text-[#091326] text-[10px] font-montserrat font-black uppercase tracking-[0.15em] shadow-md border border-white/30 whitespace-nowrap">
              {isEs ? 'MÁS ELEGIDO • HÍBRIDO' : 'MOST POPULAR • HYBRID'}
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider text-[#A7C7E7] uppercase">
                  [FLAGSHIP // 3X EN VIVO]
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
              </div>

              <div>
                <h3 className="font-montserrat font-extrabold text-2xl text-[#FAFAFA]">
                  Programa Pro
                </h3>
                <p className="text-xs text-[#A7C7E7] mt-1 font-sans">
                  {isEs
                    ? 'La fórmula bicrónica completa: práctica con IA 24/7 + 3 horas de mentoría humana semanal.'
                    : 'The full bichronous formula: 24/7 AI practice + 3 hours of weekly human mentoring.'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 pt-2">
                <span className="font-montserrat font-black text-3xl sm:text-4xl text-[#E09B30] tabular-nums">
                  {currency === 'BOB' ? '580 BOB' : '$85 USD'}
                </span>
                <span className="text-xs text-[#A7C7E7] font-sans">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              {/* Features List */}
              <ul className="space-y-3 pt-4 border-t border-[var(--border-hairline)] text-xs sm:text-sm text-[#FAFAFA] font-sans">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>3 {isEs ? 'clases 1-a-1 / semana' : '1-on-1 classes / week'}</strong> (1h c/u, Lun–Vie)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Ilimitado 24/7' : 'Unlimited 24/7'}</strong> {isEs ? 'Voice Lab (Ivan & Emma)' : 'Voice Lab (Ivan & Emma)'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Generador Ilimitado' : 'Unlimited'}</strong> {isEs ? 'de Recursos a Medida' : 'Custom Resource Generator'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    {isEs
                      ? 'Ruta Sincronizada (Prep + 3x Vivo + Recast)'
                      : 'Synchronized Route (Prep + 3x Live + Recast)'}
                  </span>
                </li>
              </ul>
            </div>

            <a
              href={getWhatsAppPlanLink('Pro', currency === 'BOB' ? '580 BOB/mes' : '$85 USD/mo')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-amber w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-full font-montserrat font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg min-h-[50px]"
            >
              <span>{isEs ? 'Empezar Plan Pro →' : 'Start Pro Plan →'}</span>
            </a>
          </div>

          {/* 3. Executive (Maximum Immersion) */}
          <div
            id="plan-card-executive"
            className="slab-3d-light p-6 sm:p-8 rounded-[24px] flex flex-col justify-between space-y-6 relative bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] shadow-sm"
          >
            {/* Top Accent bar */}
            <div className="absolute top-0 inset-x-8 h-1 bg-[#1A3153] dark:bg-[#E09B30] rounded-t-full" />

            <div className="space-y-4">
              {/* Badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-[#1A3153] dark:bg-[#1E3A5F] text-[#FAFAFA] text-[10px] font-montserrat font-extrabold uppercase tracking-[0.15em]">
                {isEs ? 'INMERSIÓN TOTAL VIP' : 'VIP MAXIMUM IMMERSION'}
              </div>

              <div>
                <h3 className="font-montserrat font-bold text-2xl text-[var(--text-primary)]">
                  Executive VIP
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
                  {isEs
                    ? 'Inmersión diaria de lunes a viernes para entrevistas internacionales o roles remotos clave.'
                    : 'Daily Mon–Fri immersion for international interviews and remote executive roles.'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 pt-2">
                <span className="font-montserrat font-black text-3xl sm:text-4xl text-[var(--text-primary)] tabular-nums">
                  {currency === 'BOB' ? '850 BOB' : '$125 USD'}
                </span>
                <span className="text-xs text-[var(--text-secondary)] font-sans">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              {/* Features List */}
              <ul className="space-y-3 pt-4 border-t border-[var(--border-hairline)] text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>5 {isEs ? 'clases 1-a-1 / semana' : '1-on-1 classes / week'}</strong> ({isEs ? 'Diario Lun–Vie 1h' : 'Daily Mon–Fri 1h'})
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Ilimitado 24/7' : 'Unlimited 24/7'}</strong> {isEs ? 'Voice Lab (Ivan & Emma)' : 'Voice Lab (Ivan & Emma)'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Prioridad Ejecutiva' : 'Executive Priority'}</strong> + {isEs ? 'Revisión de CV / PPT' : 'CV / Pitch Deck Reviews'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    {isEs ? 'Ruta Ejecutiva Diaria (5x Vivo + Entrevistas)' : 'Daily Executive Route (5x Live + Mock Interviews)'}
                  </span>
                </li>
              </ul>
            </div>

            <a
              href={getWhatsAppPlanLink('Executive VIP', currency === 'BOB' ? '850 BOB/mes' : '$125 USD/mo')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider text-[#FAFAFA] bg-[#1A3153] dark:bg-[#E09B30] dark:text-[#1A3153] hover:bg-[#091326] dark:hover:bg-[#c88624] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isEs ? 'Aplicar a Executive' : 'Apply to Executive'}</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Quota & Trust Note */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-[var(--text-secondary)] shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#10B981] shrink-0" />
            <span>
              {isEs
                ? 'Los cupos de clases en vivo se reservan de Lunes a Viernes (14:00–20:00 BOT). Cupos limitados para garantizar >75% STT.'
                : 'Live session slots are reserved Monday through Friday (14:00–20:00 BOT). Limited seats to guarantee >75% STT.'}
            </span>
          </div>
          <button
            onClick={() => openAuthModal('signup')}
            className="text-[#9A6515] dark:text-[#E09B30] font-bold hover:underline whitespace-nowrap cursor-pointer"
          >
            {isEs ? 'Crear Cuenta Gratis →' : 'Create Free Account →'}
          </button>
        </div>
      </div>
    </section>
  );
};
