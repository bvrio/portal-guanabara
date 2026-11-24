import { shallowRef } from 'vue';

import { useCookie, useHead } from '#imports';

import {
  type AppLocale,
  appLocales,
  LOCALE_COOKIE,
  loadLocaleMessages,
  type LocaleMessages,
  localeState,
  toAppLocale,
} from '~/lib/i18n';

/**
 * The visitor's language (v0.7): Português (default), English, Español or
 * Français, chosen in the header and kept in a cookie so the server renders in
 * it. Sets `<html lang>`; `ready` resolves once the language's messages are
 * loaded (the root awaits it before rendering, on the server and on hydration).
 */
export function useLocale() {
  const cookie = useCookie<string | undefined>(LOCALE_COOKIE, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/' });
  const locale = localeState();
  const messages = shallowRef<LocaleMessages>({});

  const ready = loadLocaleMessages(locale.value).then((loaded) => {
    messages.value = loaded;
  });

  useHead({ htmlAttrs: { lang: () => locale.value } });

  /** Loads the new language first, so the page never shows missing copy. */
  async function setLocale(next: string) {
    const target: AppLocale = toAppLocale(next);
    if (target === locale.value) return;
    messages.value = await loadLocaleMessages(target);
    cookie.value = target;
    locale.value = target;
  }

  return { locale, locales: appLocales, messages, ready, setLocale };
}
