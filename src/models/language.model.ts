export const SUPPORTED_LANGUAGES = [
  'fr',
  'en',
  'es',
  'de',
  'it',
  'pt',
  'nl',
  'pl',
  'ru',
  'ja',
  'zh',
  'ar',
  'hi',
  'tr',
  'ko'
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  ru: 'Русский',
  ja: '日本語',
  zh: '中文',
  ar: 'العربية',
  hi: 'हिन्दी',
  tr: 'Türkçe',
  ko: '한국어'
};