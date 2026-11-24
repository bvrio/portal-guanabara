/**
 * Catalog import — the developer-run command of Core v2.0 (D-048).
 *
 *   pnpm catalog:import --file ~/Downloads/mapeamento.xlsx
 *   pnpm catalog:import --file mapeamento.xlsx --dry-run
 *   pnpm catalog:import --file mapeamento.xlsx --without-persons
 *
 * Reads the workbook, applies the Core v2.0 rules and, when no rule breaks,
 * replaces data/catalog-snapshot.json. The report (data/import-report.md) is
 * always written, so a rejected import still says which rows to fix.
 * Runs on Node's built-in TypeScript support (Node 22.18+).
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { importCatalog } from '../importer/importCatalog.ts';
import { renderReportMarkdown } from '../importer/report.ts';
import { xlsxWorkbookSource } from '../importer/workbook.ts';
import type { CatalogSnapshot } from '../model/snapshot.ts';

const HELP = `Usage: pnpm catalog:import --file <workbook.xlsx> [--out <dir>] [--dry-run] [--without-persons]

  --file              Exported mapping workbook (.xlsx). Also read from CATALOG_WORKBOOK.
  --out               Output folder (default: packages/catalog-domain/data).
  --dry-run           Validate and print the report; write nothing.
  --without-persons   Do not import person names (coordinators, authors).`;

const { values } = parseArgs({
  options: {
    file: { type: 'string' },
    out: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    'without-persons': { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  },
});

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

const file = values.file ?? process.env.CATALOG_WORKBOOK;
if (!file) {
  console.error(`Missing --file.\n\n${HELP}`);
  process.exit(2);
}

const outDir = path.resolve(values.out ?? path.join(import.meta.dirname, '..', '..', 'data'));
const snapshotPath = path.join(outDir, 'catalog-snapshot.json');
const reportPath = path.join(outDir, 'import-report.md');

const previous = existsSync(snapshotPath)
  ? (JSON.parse(await readFile(snapshotPath, 'utf8')) as CatalogSnapshot)
  : null;

const workbook = await xlsxWorkbookSource(path.resolve(file)).read();
const { snapshot, report } = importCatalog(workbook, {
  importedAt: new Date().toISOString(),
  includePersons: !values['without-persons'],
  previous,
});

const markdown = renderReportMarkdown(report);
const errors = report.issues.filter((issue) => issue.severity === 'error');
const warnings = report.issues.length - errors.length;

if (values['dry-run']) {
  console.log(markdown);
} else {
  await writeFile(reportPath, markdown);
  if (snapshot) await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
}

console.log(
  `${report.ok ? '✓ Imported' : '✗ Rejected'}: ${report.entries.total} entries ` +
    `(${report.entries.projects} initiatives, ${report.entries.studies} studies) · ` +
    `${errors.length} errors · ${warnings} warnings`,
);
for (const error of errors.slice(0, 20)) {
  console.error(`  ✗ [${error.rule}] ${error.ref ? `ID ${error.ref}: ` : ''}${error.message}`);
}
if (!values['dry-run']) {
  console.log(`  report:   ${path.relative(process.cwd(), reportPath)}`);
  if (snapshot) console.log(`  snapshot: ${path.relative(process.cwd(), snapshotPath)}`);
}

process.exit(report.ok ? 0 : 1);
