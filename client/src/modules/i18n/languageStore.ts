import { create } from 'zustand';
import { Language, I18nContextState } from './types';
import { translations, Translations } from './translations';

const STORAGE_KEY = 'teacherivan_lang';

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'es') {
      return saved;
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  // Default to Spanish (ES) as requested
  return 'es';
}

interface LanguageStoreState extends I18nContextState {
  translations: Translations;
}

export const useLanguageStore = create<LanguageStoreState>((set, get) => ({
  lang: getInitialLanguage(),
  translations: translations[getInitialLanguage()],

  setLang: (newLang: Language) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Ignore
    }
    set({
      lang: newLang,
      translations: translations[newLang],
    });
  },

  toggleLang: () => {
    const nextLang: Language = get().lang === 'es' ? 'en' : 'es';
    get().setLang(nextLang);
  },
}));

/**
 * Universal hook to access translations and language controls
 */
export function useTranslation() {
  const lang = useLanguageStore((s) => s.lang);
  const t = useLanguageStore((s) => s.translations);
  const setLang = useLanguageStore((s) => s.setLang);
  const toggleLang = useLanguageStore((s) => s.toggleLang);

  return {
    lang,
    t,
    setLang,
    toggleLang,
    isEs: lang === 'es',
    isEn: lang === 'en',
  };
}
