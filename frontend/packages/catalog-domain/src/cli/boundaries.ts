/**
 * Builds data/municipality-boundaries.json for the Map Journey (provisional).
 *
 *   node src/cli/boundaries.ts --file <municipios-poligonos.json>
 *
 * The input is `municipios-poligonos.json` from the npm package
 * `ibge-cidades-com-poligonos` (IBGE municipalities × outlines, ISC). Download
 * and unpack it in a folder of its own and pass the path: the file is data,
 * never executed. Keeps the RJ municipalities that touch the map view, rounds
 * coordinates to 4 decimals and drops repeated points.
 * Runs on Node's built-in TypeScript support (Node 22.18+).
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { buildBoundaries, type SourceMunicipality } from '../geo/buildBoundaries.ts';

const { values } = parseArgs({ options: { file: { type: 'string' }, out: { type: 'string' } } });
if (!values.file) {
  console.error('Usage: node src/cli/boundaries.ts --file <municipios-poligonos.json> [--out <dir>]');
  process.exit(1);
}
const source = JSON.parse(await readFile(values.file, 'utf8')) as SourceMunicipality[];
const result = buildBoundaries(source);
const out = path.join(values.out ?? path.join(import.meta.dirname, '../../data'), 'municipality-boundaries.json');
await writeFile(out, `${JSON.stringify(result)}\n`);
console.log(`✓ ${result.municipalities.length} municipalities → ${path.relative(process.cwd(), out)}`);
