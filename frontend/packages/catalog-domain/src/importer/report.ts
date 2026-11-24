/**
 * Import report (Core v2.0, "Import report" — D-044). Errors stop the import
 * and leave the published snapshot unchanged; warnings are published with the
 * snapshot and become questions for the mapping team.
 */
export type IssueSeverity = 'error' | 'warning';

export type IssueRule =
  | 'header.missing-column'
  | 'id.missing'
  | 'id.not-integer'
  | 'id.duplicate'
  | 'name.missing'
  | 'list.unknown-value'
  | 'date.invalid'
  | 'date.annotation'
  | 'date.end-before-start'
  | 'kind.inferred'
  | 'kind.inconsistent'
  | 'periodicity.multiple'
  | 'status.wrong-kind'
  | 'ongoing.not-project'
  | 'values.unconfirmed-mixed'
  | 'keyword.no-category'
  | 'parties.authors-on-project'
  | 'parties.unknown-authors'
  | 'parties.collective-label'
  | 'parties.institution-type-unknown'
  | 'parties.institution-type-conflict'
  | 'sources.unpaired-metadata'
  | 'sources.invalid-link'
  | 'sources.invalid-year'
  | 'sources.venue-not-in-list'
  | 'indicators.no-results-tab';

export interface ImportIssue {
  readonly severity: IssueSeverity;
  readonly rule: IssueRule;
  readonly message: string;
  /** Workbook ID of the entry, when the issue belongs to one. */
  readonly ref?: number;
  /** Spreadsheet row number (1-based, header = 1). */
  readonly row?: number;
  readonly column?: string;
  readonly value?: string;
}

export interface ImportReport {
  readonly ok: boolean;
  readonly importedAt: string;
  readonly workbook: { readonly fileName: string; readonly sha256: string };
  readonly rowsRead: number;
  readonly entries: { readonly total: number; readonly projects: number; readonly studies: number };
  readonly includesPersons: boolean;
  /** Compared with the previous snapshot, when there is one (D-044, D-047). */
  readonly comparedWithPrevious: { readonly added: number[]; readonly removed: number[] } | null;
  /** Column → placeholder → how many cells held it (skipped as absences). */
  readonly placeholders: Record<string, Record<string, number>>;
  readonly issues: readonly ImportIssue[];
}

export const RULE_DESCRIPTIONS: Record<IssueRule, string> = {
  'header.missing-column': 'A column the importer needs is missing from the Geral tab.',
  'id.missing': 'Row without an ID.',
  'id.not-integer': 'ID is not a positive whole number.',
  'id.duplicate': 'ID used by more than one row (IDs are permanent and unique, D-047).',
  'name.missing': 'Row without a name.',
  'list.unknown-value': 'Value not found in the matching column of the Listas tab.',
  'date.invalid': 'Date does not follow the partial-date convention (YYYY-MM-DD, YYYY-MM-DD with DD, YYYY-MM-DD with MM-DD).',
  'date.annotation': 'Date carries a comment in parentheses; the comment was dropped.',
  'date.end-before-start': 'End date is earlier than the start date.',
  'kind.inferred': 'The workbook has no column saying initiative or study; the kind was inferred.',
  'kind.inconsistent': 'The inferred kind disagrees with other columns of the row.',
  'periodicity.multiple': 'More than one periodicity; Core v2.0 expects one.',
  'status.wrong-kind': 'Status belongs to the other kind of entry (initiative vs study).',
  'ongoing.not-project': 'End date "em curso" on an entry that is not an initiative.',
  'values.unconfirmed-mixed': '"Não confirmado" written next to real values; the real values were kept.',
  'keyword.no-category': 'Keyword without a category in the Listas tab.',
  'parties.authors-on-project': 'Authors filled on an initiative; authors belong to studies, so they were not imported.',
  'parties.unknown-authors': 'Authors written as a placeholder ("Autoria múltipla"); no author was imported.',
  'parties.collective-label': 'Actor looks like a collective label rather than an identifiable organization (D-029).',
  'parties.institution-type-unknown': 'Institution type could not be paired with one institution.',
  'parties.institution-type-conflict': 'The same institution gets different types in different rows.',
  'sources.unpaired-metadata': 'Several links but one set of source type, venue and year; they could not be paired per link.',
  'sources.invalid-link': 'Text in "DOI ou link" that is not a valid URL.',
  'sources.invalid-year': 'Publication year that is not a four-digit year.',
  'sources.venue-not-in-list': 'Venue not found in the Listas tab.',
  'indicators.no-results-tab': 'Figures stay in prose: there is no structured results tab yet (D-045).',
};

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

/** Markdown version of the report, committed next to the snapshot. */
export function renderReportMarkdown(report: ImportReport): string {
  const errors = report.issues.filter((issue) => issue.severity === 'error');
  const warnings = report.issues.filter((issue) => issue.severity === 'warning');
  const lines: string[] = [];

  lines.push('# Catalog import report', '');
  lines.push(`- Result: **${report.ok ? 'imported' : 'rejected — snapshot left unchanged'}**`);
  lines.push(`- Imported at: ${report.importedAt}`);
  lines.push(`- Workbook: ${report.workbook.fileName} (sha256 \`${report.workbook.sha256.slice(0, 12)}…\`)`);
  lines.push(`- Rows read from Geral: ${report.rowsRead}`);
  lines.push(
    `- Entries: ${report.entries.total} (${report.entries.projects} initiatives, ${report.entries.studies} studies)`,
  );
  lines.push(`- Person names included: ${report.includesPersons ? 'yes' : 'no (--without-persons)'}`);
  if (report.comparedWithPrevious) {
    const { added, removed } = report.comparedWithPrevious;
    lines.push(`- Added since the previous import: ${added.length ? added.join(', ') : 'none'}`);
    lines.push(`- Removed since the previous import (IDs retired): ${removed.length ? removed.join(', ') : 'none'}`);
  }
  lines.push(`- Errors: ${errors.length} · Warnings: ${warnings.length}`, '');

  const table = (issues: readonly ImportIssue[]) => {
    lines.push('| Rule | ID | Column | Value | Message |', '| --- | --- | --- | --- | --- |');
    for (const issue of issues) {
      lines.push(
        `| \`${issue.rule}\` | ${issue.ref ?? '—'} | ${escapeCell(issue.column ?? '—')} | ${escapeCell(issue.value ?? '—')} | ${escapeCell(issue.message)} |`,
      );
    }
    lines.push('');
  };

  if (errors.length) {
    lines.push('## Errors (fix in the workbook, then import again)', '');
    table(errors);
  }

  if (warnings.length) {
    lines.push('## Warnings', '');
    const byRule = new Map<IssueRule, ImportIssue[]>();
    for (const issue of warnings) byRule.set(issue.rule, [...(byRule.get(issue.rule) ?? []), issue]);
    for (const [rule, issues] of byRule) {
      lines.push(`### \`${rule}\` — ${issues.length}`, '', RULE_DESCRIPTIONS[rule], '');
      table(issues);
    }
  }

  const placeholderColumns = Object.entries(report.placeholders);
  if (placeholderColumns.length) {
    lines.push('## Placeholders skipped as absences (D-032)', '');
    lines.push('| Column | Placeholder | Cells |', '| --- | --- | --- |');
    for (const [column, counts] of placeholderColumns) {
      for (const [placeholder, count] of Object.entries(counts)) {
        lines.push(`| ${escapeCell(column)} | ${escapeCell(placeholder)} | ${count} |`);
      }
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}
