import { negotiateCatalogLocale, toCatalogLocale } from './catalogLocale.ts';

describe('catalog locale', () => {
  it('maps language tags to the supported languages', () => {
    expect(toCatalogLocale('en-US')).toBe('en');
    expect(toCatalogLocale('pt')).toBe('pt-BR');
    expect(toCatalogLocale('pt-PT')).toBe('pt-BR');
    expect(toCatalogLocale('FR')).toBe('fr');
    expect(toCatalogLocale('de')).toBeUndefined();
    expect(toCatalogLocale(undefined)).toBeUndefined();
  });

  it('negotiates Accept-Language by preference, Portuguese by default', () => {
    expect(negotiateCatalogLocale('es-AR,es;q=0.9,en;q=0.8')).toBe('es');
    expect(negotiateCatalogLocale('de-DE,fr;q=0.5,en;q=0.7')).toBe('en');
    expect(negotiateCatalogLocale('de, *;q=0.1')).toBe('pt-BR');
    expect(negotiateCatalogLocale('en;q=0, fr')).toBe('fr');
    expect(negotiateCatalogLocale(undefined)).toBe('pt-BR');
  });
});
