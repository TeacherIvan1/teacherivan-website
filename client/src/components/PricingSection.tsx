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
  const [selectedTier, setSelectedTier] = useState<PlanTierId>('pro');

  const lang = isEs ? 'es' : 'en';

  const onSelectPlanClick = (plan: PlanTierId, priceBob: 300 | 580 | 850) => {
    trackEvent('select_plan', { plan, price_bob: priceBob });
    handleWhatsAppClick('pricing', plan);
  };

  return (
    <section
      id="chapter-3-plans"
      className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg-canvas)] text-[var(--text-primary)] border-b border-[var(--border-hairline)] select-none transition-colors duration-200"
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
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-inter mt-1">
              {isEs
                ? 'Cancelá o cambiá de plan en cualquier momento. Cupos limitados a 10 alumnos por franja horaria.'
                : 'Cancel or switch tiers anytime. Strictly capped at 10 students per time window.'}
            </p>
          </div>

          {/* BOB | USD Currency Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--bg-sunken)] border border-[var(--border-hairline)] shadow-inner shrink-0">
            <button
              type="button"
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
              type="button"
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

        {/* Mobile Tier Quick-Jump Segmented Control (< 1024px) */}
        <div className="lg:hidden flex p-1 rounded-xl bg-[var(--bg-sunken)] border border-[var(--border-hairline)] gap-1 mb-6">
          <button
            type="button"
            onClick={() => setSelectedTier('essential')}
            className={`flex-1 py-2.5 px-1 rounded-lg text-xs font-montserrat font-bold transition-all text-center cursor-pointer min-h-[44px] ${
              selectedTier === 'essential'
                ? 'bg-[#1A3153] dark:bg-[#E09B30] text-[#FAFAFA] dark:text-[#1A3153] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {currency === 'BOB' ? 'Essential 300' : 'Essential $45'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier('pro')}
            className={`flex-1 py-2.5 px-1 rounded-lg text-xs font-montserrat font-bold transition-all text-center cursor-pointer min-h-[44px] ${
              selectedTier === 'pro'
                ? 'bg-[#E09B30] text-[#1A3153] shadow-md font-extrabold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {currency === 'BOB' ? 'Pro 580' : 'Pro $85'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier('executive')}
            className={`flex-1 py-2.5 px-1 rounded-lg text-xs font-montserrat font-bold transition-all text-center cursor-pointer min-h-[44px] ${
              selectedTier === 'executive'
                ? 'bg-[#1A3153] dark:bg-[#E09B30] text-[#FAFAFA] dark:text-[#1A3153] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {currency === 'BOB' ? 'Executive 850' : 'Executive $125'}
          </button>
        </div>

        {/* 3-Column Architectural Hairline Matrix (Strict 3-Level Visual Hierarchy & 2-Font Limit) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* 1. Essential (Autonomous — 300 BOB) */}
          <div
            id="plan-card-essential"
            className={`slab-3d-light p-6 sm:p-8 rounded-[24px] flex-col justify-between space-y-6 relative bg-[var(--bg-surface)] dark:bg-[#132642] border border-[var(--border-hairline)] text-[#1A3153] dark:text-[#FAFAFA] shadow-sm ${
              selectedTier === 'essential' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="space-y-4">
              {/* Badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-[var(--bg-sunken)] dark:bg-[#1A3153] text-[#1A3153] dark:text-[#FAFAFA] text-[11px] font-montserrat font-bold uppercase tracking-[0.15em] border border-[var(--border-hairline)]">
                {isEs ? 'AUTÓNOMO 24/7' : '24/7 AUTONOMOUS'}
              </div>

              {/* Level 1: Montserrat Bold Title */}
              <div>
                <h3 className="font-montserrat font-bold text-2xl text-[#1A3153] dark:text-[#FAFAFA]">
                  Essential
                </h3>
                {/* Level 2: Scannable Inter Subtitle */}
                <p className="text-xs sm:text-sm text-[#4A5568] dark:text-[#A7C7E7] mt-1 font-inter leading-relaxed">
                  {isEs
                    ? 'Inmersión autónoma 24/7 para profesionales que avanzan a su propio ritmo.'
                    : 'Autonomous 24/7 voice immersion for self-paced professionals.'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="font-montserrat font-black text-3xl sm:text-4xl text-[#1A3153] dark:text-[#FAFAFA] tabular-nums">
                  {currency === 'BOB' ? '300 BOB' : '$45 USD'}
                </span>
                <span className="text-xs text-[#4A5568] dark:text-[#A7C7E7] font-inter">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              {/* Level 2: Max 3–4 Concise Bullet Points */}
              <ul className="space-y-3 pt-4 border-t border-[var(--border-hairline)] text-xs sm:text-sm text-[#4A5568] dark:text-[#A7C7E7] font-inter">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] dark:text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>0 {isEs ? 'clases en vivo' : 'live classes'}</strong> ({isEs ? '100% autónomo' : '100% self-paced'})
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] dark:text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Voice Lab 24/7 Ilimitado' : 'Unlimited 24/7 Voice Lab'}</strong> (Ivan &amp; Emma)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] dark:text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Generador Ilimitado' : 'Unlimited Generator'}</strong> {isEs ? 'de Recursos y Fichas' : 'of Custom Resources'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] dark:text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    {isEs ? 'Ruta Autónoma de 5 Días (Mi Ruta)' : '5-Day Autonomous Sprint (My Path)'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Level 3: Secondary #1A3153 Outline CTA */}
            <a
              id="plan-cta-essential"
              href={getPlanWhatsAppUrl('essential', lang, currency)}
              onClick={() => onSelectPlanClick('essential', 300)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider text-[#1A3153] dark:text-[#FAFAFA] bg-transparent hover:bg-[#1A3153] hover:text-[#FAFAFA] dark:hover:bg-[#E09B30] dark:hover:text-[#091326] border border-[#1A3153]/30 dark:border-[#A7C7E7]/40 transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isEs ? 'Elegir Essential' : 'Select Essential'}</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* 2. Pro (Flagship — Elevated 3D Dark Slab — 580 BOB) */}
          <div
            id="plan-card-pro"
            className={`slab-3d-dark p-6 sm:p-8 rounded-[24px] flex-col justify-between space-y-6 relative text-[#FAFAFA] bg-[#132642] border-2 border-[#E09B30] lg:-translate-y-3 z-10 ${
              selectedTier === 'pro' ? 'flex' : 'hidden lg:flex'
            }`}
            style={{
              boxShadow: 'var(--shadow-slab-3d)',
            }}
          >
            {/* Top Recommended Badge */}
            <div className="inline-flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-[#E09B30] text-[#091326] text-[11px] font-montserrat font-extrabold uppercase tracking-[0.15em]">
                {isEs ? 'MÁS ELEGIDO • HÍBRIDO' : 'MOST POPULAR • HYBRID'}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
            </div>

            <div className="space-y-4">
              {/* Level 1: Montserrat Bold Title */}
              <div>
                <h3 className="font-montserrat font-bold text-2xl text-[#FAFAFA]">
                  Programa Pro
                </h3>
                {/* Level 2: Scannable Inter Subtitle */}
                <p className="text-xs sm:text-sm text-[#A7C7E7] mt-1 font-inter leading-relaxed">
                  {isEs
                    ? 'La fórmula bicrónica completa: práctica de voz 24/7 + 3 clases 1-a-1 en vivo por semana.'
                    : 'The complete bichronous formula: 24/7 voice practice + 3 live 1-on-1 classes per week.'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="font-montserrat font-black text-3xl sm:text-4xl text-[#E09B30] tabular-nums">
                  {currency === 'BOB' ? '580 BOB' : '$85 USD'}
                </span>
                <span className="text-xs text-[#A7C7E7] font-inter">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              {/* Level 2: Max 3–4 Concise Bullet Points */}
              <ul className="space-y-3 pt-4 border-t border-[#A7C7E7]/20 text-xs sm:text-sm text-[#FAFAFA] font-inter">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>3 {isEs ? 'clases 1-a-1 / semana' : '1-on-1 classes / week'}</strong> (1h c/u, Lun–Vie)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Voice Lab 24/7 Ilimitado' : 'Unlimited 24/7 Voice Lab'}</strong> (Ivan &amp; Emma)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Generador Ilimitado' : 'Unlimited Generator'}</strong> {isEs ? 'de Recursos a Medida' : 'of Custom Resources'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    {isEs
                      ? 'Ruta Sincronizada (Pre-Clase + 3x Vivo + Recast)'
                      : 'Synchronized Route (Prep + 3x Live + Recast)'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Level 3: Primary #E09B30 CTA Button */}
            <a
              id="plan-cta-pro"
              href={getPlanWhatsAppUrl('pro', lang, currency)}
              onClick={() => onSelectPlanClick('pro', 580)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-amber w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full font-montserrat font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg min-h-[50px]"
            >
              <span>{isEs ? 'Empezar Plan Pro →' : 'Start Pro Plan →'}</span>
            </a>
          </div>

          {/* 3. Executive (Maximum Immersion — 850 BOB) */}
          <div
            id="plan-card-executive"
            className={`slab-3d-light p-6 sm:p-8 rounded-[24px] flex-col justify-between space-y-6 relative bg-[var(--bg-surface)] dark:bg-[#132642] border border-[var(--border-hairline)] text-[#1A3153] dark:text-[#FAFAFA] shadow-sm ${
              selectedTier === 'executive' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="space-y-4">
              {/* Badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-[#1A3153] dark:bg-[#1E3A5F] text-[#FAFAFA] text-[11px] font-montserrat font-bold uppercase tracking-[0.15em]">
                {isEs ? 'INMERSIÓN TOTAL VIP' : 'VIP MAXIMUM IMMERSION'}
              </div>

              {/* Level 1: Montserrat Bold Title */}
              <div>
                <h3 className="font-montserrat font-bold text-2xl text-[#1A3153] dark:text-[#FAFAFA]">
                  Executive VIP
                </h3>
                {/* Level 2: Scannable Inter Subtitle */}
                <p className="text-xs sm:text-sm text-[#4A5568] dark:text-[#A7C7E7] mt-1 font-inter leading-relaxed">
                  {isEs
                    ? 'Inmersión diaria de lunes a viernes para entrevistas internacionales y roles ejecutivos.'
                    : 'Daily Mon–Fri immersion for international interviews and executive leadership roles.'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="font-montserrat font-black text-3xl sm:text-4xl text-[#1A3153] dark:text-[#FAFAFA] tabular-nums">
                  {currency === 'BOB' ? '850 BOB' : '$125 USD'}
                </span>
                <span className="text-xs text-[#4A5568] dark:text-[#A7C7E7] font-inter">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              {/* Level 2: Max 3–4 Concise Bullet Points */}
              <ul className="space-y-3 pt-4 border-t border-[var(--border-hairline)] text-xs sm:text-sm text-[#4A5568] dark:text-[#A7C7E7] font-inter">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] dark:text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>5 {isEs ? 'clases 1-a-1 / semana' : '1-on-1 classes / week'}</strong> ({isEs ? 'Diario Lun–Vie 1h' : 'Daily Mon–Fri 1h'})
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] dark:text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Voice Lab 24/7 Ilimitado' : 'Unlimited 24/7 Voice Lab'}</strong> (Ivan &amp; Emma)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] dark:text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    <strong>{isEs ? 'Prioridad Ejecutiva' : 'Executive Priority'}</strong> + {isEs ? 'Revisión de CV / Pitch' : 'CV / Pitch Deck Reviews'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#9A6515] dark:text-[#E09B30] shrink-0 mt-0.5" />
                  <span>
                    {isEs ? 'Ruta Ejecutiva Diaria (5x Vivo + Entrevistas)' : 'Daily Executive Route (5x Live + Mock Interviews)'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Level 3: Secondary #1A3153 / #E09B30 CTA */}
            <a
              id="plan-cta-executive"
              href={getPlanWhatsAppUrl('executive', lang, currency)}
              onClick={() => onSelectPlanClick('executive', 850)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider text-[#FAFAFA] bg-[#1A3153] dark:bg-[#E09B30] dark:text-[#091326] hover:bg-[#091326] dark:hover:bg-[#ECAA41] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isEs ? 'Aplicar a Executive' : 'Apply to Executive'}</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Quota & Trust Note */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs font-inter text-[var(--text-secondary)] shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#10B981] shrink-0" />
            <span>
              {isEs
                ? 'Los cupos de clases en vivo se reservan de Lunes a Viernes (14:00–20:00 BOT). Cupos limitados para garantizar >75% de habla activa.'
                : 'Live session slots are reserved Monday through Friday (14:00–20:00 BOT). Limited seats to guarantee >75% active speaking time.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className="text-[#9A6515] dark:text-[#E09B30] font-montserrat font-bold hover:underline whitespace-nowrap cursor-pointer"
          >
            {isEs ? 'Crear Cuenta Gratis →' : 'Create Free Account →'}
          </button>
        </div>
      </div>
    </section>
  );
};
