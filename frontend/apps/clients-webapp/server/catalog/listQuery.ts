import type { CatalogInstitutionQuery, CatalogListQuery } from '@portal-guanabara/catalog-domain/contracts';

type RawQuery = Record<string, unknown>;

function single(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' && first.trim() ? first.trim() : undefined;
}

function integer(value: unknown): number | undefined {
  const text = single(value);
  if (!text || !/^\d{1,4}$/.test(text)) return undefined;
  return Number(text);
}

/**
 * Query string → CatalogListQuery. Only the shape is checked here; the Domain
 * drops unknown codes and clamps paging, and echoes what it understood.
 */
const STATUSES = ['active', 'in_implementation', 'ended', 'published', 'in_progress'] as const;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function parseCatalogListQuery(raw: RawQuery): CatalogListQuery {
  const kind = single(raw.kind);
  const status = single(raw.status);
  const sort = single(raw.sort);
  const query: { -readonly [K in keyof CatalogListQuery]: CatalogListQuery[K] } = {};

  const q = single(raw.q);
  if (q) query.q = q;
  if (kind === 'project' || kind === 'study') query.kind = kind;
  const knownStatus = STATUSES.find((candidate) => candidate === status);
  if (knownStatus) query.status = knownStatus;
  for (const key of ['from', 'to'] as const) {
    const value = single(raw[key]);
    if (value && MONTH.test(value)) query[key] = value;
  }
  for (const key of ['keyword', 'municipality', 'sector', 'mechanism', 'institution'] as const) {
    const value = single(raw[key]);
    if (value) query[key] = value;
  }
  if (sort === 'name' || sort === 'recent') query.sort = sort;
  const page = integer(raw.page);
  if (page) query.page = page;
  const pageSize = integer(raw.pageSize);
  if (pageSize) query.pageSize = pageSize;

  return query;
}

const ROLES = ['executor', 'funder', 'partner', 'author'] as const;

/** Query string → CatalogInstitutionQuery (same rules as the entry list). */
export function parseCatalogInstitutionQuery(raw: RawQuery): CatalogInstitutionQuery {
  const kind = single(raw.kind);
  const role = single(raw.role);
  const sort = single(raw.sort);
  const query: { -readonly [K in keyof CatalogInstitutionQuery]: CatalogInstitutionQuery[K] } = {};

  const q = single(raw.q);
  if (q) query.q = q;
  if (kind === 'project' || kind === 'study') query.kind = kind;
  const knownRole = ROLES.find((candidate) => candidate === role);
  if (knownRole) query.role = knownRole;
  const type = single(raw.type);
  if (type) query.type = type;
  if (sort === 'name' || sort === 'entries') query.sort = sort;
  const page = integer(raw.page);
  if (page) query.page = page;
  const pageSize = integer(raw.pageSize);
  if (pageSize) query.pageSize = pageSize;

  return query;
}

/** "36" → 36; anything else → null (the route answers 404). */
export function parseEntryRef(value: unknown): number | null {
  const text = single(value);
  return text && /^[1-9]\d{0,8}$/.test(text) ? Number(text) : null;
}
