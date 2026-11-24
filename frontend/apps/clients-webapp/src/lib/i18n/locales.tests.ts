import { describe, expect, it } from 'vitest';

import { appLocales, defaultLocale, loadLocaleMessages, localeNames, toAppLocale } from './locales';

describe('app locales', () => {
  it('offers Portuguese, English, Spanish and French, Portuguese first', () => {
    expect(appLocales).toEqual(['pt-BR', 'en', 'es', 'fr']);
    expect(defaultLocale).toBe('pt-BR');
    expect(localeNames.es).toBe('Español');
  });

  it('falls back to Portuguese for anything unknown', () => {
    expect(toAppLocale('fr')).toBe('fr');
    expect(toAppLocale('de')).toBe('pt-BR');
    expect(toAppLocale(undefined)).toBe('pt-BR');
  });

  it('loads a catalog per language; Portuguese needs none', async () => {
    expect(await loadLocaleMessages('pt-BR')).toEqual({});
    const english = await loadLocaleMessages('en');
    expect(english['clients.app.nav.home']).toBe('Home');
  });
});
