import React from 'react';
import { Award, CheckCircle2, MessageCircle, Mic, ArrowRight, Quote, Shield } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useConversationStore } from '../modules/conversation/conversationStore';

export const TrustSection: React.FC = () => {
  const { t } = useTranslation();
  const { startSession, status } = useConversationStore();

  const WHATSAPP_PHONE = '59178680795';
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    'Hola Teacher Ivan! Me gustaría hacer una consulta para empezar mis clases 1 a 1 de inglés.'
  )}`;

  const handleStartTutor = () => {
    const el = document.getElementById('voice-tutor-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (status !== 'connected') {
      startSession();
    }
  };

  const testimonials = [
    {
      quote: t.trustSection.t1Quote,
      name: t.trustSection.t1Name,
      role: t.trustSection.t1Role,
    },
    {
      quote: t.trustSection.t2Quote,
      name: t.trustSection.t2Name,
      role: t.trustSection.t2Role,
    },
    {
      quote: t.trustSection.t3Quote,
      name: t.trustSection.t3Name,
      role: t.trustSection.t3Role,
    },
  ];

  return (
    <section
      id="trust-section"
      className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full"
      aria-label="Teacher Ivan Credentials and Student Testimonials"
    >
      <div className="max-w-6xl mx-auto">
        {/* Coach Bio & Philosophy */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#12223a] to-[#1A3153] border border-[#A7C7E7]/35 shadow-2xl mb-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Ivan Photo / Mascot Placeholder (Guaranteed min 160px) */}
            <div
              className="flex-shrink-0 relative group"
              data-placeholder="coach-photo"
              title="Teacher Ivan Official Coach Photo"
            >
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-[#1A3153] border-2 border-[#E09B30] p-3 flex items-center justify-center shadow-xl shadow-[#E09B30]/20 relative overflow-hidden">
                <img
                  src="/assets/logo.svg"
                  alt="Teacher Ivan Official Coach"
                  className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#E09B30] text-[#1A3153] p-1.5 rounded-full shadow-md">
                <Shield size={16} fill="currentColor" />
              </div>
            </div>

            {/* Coach Details & Philosophy */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider mb-3">
                <Award size={13} />
                <span>{t.trustSection.badge}</span>
              </div>

              <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#FAFAFA] mb-2 tracking-tight">
                {t.trustSection.title}
              </h2>
              <p className="font-inter text-sm text-[#A7C7E7] mb-5">
                {t.trustSection.subtitle}
              </p>

              {/* 2 Verified Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#12223a]/90 border border-[#A7C7E7]/25 text-xs text-[#FAFAFA]">
                  <CheckCircle2 size={16} className="text-[#E09B30] flex-shrink-0" />
                  <span className="font-semibold">{t.trustSection.cred1}</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#12223a]/90 border border-[#A7C7E7]/25 text-xs text-[#FAFAFA]">
                  <CheckCircle2 size={16} className="text-[#10b981] flex-shrink-0" />
                  <span className="font-semibold">{t.trustSection.cred2}</span>
                </div>
              </div>

              {/* 1-Line Philosophy Quote */}
              <blockquote className="p-4 rounded-xl bg-[#1A3153]/60 border-l-4 border-[#E09B30] text-xs sm:text-sm text-[#A7C7E7] italic">
                {t.trustSection.philosophy}
                <footer className="mt-1 text-[11px] font-montserrat font-bold text-[#E09B30] not-italic">
                  — {t.trustSection.philosophyAuthor}
                </footer>
              </blockquote>
            </div>
          </div>
        </div>

        {/* 3 Student Testimonial Placeholders */}
        <div className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-montserrat font-bold uppercase tracking-wider text-[#E09B30]">
              {t.trustSection.testimonialsBadge}
            </span>
            <h3 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#FAFAFA]">
              {t.trustSection.testimonialsHeading}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                data-placeholder="student-testimonial"
                className="p-6 rounded-3xl bg-[#12223a]/80 border border-[#A7C7E7]/25 shadow-lg flex flex-col justify-between hover:border-[#E09B30]/40 transition-all duration-200"
              >
                <div>
                  <Quote size={20} className="text-[#E09B30] mb-3 opacity-60" />
                  <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] leading-relaxed mb-6">
                    “{item.quote}”
                  </p>
                </div>
                <div className="pt-4 border-t border-[#A7C7E7]/15">
                  <div className="font-montserrat font-bold text-xs text-[#FAFAFA]">
                    {item.name}
                  </div>
                  <div className="font-inter text-[11px] text-[#A7C7E7]">
                    {item.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final High-Converting CTA Box */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#12223a] via-[#1A3153] to-[#12223a] border-2 border-[#E09B30]/60 shadow-2xl text-center max-w-3xl mx-auto">
          <h3 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#FAFAFA] mb-3 tracking-tight">
            {t.trustSection.finalCtaTitle}
          </h3>
          <p className="font-inter text-sm sm:text-base text-[#A7C7E7] mb-8 max-w-lg mx-auto leading-relaxed">
            {t.trustSection.finalCtaSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary: Try AI Tutor Free */}
            <button
              type="button"
              id="final-cta-try-ai-btn"
              onClick={handleStartTutor}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-montserrat font-bold text-xs sm:text-sm uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-[#E09B30]/35 cursor-pointer min-h-[48px]"
            >
              <Mic size={16} />
              <span>{t.trustSection.tryAiBtn}</span>
              <ArrowRight size={15} />
            </button>

            {/* Secondary: Chat with Ivan on WhatsApp */}
            <a
              id="final-cta-whatsapp-link"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-montserrat font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] bg-[#12223a] border border-[#A7C7E7]/60 text-[#FAFAFA] hover:bg-[#1A3153] hover:border-[#25D366] transition-all duration-200 min-h-[48px]"
            >
              <MessageCircle size={16} className="text-[#25D366]" />
              <span>{t.trustSection.chatWhatsappBtn}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
