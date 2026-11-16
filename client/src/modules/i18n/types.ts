export type Language = 'es' | 'en';

export interface I18nContextState {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}
