import type { FlagCountry } from '@portal-guanabara/presentation-lake';

/**
 * Languages of the portal (v0.7). Portuguese is the source: its copy is the
 * `defaultMessage` of each descriptor; the others are translation catalogs in
 * `locales/<locale>.json`, checked by `pnpm i18n:check`.
 */
export const appLocales = ['pt-BR', 'en', 'es', 'fr'] as const;
export type AppLocale = (typeof appLocales)[number];
export const defaultLocale: AppLocale = 'pt-BR';

/** Cookie holding the visitor's choice (the server renders in that language). */
export const LOCALE_COOKIE = 'pg_locale';

/** Each language named in itself — never translated. */
export const localeNames: Readonly<Record<AppLocale, string>> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

/** Short tag shown on the header button. */
export const localeShortNames: Readonly<Record<AppLocale, string>> = { 'pt-BR': 'PT', en: 'EN', es: 'ES', fr: 'FR' };

/**
 * The flag drawn beside each language in the header's Opções and the phone
 * menu (v0.9.17): Brazil, the United Kingdom, Spain and France.
 */
export const localeFlags: Readonly<Record<AppLocale, FlagCountry>> = { 'pt-BR': 'br', en: 'gb', es: 'es', fr: 'fr' };

export function toAppLocale(value: unknown): AppLocale {
  return appLocales.find((locale) => locale === value) ?? defaultLocale;
}

export type LocaleMessages = Readonly<Record<string, string>>;

/** Translation catalogs, split per language so a visitor downloads only theirs. */
const catalogs: Readonly<Record<Exclude<AppLocale, 'pt-BR'>, () => Promise<{ default: LocaleMessages }>>> = {
  en: () => import('../../../locales/en.json'),
  es: () => import('../../../locales/es.json'),
  fr: () => import('../../../locales/fr.json'),
};

/** Messages for `createIntl`; Portuguese needs none (descriptors carry it). */
export async function loadLocaleMessages(locale: AppLocale): Promise<LocaleMessages> {
  if (locale === 'pt-BR') return {};
  return (await catalogs[locale]()).default;
}
