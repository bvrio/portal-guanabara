import {
  isBefore,
  parseLinks,
  parsePartialDate,
  parsePersonMentions,
  parseYears,
  placeholderKind,
  slugify,
  splitCell,
  splitDetailLines,
} from './parsers.ts';

describe('placeholders (D-032)', () => {
  it('classifies the workbook placeholders, case-insensitively', () => {
    expect(placeholderKind('não se aplica')).toBe('not_applicable');
    expect(placeholderKind('não encontrado')).toBe('not_found');
    expect(placeholderKind('sem informação')).toBe('not_found');
    expect(placeholderKind('Não confirmado')).toBe('unconfirmed');
    expect(placeholderKind('Unidade não confirmada')).toBe('unconfirmed');
    expect(placeholderKind('Macrolixo')).toBeNull();
  });

  it('separates real values from placeholders and drops duplicates', () => {
    expect(splitCell('Transição, Interior, Não confirmado, Interior')).toEqual({
      values: ['Transição', 'Interior'],
      placeholders: ['Não confirmado'],
    });
  });
});

describe('partial dates (D-033)', () => {
  it('keeps the precision the workbook knows', () => {
    expect(parsePartialDate('2016-01-21')).toEqual({
      kind: 'date',
      value: { date: '2016-01-21', precision: 'day' },
      annotation: null,
    });
    expect(parsePartialDate('2021-12-DD')).toEqual({
      kind: 'date',
      value: { date: '2021-12-01', precision: 'month' },
      annotation: null,
    });
    expect(parsePartialDate('2022-MM-DD')).toEqual({
      kind: 'date',
      value: { date: '2022-01-01', precision: 'year' },
      annotation: null,
    });
  });

  it('reads ongoing, placeholders, annotations and invalid dates', () => {
    expect(parsePartialDate('em curso')).toEqual({ kind: 'ongoing' });
    expect(parsePartialDate('não encontrado')).toEqual({ kind: 'placeholder', placeholder: 'not_found' });
    expect(parsePartialDate('2008-04 (período simulado)')).toMatchObject({
      kind: 'date',
      value: { precision: 'month' },
      annotation: 'período simulado',
    });
    expect(parsePartialDate('2023-02-30')).toEqual({ kind: 'invalid' });
    expect(parsePartialDate('março de 2020')).toEqual({ kind: 'invalid' });
    expect(parsePartialDate('')).toEqual({ kind: 'empty' });
  });

  it('compares dates only as precisely as the coarser one', () => {
    const month = { date: '2017-03-01', precision: 'month' } as const;
    expect(isBefore({ date: '2017-03-21', precision: 'day' }, month)).toBe(false);
    expect(isBefore({ date: '2017-02-28', precision: 'day' }, month)).toBe(true);
  });
});

describe('people, links and years', () => {
  it('splits person mentions and their context', () => {
    expect(parsePersonMentions('Rodrigo Gaião (coordenação); Pedro Belga (biólogo)').mentions).toEqual([
      { name: 'Rodrigo Gaião', note: 'coordenação' },
      { name: 'Pedro Belga', note: 'biólogo' },
    ]);
    expect(parsePersonMentions('não encontrado')).toEqual({ mentions: [], placeholders: ['não encontrado'] });
  });

  it('reads links with notes and DOIs, keeping semicolons inside notes', () => {
    const { links, invalid } = parseLinks(
      'https://doi.org/10.1016/j.marpolbul.2018.12.042 ; https://example.org/a.pdf (versão 1; não verificado)',
    );
    expect(invalid).toEqual([]);
    expect(links).toEqual([
      { url: 'https://doi.org/10.1016/j.marpolbul.2018.12.042', doi: '10.1016/j.marpolbul.2018.12.042', note: null },
      { url: 'https://example.org/a.pdf', doi: null, note: 'versão 1; não verificado' },
    ]);
    expect(parseLinks('ver site').invalid).toEqual(['ver site']);
  });

  it('reads publication years', () => {
    expect(parseYears('2024, 2025, 2026').years).toEqual([2024, 2025, 2026]);
    expect(parseYears('não encontrado').years).toEqual([]);
  });

  it('slugifies Portuguese names', () => {
    expect(slugify("Espelho d'água")).toBe('espelho-d-agua');
    expect(slugify('São Gonçalo')).toBe('sao-goncalo');
  });

  it('splits labelled detail lines', () => {
    expect(splitDetailLines('Local: Fundão\nTexto livre')).toEqual([
      { label: 'Local', text: 'Fundão' },
      { label: null, text: 'Texto livre' },
    ]);
  });
});
