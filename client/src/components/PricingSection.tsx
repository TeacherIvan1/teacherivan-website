import React, { useState } from 'react';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useAuthStore } from '../modules/auth/authStore';
import { useTheme } from '../modules/theme/ThemeContext';
import { getPlanWhatsAppUrl, handleWhatsAppClick, PlanTierId } from '../utils/whatsapp';
import { trackEvent } from '../utils/analytics';

export const PricingSection: React.FC = () => {
  const { isEs } = useTranslation();
  const { openAuthModal } = useAuthStore();
  const { isDark } = useTheme();
  const [currency, setCurrency] = useState<'BOB' | 'USD'>('BOB');
  const [mobileTier, setMobileTier] = useState<PlanTierId>('pro');

  const lang = isEs ? 'es' : 'en';

  const onSelectPlanClick = (plan: PlanTierId, priceBob: 300 | 580 | 850) => {
    trackEvent('select_plan', { plan, price_bob: priceBob });
    handleWhatsAppClick('pricing', plan);
  };

  const panelBg = isDark ? 'rgba(19, 38, 66, 0.90)' : 'rgba(255, 255, 255, 0.96)';
  const panelBorder = isDark ? '1px solid rgba(167, 199, 231, 0.25)' : '1px solid rgba(26, 49, 83, 0.16)';

  return (
    <section
      id="chapter-3-plans"
      aria-labelledby="pricing-section-heading"
      className="py-12 md:py-20 px-4 sm:px-6 lg:px-12 select-none"
      style={{
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="max-w-[1280px] mx-auto space-y-6 md:space-y-10">
        {/* Header Controls: High-Contrast Backing Strip + BOB | USD Currency Toggle */}
        <div
          className={`flex flex-col md:flex-row items-center justify-between gap-5 p-5 sm:p-8 rounded-[24px] md:rounded-[28px] shadow-md ${
            isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
          }`}
          style={{
            background: panelBg,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: panelBorder,
          }}
        >
          <div className="text-center md:text-left">
            <div
              className={`hidden sm:block text-xs font-montserrat font-bold tracking-[0.15em] uppercase mb-1.5 ${
                isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'
              }`}
            >
              —— {isEs ? 'INVERSIÓN TRANSPARENTE' : 'TRANSPARENT TUITION'}
            </div>
            <h2
              id="pricing-section-heading"
              className={`font-montserrat font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight ${
                isDark ? 'text-[#FAFAFA]' : 'text-[#1A3153]'
              }`}
            >
              {isEs ? 'Planes claros.' : 'Clear plans.'}{' '}
              <span className={isDark ? 'text-[#A7C7E7] font-semibold' : 'text-[#334155] font-semibold'}>
                {isEs ? 'Sin contratos ocultos.' : 'No hidden contracts.'}
              </span>
            </h2>
            <p
              className={`text-sm sm:text-base font-inter mt-1.5 ${
                isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'
              }`}
            >
              {isEs
                ? 'Cancela o cambia de plan cuando quieras. Clases Lun–Vie (14:00–20:00 BOT).'
                : 'Cancel or switch tiers anytime. Live classes Mon–Fri (14:00–20:00 BOT).'}
            </p>
          </div>

          {/* BOB | USD Currency Toggle (min 44px tap targets) */}
          <div
            role="group"
            aria-label={isEs ? 'Moneda' : 'Currency'}
            className={`flex items-center gap-1 p-1 rounded-full border shadow-inner shrink-0 ${
              isDark
                ? 'bg-[#091326] border-[#A7C7E7]/30'
                : 'bg-[#EEF3F8] border-[#1A3153]/20'
            }`}
          >
            <button
              type="button"
              onClick={() => setCurrency('BOB')}
              aria-pressed={currency === 'BOB'}
              className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-montserrat font-bold tracking-wider transition-all cursor-pointer ${
                currency === 'BOB'
                  ? 'bg-[#E09B30] text-[#091326] shadow-sm'
                  : isDark
                  ? 'text-[#FAFAFA] hover:text-[#E09B30]'
                  : 'text-[#1A3153] hover:text-[#9A6515]'
              }`}
            >
              BOB (Bs)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              aria-pressed={currency === 'USD'}
              className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-montserrat font-bold tracking-wider transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#E09B30] text-[#091326] shadow-sm'
                  : isDark
                  ? 'text-[#FAFAFA] hover:text-[#E09B30]'
                  : 'text-[#1A3153] hover:text-[#9A6515]'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* Mobile Segmented Tier Switcher (< 768px) — 48px touch targets */}
        <div
          role="tablist"
          aria-label={isEs ? 'Seleccionar plan' : 'Select plan'}
          className={`md:hidden grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl border ${
            isDark
              ? 'bg-[#091326]/90 border-[#A7C7E7]/25'
              : 'bg-[#EEF3F8] border-[#1A3153]/18'
          }`}
        >
          {(
            [
              { id: 'essential', label: 'Essential', sub: currency === 'BOB' ? '300 Bs' : '$45' },
              { id: 'pro', label: 'Pro', sub: currency === 'BOB' ? '580 Bs' : '$85' },
              { id: 'executive', label: 'Executive', sub: currency === 'BOB' ? '850 Bs' : '$125' },
            ] as const
          ).map((tier) => {
            const active = mobileTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMobileTier(tier.id)}
                className={`min-h-[48px] py-2 px-2 rounded-xl font-montserrat font-bold text-xs transition-all cursor-pointer flex flex-col items-center justify-center leading-tight ${
                  active
                    ? 'bg-[#E09B30] text-[#091326] shadow-md font-extrabold'
                    : isDark
                    ? 'text-[#FAFAFA] hover:bg-[#1A3153]'
                    : 'text-[#1A3153] hover:bg-[#FFFFFF]'
                }`}
              >
                <span>{tier.label}</span>
                <span className="text-[11px] font-semibold opacity-90">{tier.sub}</span>
              </button>
            );
          })}
        </div>

        {/* 3-Column Architectural Pricing Matrix (Essential 300 | Pro 580 | Executive 850 BOB) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* 1. Essential (300 BOB/mes | $45 USD) */}
          <div
            id="plan-card-essential"
            className={`${
              mobileTier === 'essential' ? 'flex' : 'hidden md:flex'
            } p-6 sm:p-8 rounded-[24px] flex-col justify-between space-y-6 relative bg-[#FFFFFF] border border-[#1A3153]/20 text-[#1A3153] shadow-xl`}
          >
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-[#EEF3F8] text-[#9A6515] text-xs font-montserrat font-bold uppercase tracking-[0.12em] border border-[#1A3153]/15">
                {isEs ? '100% AUTÓNOMO • 24/7' : '100% AUTONOMOUS • 24/7'}
              </div>

              <div>
                <h3 className="font-montserrat font-bold text-2xl text-[#1A3153]">
                  Essential
                </h3>
                <p className="text-sm sm:text-base text-[#334155] mt-1 font-inter leading-relaxed">
                  {isEs
                    ? 'Práctica autónoma 24/7 a tu propio ritmo.'
                    : 'Self-paced 24/7 voice immersion anytime.'}
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="font-montserrat font-extrabold text-3xl sm:text-4xl text-[#1A3153] tabular-nums">
                  {currency === 'BOB' ? '300 BOB' : '$45 USD'}
                </span>
                <span className="text-sm text-[#475569] font-inter">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-[#1A3153]/15 text-sm text-[#334155] font-inter">
                <li className="flex items-start gap-2.5">
                  <Check size={17} className="text-[#9A6515] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#1A3153]">0 {isEs ? 'clases en vivo' : 'live classes'}</strong> ({isEs ? '100% autónomo' : '100% self-paced'})
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={17} className="text-[#9A6515] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#1A3153]">{isEs ? 'Laboratorio de Voz 24/7' : 'Unlimited 24/7 Voice Lab'}</strong> (Ivan &amp; Emma)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={17} className="text-[#9A6515] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#1A3153]">{isEs ? 'Mi Ruta + Generador IA' : 'My Path + AI Resources'}</strong> {isEs ? 'ilimitado' : 'unlimited'}
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
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full font-montserrat font-bold text-sm uppercase tracking-wider text-[#1A3153] bg-[#EEF3F8] hover:bg-[#1A3153] hover:text-[#FAFAFA] border border-[#1A3153]/30 transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isEs ? 'Elegir Essential' : 'Select Essential'}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>

          {/* 2. Pro (580 BOB/mes | $85 USD — Flagship): Deep Navy #1A3153 with #E09B30 border */}
          <div
            id="plan-card-pro"
            className={`${
              mobileTier === 'pro' ? 'flex' : 'hidden md:flex'
            } p-6 sm:p-8 rounded-[24px] flex-col justify-between space-y-6 relative text-[#FAFAFA] bg-[#1A3153] border-2 border-[#E09B30] shadow-xl md:-translate-y-2 z-10`}
            style={{
              boxShadow: '0 24px 48px rgba(9, 19, 38, 0.45), 0 0 36px rgba(224, 155, 48, 0.22)',
            }}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center justify-between w-full">
                <span className="px-3.5 py-1 rounded-full bg-[#E09B30] text-[#091326] text-xs font-montserrat font-extrabold uppercase tracking-[0.12em]">
                  {isEs ? 'MÁS ELEGIDO • HÍBRIDO' : 'MOST POPULAR • HYBRID'}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
              </div>

              <div>
                <h3 className="font-montserrat font-bold text-2xl text-[#FAFAFA]">
                  Programa Pro
                </h3>
                <p className="text-sm sm:text-base text-[#A7C7E7] mt-1 font-inter leading-relaxed">
                  {isEs
                    ? 'Todo Essential + 3 horas semanales 1-a-1 en vivo con Teacher Ivan.'
                    : 'Everything in Essential + 3 weekly live 1-on-1 hours with Teacher Ivan.'}
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="font-montserrat font-extrabold text-3xl sm:text-4xl text-[#E09B30] tabular-nums">
                  {currency === 'BOB' ? '580 BOB' : '$85 USD'}
                </span>
                <span className="text-sm text-[#A7C7E7] font-inter">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-[#A7C7E7]/25 text-sm text-[#FAFAFA] font-inter">
                <li className="flex items-start gap-2.5">
                  <Check size={17} className="text-[#E09B30] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>3 {isEs ? 'clases 1-a-1 / semana' : '1-on-1 classes / week'}</strong> (Lun–Vie 14:00–20:00 BOT)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={17} className="text-[#E09B30] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>{isEs ? 'Todo lo incluido en Essential' : 'Everything in Essential'}</strong> (Voice Lab 24/7 + Mi Ruta)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={17} className="text-[#E09B30] shrink-0 mt-0.5" aria-hidden="true" />
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
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full font-montserrat font-extrabold text-sm uppercase tracking-wider bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] transition-all cursor-pointer shadow-lg min-h-[50px]"
            >
              <span>{isEs ? 'Empezar Plan Pro →' : 'Start Pro Plan →'}</span>
            </a>
          </div>

          {/* 3. Executive (850 BOB/mes | $125 USD) */}
          <div
            id="plan-card-executive"
            className={`${
              mobileTier === 'executive' ? 'flex' : 'hidden md:flex'
            } p-6 sm:p-8 rounded-[24px] flex-col justify-between space-y-6 relative bg-[#FFFFFF] border border-[#1A3153]/20 text-[#1A3153] shadow-xl overflow-hidden`}
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#1A3153]" aria-hidden="true" />

            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-[#1A3153] text-[#FAFAFA] text-xs font-montserrat font-bold uppercase tracking-[0.12em]">
                {isEs ? 'INMERSIÓN TOTAL VIP' : 'VIP MAXIMUM IMMERSION'}
              </div>

              <div>
                <h3 className="font-montserrat font-bold text-2xl text-[#1A3153]">
                  Executive VIP
                </h3>
                <p className="text-sm sm:text-base text-[#334155] mt-1 font-inter leading-relaxed">
                  {isEs
                    ? 'Inmersión diaria de lunes a viernes para entrevistas y liderazgo global.'
                    : 'Daily Mon–Fri immersion for international interviews and leadership.'}
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="font-montserrat font-extrabold text-3xl sm:text-4xl text-[#1A3153] tabular-nums">
                  {currency === 'BOB' ? '850 BOB' : '$125 USD'}
                </span>
                <span className="text-sm text-[#475569] font-inter">
                  {isEs ? '/ mes' : '/ mo'}
                </span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-[#1A3153]/15 text-sm text-[#334155] font-inter">
                <li className="flex items-start gap-2.5">
                  <Check size={17} className="text-[#9A6515] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#1A3153]">5 {isEs ? 'clases 1-a-1 / semana' : '1-on-1 classes / week'}</strong> ({isEs ? 'Diario Lun–Vie' : 'Daily Mon–Fri'})
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={17} className="text-[#9A6515] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#1A3153]">{isEs ? 'Todo lo incluido en Essential' : 'Everything in Essential'}</strong> (Voice Lab 24/7 + Mi Ruta)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={17} className="text-[#9A6515] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#1A3153]">{isEs ? 'Simulacros Diarios' : 'Daily Mock Prep'}</strong> ({isEs ? 'Entrevistas, CV y IELTS' : 'Interviews, CV & IELTS'})
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
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full font-montserrat font-bold text-sm uppercase tracking-wider text-[#FAFAFA] bg-[#1A3153] hover:bg-[#091326] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isEs ? 'Aplicar a Executive' : 'Apply to Executive'}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Bottom Trust Strip */}
        <div
          className={`p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-sm font-inter shadow-sm ${
            isDark ? 'text-[#A7C7E7]' : 'text-[#334155]'
          }`}
          style={{
            background: panelBg,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: panelBorder,
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#10B981] shrink-0" aria-hidden="true" />
            <span>
              {isEs
                ? 'Garantía de más del 75% de habla activa por sesión (Lun–Vie 14:00–20:00 BOT).'
                : 'Guaranteed >75% active student speaking time per session (Mon–Fri 14:00–20:00 BOT).'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className={`min-h-[44px] px-3 font-montserrat font-bold hover:underline whitespace-nowrap cursor-pointer ${
              isDark ? 'text-[#E09B30]' : 'text-[#9A6515]'
            }`}
          >
            {isEs ? 'Crear Cuenta Gratis →' : 'Create Free Account →'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
