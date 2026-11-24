import {
  CATALOG_SNAPSHOT_SCHEMA_VERSION,
  type CatalogSnapshot,
  type EntryKind,
  type EntryParty,
  type EntryStatus,
  type KeywordItem,
  type PartyRecord,
  type Periodicity,
  type PlaceRecord,
  type PlaceType,
  type ReferenceItem,
  type SnapshotEntry,
  type SourceRecord,
} from '../model/snapshot.ts';

import { GERAL, type GeralColumnKey, LIST_COLUMNS, type ListasColumnKey } from './columns.ts';
import {
  cellText,
  isBefore,
  parseLinks,
  parsePartialDate,
  parsePersonMentions,
  parseYears,
  placeholderKind,
  slugify,
  splitCell,
} from './parsers.ts';
import { readReferenceLists } from './referenceLists.ts';
import type { ImportIssue, ImportReport, IssueRule } from './report.ts';
import type { WorkbookData } from './workbook.ts';

export interface ImportOptions {
  /** ISO timestamp of the run (injected so tests are deterministic). */
  readonly importedAt: string;
  /** False → person names (coordinators, authors) are not imported at all. */
  readonly includePersons: boolean;
  /** The snapshot currently published, to report added and removed IDs. */
  readonly previous?: CatalogSnapshot | null;
}

export interface ImportResult {
  /** Null when the import was rejected (any error). */
  readonly snapshot: CatalogSnapshot | null;
  readonly report: ImportReport;
}

const PERIODICITY: Record<string, Periodicity> = {
  contínua: 'continuous',
  periódica: 'periodic',
  pontual: 'one_off',
};

const STATUS: Record<string, { kind: EntryKind; status: EntryStatus }> = {
  ativa: { kind: 'project', status: 'active' },
  'em implantação': { kind: 'project', status: 'in_implementation' },
  encerrada: { kind: 'project', status: 'ended' },
  publicado: { kind: 'study', status: 'published' },
  'em andamento': { kind: 'study', status: 'in_progress' },
};

const PLACE_COLUMNS: ReadonlyArray<readonly [GeralColumnKey, PlaceType]> = [
  ['sector', 'sector'],
  ['municipality', 'municipality'],
  ['locality', 'locality'],
  ['river', 'river'],
  ['conservationUnit', 'conservation_unit'],
  ['fishingColony', 'fishing_colony'],
];

const PLACE_LISTS: Record<PlaceType, ListasColumnKey> = {
  sector: 'sector',
  municipality: 'municipality',
  locality: 'locality',
  river: 'river',
  conservation_unit: 'conservationUnit',
  fishing_colony: 'fishingColony',
};

/**
 * Labels that usually describe a group of people rather than one identifiable
 * organization. They are still imported as institutions; the mapping team
 * decides case by case (Core v2.0, D-029 and team question 1).
 */
const COLLECTIVE_HINTS: readonly RegExp[] = [
  /^pescadores\b/i,
  /^colônias\b/i,
  /^cooperativas\b/i,
  /^comunidade\b/i,
  /^poder público$/i,
  /^escoteiros$/i,
];

const lower = (value: string) => value.toLocaleLowerCase('pt-BR');

function referenceItems(names: readonly string[]): ReferenceItem[] {
  return names.map((name) => ({ code: slugify(name), name }));
}

/**
 * Transforms the workbook into a catalog snapshot, applying the Core v2.0
 * import rules. Pure: no I/O, so it is tested with in-memory workbooks.
 * All or nothing (D-044): any error → no snapshot.
 */
export function importCatalog(workbook: WorkbookData, options: ImportOptions): ImportResult {
  const issues: ImportIssue[] = [];
  const placeholderCounts: Record<string, Record<string, number>> = {};
  const issue = (severity: ImportIssue['severity'], rule: IssueRule, message: string, extra: Partial<ImportIssue> = {}) =>
    issues.push({ severity, rule, message, ...extra });

  const geral = workbook.sheets['Geral'] ?? [];
  const header = (geral[0] ?? []).map(cellText);
  const columnIndex = {} as Record<GeralColumnKey, number>;

  if (!workbook.sheets['Geral']) issue('error', 'header.missing-column', 'The workbook has no "Geral" tab.');
  for (const [key, column] of Object.entries(GERAL) as [GeralColumnKey, string][]) {
    columnIndex[key] = header.indexOf(column);
    if (columnIndex[key] === -1 && workbook.sheets['Geral']) {
      issue('error', 'header.missing-column', `Column "${column}" is missing from the Geral tab.`, { column });
    }
  }

  const lists = readReferenceLists(workbook.sheets['Listas']);
  for (const column of lists.missingColumns) {
    issue('error', 'header.missing-column', `Column "${column}" is missing from the Listas tab.`, { column });
  }

  const base = {
    importedAt: options.importedAt,
    workbook: { fileName: workbook.fileName, sha256: workbook.sha256 },
    includesPersons: options.includePersons,
  };

  if (issues.some((entry) => entry.severity === 'error')) {
    return {
      snapshot: null,
      report: {
        ...base,
        ok: false,
        rowsRead: Math.max(geral.length - 1, 0),
        entries: { total: 0, projects: 0, studies: 0 },
        comparedWithPrevious: null,
        placeholders: {},
        issues,
      },
    };
  }

  // ------------------------------------------------------- reference data
  const keywords: KeywordItem[] = lists.values.keyword.map((name) => {
    const category = lists.keywordCategories.get(name) ?? null;
    if (!category) issue('warning', 'keyword.no-category', `Keyword "${name}" has no category.`, { value: name });
    return { code: slugify(name), name, category };
  });
  const mechanisms = referenceItems(lists.values.mechanism);
  const siteTypes = referenceItems(lists.values.siteType);
  const institutionTypes = referenceItems(lists.values.institutionType);
  const sourceTypes = referenceItems(lists.values.sourceType);
  const indicators = referenceItems(lists.values.indicator);
  const actors = new Set(lists.values.actor);
  const venues = new Set(lists.values.venue);

  const places = new Map<string, PlaceRecord>();
  const registerPlace = (type: PlaceType, name: string) => {
    const slug = slugify(name);
    const id = `${type}:${slug}`;
    if (!places.has(id)) places.set(id, { id, type, slug, name });
    return id;
  };
  for (const type of Object.keys(PLACE_LISTS) as PlaceType[]) {
    for (const name of lists.values[PLACE_LISTS[type]]) registerPlace(type, name);
  }

  const parties = new Map<string, PartyRecord>();
  const institutionId = (name: string) => {
    const id = `institution:${slugify(name)}`;
    if (!parties.has(id)) parties.set(id, { id, kind: 'institution', name, institutionType: null });
    return id;
  };
  const personId = (name: string) => {
    const id = `person:${slugify(name)}`;
    if (!parties.has(id)) parties.set(id, { id, kind: 'person', name });
    return id;
  };

  const sources = new Map<string, SourceRecord>();
  const institutionTypeCandidates = new Map<string, Set<string>>();

  // ------------------------------------------------------------- entries
  const entries: SnapshotEntry[] = [];
  const seenRefs = new Map<number, number>();
  let rowsRead = 0;

  for (let index = 1; index < geral.length; index += 1) {
    const cells = geral[index] ?? [];
    if (cells.every((cell) => cellText(cell) === '')) continue;
    rowsRead += 1;

    const row = index + 1;
    const text = (key: GeralColumnKey) => cellText(cells[columnIndex[key]]);
    const at = (key: GeralColumnKey, extra: Partial<ImportIssue> = {}) => ({ row, column: GERAL[key], ...extra });

    // ID — permanent public reference (D-047).
    const idText = text('id');
    const ref = Number(idText);
    if (!idText) {
      issue('error', 'id.missing', `Row ${row} has no ID.`, at('id'));
      continue;
    }
    if (!Number.isInteger(ref) || ref <= 0) {
      issue('error', 'id.not-integer', `ID "${idText}" is not a positive whole number.`, at('id', { value: idText }));
      continue;
    }
    if (seenRefs.has(ref)) {
      issue('error', 'id.duplicate', `ID ${ref} is used by rows ${seenRefs.get(ref)} and ${row}.`, at('id', { ref }));
      continue;
    }
    seenRefs.set(ref, row);

    const name = text('name');
    if (!name) issue('error', 'name.missing', `ID ${ref} has no name.`, at('name', { ref }));

    /** Splits a list cell, counts placeholders and checks values against Listas. */
    const list = (key: GeralColumnKey, separator?: RegExp) => {
      const result = splitCell(text(key), separator);
      for (const placeholder of result.placeholders) {
        const column = (placeholderCounts[GERAL[key]] ??= {});
        column[placeholder] = (column[placeholder] ?? 0) + 1;
      }
      const listKey = LIST_COLUMNS.find(([geralKey]) => geralKey === key)?.[1];
      if (listKey) {
        const allowed = new Set(lists.values[listKey]);
        for (const value of result.values) {
          if (!allowed.has(value)) {
            issue('error', 'list.unknown-value', `"${value}" is not in the Listas column "${listKey}".`, at(key, { ref, value }));
          }
        }
      }
      if (result.values.length && result.placeholders.some((value) => placeholderKind(value) === 'unconfirmed')) {
        issue('warning', 'values.unconfirmed-mixed', `"Não confirmado" next to ${result.values.join(', ')}.`, at(key, { ref }));
      }
      return result;
    };

    // Kind: the workbook has no kind column; studies have no mechanism of action.
    const mechanismCell = list('mechanism');
    const kind: EntryKind =
      mechanismCell.values.length === 0 && mechanismCell.placeholders.some((value) => placeholderKind(value) === 'not_applicable')
        ? 'study'
        : 'project';

    const executors = list('executors');
    const partners = list('partners');
    const coordinatorText = text('coordinator');
    const coordinators = parsePersonMentions(coordinatorText);
    for (const placeholder of coordinators.placeholders) {
      const column = (placeholderCounts[GERAL.coordinator] ??= {});
      column[placeholder] = (column[placeholder] ?? 0) + 1;
    }

    if (kind === 'study') {
      const filled: string[] = [];
      if (executors.values.length) filled.push(GERAL.executors);
      if (coordinators.mentions.length) filled.push(GERAL.coordinator);
      if (filled.length) {
        issue('warning', 'kind.inconsistent', `ID ${ref} was read as a study but fills ${filled.join(', ')}; those values were not imported.`, {
          row,
          ref,
          column: filled.join(', '),
        });
      }
    }

    // Status and periodicity.
    const statusCell = list('status');
    let status: EntryStatus | null = null;
    for (const value of statusCell.values) {
      const mapped = STATUS[lower(value)];
      if (!mapped) continue;
      if (mapped.kind !== kind) {
        issue('warning', 'status.wrong-kind', `Status "${value}" does not apply to a ${kind === 'study' ? 'study' : 'initiative'}.`, at('status', { ref, value }));
        continue;
      }
      status = mapped.status;
    }
    if (kind === 'project' && statusCell.placeholders.some((value) => placeholderKind(value) === 'not_applicable')) {
      issue('warning', 'kind.inconsistent', `ID ${ref} was read as an initiative but its status is "não se aplica".`, at('status', { ref }));
    }

    const periodicityCell = list('periodicity');
    const periodicity = periodicityCell.values
      .map((value) => PERIODICITY[lower(value)])
      .filter((value): value is Periodicity => Boolean(value));
    if (periodicity.length > 1) {
      issue('warning', 'periodicity.multiple', `ID ${ref} has ${periodicityCell.values.join(', ')}.`, at('periodicity', { ref }));
    }

    // Dates with precision (D-033).
    const readDate = (key: 'startDate' | 'endDate') => {
      const raw = text(key);
      const parsed = parsePartialDate(raw);
      if (parsed.kind === 'invalid' || (parsed.kind === 'ongoing' && key === 'startDate')) {
        issue('error', 'date.invalid', `"${raw}" is not a valid partial date.`, at(key, { ref, value: raw }));
        return { date: null, ongoing: false };
      }
      if (parsed.kind === 'placeholder') {
        const column = (placeholderCounts[GERAL[key]] ??= {});
        column[raw] = (column[raw] ?? 0) + 1;
      }
      if (parsed.kind === 'date' && parsed.annotation) {
        issue('warning', 'date.annotation', `Comment "${parsed.annotation}" dropped from the date.`, at(key, { ref, value: raw }));
      }
      return { date: parsed.kind === 'date' ? parsed.value : null, ongoing: parsed.kind === 'ongoing' };
    };
    const start = readDate('startDate');
    const end = readDate('endDate');
    if (end.ongoing && kind !== 'project') {
      issue('warning', 'ongoing.not-project', `ID ${ref} is a study with end date "em curso".`, at('endDate', { ref }));
    }
    if (start.date && end.date && isBefore(end.date, start.date)) {
      issue('warning', 'date.end-before-start', `ID ${ref} ends before it starts.`, { row, ref });
    }

    // Places (declared territory, D-028).
    const entryPlaces: string[] = [];
    for (const [key, type] of PLACE_COLUMNS) {
      for (const value of list(key).values) entryPlaces.push(registerPlace(type, value));
    }

    // Parties and roles (D-030).
    const entryParties: EntryParty[] = [];
    const addParty = (party: string, role: EntryParty['role'], note: string | null = null) => {
      if (!entryParties.some((item) => item.party === party && item.role === role)) entryParties.push({ party, role, note });
    };

    const executingInstitutions = list('executingInstitutions');
    const executingSet: string[] = [];
    for (const value of executingInstitutions.values) {
      const id = institutionId(value);
      executingSet.push(id);
      // In studies the column holds the authors' institutions (role author).
      addParty(id, kind === 'study' ? 'author' : 'executor');
    }
    if (kind === 'project') {
      for (const value of executors.values) {
        const id = institutionId(value);
        if (!executingSet.includes(id)) executingSet.push(id);
        addParty(id, 'executor');
      }
    }
    for (const value of list('funders').values) addParty(institutionId(value), 'funder');
    for (const value of partners.values) addParty(institutionId(value), 'partner');
    list('funderType'); // Not imported: derived from the funder's institution (D-034).

    const institutionTypeCell = list('institutionType');
    const executorInstitutionTypes = institutionTypeCell.values.map(slugify);
    if (executingSet.length === 1 && executorInstitutionTypes.length === 1) {
      const candidates = institutionTypeCandidates.get(executingSet[0]!) ?? new Set<string>();
      candidates.add(executorInstitutionTypes[0]!);
      institutionTypeCandidates.set(executingSet[0]!, candidates);
    }

    if (kind === 'project') {
      if (options.includePersons) {
        for (const mention of coordinators.mentions) addParty(personId(mention.name), 'coordinator', mention.note);
      }
    }

    const authorsText = text('authors');
    const authors = parsePersonMentions(authorsText);
    for (const placeholder of authors.placeholders) {
      if (placeholderKind(placeholder) === 'not_found' && lower(placeholder) === 'autoria múltipla') {
        issue('warning', 'parties.unknown-authors', `ID ${ref} lists "${placeholder}" as authors.`, at('authors', { ref, value: placeholder }));
      }
      const column = (placeholderCounts[GERAL.authors] ??= {});
      column[placeholder] = (column[placeholder] ?? 0) + 1;
    }
    if (authors.mentions.length && kind === 'project') {
      issue('warning', 'parties.authors-on-project', `ID ${ref} is an initiative with authors "${authorsText}".`, at('authors', { ref }));
    } else if (kind === 'study') {
      for (const mention of authors.mentions) {
        if (actors.has(mention.name)) addParty(institutionId(mention.name), 'author');
        else if (options.includePersons) addParty(personId(mention.name), 'author', mention.note);
      }
    }

    // Sources (D-035): one record per link, deduplicated by URL.
    const entrySourceTypes = list('sourceType').values.map(slugify);
    const venueCell = splitCell(text('venue'));
    for (const placeholder of venueCell.placeholders) {
      const column = (placeholderCounts[GERAL.venue] ??= {});
      column[placeholder] = (column[placeholder] ?? 0) + 1;
    }
    const entryVenues = venueCell.values;
    for (const venue of entryVenues) {
      if (!venues.has(venue)) {
        issue('warning', 'sources.venue-not-in-list', `Venue "${venue}" is not in the Listas tab.`, at('venue', { ref, value: venue }));
      }
    }
    const years = parseYears(text('publicationYear'));
    for (const value of years.invalid) {
      issue('warning', 'sources.invalid-year', `"${value}" is not a year.`, at('publicationYear', { ref, value }));
    }
    for (const placeholder of years.placeholders) {
      const column = (placeholderCounts[GERAL.publicationYear] ??= {});
      column[placeholder] = (column[placeholder] ?? 0) + 1;
    }

    const links = parseLinks(text('links'));
    for (const value of links.invalid) {
      issue('warning', 'sources.invalid-link', `"${value}" is not a valid link.`, at('links', { ref, value }));
    }
    const pairable =
      links.links.length === 1 && entrySourceTypes.length <= 1 && entryVenues.length <= 1 && years.years.length <= 1;
    if (links.links.length > 1 && (entrySourceTypes.length || entryVenues.length || years.years.length)) {
      issue('warning', 'sources.unpaired-metadata', `ID ${ref} has ${links.links.length} links and one set of source facts.`, at('links', { ref }));
    }
    const entrySources = links.links.map((link) => {
      const existing = [...sources.values()].find((source) => source.url === link.url);
      if (existing) return existing.id;
      const id = `source:${sources.size + 1}`;
      sources.set(id, {
        id,
        url: link.url,
        doi: link.doi,
        note: link.note,
        sourceType: pairable ? (entrySourceTypes[0] ?? null) : null,
        venue: pairable ? (entryVenues[0] ?? null) : null,
        publishedYear: pairable ? (years.years[0] ?? null) : null,
      });
      return id;
    });

    const optional = (key: GeralColumnKey) => {
      const value = text(key);
      if (!value) return null;
      if (placeholderKind(value)) {
        const column = (placeholderCounts[GERAL[key]] ??= {});
        column[value] = (column[value] ?? 0) + 1;
        return null;
      }
      return value;
    };

    entries.push({
      ref,
      kind,
      name,
      objective: optional('objective'),
      start: start.date,
      end: end.date,
      ongoing: end.ongoing,
      periodicity,
      status,
      mechanisms: kind === 'project' ? mechanismCell.values.map(slugify) : [],
      keywords: list('keywords').values.map(slugify),
      siteTypes: list('siteType').values.map(slugify),
      places: entryPlaces,
      parties: entryParties,
      sources: entrySources,
      executorInstitutionTypes,
      indicators: list('indicator').values.map(slugify),
      sourceTypes: entrySourceTypes,
      venues: entryVenues,
      publicationYears: years.years,
      resultsSummary: optional('results'),
      dataAvailability: optional('dataAvailability'),
      details: optional('details'),
    });
  }

  // ----------------------------------------------------- cross-row rules
  if (entries.length) {
    issue('warning', 'kind.inferred', 'Kind inferred: "Mecanismo de atuação" = "não se aplica" → study; anything else → initiative.', {
      column: GERAL.mechanism,
    });
  }
  if (entries.some((entry) => entry.resultsSummary)) {
    issue('warning', 'indicators.no-results-tab', '"Resultados gerados" is published as prose; totals and charts of results need the results tab.', {
      column: GERAL.results,
    });
  }

  const untyped: string[] = [];
  for (const [id, party] of parties) {
    if (party.kind !== 'institution') continue;
    const candidates = institutionTypeCandidates.get(id);
    if (candidates?.size === 1) {
      parties.set(id, { ...party, institutionType: [...candidates][0]! });
    } else if (candidates && candidates.size > 1) {
      issue('warning', 'parties.institution-type-conflict', `"${party.name}" is typed as ${[...candidates].join(' and ')}.`, {
        value: party.name,
      });
    } else {
      untyped.push(party.name);
    }
    if (COLLECTIVE_HINTS.some((hint) => hint.test(party.name))) {
      issue('warning', 'parties.collective-label', `"${party.name}" may be a collective label, not one organization.`, {
        value: party.name,
      });
    }
  }
  if (untyped.length) {
    issue(
      'warning',
      'parties.institution-type-unknown',
      `${untyped.length} institutions have no type: "Tipo de instituição" is written per row, not per institution.`,
      { column: GERAL.institutionType, value: untyped.slice(0, 8).join(', ') + (untyped.length > 8 ? ', …' : '') },
    );
  }

  const projects = entries.filter((entry) => entry.kind === 'project').length;
  const counts = { total: entries.length, projects, studies: entries.length - projects };
  const previousRefs = options.previous ? new Set(options.previous.entries.map((entry) => entry.ref)) : null;
  const currentRefs = new Set(entries.map((entry) => entry.ref));
  const comparedWithPrevious = previousRefs
    ? {
        added: [...currentRefs].filter((ref) => !previousRefs.has(ref)).sort((a, b) => a - b),
        removed: [...previousRefs].filter((ref) => !currentRefs.has(ref)).sort((a, b) => a - b),
      }
    : null;

  const ok = !issues.some((entry) => entry.severity === 'error');
  const report: ImportReport = {
    ...base,
    ok,
    rowsRead,
    entries: counts,
    comparedWithPrevious,
    placeholders: placeholderCounts,
    issues,
  };

  if (!ok) return { snapshot: null, report };

  const byName = new Intl.Collator('pt-BR').compare;
  const snapshot: CatalogSnapshot = {
    schemaVersion: CATALOG_SNAPSHOT_SCHEMA_VERSION,
    importRun: {
      importedAt: options.importedAt,
      workbook: base.workbook,
      entryCount: counts.total,
      projectCount: counts.projects,
      studyCount: counts.studies,
      warningCount: issues.length,
      includesPersons: options.includePersons,
    },
    keywords,
    mechanisms,
    siteTypes,
    institutionTypes,
    sourceTypes,
    indicators,
    places: [...places.values()].sort((a, b) => a.type.localeCompare(b.type) || byName(a.name, b.name)),
    parties: [...parties.values()].sort((a, b) => byName(a.name, b.name)),
    sources: [...sources.values()],
    entries: entries.sort((a, b) => a.ref - b.ref),
  };

  return { snapshot, report };
}

