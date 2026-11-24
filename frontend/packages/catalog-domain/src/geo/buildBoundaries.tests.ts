import { buildBoundaries, type SourceMunicipality } from './buildBoundaries.ts';

const ring = (x: number, y: number) => [
  [x, y],
  [x + 0.123456, y],
  [x + 0.123456, y],
  [x + 0.123456, y + 0.1],
  [x, y + 0.1],
  [x, y],
];

const source: SourceMunicipality[] = [
  { ufSigla: 'RJ', municipioCodigo: '3303302', municipioNome: 'Niterói', poligono: { type: 'MultiPolygon', coordinates: [[ring(-43.1, -22.95)]] } },
  { ufSigla: 'RJ', municipioCodigo: '3300100', municipioNome: 'Angra dos Reis', poligono: { type: 'MultiPolygon', coordinates: [[ring(-44.4, -23)]] } },
  { ufSigla: 'SP', municipioCodigo: '3550308', municipioNome: 'São Paulo', poligono: { type: 'MultiPolygon', coordinates: [[ring(-43.1, -22.9)]] } },
];

describe('buildBoundaries', () => {
  it('keeps the RJ municipalities inside the view, slugged, rounded and without repeated points', () => {
    const result = buildBoundaries(source);
    expect(result.municipalities.map(({ ibgeCode, slug }) => ({ ibgeCode, slug }))).toEqual([
      { ibgeCode: '3303302', slug: 'niteroi' },
    ]);
    expect(result.municipalities[0]!.geometry[0]![0]).toEqual([
      [-43.1, -22.95],
      [-42.9765, -22.95],
      [-42.9765, -22.85],
      [-43.1, -22.85],
      [-43.1, -22.95],
    ]);
    expect(result.source.note).toMatch(/Provisório/);
  });
});
