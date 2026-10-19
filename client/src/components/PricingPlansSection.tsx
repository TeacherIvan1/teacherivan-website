import React, { useState } from 'react';
import { Check, Sparkles, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';

export const PricingPlansSection: React.FC = () => {
  const { t } = useTranslation();
  const [currency, setCurrency] = useState<'BOB' | 'USD'>('BOB');

  const WHATSAPP_PHONE = '59178680795';

  const getWhatsAppLink = (planName: string, price: string) => {
    const text = `Hola Teacher Ivan! Me gustaría consultar disponibilidad e inscribirme al plan "${planName}" (${price}).`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  };

  const plans = [
    {
      id: 'essential',
      name: t.pricingPlans.essential.name,
      target: t.pricingPlans.essential.target,
      price: currency === 'BOB' ? t.pricingPlans.essential.priceBob : t.pricingPlans.essential.priceUsd,
      features: t.pricingPlans.essential.features,
      isPopular: false,
      buttonStyle: 'bg-[#1A3153] border border-[#A7C7E7] text-[#FAFAFA] hover:bg-[#12223a]',
    },
    {
      id: 'pro',
      name: t.pricingPlans.pro.name,
      target: t.pricingPlans.pro.target,
      price: currency === 'BOB' ? t.pricingPlans.pro.priceBob : t.pricingPlans.pro.priceUsd,
      features: t.pricingPlans.pro.features,
      isPopular: true,
      buttonStyle: 'bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] shadow-lg shadow-[#E09B30]/30',
    },
    {
      id: 'executive',
      name: t.pricingPlans.executive.name,
      target: t.pricingPlans.executive.target,
      price: currency === 'BOB' ? t.pricingPlans.executive.priceBob : t.pricingPlans.executive.priceUsd,
      features: t.pricingPlans.executive.features,
      isPopular: false,
      buttonStyle: 'bg-[#1A3153] border border-[#E09B30]/60 text-[#FAFAFA] hover:bg-[#12223a]',
    },
  ];

  return (
    <section
      id="pricing-plans-section"
      className="py-16 md:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full"
      aria-label="Official Tuition and Coaching Plans"
    >
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>{t.pricingPlans.badge}</span>
        </div>
        <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
          {t.pricingPlans.title}
        </h2>
        <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed">
          {t.pricingPlans.subtitle}
        </p>

        {/* Currency Toggle (BOB vs USD) */}
        <div className="pt-3 flex items-center justify-center gap-3">
          <span className="text-xs font-montserrat font-semibold text-[#A7C7E7]">
            {t.pricingPlans.currencyToggle}
          </span>
          <div className="inline-flex rounded-full p-1 bg-slate-900 border border-[#A7C7E7]/30 shadow-inner">
            <button
              onClick={() => setCurrency('BOB')}
              className={`px-4 py-1.5 rounded-full text-xs font-montserrat font-bold transition-all ${
                currency === 'BOB'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              {t.pricingPlans.bob}
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 rounded-full text-xs font-montserrat font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              {t.pricingPlans.usd}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-7 rounded-3xl flex flex-col justify-between transition-all duration-200 relative ${
              plan.isPopular
                ? 'bg-gradient-to-b from-[#1A3153] to-[#12223a] border-2 border-[#E09B30] shadow-2xl md:-translate-y-2'
                : 'bg-[#1A3153]/70 border border-[#A7C7E7]/30 shadow-xl'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E09B30] text-[#1A3153] text-[10px] font-montserrat font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                <Zap size={11} fill="currentColor" />
                <span>{t.pricingPlans.recommendedBadge}</span>
              </div>
            )}

            <div>
              <div className="mb-4">
                <h3 className="font-montserrat font-bold text-xl text-[#FAFAFA] mb-1">
                  {plan.name}
                </h3>
                <span className="text-xs text-[#A7C7E7] font-medium block">
                  {plan.target}
                </span>
              </div>

              {/* Price Block */}
              <div className="py-4 border-y border-[#A7C7E7]/20 mb-6">
                <span className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#FAFAFA]">
                  {plan.price}
                </span>
              </div>

              {/* Feature List */}
              <ul className="space-y-3.5 text-xs text-[#FAFAFA]/95 mb-8">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#E09B30]/20 text-[#E09B30] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div>
              <a
                href={getWhatsAppLink(plan.name, plan.price)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${plan.buttonStyle}`}
              >
                <span>{t.pricingPlans.enrollBtn}</span>
                <ExternalLink size={13} />
              </a>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A7C7E7] mt-3">
                <ShieldCheck size={13} className="text-[#E09B30]" />
                <span>Direct WhatsApp Mentorship & Confirmation</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingPlansSection;
