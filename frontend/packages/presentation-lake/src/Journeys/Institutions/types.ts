/**
 * Data shapes of the Institutions Journey presentation (defined here, not
 * imported from the Catalog Domain; the Page maps the API response onto them).
 */
export type InstitutionRole = 'executor' | 'funder' | 'partner' | 'author';
export type InstitutionEntryKind = 'project' | 'study';

export interface InstitutionItem {
  /** Slug — what the Page uses to open the institution's entries. */
  code: string;
  name: string;
  /** Type label (Acadêmica, Terceiro setor…); null when unknown. */
  type: string | null;
  entries: number;
  projects: number;
  studies: number;
  /** Entries per role, most frequent first. */
  roles: readonly { role: InstitutionRole; count: number }[];
  /** Official logo URL, when authorised and supplied. */
  logo?: string;
}
