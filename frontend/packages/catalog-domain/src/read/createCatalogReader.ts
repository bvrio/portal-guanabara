import type {
  CatalogBucket,
  CatalogEntryDetails,
  CatalogEntrySummary,
  CatalogInstitutionListResult,
  CatalogInstitutionQuery,
  CatalogInstitutionRole,
  CatalogInstitutionSummary,
  CatalogLabeled,
  CatalogListQuery,
  CatalogListResult,
  CatalogMap,
  CatalogKindBucket,
  CatalogMapMunicipality,
  CatalogMapSector,
  CatalogOverview,
  CatalogPartyGroup,
  CatalogPlaceGroup,
  NormalizedCatalogInstitutionQuery,
  NormalizedCatalogListQuery,
} from '../contracts/index.ts';
import { searchable, splitDetailLines } from '../importer/parsers.ts';
import type { BaySectorZones } from '../model/baySectors.ts';
import type { MunicipalityBoundaries } from '../model/boundaries.ts';
import {
  CATALOG_SNAPSHOT_SCHEMA_VERSION,
  type CatalogSnapshot,
  type EntryStatus,
  type PartialDate,
  PARTY_ROLES,
  PLACE_TYPES,
  type PlaceType,
  type ReferenceItem,
  type SnapshotEntry,
} from '../model/snapshot.ts';

/** Read services of the Catalog Domain (Core v2.0: "the read services the webapp uses"). */
export interface CatalogReader {
  getOverview(): CatalogOverview;
  listEntries(query?: CatalogListQuery): CatalogListResult;
  /** Every institution in the catalog, with what it does and in how many entries. */
  listInstitutions(query?: CatalogInstitutionQuery): CatalogInstitutionListResult;
  /** Null when no entry has this workbook ID (unknown or retired, D-047). */
  getEntry(ref: number, options?: { includePersons?: boolean }): CatalogEntryDetails | null;
  /** The municipalities around the bay with their entries (needs `boundaries`). */
  getMap(): CatalogMap;
}

export interface CatalogReaderOptions {
  /** Sets "now" for ongoing entries in the period filter (tests pin it). */
  readonly today?: Date;
  /** Municipality outlines for the Map Journey; without them the map is empty. */
  readonly boundaries?: MunicipalityBoundaries;
  /** Bay sector zones for the Map Journey; without them sectors are listed but not drawn. */
  readonly sectors?: BaySectorZones;
}

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;
/** Highlights per kind (three on Início since v0.9.18). */
const HIGHLIGHTS = 3;
const MAX_QUERY_LENGTH = 100;

type Dimension = 'kind' | 'status' | 'period' | 'keyword' | 'municipality' | 'sector' | 'mechanism' | 'institution' | 'q';
type InstitutionDimension = 'kind' | 'role' | 'type' | 'q';
const INSTITUTION_ROLES: readonly CatalogInstitutionRole[] = ['executor', 'funder', 'partner', 'author'];
const INSTITUTION_PREFIX = 'institution:';

const STATUSES: readonly EntryStatus[] = ['active', 'in_implementation', 'ended', 'published', 'in_progress'];
const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** First month a partial date can mean. */
function firstMonth(date: PartialDate): string {
  return date.date.slice(0, 7);
}

/** Last month a partial date can mean (a year-only date covers December). */
function lastMonth(date: PartialDate): string {
  return date.precision === 'year' ? `${date.date.slice(0, 4)}-12` : date.date.slice(0, 7);
}

/** Months an entry covers: start → end, "now" while ongoing; null without a start. */
function activityOf(entry: SnapshotEntry, now: string): { from: string; to: string } | null {
  if (!entry.start) return null;
  const from = firstMonth(entry.start);
  const to = entry.end ? lastMonth(entry.end) : entry.ongoing ? now : lastMonth(entry.start);
  return { from, to: to < from ? from : to };
}

const compareNames = new Intl.Collator('pt-BR', { sensitivity: 'base' }).compare;

function byCountThenName(a: CatalogBucket, b: CatalogBucket) {
  return b.count - a.count || compareNames(a.label, b.label);
}

function startKey(entry: SnapshotEntry) {
  return entry.start?.date ?? '';
}

export function createCatalogReader(snapshot: CatalogSnapshot, options: CatalogReaderOptions = {}): CatalogReader {
  if (snapshot.schemaVersion !== CATALOG_SNAPSHOT_SCHEMA_VERSION) {
    throw new Error(`Unsupported catalog snapshot schemaVersion ${String(snapshot.schemaVersion)}`);
  }

  const index = <T extends { code: string }>(items: readonly T[]) => new Map(items.map((item) => [item.code, item]));
  const keywords = index(snapshot.keywords);
  const mechanisms = index(snapshot.mechanisms);
  const siteTypes = index(snapshot.siteTypes);
  const sourceTypes = index(snapshot.sourceTypes);
  const indicators = index(snapshot.indicators);
  const places = new Map(snapshot.places.map((place) => [place.id, place]));
  const parties = new Map(snapshot.parties.map((party) => [party.id, party]));
  const sources = new Map(snapshot.sources.map((source) => [source.id, source]));
  const entries = [...snapshot.entries];
  const entriesByRef = new Map(entries.map((entry) => [entry.ref, entry]));
  const now = () => (options.today ?? new Date()).toISOString().slice(0, 7);

  const labeled = (codes: readonly string[], items: Map<string, ReferenceItem>): CatalogLabeled[] =>
    codes.flatMap((code) => {
      const item = items.get(code);
      return item ? [{ code, label: item.name }] : [];
    });

  const placesOf = (entry: SnapshotEntry, type: PlaceType) =>
    entry.places.flatMap((id) => {
      const place = places.get(id);
      return place?.type === type ? [place] : [];
    });

  const searchText = new Map(
    entries.map((entry) => {
      const words = [
        entry.name,
        entry.objective ?? '',
        ...labeled(entry.keywords, keywords).map((item) => item.label),
        ...entry.places.map((id) => places.get(id)?.name ?? ''),
        ...entry.parties.flatMap(({ party }) => {
          const record = parties.get(party);
          return record?.kind === 'institution' ? [record.name] : [];
        }),
      ];
      return [entry.ref, searchable(words.join(' '))];
    }),
  );

  function summarize(entry: SnapshotEntry): CatalogEntrySummary {
    return {
      ref: entry.ref,
      kind: entry.kind,
      name: entry.name,
      objective: entry.objective,
      status: entry.status,
      start: entry.start,
      end: entry.end,
      ongoing: entry.ongoing,
      municipalities: placesOf(entry, 'municipality').map((place) => place.name),
      sectors: placesOf(entry, 'sector').map((place) => ({ code: place.slug, label: place.name })),
      keywords: labeled(entry.keywords, keywords),
      publicationYears: entry.publicationYears,
    };
  }

  function recentFirst(a: SnapshotEntry, b: SnapshotEntry) {
    return startKey(b).localeCompare(startKey(a)) || compareNames(a.name, b.name);
  }

  function countBy(
    subset: readonly SnapshotEntry[],
    codesOf: (entry: SnapshotEntry) => readonly string[],
    labelOf: (code: string) => string | undefined,
  ): CatalogBucket[] {
    const counts = new Map<string, number>();
    for (const entry of subset) {
      for (const code of new Set(codesOf(entry))) counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    return [...counts]
      .flatMap(([code, count]) => {
        const label = labelOf(code);
        return label ? [{ code, label, count }] : [];
      })
      .sort(byCountThenName);
  }

  /** `countBy`, split by kind: what Início draws as two-colour bars (v0.8). */
  function countByKind(
    subset: readonly SnapshotEntry[],
    codesOf: (entry: SnapshotEntry) => readonly string[],
    labelOf: (code: string) => string | undefined,
  ): CatalogKindBucket[] {
    const ofKind = countBy(
      subset.filter((entry) => entry.kind === 'project'),
      codesOf,
      labelOf,
    );
    const projects = new Map(ofKind.map((bucket) => [bucket.code, bucket.count]));
    return countBy(subset, codesOf, labelOf).map((bucket) => {
      const ofProjects = projects.get(bucket.code) ?? 0;
      return { ...bucket, projects: ofProjects, studies: bucket.count - ofProjects };
    });
  }

  const placeCodes = (type: PlaceType) => (entry: SnapshotEntry) => placesOf(entry, type).map((place) => place.slug);
  const placeLabel = (type: PlaceType) => (slug: string) => places.get(`${type}:${slug}`)?.name;
  const keywordCodes = (entry: SnapshotEntry) => entry.keywords;
  const mechanismCodes = (entry: SnapshotEntry) => entry.mechanisms;
  const institutionCodes = (entry: SnapshotEntry) =>
    entry.parties.flatMap(({ party }) => (party.startsWith(INSTITUTION_PREFIX) ? [party.slice(INSTITUTION_PREFIX.length)] : []));
  const institutionLabel = (slug: string) => {
    const party = parties.get(INSTITUTION_PREFIX + slug);
    return party?.kind === 'institution' ? party.name : undefined;
  };
  const institutionTypes = index(snapshot.institutionTypes);

  // ------------------------------------------------------------- overview
  function getOverview(): CatalogOverview {
    const projects = entries.filter((entry) => entry.kind === 'project');
    const studies = entries.filter((entry) => entry.kind === 'study');
    const institutions = new Set(
      entries.flatMap((entry) => entry.parties.map(({ party }) => party).filter((id) => parties.get(id)?.kind === 'institution')),
    );
    const municipalities = countByKind(entries, placeCodes('municipality'), placeLabel('municipality'));

    const latestYear = (entry: SnapshotEntry) => Math.max(0, ...entry.publicationYears);

    return {
      importedAt: snapshot.importRun.importedAt,
      totals: {
        entries: entries.length,
        projects: projects.length,
        studies: studies.length,
        activeProjects: projects.filter((entry) => entry.status === 'active').length,
        institutions: institutions.size,
        municipalities: municipalities.length,
      },
      distributions: {
        keywords: countByKind(entries, keywordCodes, (code) => keywords.get(code)?.name),
        municipalities,
        sectors: countByKind(entries, placeCodes('sector'), placeLabel('sector')),
        mechanisms: countByKind(projects, mechanismCodes, (code) => mechanisms.get(code)?.name),
      },
      unknown: {
        keywords: entries.filter((entry) => entry.keywords.length === 0).length,
        municipalities: entries.filter((entry) => placesOf(entry, 'municipality').length === 0).length,
        sectors: entries.filter((entry) => placesOf(entry, 'sector').length === 0).length,
        mechanisms: projects.filter((entry) => entry.mechanisms.length === 0).length,
      },
      highlights: {
        ongoingProjects: projects
          .filter((entry) => entry.ongoing || entry.status === 'active')
          .sort(recentFirst)
          .slice(0, HIGHLIGHTS)
          .map(summarize),
        recentStudies: [...studies]
          .sort((a, b) => latestYear(b) - latestYear(a) || recentFirst(a, b))
          .slice(0, HIGHLIGHTS)
          .map(summarize),
      },
    };
  }

  // ----------------------------------------------------------------- list
  function normalize(query: CatalogListQuery): NormalizedCatalogListQuery {
    const q = query.q?.trim().slice(0, MAX_QUERY_LENGTH);
    const pageSize = Math.min(Math.max(Math.trunc(query.pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    const normalized: { -readonly [K in keyof NormalizedCatalogListQuery]: NormalizedCatalogListQuery[K] } = {
      sort: query.sort === 'name' ? 'name' : 'recent',
      page: Math.max(Math.trunc(query.page ?? 1) || 1, 1),
      pageSize,
    };

    if (q) normalized.q = q;
    if (query.kind === 'project' || query.kind === 'study') normalized.kind = query.kind;
    if (query.status && STATUSES.includes(query.status)) normalized.status = query.status;
    if (query.from && MONTH.test(query.from)) normalized.from = query.from;
    if (query.to && MONTH.test(query.to)) normalized.to = query.to;
    if (normalized.from && normalized.to && normalized.from > normalized.to) {
      [normalized.from, normalized.to] = [normalized.to, normalized.from];
    }
    if (query.keyword && keywords.has(query.keyword)) normalized.keyword = query.keyword;
    if (query.municipality && places.has(`municipality:${query.municipality}`)) normalized.municipality = query.municipality;
    if (query.sector && places.has(`sector:${query.sector}`)) normalized.sector = query.sector;
    if (query.mechanism && mechanisms.has(query.mechanism)) normalized.mechanism = query.mechanism;
    if (query.institution && parties.get(INSTITUTION_PREFIX + query.institution)?.kind === 'institution') {
      normalized.institution = query.institution;
    }

    return normalized;
  }

  function matches(entry: SnapshotEntry, query: NormalizedCatalogListQuery, skip?: Dimension) {
    if (skip !== 'kind' && query.kind && entry.kind !== query.kind) return false;
    if (skip !== 'status' && query.status && entry.status !== query.status) return false;
    if (skip !== 'period' && (query.from || query.to)) {
      const activity = activityOf(entry, now());
      if (!activity) return false;
      if (query.to && activity.from > query.to) return false;
      if (query.from && activity.to < query.from) return false;
    }
    if (skip !== 'keyword' && query.keyword && !entry.keywords.includes(query.keyword)) return false;
    if (skip !== 'municipality' && query.municipality && !entry.places.includes(`municipality:${query.municipality}`)) return false;
    if (skip !== 'sector' && query.sector && !entry.places.includes(`sector:${query.sector}`)) return false;
    if (skip !== 'mechanism' && query.mechanism && !entry.mechanisms.includes(query.mechanism)) return false;
    if (skip !== 'institution' && query.institution) {
      const id = INSTITUTION_PREFIX + query.institution;
      if (!entry.parties.some(({ party }) => party === id)) return false;
    }
    if (skip !== 'q' && query.q) {
      const haystack = searchText.get(entry.ref) ?? '';
      if (!searchable(query.q).split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  }

  function listEntries(input: CatalogListQuery = {}): CatalogListResult {
    const query = normalize(input);
    const filtered = entries.filter((entry) => matches(entry, query));
    filtered.sort(query.sort === 'name' ? (a, b) => compareNames(a.name, b.name) : recentFirst);

    const total = filtered.length;
    const pageCount = Math.max(Math.ceil(total / query.pageSize), 1);
    const page = Math.min(query.page, pageCount);
    const offset = (page - 1) * query.pageSize;
    const facetSubset = (skip: Dimension) => entries.filter((entry) => matches(entry, query, skip));

    const kindCounts = countBy(facetSubset('kind'), (entry) => [entry.kind], (code) => code);
    const statusCounts = countBy(facetSubset('status'), (entry) => (entry.status ? [entry.status] : []), (code) => code);
    const months = entries.flatMap((entry) => {
      const activity = activityOf(entry, now());
      return activity ? [activity.from, activity.to] : [];
    });

    return {
      items: filtered.slice(offset, offset + query.pageSize).map(summarize),
      total,
      page,
      pageSize: query.pageSize,
      pageCount,
      query: { ...query, page },
      facets: {
        kinds: (['project', 'study'] as const).map((kind) => ({
          code: kind,
          label: kind,
          count: kindCounts.find((bucket) => bucket.code === kind)?.count ?? 0,
        })),
        statuses: STATUSES.flatMap((status) => {
          const count = statusCounts.find((bucket) => bucket.code === status)?.count ?? 0;
          return count || status === query.status ? [{ code: status, label: status, count }] : [];
        }),
        keywords: countBy(facetSubset('keyword'), keywordCodes, (code) => keywords.get(code)?.name),
        municipalities: countBy(facetSubset('municipality'), placeCodes('municipality'), placeLabel('municipality')),
        sectors: countBy(facetSubset('sector'), placeCodes('sector'), placeLabel('sector')),
        mechanisms: countBy(facetSubset('mechanism'), mechanismCodes, (code) => mechanisms.get(code)?.name),
        institutions: countBy(facetSubset('institution'), institutionCodes, institutionLabel),
        period: {
          first: months.length ? months.reduce((a, b) => (a < b ? a : b)) : null,
          last: months.length ? months.reduce((a, b) => (a > b ? a : b)) : null,
        },
      },
    };
  }

  // --------------------------------------------------------- institutions
  const institutionStats = snapshot.parties.flatMap((party): CatalogInstitutionSummary[] => {
    if (party.kind !== 'institution') return [];
    const kinds = { project: 0, study: 0 };
    const roles = new Map<CatalogInstitutionRole, number>();
    for (const entry of entries) {
      const own = entry.parties.filter((link) => link.party === party.id);
      if (!own.length) continue;
      kinds[entry.kind] += 1;
      for (const role of new Set(own.map((link) => link.role))) {
        if (role !== 'coordinator') roles.set(role, (roles.get(role) ?? 0) + 1);
      }
    }
    const type = party.institutionType ? institutionTypes.get(party.institutionType) : undefined;
    return [
      {
        code: party.id.slice(INSTITUTION_PREFIX.length),
        name: party.name,
        type: type ? { code: type.code, label: type.name } : null,
        entries: kinds.project + kinds.study,
        projects: kinds.project,
        studies: kinds.study,
        roles: [...roles]
          .map(([role, count]) => ({ role, count }))
          .sort((a, b) => b.count - a.count || INSTITUTION_ROLES.indexOf(a.role) - INSTITUTION_ROLES.indexOf(b.role)),
      },
    ];
  });
  const institutionSearch = new Map(institutionStats.map((item) => [item.code, searchable(item.name)]));

  function normalizeInstitutions(query: CatalogInstitutionQuery): NormalizedCatalogInstitutionQuery {
    const q = query.q?.trim().slice(0, MAX_QUERY_LENGTH);
    const pageSize = Math.min(Math.max(Math.trunc(query.pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    const normalized: { -readonly [K in keyof NormalizedCatalogInstitutionQuery]: NormalizedCatalogInstitutionQuery[K] } = {
      sort: query.sort === 'name' ? 'name' : 'entries',
      page: Math.max(Math.trunc(query.page ?? 1) || 1, 1),
      pageSize,
    };
    if (q) normalized.q = q;
    if (query.kind === 'project' || query.kind === 'study') normalized.kind = query.kind;
    if (query.role && INSTITUTION_ROLES.includes(query.role)) normalized.role = query.role;
    if (query.type && institutionTypes.has(query.type)) normalized.type = query.type;
    return normalized;
  }

  function institutionMatches(
    item: CatalogInstitutionSummary,
    query: NormalizedCatalogInstitutionQuery,
    skip?: InstitutionDimension,
  ) {
    if (skip !== 'kind' && query.kind && !(query.kind === 'project' ? item.projects : item.studies)) return false;
    if (skip !== 'role' && query.role && !item.roles.some(({ role }) => role === query.role)) return false;
    if (skip !== 'type' && query.type && item.type?.code !== query.type) return false;
    if (skip !== 'q' && query.q) {
      const haystack = institutionSearch.get(item.code) ?? '';
      if (!searchable(query.q).split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  }

  function listInstitutions(input: CatalogInstitutionQuery = {}): CatalogInstitutionListResult {
    const query = normalizeInstitutions(input);
    const filtered = institutionStats.filter((item) => institutionMatches(item, query));
    filtered.sort(
      query.sort === 'name'
        ? (a, b) => compareNames(a.name, b.name)
        : (a, b) => b.entries - a.entries || compareNames(a.name, b.name),
    );
    const total = filtered.length;
    const pageCount = Math.max(Math.ceil(total / query.pageSize), 1);
    const page = Math.min(query.page, pageCount);
    const offset = (page - 1) * query.pageSize;
    const subset = (skip: InstitutionDimension) => institutionStats.filter((item) => institutionMatches(item, query, skip));

    const kindSubset = subset('kind');
    const roleSubset = subset('role');
    const types = new Map<string, number>();
    for (const item of subset('type')) if (item.type) types.set(item.type.code, (types.get(item.type.code) ?? 0) + 1);

    return {
      items: filtered.slice(offset, offset + query.pageSize),
      total,
      page,
      pageSize: query.pageSize,
      pageCount,
      query: { ...query, page },
      facets: {
        allKinds: kindSubset.length,
        kinds: (['project', 'study'] as const).map((kind) => ({
          code: kind,
          label: kind,
          count: kindSubset.filter((item) => (kind === 'project' ? item.projects : item.studies) > 0).length,
        })),
        roles: INSTITUTION_ROLES.flatMap((role) => {
          const count = roleSubset.filter((item) => item.roles.some((link) => link.role === role)).length;
          return count || role === query.role ? [{ code: role, label: role, count }] : [];
        }),
        types: [...types]
          .map(([code, count]) => ({ code, label: institutionTypes.get(code)?.name ?? code, count }))
          .sort(byCountThenName),
        unknownTypes: filtered.filter((item) => !item.type).length,
      },
    };
  }

  // -------------------------------------------------------------- details
  function getEntry(ref: number, options: { includePersons?: boolean } = {}): CatalogEntryDetails | null {
    const entry = entriesByRef.get(ref);
    if (!entry) return null;

    const includePersons = options.includePersons ?? false;
    let personsHidden = false;

    const placeGroups: CatalogPlaceGroup[] = PLACE_TYPES.flatMap((type) => {
      const names = placesOf(entry, type).map((place) => place.name);
      return names.length ? [{ type, names }] : [];
    });

    const partyGroups: CatalogPartyGroup[] = PARTY_ROLES.flatMap((role) => {
      const members = entry.parties.flatMap((link) => {
        if (link.role !== role) return [];
        const party = parties.get(link.party);
        if (!party) return [];
        if (party.kind === 'person' && !includePersons) {
          personsHidden = true;
          return [];
        }
        // Institutions carry their filter code (v0.9), so the details can open their entries.
        const code = party.kind === 'institution' ? link.party.slice(INSTITUTION_PREFIX.length) : null;
        return [{ name: party.name, kind: party.kind, code, note: party.kind === 'person' ? link.note : null }];
      });
      return members.length ? [{ role, parties: members }] : [];
    });

    return {
      ...summarize(entry),
      periodicity: entry.periodicity,
      mechanisms: labeled(entry.mechanisms, mechanisms),
      siteTypes: labeled(entry.siteTypes, siteTypes),
      places: placeGroups,
      parties: partyGroups,
      personsHidden,
      sources: entry.sources.flatMap((id) => {
        const source = sources.get(id);
        if (!source) return [];
        return [
          {
            url: source.url,
            doi: source.doi,
            note: source.note,
            sourceType: source.sourceType ? (sourceTypes.get(source.sourceType)?.name ?? null) : null,
            venue: source.venue,
            publishedYear: source.publishedYear,
          },
        ];
      }),
      sourceTypes: labeled(entry.sourceTypes, sourceTypes).map((item) => item.label),
      venues: entry.venues,
      indicators: labeled(entry.indicators, indicators).map((item) => item.label),
      resultsSummary: entry.resultsSummary,
      dataAvailability: entry.dataAvailability,
      detailNotes: entry.details ? splitDetailLines(entry.details) : [],
    };
  }

  // ------------------------------------------------------------------ map
  function countPlaces(type: PlaceType) {
    const counts = new Map<string, { entries: number; projects: number; studies: number }>();
    for (const entry of entries) {
      for (const place of placesOf(entry, type)) {
        const count = counts.get(place.slug) ?? { entries: 0, projects: 0, studies: 0 };
        count.entries += 1;
        if (entry.kind === 'project') count.projects += 1;
        else count.studies += 1;
        counts.set(place.slug, count);
      }
    }
    return counts;
  }

  /** Every sector of the catalog, in the zones' order (head of the bay → open sea), then the rest by name. */
  function mapSectors(): CatalogMapSector[] {
    const counts = countPlaces('sector');
    const zones = options.sectors?.sectors ?? [];
    const order = (slug: string) => {
      const index = zones.findIndex((zone) => zone.slug === slug);
      return index < 0 ? zones.length : index;
    };
    return snapshot.places
      .filter((place) => place.type === 'sector')
      .map((place) => {
        const zone = zones.find((item) => item.slug === place.slug);
        const count = counts.get(place.slug) ?? { entries: 0, projects: 0, studies: 0 };
        return { code: place.slug, name: place.name, ...count, geometry: zone?.geometry ?? null, label: zone?.label ?? null };
      })
      .sort((a, b) => order(a.code) - order(b.code) || compareNames(a.name, b.name));
  }

  function getMap(): CatalogMap {
    const counts = countPlaces('municipality');

    const municipalities: CatalogMapMunicipality[] = (options.boundaries?.municipalities ?? [])
      .map((boundary) => {
        const count = counts.get(boundary.slug) ?? { entries: 0, projects: 0, studies: 0 };
        // The catalog's spelling wins for municipalities it knows.
        const name = places.get(`municipality:${boundary.slug}`)?.name ?? boundary.name;
        return { code: boundary.slug, ibgeCode: boundary.ibgeCode, name, ...count, geometry: boundary.geometry };
      })
      .sort((a, b) => b.entries - a.entries || compareNames(a.name, b.name));

    return {
      view: options.boundaries?.view ?? { west: 0, south: 0, east: 0, north: 0 },
      municipalities,
      unknown: entries.filter((entry) => placesOf(entry, 'municipality').length === 0).length,
      sectors: mapSectors(),
      unknownSectors: entries.filter((entry) => placesOf(entry, 'sector').length === 0).length,
      source: {
        name: options.boundaries?.source.name ?? '',
        url: options.boundaries?.source.url ?? '',
        note: options.boundaries?.source.note ?? '',
        provisional: true,
      },
    };
  }

  return { getOverview, listEntries, listInstitutions, getEntry, getMap };
}

