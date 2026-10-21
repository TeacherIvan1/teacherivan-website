import React from 'react';
import { Mic, MessageCircle } from 'lucide-react';
import { useTranslation } from '../modules/i18n/languageStore';
import { useConversationStore } from '../modules/conversation/conversationStore';
import { getWhatsAppUrl } from '../config/contact';

export const MobileBottomBar: React.FC = () => {
  const { t } = useTranslation();
  const { startSession, status } = useConversationStore();

  const whatsappUrl = getWhatsAppUrl(
    'Hola Teacher Ivan! Me gustaría consultar disponibilidad e información sobre las clases de inglés.'
  );

  const handleStartTutor = () => {
    const el = document.getElementById('voice-tutor-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (status !== 'connected') {
      startSession();
    }
  };

  return (
    <div
      id="mobile-sticky-bottom-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#12223a]/95 backdrop-blur-md border-t border-[#A7C7E7]/30 p-2.5 px-4 shadow-2xl flex items-center gap-3"
      role="region"
      aria-label="Quick Mobile Actions"
    >
      {/* 1. Try AI Tutor (Min 44px height) */}
      <button
        type="button"
        id="mobile-bar-try-ai-btn"
        onClick={handleStartTutor}
        className="flex-1 min-h-[46px] h-[46px] rounded-full bg-[#E09B30] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#E09B30]/35 cursor-pointer active:scale-95 transition-transform"
      >
        <Mic size={16} />
        <span>{t.mobileBar.tryAi}</span>
      </button>

      {/* 2. WhatsApp (Min 44px height) */}
      <a
        id="mobile-bar-whatsapp-link"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-h-[46px] h-[46px] rounded-full bg-[#25D366] text-white font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-transform"
      >
        <MessageCircle size={16} fill="currentColor" />
        <span>{t.mobileBar.whatsapp}</span>
      </a>
    </div>
  );
};

export default MobileBottomBar;
