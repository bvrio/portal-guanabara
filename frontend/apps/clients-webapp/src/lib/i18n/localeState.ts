import type { Ref } from 'vue';

import { useCookie, useState } from '#imports';

import { type AppLocale, LOCALE_COOKIE, toAppLocale } from './locales';

/**
 * The visitor's language for this request/session, read once from the cookie.
 * Not a Hook (lib helpers are not named `use*`): the HTTP transport and Hooks
 * read it to send `Accept-Language` and key their data by language.
 * Call it synchronously inside a Nuxt context (setup or an async-data handler).
 */
export function localeState(): Ref<AppLocale> {
  return useState<AppLocale>('pg:locale', () => toAppLocale(useCookie<string | undefined>(LOCALE_COOKIE).value));
}
