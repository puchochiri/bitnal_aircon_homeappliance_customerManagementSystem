export const defaultLocale = 'ko' as const
export const supportedLocales = ['ko', 'en'] as const
export type Locale = (typeof supportedLocales)[number]

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
}
