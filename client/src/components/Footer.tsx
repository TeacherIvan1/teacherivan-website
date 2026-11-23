import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, Clock, ShieldCheck, FileText, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { BrandWordmark } from './BrandWordmark';
import { useTranslation } from '../modules/i18n/languageStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { useAuthStore } from '../modules/auth/authStore';
import { useCookieConsent } from '../context/CookieConsentContext';
import { getGeneralWhatsAppUrl, handleWhatsAppClick } from '../utils/whatsapp';

export const Footer: React.FC = () => {
  const { isEs } = useTranslation();
  const { setActiveView } = useNavigationStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { openLegalModal, openCookiePreferences } = useCookieConsent();

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const scrollToSection = (
    sectionId: string,
    portalView?: 'path' | 'simulator' | 'resources' | 'schedule'
  ) => {
    if (isAuthenticated && portalView) {
      setActiveView(portalView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="app-footer"
      className="select-none text-[#FAFAFA] bg-[#091326]"
      style={{
        position: 'relative',
        zIndex: 10,
        padding: isMobile ? '56px 20px 36px' : '100px 44px 52px',
        background: '#091326',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          borderTop: '1px solid rgba(167,199,231,0.22)',
          paddingTop: isMobile ? 28 : 44,
        }}
      >
        {/* Responsive 4-Column Desktop / 2-Column Mobile Grid */}
        <div
          id="footer-4col-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : '1.4fr 1fr 1fr 1fr',
            gap: isMobile ? '28px 16px' : '40px',
            paddingBottom: 32,
            borderBottom: '1px solid rgba(167,199,231,0.18)',
          }}
        >
          {/* COLUMN 1: Brand & Mission */}
          <div
            style={{
              gridColumn: isMobile ? '1 / -1' : undefined,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <BrandWordmark
              isMobile={isMobile}
              surface="dark"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                lineHeight: 1.6,
                color: '#A7C7E7',
                maxWidth: 320,
              }}
            >
              {isEs
                ? 'Método Bicrónico: Inmersión IA 24/7 + Coaching 1-a-1 en vivo.'
                : 'Bichronous Method: 24/7 AI Immersion + Live 1-on-1 Coaching.'}
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: '#A7C7E7',
              }}
            >
              © 2026 Teacher Ivan. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
            </p>
          </div>

          {/* COLUMN 2: Platform / Plataforma */}
          <div className="flex flex-col items-start gap-2">
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30] mb-1">
              {isEs ? 'Plataforma' : 'Platform'}
            </h3>
            <ul className="space-y-1 font-inter text-sm text-[#A7C7E7]">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('chapter-1-bicronic', 'path')}
                  className="min-h-[44px] py-1.5 hover:text-[#FAFAFA] transition-colors cursor-pointer text-left inline-flex items-center"
                >
                  {isEs ? 'Método Bicrónico' : 'Bichronous Method'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('chapter-2-voicelab', 'simulator')}
                  className="min-h-[44px] py-1.5 hover:text-[#FAFAFA] transition-colors cursor-pointer text-left inline-flex items-center"
                >
                  Voice Lab 24/7
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('chapter-3-plans', 'schedule')}
                  className="min-h-[44px] py-1.5 hover:text-[#FAFAFA] transition-colors cursor-pointer text-left inline-flex items-center"
                >
                  {isEs ? 'Planes (300–850 BOB)' : 'Plans (300–850 BOB)'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('chapter-4-faq', 'resources')}
                  className="min-h-[44px] py-1.5 hover:text-[#FAFAFA] transition-colors cursor-pointer text-left inline-flex items-center"
                >
                  {isEs ? 'Preguntas' : 'FAQ'}
                </button>
              </li>
              {!isAuthenticated && (
                <li>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signup')}
                    className="min-h-[44px] py-1.5 font-montserrat font-bold text-sm text-[#E09B30] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isEs ? 'Crear Cuenta Gratis' : 'Create Free Account'}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* COLUMN 3: Legal */}
          <div className="flex flex-col items-start gap-2">
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30] mb-1">
              Legal
            </h3>
            <ul className="space-y-1 font-inter text-sm text-[#A7C7E7]">
              <li>
                <button
                  id="footer-privacy-policy-btn"
                  type="button"
                  onClick={() => openLegalModal('privacy')}
                  className="min-h-[44px] py-1.5 hover:text-[#FAFAFA] transition-colors cursor-pointer inline-flex items-center gap-2 text-left"
                >
                  <ShieldCheck size={15} className="text-[#E09B30] shrink-0" aria-hidden="true" />
                  <span>{isEs ? 'Política de Privacidad' : 'Privacy Policy'}</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-cookie-policy-btn"
                  type="button"
                  onClick={() => openLegalModal('cookies')}
                  className="min-h-[44px] py-1.5 hover:text-[#FAFAFA] transition-colors cursor-pointer inline-flex items-center gap-2 text-left"
                >
                  <FileText size={15} className="text-[#E09B30] shrink-0" aria-hidden="true" />
                  <span>{isEs ? 'Política de Cookies' : 'Cookie Policy'}</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-cookie-settings-btn"
                  type="button"
                  onClick={openCookiePreferences}
                  className="min-h-[44px] py-1.5 hover:text-[#FAFAFA] transition-colors cursor-pointer inline-flex items-center gap-2 text-left"
                >
                  <SlidersHorizontal size={15} className="text-[#E09B30] shrink-0" aria-hidden="true" />
                  <span>{isEs ? 'Configurar Cookies' : 'Cookie Settings'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Contact / Contacto */}
          <div
            style={{
              gridColumn: isMobile ? '1 / -1' : undefined,
            }}
            className="flex flex-col items-start gap-3"
          >
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30]">
              {isEs ? 'Contacto' : 'Contact'}
            </h3>

            <a
              id="footer-direct-whatsapp-btn"
              href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
              onClick={() => handleWhatsAppClick('footer')}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] px-5 py-3 rounded-full bg-[#E09B30] hover:bg-[#ECAA41] text-[#091326] font-montserrat font-extrabold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <MessageCircle size={16} aria-hidden="true" />
              <span>WhatsApp +591 72878330</span>
            </a>

            <div className="space-y-1 font-inter text-sm text-[#A7C7E7]">
              <a
                href="mailto:ivan@teacherivan.com"
                className="min-h-[44px] inline-flex items-center gap-2 hover:text-[#FAFAFA] transition-colors"
              >
                <Mail size={14} className="text-[#E09B30] shrink-0" aria-hidden="true" />
                <span>ivan@teacherivan.com</span>
              </a>
              <div className="flex items-center gap-2 py-1">
                <Clock size={14} className="text-[#E09B30] shrink-0" aria-hidden="true" />
                <span>{isEs ? 'Lun–Vie • 14:00–20:00 BOT' : 'Mon–Fri • 14:00–20:00 BOT'}</span>
              </div>
            </div>

            {/* Clean Inline SVG Social Links (44x44px touch targets) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                id="footer-social-instagram"
                href="https://instagram.com/teacherivan_english.classes"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Teacher Ivan"
                className="w-11 h-11 rounded-full bg-[#1A3153] hover:bg-[#E09B30] text-[#FAFAFA] hover:text-[#091326] border border-[#A7C7E7]/30 hover:border-[#E09B30] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                id="footer-social-tiktok"
                href="https://tiktok.com/@teacher_ivan_english_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Teacher Ivan"
                className="w-11 h-11 rounded-full bg-[#1A3153] hover:bg-[#E09B30] text-[#FAFAFA] hover:text-[#091326] border border-[#A7C7E7]/30 hover:border-[#E09B30] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43 6.3 6.3 0 0 0 1.88-4.42V8.71a8.31 8.31 0 0 0 4.85 1.56v-3.46a4.85 4.85 0 0 1-1-.12z" />
                </svg>
              </a>

              <a
                id="footer-social-youtube"
                href="https://youtube.com/@Teacher_Ivan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Teacher Ivan"
                className="w-11 h-11 rounded-full bg-[#1A3153] hover:bg-[#E09B30] text-[#FAFAFA] hover:text-[#091326] border border-[#A7C7E7]/30 hover:border-[#E09B30] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              <a
                id="footer-social-facebook"
                href="https://www.facebook.com/search/top?q=Teacher%20Ivan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Teacher Ivan"
                className="w-11 h-11 rounded-full bg-[#1A3153] hover:bg-[#E09B30] text-[#FAFAFA] hover:text-[#091326] border border-[#A7C7E7]/30 hover:border-[#E09B30] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm font-inter text-[#A7C7E7]">
          <span>Teacher Ivan • English Classes • Sucre, Bolivia • Online Worldwide</span>
          <span>
            {isEs
              ? 'Inmersión Asincrónica 24/7 + Coaching Humano 1-a-1'
              : '24/7 Async Immersion + 1-on-1 Human Coaching'}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
