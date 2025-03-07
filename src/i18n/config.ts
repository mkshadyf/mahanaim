import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import fr from './fr.json';

// Get stored language preference or use browser language with French fallback
const getInitialLanguage = (): string => {
  const storedLanguage = localStorage.getItem('preferredLanguage');
  if (storedLanguage) {
    return storedLanguage;
  }

  // Check browser language but default to French
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'en' ? 'en' : 'fr';
};

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    fr: {
      translation: fr,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'fr', // French as fallback
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  document.documentElement.lang = lng;
});

export default i18n;
