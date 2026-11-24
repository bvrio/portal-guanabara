import { importCatalog } from '../importer/importCatalog.ts';
import { projectRow, studyRow, workbookFixture } from '../testing/workbookFixture.ts';

import type { BaySectorZones } from '../model/baySectors.ts';
import type { MunicipalityBoundaries } from '../model/boundaries.ts';

import { getCatalogReader } from './catalogReader.ts';
import { createCatalogReader } from './createCatalogReader.ts';

const snapshot = importCatalog(
  workbookFixture([
    projectRow(),
    projectRow({
      id: 3,
      name: 'Limpeza de Jurujuba',
      municipality: 'Niterói',
      sector: 'Não confirmado',
      locality: 'Jurujuba',
      status: 'Encerrada',
      endDate: '2023-08-DD',
      startDate: '2023-02-DD',
      mechanism: 'Limpeza, Educativa',
      executingInstitutions: 'Prefeitura de Niterói',
      executors: 'não encontrado',
      coordinator: 'não encontrado',
    }),
    studyRow(),
    studyRow({ id: 4, name: 'Second study', publicationYear: '2024', municipality: 'Não confirmado', locality: 'sem informação' }),
  ]),
  { importedAt: '2026-11-22T12:00:00.000Z', includePersons: true },
).snapshot!;

const reader = createCatalogReader(snapshot, { today: new Date('2026-11-22T12:00:00Z') });

describe('createCatalogReader — overview', () => {
  it('summarizes totals, distributions and unknowns', () => {
    const overview = reader.getOverview();

    expect(overview.totals).toEqual({
      entries: 4,
      projects: 2,
      studies: 2,
      activeProjects: 1,
      institutions: 6,
      municipalities: 2,
    });
    // Every bucket is split by kind (v0.8): count = projects + studies.
    expect(overview.distributions.municipalities).toEqual([
      { code: 'niteroi', label: 'Niterói', count: 2, projects: 1, studies: 1 },
      { code: 'rio-de-janeiro', label: 'Rio de Janeiro', count: 1, projects: 1, studies: 0 },
    ]);
    // Mechanisms count projects only; unknown is never a bucket (D-032).
    expect(overview.distributions.mechanisms[0]).toEqual({ code: 'limpeza', label: 'Limpeza', count: 2, projects: 2, studies: 0 });
    for (const bucket of overview.distributions.keywords) expect(bucket.projects + bucket.studies).toBe(bucket.count);
    expect(overview.unknown).toEqual({ keywords: 0, municipalities: 1, sectors: 1, mechanisms: 0 });
  });

  it('highlights ongoing initiatives and the latest studies', () => {
    const { highlights } = reader.getOverview();
    expect(highlights.ongoingProjects.map((entry) => entry.ref)).toEqual([1]);
    expect(highlights.recentStudies.map((entry) => entry.ref)).toEqual([4, 2]);
  });
});

describe('createCatalogReader — list', () => {
  it('filters, sorts and paginates', () => {
    const result = reader.listEntries({ kind: 'project', sort: 'name' });
    expect(result.items.map((entry) => entry.name)).toEqual(['Limpeza de Jurujuba', 'Pescando Resíduos']);
    expect(result.total).toBe(2);

    const paged = reader.listEntries({ pageSize: 3, page: 2 });
    expect(paged).toMatchObject({ total: 4, page: 2, pageCount: 2 });
    expect(paged.items).toHaveLength(1);
  });

  it('lists the bay sectors of each entry by slug', () => {
    const items = reader.listEntries({ sort: 'name' }).items;
    const project = items.find((entry) => entry.ref === 1);
    const unconfirmed = items.find((entry) => entry.ref === 3);

    expect(project?.sectors.length).toBeGreaterThan(0);
    for (const sector of project?.sectors ?? []) expect(sector.code).toMatch(/^[a-z-]+$/);
    expect(unconfirmed?.sectors).toEqual([]);
  });

  it('filters by confirmed status and offers only statuses that exist', () => {
    const all = reader.listEntries();
    expect(all.facets.statuses.map((bucket) => bucket.code)).toEqual(
      expect.arrayContaining(all.facets.statuses.filter((bucket) => bucket.count > 0).map((bucket) => bucket.code)),
    );
    for (const bucket of all.facets.statuses) expect(bucket.count).toBeGreaterThan(0);

    const ended = reader.listEntries({ status: 'ended' });
    expect(ended.query.status).toBe('ended');
    expect(ended.items.map((entry) => entry.ref)).toEqual([3]);
    expect(ended.items.every((entry) => entry.status === 'ended')).toBe(true);

    expect(reader.listEntries({ status: 'unknown' as never }).query.status).toBeUndefined();
  });

  it('filters by period: activity overlapping the months asked, never entries without dates', () => {
    const result = reader.listEntries({ from: '2023-01', to: '2023-12' });
    expect(result.items.map((entry) => entry.ref)).toContain(3);
    expect(result.items.every((entry) => entry.start !== null)).toBe(true);

    // Reversed bounds are swapped, malformed ones dropped.
    expect(reader.listEntries({ from: '2023-12', to: '2023-01' }).query).toMatchObject({ from: '2023-01', to: '2023-12' });
    expect(reader.listEntries({ from: '2023-13' }).query.from).toBeUndefined();

    // An ongoing entry reaches "today"; nothing reaches the far future otherwise.
    const future = reader.listEntries({ from: '2026-11' }).items;
    expect(future.every((entry) => entry.ongoing)).toBe(true);

    const { first, last } = reader.listEntries().facets.period;
    expect(first && last && first <= last).toBe(true);
  });

  it('searches without accents or case', () => {
    expect(reader.listEntries({ q: 'PESCANDO RESIDUOS' }).items.map((entry) => entry.ref)).toEqual([1]);
    expect(reader.listEntries({ q: 'niteroi limpeza' }).items.map((entry) => entry.ref)).toEqual([3]);
  });

  it('drops unknown filter values instead of failing', () => {
    const result = reader.listEntries({ keyword: 'nope', municipality: 'atlantis', page: 99 });
    expect(result.query).toEqual({ sort: 'recent', page: 1, pageSize: 12 });
    expect(result.total).toBe(4);
  });

  it('counts each facet against the other active filters', () => {
    const { facets } = reader.listEntries({ municipality: 'niteroi' });
    expect(facets.kinds).toEqual([
      { code: 'project', label: 'project', count: 1 },
      { code: 'study', label: 'study', count: 1 },
    ]);
    // The municipality facet ignores its own filter, so every option stays visible.
    expect(facets.municipalities.map((bucket) => bucket.code)).toEqual(['niteroi', 'rio-de-janeiro']);
  });
});

describe('createCatalogReader — institutions', () => {
  it('lists every institution with its entries per kind and role, most entries first', () => {
    const result = reader.listInstitutions();
    expect(result.total).toBe(6);
    expect(result.items[0]).toEqual({
      code: 'cnpq',
      name: 'CNPq',
      type: null,
      entries: 4,
      projects: 2,
      studies: 2,
      roles: [{ role: 'funder', count: 4 }],
    });
    expect(result.items.find((item) => item.code === 'prefeitura-de-niteroi')?.type).toEqual({
      code: 'terceiro-setor',
      label: 'Terceiro setor',
    });
    expect(result.facets.unknownTypes).toBe(5);
  });

  it('filters by kind, role, type and name, and counts facets against the other filters', () => {
    expect(reader.listInstitutions({ kind: 'study', role: 'author' }).items.map((item) => item.code)).toEqual(['uff', 'ufrj']);
    expect(reader.listInstitutions({ type: 'terceiro-setor' }).items.map((item) => item.code)).toEqual(['prefeitura-de-niteroi']);
    expect(reader.listInstitutions({ q: 'niteroi' }).items.map((item) => item.name)).toEqual(['Prefeitura de Niterói']);

    const { facets } = reader.listInstitutions({ role: 'author' });
    expect(facets.kinds).toEqual([
      { code: 'project', label: 'project', count: 0 },
      { code: 'study', label: 'study', count: 2 },
    ]);
    // "Todos" counts each institution once, whichever kinds it works in.
    expect(facets.allKinds).toBe(2);
    const all = reader.listInstitutions();
    expect(all.facets.allKinds).toBe(all.total);
    expect(all.facets.allKinds).toBeLessThanOrEqual(all.facets.kinds.reduce((sum, bucket) => sum + bucket.count, 0));
    // The role facet ignores its own filter.
    expect(facets.roles.map((bucket) => bucket.code)).toEqual(['executor', 'funder', 'author']);
  });

  it('sorts by name and drops unknown filter values', () => {
    const result = reader.listInstitutions({ sort: 'name', role: 'coordinator' as never, type: 'nope' });
    expect(result.query).toEqual({ sort: 'name', page: 1, pageSize: 12 });
    expect(result.items[0]?.name).toBe('CNPq');
  });

  it('filters entries by institution, in any role, with a facet of institutions', () => {
    expect(reader.listEntries({ institution: 'uff' }).items.map((item) => item.ref)).toEqual([2, 4]);
    const { facets, query } = reader.listEntries({ institution: 'cnpq' });
    expect(query.institution).toBe('cnpq');
    expect(facets.institutions.slice(0, 3)).toEqual([
      { code: 'cnpq', label: 'CNPq', count: 4 },
      { code: 'uff', label: 'UFF', count: 2 },
      { code: 'ufrj', label: 'UFRJ', count: 2 },
    ]);
    expect(reader.listEntries({ institution: 'unknown' }).query.institution).toBeUndefined();
  });
});

describe('createCatalogReader — details', () => {
  it('groups places and parties and labels references', () => {
    const entry = reader.getEntry(1, { includePersons: true })!;
    expect(entry.places.map((group) => group.type)).toEqual(['sector', 'municipality', 'locality', 'fishing_colony']);
    expect(entry.parties.map((group) => group.role)).toEqual(['executor', 'funder', 'coordinator']);
    expect(entry.mechanisms).toEqual([
      { code: 'transacional', label: 'Transacional' },
      { code: 'limpeza', label: 'Limpeza' },
    ]);
    expect(entry.detailNotes[0]).toEqual({ label: 'Local', text: 'Ilha do Governador' });
    expect(entry.personsHidden).toBe(false);
  });

  it('leaves person names out unless asked (LGPD flag)', () => {
    const entry = reader.getEntry(2)!;
    const authors = entry.parties.find((group) => group.role === 'author')!;
    expect(authors.parties.map((party) => party.kind)).toEqual(['institution', 'institution']);
    expect(entry.personsHidden).toBe(true);
  });

  it('returns null for unknown or retired IDs', () => {
    expect(reader.getEntry(404)).toBeNull();
  });
});

describe('published snapshot', () => {
  it('loads and answers every read', () => {
    const published = getCatalogReader();
    const overview = published.getOverview();
    expect(overview.totals.entries).toBeGreaterThan(0);
    expect(overview.totals.projects + overview.totals.studies).toBe(overview.totals.entries);

    const first = published.listEntries({ pageSize: 1 }).items[0]!;
    expect(published.getEntry(first.ref)?.name).toBe(first.name);

    const institutions = published.listInstitutions({ pageSize: 48 });
    expect(institutions.total).toBe(overview.totals.institutions);
    const top = institutions.items[0]!;
    expect(published.listEntries({ institution: top.code }).total).toBe(top.entries);
  });
});

describe('createCatalogReader — map', () => {
  const square = (x: number, y: number) => [[[[x, y], [x + 0.1, y], [x + 0.1, y + 0.1], [x, y + 0.1], [x, y]]]] as const;
  const boundaries: MunicipalityBoundaries = {
    schemaVersion: 1,
    source: { name: 'Fixture', url: 'https://example.org', note: 'Test' },
    view: { west: -43.5, south: -23, east: -42.8, north: -22.5 },
    municipalities: [
      { ibgeCode: '3302502', name: 'Magé', slug: 'mage', geometry: square(-43.1, -22.6) },
      { ibgeCode: '3304557', name: 'Rio de Janeiro', slug: 'rio-de-janeiro', geometry: square(-43.4, -22.9) },
      { ibgeCode: '3303302', name: 'Niterói', slug: 'niteroi', geometry: square(-43.1, -22.9) },
    ],
  };
  const sectors: BaySectorZones = {
    schemaVersion: 1,
    source: { name: 'Fixture', note: 'Test' },
    sectors: [
      { slug: 'interior', geometry: square(-43.2, -22.8), label: [-43.15, -22.75] },
      { slug: 'baia-inteira', geometry: null, label: null },
      { slug: 'entrada', geometry: square(-43.2, -22.95), label: [-43.15, -22.9] },
    ],
  };
  const withMap = createCatalogReader(snapshot, { today: new Date('2026-11-22T12:00:00Z'), boundaries, sectors });

  it('counts entries per municipality, busiest first, with the neighbours after', () => {
    const map = withMap.getMap();
    expect(map.municipalities.map(({ code, entries, projects, studies }) => ({ code, entries, projects, studies }))).toEqual([
      { code: 'niteroi', entries: 2, projects: 1, studies: 1 },
      { code: 'rio-de-janeiro', entries: 1, projects: 1, studies: 0 },
      { code: 'mage', entries: 0, projects: 0, studies: 0 },
    ]);
    expect(map.unknown).toBe(1);
    expect(map.view).toEqual(boundaries.view);
    expect(map.source).toMatchObject({ name: 'Fixture', provisional: true });
  });

  it('agrees with the municipality filter of the list', () => {
    // Neighbours the catalog does not know are not a filter at all.
    for (const municipality of withMap.getMap().municipalities.filter((item) => item.entries > 0)) {
      expect(withMap.listEntries({ municipality: municipality.code }).total).toBe(municipality.entries);
    }
  });

  it('counts entries per bay sector in the order of the zones, with their zones', () => {
    const map = withMap.getMap();
    expect(map.sectors.map(({ code, entries, projects, studies }) => ({ code, entries, projects, studies }))).toEqual([
      { code: 'interior', entries: 1, projects: 1, studies: 0 },
      { code: 'entrada', entries: 2, projects: 0, studies: 2 },
    ]);
    expect(map.sectors[0]).toMatchObject({ name: 'Interior', label: [-43.15, -22.75] });
    expect(map.sectors[0]!.geometry).toEqual(sectors.sectors[0]!.geometry);
    expect(map.unknownSectors).toBe(1);
    for (const sector of map.sectors) expect(withMap.listEntries({ sector: sector.code }).total).toBe(sector.entries);
  });

  it('is empty without boundaries, and lists sectors without zones', () => {
    expect(reader.getMap().municipalities).toEqual([]);
    expect(reader.getMap().sectors.every((sector) => sector.geometry === null && sector.label === null)).toBe(true);
  });
});

describe('published map', () => {
  it('draws the bay sectors: four zones in the water, the whole bay listed only', () => {
    const map = getCatalogReader().getMap();
    expect(map.sectors.map((sector) => sector.code)).toEqual(['interior', 'transicao', 'entrada', 'baia-inteira', 'fora-da-baia']);
    expect(map.sectors.filter((sector) => sector.geometry).map((sector) => sector.code)).toEqual([
      'interior',
      'transicao',
      'entrada',
      'fora-da-baia',
    ]);
    const overview = getCatalogReader().getOverview();
    for (const sector of map.sectors) {
      expect(sector.entries).toBe(overview.distributions.sectors.find((bucket) => bucket.code === sector.code)?.count ?? 0);
    }
  });

  it('draws the eight catalog municipalities among their neighbours', () => {
    const map = getCatalogReader().getMap();
    const active = map.municipalities.filter((municipality) => municipality.entries > 0);
    expect(active).toHaveLength(getCatalogReader().getOverview().totals.municipalities);
    expect(map.municipalities.length).toBeGreaterThan(active.length);
    for (const municipality of active) {
      expect(municipality.ibgeCode).toMatch(/^33\d{5}$/);
      expect(municipality.geometry.length).toBeGreaterThan(0);
    }
  });
});

describe('published snapshot — languages', () => {
  it('translates controlled vocabularies and keeps proper names', () => {
    const portuguese = getCatalogReader('pt-BR').getOverview();
    const english = getCatalogReader('en').getOverview();
    expect(english.distributions.keywords.find((bucket) => bucket.code === 'macrolixo')?.label).toBe('Macro-litter');
    expect(english.distributions.sectors.find((bucket) => bucket.code === 'interior')?.label).toBe('Inner bay');
    expect(english.distributions.municipalities).toEqual(portuguese.distributions.municipalities);
    expect(english.highlights.ongoingProjects.map((entry) => entry.name)).toEqual(
      portuguese.highlights.ongoingProjects.map((entry) => entry.name),
    );
    expect(getCatalogReader('fr')).toBe(getCatalogReader('fr'));
  });
});
