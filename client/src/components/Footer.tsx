import React from 'react';
import { Target, Headphones, BookOpen, Calendar, MessageCircle } from 'lucide-react';
import { BrandLockup } from './BrandLockup';
import { useTranslation } from '../modules/i18n/languageStore';
import { useNavigationStore } from '../modules/navigation/navigationStore';
import { useAuthStore } from '../modules/auth/authStore';
import { TEACHER_PHONE, getWhatsAppUrl } from '../config/contact';

export const Footer: React.FC = () => {
  const { t, isEs } = useTranslation();
  const { activeView, setActiveView } = useNavigationStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <footer id="app-footer" className="bg-[#12223a] border-t border-[#A7C7E7]/25 text-[#FAFAFA] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2.5">
          {/* Logo strictly forced to dark surface colors (White + Amber I + Soft Denim subtitle) */}
          <BrandLockup
            size="lg"
            variant="dark"
            forceDarkSurface={true}
            altText="Teacher Ivan Official Platform"
          />
          <p className="font-inter text-xs text-[#A7C7E7] max-w-sm">
            {t.footer.desc}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-5 sm:gap-6 text-xs text-[#A7C7E7]">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => setActiveView('path')}
                className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                  activeView === 'path' ? 'text-[#E09B30] font-bold' : ''
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Target size={13} />
                  <span>{isEs ? 'Mi Ruta' : 'My Path'}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('simulator')}
                className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                  activeView === 'simulator' ? 'text-[#E09B30] font-bold' : ''
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Headphones size={13} />
                  <span>{isEs ? 'Tutor de Conversación' : 'Voice Tutor'}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('resources')}
                className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                  activeView === 'resources' ? 'text-[#E09B30] font-bold' : ''
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} />
                  <span>{isEs ? 'Recursos & Juegos' : 'Resources & Games'}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('schedule')}
                className={`hover:text-[#E09B30] transition-colors cursor-pointer ${
                  activeView === 'schedule' ? 'text-[#E09B30] font-bold' : ''
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>{t.scheduling.navTab}</span>
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('flagship-simulator-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-[#E09B30] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Headphones size={13} />
                  <span>{isEs ? 'Tutor de Conversación' : 'Voice Tutor'}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('faq-pricing-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-[#E09B30] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} />
                  <span>{isEs ? 'Planes de Estudio' : 'Study Plans'}</span>
                </span>
              </button>

              <a
                href={getWhatsAppUrl('Hola Teacher Ivan! Deseo consultar sobre las clases.')}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#10b981] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <MessageCircle size={13} />
                  <span>WhatsApp Directo</span>
                </span>
              </a>
            </>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[#A7C7E7]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A7C7E7]/70">
        <div>
          &copy; {new Date().getFullYear()} Teacher Ivan English Classes. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}
        </div>
        <div className="flex items-center gap-4">
          <span>{isEs ? 'Sucre, Bolivia • Método Bicrónico' : 'Sucre, Bolivia • Bichronous Method'}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
