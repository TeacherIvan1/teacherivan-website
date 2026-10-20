import React, { useState } from 'react';
import { Check, Sparkles, MessageCircle, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';

export const PricingPlansSection: React.FC = () => {
  const { t } = useTranslation();
  const [currency, setCurrency] = useState<'BOB' | 'USD'>('BOB');

  const WHATSAPP_PHONE = '59178680795';

  const getWhatsAppLink = (planName: string, price: string) => {
    const text = `Hola Teacher Ivan! Me gustaría consultar disponibilidad e inscribirme al "${planName}" (${price}).`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  };

  const plans = [
    {
      id: 'essential',
      name: t.pricingPlans.essential.name,
      target: t.pricingPlans.essential.target,
      price: currency === 'BOB' ? t.pricingPlans.essential.priceBob : t.pricingPlans.essential.priceUsd,
      features: t.pricingPlans.essential.features.slice(0, 4),
      isPopular: false,
    },
    {
      id: 'pro',
      name: t.pricingPlans.pro.name,
      target: t.pricingPlans.pro.target,
      price: currency === 'BOB' ? t.pricingPlans.pro.priceBob : t.pricingPlans.pro.priceUsd,
      features: t.pricingPlans.pro.features.slice(0, 4),
      isPopular: true,
    },
    {
      id: 'executive',
      name: t.pricingPlans.executive.name,
      target: t.pricingPlans.executive.target,
      price: currency === 'BOB' ? t.pricingPlans.executive.priceBob : t.pricingPlans.executive.priceUsd,
      features: t.pricingPlans.executive.features.slice(0, 4),
      isPopular: false,
    },
  ];

  const comparisonRows = [
    {
      feature: t.pricingSection.row1Feature,
      ivan: t.pricingSection.row1Ivan,
      academies: t.pricingSection.row1Academies,
      apps: t.pricingSection.row1Apps,
    },
    {
      feature: t.pricingSection.row2Feature,
      ivan: t.pricingSection.row2Ivan,
      academies: t.pricingSection.row2Academies,
      apps: t.pricingSection.row2Apps,
    },
    {
      feature: t.pricingSection.row3Feature,
      ivan: t.pricingSection.row3Ivan,
      academies: t.pricingSection.row3Academies,
      apps: t.pricingSection.row3Apps,
    },
  ];

  return (
    <section
      id="pricing-plans-section"
      className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full border-b border-[#A7C7E7]/25"
      aria-label="Official Tuition and Coaching Plans"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>{t.pricingSection.badge}</span>
        </div>
        <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#FAFAFA] tracking-tight">
          {t.pricingSection.title}
        </h2>
        <p className="font-inter text-sm sm:text-base text-[#A7C7E7] leading-relaxed max-w-xl mx-auto">
          {t.pricingSection.subtitle}
        </p>

        {/* Currency Toggle (BOB vs USD) */}
        <div className="pt-3 flex items-center justify-center gap-3">
          <span className="text-xs font-montserrat font-semibold text-[#A7C7E7]">
            {t.pricingSection.currencyToggle}
          </span>
          <div className="inline-flex rounded-full p-1 bg-[#12223a] border border-[#A7C7E7]/30 shadow-inner">
            <button
              onClick={() => setCurrency('BOB')}
              className={`px-4 py-1.5 rounded-full text-xs font-montserrat font-bold transition-all cursor-pointer ${
                currency === 'BOB'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              {t.pricingSection.bob}
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 rounded-full text-xs font-montserrat font-bold transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
                  : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
              }`}
            >
              {t.pricingSection.usd}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Plans Grid (Max 4 bullets each) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-2 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-7 rounded-3xl flex flex-col justify-between transition-all duration-200 relative ${
              plan.isPopular
                ? 'bg-gradient-to-b from-[#1A3153] to-[#12223a] border-2 border-[#E09B30] shadow-2xl md:-translate-y-2'
                : 'bg-[#12223a]/80 border border-[#A7C7E7]/30 shadow-xl'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E09B30] text-[#1A3153] text-[10px] font-montserrat font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                <Zap size={11} fill="currentColor" />
                <span>{t.pricingSection.mostPopular}</span>
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

              {/* Max 4 Features */}
              <ul className="space-y-3 text-xs text-[#FAFAFA]/95 mb-8">
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

            {/* CTA Button: Start with [Plan Name] */}
            <div>
              <a
                href={getWhatsAppLink(plan.name, plan.price)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 px-6 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  plan.isPopular
                    ? 'bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] shadow-lg shadow-[#E09B30]/35'
                    : 'bg-[#1A3153] border border-[#A7C7E7]/60 text-[#FAFAFA] hover:bg-[#12223a] hover:border-[#E09B30]'
                }`}
              >
                <MessageCircle size={15} className={plan.isPopular ? 'text-[#1A3153]' : 'text-[#25D366]'} />
                <span>{`${t.pricingSection.startWith} ${plan.name}`}</span>
              </a>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A7C7E7] mt-3">
                <ShieldCheck size={13} className="text-[#E09B30]" />
                <span>{t.pricingSection.guarantee}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plain-Language Comparison Table (3 Rows Max, No Competitor Names) */}
      <div className="p-7 sm:p-9 rounded-3xl bg-[#12223a]/80 border border-[#A7C7E7]/30 shadow-xl max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="font-montserrat font-bold text-xl text-[#FAFAFA] mb-1">
            {t.pricingSection.comparisonTitle}
          </h3>
          <p className="font-inter text-xs sm:text-sm text-[#A7C7E7]">
            {t.pricingSection.comparisonSubtitle}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#A7C7E7]/25 text-[#A7C7E7] font-montserrat uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">{t.pricingSection.headerFeature}</th>
                <th className="py-3 px-3 text-[#E09B30] font-bold">{t.pricingSection.headerIvan}</th>
                <th className="py-3 px-3">{t.pricingSection.headerAcademies}</th>
                <th className="py-3 px-3">{t.pricingSection.headerApps}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A7C7E7]/15">
              {comparisonRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#1A3153]/40 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[#FAFAFA] whitespace-nowrap">
                    {row.feature}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#E09B30]">
                    {row.ivan}
                  </td>
                  <td className="py-3.5 px-3 text-[#A7C7E7]">
                    {row.academies}
                  </td>
                  <td className="py-3.5 px-3 text-[#A7C7E7]">
                    {row.apps}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PricingPlansSection;
