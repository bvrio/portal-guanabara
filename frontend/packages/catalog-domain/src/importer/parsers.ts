import type { DatePrecision, PartialDate } from '../model/snapshot.ts';

/**
 * What a workbook placeholder says about the state of knowledge (Core v2.0,
 * "Unknown values are absences, not values" — D-032). None of them is stored
 * as a value.
 */
export type PlaceholderKind = 'not_applicable' | 'not_found' | 'unconfirmed';

const PLACEHOLDERS: Record<string, PlaceholderKind> = {
  'não se aplica': 'not_applicable',
  'não encontrado': 'not_found',
  'sem informação': 'not_found',
  'sem dado quantitativo': 'not_found',
  'autoria múltipla': 'not_found',
  'não confirmado': 'unconfirmed',
  'unidade não confirmada': 'unconfirmed',
};

export function placeholderKind(value: string): PlaceholderKind | null {
  return PLACEHOLDERS[value.trim().toLocaleLowerCase('pt-BR')] ?? null;
}

/** Cell → trimmed string; numbers stay integers when they are whole (IDs, years). */
export function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

export interface SplitValues {
  /** Real values, in workbook order, without duplicates. */
  readonly values: string[];
  /** Placeholders found in the cell (possibly alongside real values). */
  readonly placeholders: string[];
}

/** Splits a multi-valued cell. Lists use ", "; persons and links use ";". */
export function splitCell(text: string, separator: RegExp = /,\s*/): SplitValues {
  const values: string[] = [];
  const placeholders: string[] = [];

  for (const raw of text.split(separator)) {
    const part = raw.trim();
    if (!part) continue;
    if (placeholderKind(part)) placeholders.push(part);
    else if (!values.includes(part)) values.push(part);
  }

  return { values, placeholders };
}

/** ASCII slug used as a code for workbook reference lists and in filter URLs. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Accent- and case-insensitive form used by text search. */
export function searchable(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR');
}

export type DateParse =
  | { readonly kind: 'date'; readonly value: PartialDate; readonly annotation: string | null }
  | { readonly kind: 'ongoing' }
  | { readonly kind: 'placeholder'; readonly placeholder: PlaceholderKind }
  | { readonly kind: 'empty' }
  | { readonly kind: 'invalid' };

function isRealDay(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function partial(year: string, month: string, day: string, precision: DatePrecision): PartialDate {
  return { date: `${year}-${month}-${day}`, precision };
}

/**
 * Partial-date convention (D-033): `2016-01-21` → day, `2021-12-DD` → month,
 * `2022-MM-DD` → year. `em curso` marks an ongoing entry.
 */
export function parsePartialDate(text: string): DateParse {
  const value = text.trim();
  if (!value) return { kind: 'empty' };
  if (value.toLocaleLowerCase('pt-BR') === 'em curso') return { kind: 'ongoing' };

  const placeholder = placeholderKind(value);
  if (placeholder) return { kind: 'placeholder', placeholder };

  let match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    const [, y, m, d] = match as unknown as [string, string, string, string];
    return isRealDay(Number(y), Number(m), Number(d))
      ? { kind: 'date', value: partial(y, m, d, 'day'), annotation: null }
      : { kind: 'invalid' };
  }

  match = /^(\d{4})-(\d{2})(?:-DD)?(?:\s*\((.+)\))?$/.exec(value);
  if (match) {
    const [, y, m, note] = match as unknown as [string, string, string, string | undefined];
    if (Number(m) < 1 || Number(m) > 12) return { kind: 'invalid' };
    return { kind: 'date', value: partial(y, m, '01', 'month'), annotation: note?.trim() ?? null };
  }

  match = /^(\d{4})(?:-MM-DD)?$/.exec(value);
  if (match) {
    const [, y] = match as unknown as [string, string];
    return { kind: 'date', value: partial(y, '01', '01', 'year'), annotation: null };
  }

  return { kind: 'invalid' };
}

/** Compares two partial dates only as precisely as the coarser one allows. */
export function isBefore(a: PartialDate, b: PartialDate): boolean {
  const order: DatePrecision[] = ['year', 'month', 'day'];
  const precision = order[Math.min(order.indexOf(a.precision), order.indexOf(b.precision))]!;
  const length = precision === 'year' ? 4 : precision === 'month' ? 7 : 10;
  return a.date.slice(0, length) < b.date.slice(0, length);
}

export interface PersonMention {
  readonly name: string;
  readonly note: string | null;
}

/** "Glaucia Souza (presidente da COOP PROMAR); Pedro Belga (biólogo)" → mentions. */
export function parsePersonMentions(text: string): { mentions: PersonMention[]; placeholders: string[] } {
  const { values, placeholders } = splitCell(text, /;/);
  const mentions = values.map((value) => {
    const match = /^(.*?)\s*\((.*)\)\s*$/.exec(value);
    return match
      ? { name: match[1]!.trim(), note: match[2]!.trim() || null }
      : { name: value, note: null };
  });
  return { mentions: mentions.filter((mention) => mention.name), placeholders };
}

export interface LinkMention {
  readonly url: string;
  readonly doi: string | null;
  readonly note: string | null;
}

/** "https://a ; https://b (PDF do artigo)" → links; returns the parts that are not URLs. */
export function parseLinks(text: string): { links: LinkMention[]; invalid: string[]; placeholders: string[] } {
  const { values, placeholders } = splitCell(text, /\s+;\s+|\s*;\s*(?=https?:\/\/)/);
  const links: LinkMention[] = [];
  const invalid: string[] = [];

  for (const value of values) {
    const match = /^(https?:\/\/\S+)\s*(?:\((.*)\))?\s*$/.exec(value);
    if (!match) {
      invalid.push(value);
      continue;
    }
    try {
      const url = new URL(match[1]!);
      const doi = url.hostname === 'doi.org' || url.hostname === 'dx.doi.org' ? decodeURIComponent(url.pathname.slice(1)) : null;
      links.push({ url: url.toString(), doi: doi || null, note: match[2]?.trim() || null });
    } catch {
      invalid.push(value);
    }
  }

  return { links, invalid, placeholders };
}

/** "2024, 2025, 2026" → [2024, 2025, 2026]; placeholders are skipped. */
export function parseYears(text: string): { years: number[]; invalid: string[]; placeholders: string[] } {
  const { values, placeholders } = splitCell(text);
  const years: number[] = [];
  const invalid: string[] = [];
  for (const value of values) {
    if (/^\d{4}$/.test(value)) years.push(Number(value));
    else invalid.push(value);
  }
  return { years, invalid, placeholders };
}

/** Splits "Label: text" lines of the free-text Detalhes column. */
export function splitDetailLines(text: string): { label: string | null; text: string }[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = /^([^:]{2,48}):\s+(.+)$/.exec(line);
      return match ? { label: match[1]!.trim(), text: match[2]!.trim() } : { label: null, text: line };
    });
}
