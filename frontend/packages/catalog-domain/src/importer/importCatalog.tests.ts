import { projectRow, studyRow, workbookFixture } from '../testing/workbookFixture.ts';

import { importCatalog } from './importCatalog.ts';
import { renderReportMarkdown } from './report.ts';

const options = { importedAt: '2026-11-22T12:00:00.000Z', includePersons: true };

function rulesOf(result: ReturnType<typeof importCatalog>) {
  return result.report.issues.map((issue) => `${issue.severity}:${issue.rule}`);
}

describe('importCatalog', () => {
  it('imports initiatives and studies with Core v2.0 shapes', () => {
    const { snapshot, report } = importCatalog(workbookFixture([projectRow(), studyRow()]), options);

    expect(report.ok).toBe(true);
    expect(report.entries).toEqual({ total: 2, projects: 1, studies: 1 });
    expect(snapshot).not.toBeNull();

    const [project, study] = snapshot!.entries;
    expect(project).toMatchObject({
      ref: 1,
      kind: 'project',
      status: 'active',
      ongoing: true,
      start: { date: '2021-12-01', precision: 'month' },
      end: null,
      periodicity: ['continuous'],
      mechanisms: ['transacional', 'limpeza'],
      keywords: ['macrolixo', 'manguezal'],
      places: ['sector:interior', 'municipality:rio-de-janeiro', 'locality:ilha-do-governador', 'fishing_colony:z-8'],
    });
    expect(project!.parties).toEqual([
      { party: 'institution:instituto-bvrio', role: 'executor', note: null },
      { party: 'institution:pescadores-artesanais', role: 'executor', note: null },
      { party: 'institution:cnpq', role: 'funder', note: null },
      { party: 'person:maria-silva', role: 'coordinator', note: 'coordenação do projeto' },
    ]);

    expect(study).toMatchObject({ ref: 2, kind: 'study', status: null, mechanisms: [], periodicity: ['one_off'] });
    // Executing institutions of a study are its authors' institutions.
    expect(study!.parties.filter((party) => party.role === 'author').map((party) => party.party)).toEqual([
      'institution:uff',
      'institution:ufrj',
      'person:alves-v-e-n',
      'person:figueiredo-g-m',
    ]);
  });

  it('stores placeholders as absences and counts them in the report', () => {
    const { snapshot, report } = importCatalog(
      workbookFixture([projectRow({ sector: 'Não confirmado', municipality: 'Não confirmado', startDate: 'não encontrado' })]),
      options,
    );

    expect(snapshot!.entries[0]!.places).toEqual(['locality:ilha-do-governador', 'fishing_colony:z-8']);
    expect(snapshot!.entries[0]!.start).toBeNull();
    expect(report.placeholders['Setor da Baía de Guanabara (lista)']).toEqual({ 'Não confirmado': 1 });
    expect(report.placeholders['Rios (lista)']).toEqual({ 'sem informação': 1 });
  });

  it('rejects the whole import when a rule breaks (D-044)', () => {
    const result = importCatalog(
      workbookFixture([
        projectRow(),
        projectRow({ name: 'Duplicate' }),
        studyRow({ id: 3, keywords: 'Plástico', startDate: '2019-13-DD' }),
      ]),
      options,
    );

    expect(result.snapshot).toBeNull();
    expect(result.report.ok).toBe(false);
    expect(rulesOf(result)).toEqual(
      expect.arrayContaining(['error:id.duplicate', 'error:list.unknown-value', 'error:date.invalid']),
    );
  });

  it('fails when a Geral column is missing', () => {
    const result = importCatalog(workbookFixture([projectRow()], { dropColumns: ['links'] }), options);
    expect(result.snapshot).toBeNull();
    expect(result.report.issues[0]).toMatchObject({ rule: 'header.missing-column', column: 'DOI ou link' });
  });

  it('warns about what the mapping team should look at', () => {
    const result = importCatalog(
      workbookFixture([
        projectRow({ periodicity: 'Contínua, Pontual', authors: 'Ferreira, J. A.' }),
        studyRow({
          links: 'https://a.org/1 ; https://a.org/2',
          coordinator: 'Renato Carreira (orientador)',
          sector: 'Entrada, Não confirmado',
        }),
      ]),
      options,
    );

    expect(result.report.ok).toBe(true);
    expect(rulesOf(result)).toEqual(
      expect.arrayContaining([
        'warning:kind.inferred',
        'warning:periodicity.multiple',
        'warning:parties.authors-on-project',
        'warning:kind.inconsistent',
        'warning:sources.unpaired-metadata',
        'warning:values.unconfirmed-mixed',
        'warning:parties.collective-label',
      ]),
    );
    // Authors on an initiative are not imported as parties.
    expect(result.snapshot!.entries[0]!.parties.some((party) => party.role === 'author')).toBe(false);
  });

  it('pairs source facts only when the entry has a single link', () => {
    const { snapshot } = importCatalog(
      workbookFixture([studyRow(), projectRow({ id: 5, links: 'https://a.org/1 ; https://a.org/2' })]),
      options,
    );
    const [paired, ...unpaired] = snapshot!.sources;
    expect(paired).toMatchObject({
      doi: '10.1016/j.marpolbul.2019.06.042',
      sourceType: 'artigo-cientifico',
      venue: 'Marine Pollution Bulletin',
      publishedYear: 2019,
    });
    expect(unpaired.every((source) => source.sourceType === null && source.publishedYear === null)).toBe(true);
  });

  it('types an institution only when the row leaves no doubt', () => {
    const { snapshot } = importCatalog(workbookFixture([projectRow(), studyRow()]), options);
    const byName = Object.fromEntries(snapshot!.parties.map((party) => [party.name, party]));
    // Project: two executing institutions, one type → ambiguous.
    expect(byName['Instituto BVRio']).toMatchObject({ kind: 'institution', institutionType: null });

    const single = importCatalog(workbookFixture([projectRow({ executors: 'não encontrado' })]), options).snapshot!;
    expect(single.parties.find((party) => party.name === 'Instituto BVRio')).toMatchObject({ institutionType: 'terceiro-setor' });
  });

  it('can leave person names out entirely', () => {
    const { snapshot } = importCatalog(workbookFixture([projectRow(), studyRow()]), { ...options, includePersons: false });
    expect(snapshot!.parties.some((party) => party.kind === 'person')).toBe(false);
    expect(snapshot!.importRun.includesPersons).toBe(false);
  });

  it('reports IDs added and retired since the previous import (D-047)', () => {
    const previous = importCatalog(workbookFixture([projectRow(), studyRow()]), options).snapshot;
    const { report } = importCatalog(workbookFixture([projectRow(), studyRow({ id: 9 })]), { ...options, previous });
    expect(report.comparedWithPrevious).toEqual({ added: [9], removed: [2] });
  });

  it('renders a readable markdown report', () => {
    const { report } = importCatalog(workbookFixture([projectRow(), studyRow()]), options);
    const markdown = renderReportMarkdown(report);
    expect(markdown).toContain('# Catalog import report');
    expect(markdown).toContain('Entries: 2 (1 initiatives, 1 studies)');
    expect(markdown).toContain('`kind.inferred`');
  });
});
