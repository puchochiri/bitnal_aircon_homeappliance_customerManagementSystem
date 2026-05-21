'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { defaultLocale, supportedLocales } from './config'

import koCommon from './locales/ko/common.json'
import enCommon from './locales/en/common.json'

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        ko: { common: koCommon },
        en: { common: enCommon },
      },
      defaultNS: 'common',
      fallbackLng: defaultLocale,
      supportedLngs: [...supportedLocales],
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'bitnal_lang',
      },
    })
}

export default i18n
