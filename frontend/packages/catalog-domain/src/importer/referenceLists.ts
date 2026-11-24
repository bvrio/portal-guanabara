import { LISTAS, type ListasColumnKey } from './columns.ts';
import { cellText, placeholderKind } from './parsers.ts';
import type { SheetRows } from './workbook.ts';

export interface ReferenceLists {
  /** Listas column → its values, placeholders left out. */
  readonly values: Readonly<Record<ListasColumnKey, readonly string[]>>;
  /** Keyword → category, paired row by row in the Listas tab. */
  readonly keywordCategories: ReadonlyMap<string, string | null>;
  /** Listas columns the tab does not have. */
  readonly missingColumns: readonly string[];
}

/** Reads the "Listas" tab: one controlled list per column, header in row 1. */
export function readReferenceLists(rows: SheetRows | undefined): ReferenceLists {
  const header = (rows?.[0] ?? []).map(cellText);
  const missingColumns: string[] = [];
  const values = {} as Record<ListasColumnKey, string[]>;

  for (const [key, column] of Object.entries(LISTAS) as [ListasColumnKey, string][]) {
    const index = header.indexOf(column);
    if (index === -1) missingColumns.push(column);

    const list: string[] = [];
    for (const row of rows?.slice(1) ?? []) {
      const value = index === -1 ? '' : cellText(row[index]);
      if (value && !placeholderKind(value) && !list.includes(value)) list.push(value);
    }
    values[key] = list;
  }

  const keywordIndex = header.indexOf(LISTAS.keyword);
  const categoryIndex = header.indexOf(LISTAS.keywordCategory);
  const keywordCategories = new Map<string, string | null>();
  for (const row of rows?.slice(1) ?? []) {
    const keyword = keywordIndex === -1 ? '' : cellText(row[keywordIndex]);
    if (!keyword || placeholderKind(keyword)) continue;
    const category = categoryIndex === -1 ? '' : cellText(row[categoryIndex]);
    keywordCategories.set(keyword, category || null);
  }

  return { values, keywordCategories, missingColumns };
}
