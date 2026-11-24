import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import readExcelFile from 'read-excel-file/node';

export type SheetRows = ReadonlyArray<ReadonlyArray<unknown>>;

/** The workbook as the importer sees it: raw rows per tab, plus its fingerprint. */
export interface WorkbookData {
  readonly fileName: string;
  readonly sha256: string;
  readonly sheets: Readonly<Record<string, SheetRows>>;
}

/**
 * Where the workbook comes from. Today an exported .xlsx file; Core v2.0
 * (D-048) reads Google Sheets directly with a read-only service account —
 * that will be a second implementation of this interface.
 */
export interface WorkbookSource {
  read(): Promise<WorkbookData>;
}

export function xlsxWorkbookSource(filePath: string): WorkbookSource {
  return {
    async read() {
      const bytes = await readFile(filePath);
      const sheets = await readExcelFile(bytes);

      return {
        fileName: path.basename(filePath),
        sha256: createHash('sha256').update(bytes).digest('hex'),
        sheets: Object.fromEntries(sheets.map(({ sheet, data }) => [sheet, data])),
      };
    },
  };
}
