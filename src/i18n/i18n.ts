import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from './locales/en/translation.json';
import translationLO from './locales/lo/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  lo: {
    translation: translationLO,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  }).then(() => {
    // Set the lang attribute immediately after initialization
    document.documentElement.setAttribute('lang', i18n.language);
  });

// Add listener for language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
