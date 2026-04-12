import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enLocales from './locales/en.json';
import trLocales from './locales/tr.json';

const resources = {
  en: { translation: enLocales },
  tr: { translation: trLocales },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    lng: 'tr', // Default to Turkish
    interpolation: {
      escapeValue: false, // React already safe from xss
    },
  });

export default i18n;
