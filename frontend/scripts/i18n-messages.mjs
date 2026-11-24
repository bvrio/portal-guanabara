/**
 * Message extraction and checks (Phase 6).
 *
 *   pnpm i18n:extract   → writes apps/clients-webapp/locales/pt-BR.json
 *   pnpm i18n:check     → fails when a rule breaks or the catalog is out of date
 *
 * Product copy lives in colocated `*.messages.ts` files (`defineMessages`).
 * `@formatjs/cli` extracts it into one source catalog — the file a translator
 * starts from, and the one other locales (`locales/<lang>.json`) mirror.
 * Whitespace is kept as written, so a non-breaking space (“+ Filtro”) reaches
 * the catalog too.
 *
 * Translations (v0.7): `locales/en.json`, `es.json` and `fr.json` map every id
 * to its text. Portuguese needs no catalog at runtime (descriptors carry it).
 *
 * Rules:
 *   1. Every message is valid ICU MessageFormat.
 *   2. Ids are unique across the repository.
 *   3. Ids follow the owner: `clients.*` in the App, `presentationLake.*` in the lake.
 *   4. Copy lives in `*.messages.ts`: no `defaultMessage` in .vue files and no
 *      `defineMessages` call outside messages files.
 *   5. Every translation catalog has exactly the source ids, each a valid ICU
 *      message with the same arguments as the Portuguese source.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parse } from '@formatjs/icu-messageformat-parser';

const root = process.cwd();
const mode = process.argv.includes('--write') ? 'write' : 'check';
const catalogPath = path.join(root, 'apps/clients-webapp/locales/pt-BR.json');
const translationLocales = ['en', 'es', 'fr'];

const sources = [
  { dir: 'apps/clients-webapp/src', prefix: 'clients.' },
  { dir: 'packages/presentation-lake/src', prefix: 'presentationLake.' },
];

const errors = [];

function walk(dir, extensions) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(full, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [full] : [];
  });
}

const rel = (file) => path.relative(root, file);

// --------------------------------------------------------------- sources
const messageFiles = sources.flatMap(({ dir, prefix }) =>
  walk(path.join(root, dir), ['.messages.ts']).map((file) => ({ file, prefix })),
);

// ---------------------------------------------------- rules 2 and 3 (ids)
const seen = new Map();
for (const { file, prefix } of messageFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)) {
    const id = match[1];
    if (seen.has(id)) errors.push(`Duplicated id "${id}" in ${rel(file)} and ${seen.get(id)}`);
    seen.set(id, rel(file));
    if (!id.startsWith(prefix)) errors.push(`Id "${id}" in ${rel(file)} must start with "${prefix}"`);
  }
}

// ------------------------------------------------------------ extraction
if (errors.length) {
  console.error('Message checks failed:');
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exit(1);
}

const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pg-i18n-')), 'messages.json');
try {
  execFileSync(
    path.join(root, 'node_modules/.bin/formatjs'),
    ['extract', ...messageFiles.map(({ file }) => file), '--out-file', tmp, '--throws', '--preserve-whitespace'],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
} catch (error) {
  console.error(`✗ @formatjs/cli could not extract the messages:\n${String(error.stderr ?? error.message).split('\n')[0]}`);
  process.exit(1);
}
const extracted = JSON.parse(fs.readFileSync(tmp, 'utf8'));

// ------------------------------------------------------------ rule 1 (ICU)
for (const [id, descriptor] of Object.entries(extracted)) {
  try {
    parse(descriptor.defaultMessage);
  } catch (error) {
    errors.push(`Invalid ICU message "${id}": ${error.message}`);
  }
}

// ------------------------------------------------------- rule 4 (location)
for (const { dir } of sources) {
  for (const file of walk(path.join(root, dir), ['.vue'])) {
    if (/\bdefaultMessage\s*:\s*['"`]/.test(fs.readFileSync(file, 'utf8'))) {
      errors.push(`Copy belongs in a *.messages.ts file, not in ${rel(file)}`);
    }
  }
  for (const file of walk(path.join(root, dir), ['.ts'])) {
    if (file.endsWith('.messages.ts') || /\.(tests|stories)\.ts$/.test(file) || file.endsWith('defineMessages.ts')) continue;
    if (/\bdefineMessages\s*\(/.test(fs.readFileSync(file, 'utf8'))) {
      errors.push(`defineMessages belongs in a *.messages.ts file, not in ${rel(file)}`);
    }
  }
}

// ---------------------------------------------------- rule 5 (translations)
/** Argument and tag names of a parsed message, e.g. `count`, `<study>` (plural `#` is not one). */
function argumentsOf(elements, names = new Set()) {
  for (const element of elements) {
    if (element.type === 0 || element.type === 7) continue; // literal, pound
    if (element.type === 8) {
      names.add(`<${element.value}>`); // rich-text tag, e.g. <study>
      argumentsOf(element.children, names);
      continue;
    }
    names.add(element.value);
    for (const option of Object.values(element.options ?? {})) argumentsOf(option.value, names);
  }
  return names;
}

const sourceArguments = new Map();
for (const [id, descriptor] of Object.entries(extracted)) {
  try {
    sourceArguments.set(id, [...argumentsOf(parse(descriptor.defaultMessage))].sort().join(','));
  } catch {
    // Reported by rule 1.
  }
}

const translationErrors = [];
const translationCounts = [];
for (const locale of translationLocales) {
  const file = path.join(root, `apps/clients-webapp/locales/${locale}.json`);
  if (!fs.existsSync(file)) {
    translationErrors.push(`${rel(file)} is missing`);
    continue;
  }
  const messages = JSON.parse(fs.readFileSync(file, 'utf8'));
  translationCounts.push(`${locale} ${Object.keys(messages).length}`);
  for (const id of Object.keys(extracted)) {
    if (typeof messages[id] !== 'string') translationErrors.push(`${locale}: missing "${id}"`);
  }
  for (const [id, text] of Object.entries(messages)) {
    if (!(id in extracted)) {
      translationErrors.push(`${locale}: "${id}" is not a source message (removed or renamed?)`);
      continue;
    }
    try {
      const names = [...argumentsOf(parse(text))].sort().join(',');
      if (sourceArguments.has(id) && names !== sourceArguments.get(id)) {
        translationErrors.push(`${locale}: "${id}" uses {${names}} but the source uses {${sourceArguments.get(id)}}`);
      }
    } catch (error) {
      translationErrors.push(`${locale}: invalid ICU message "${id}": ${error.message}`);
    }
  }
}

// --------------------------------------------------------------- catalog
const catalog = Object.fromEntries(
  Object.keys(extracted)
    .sort()
    .map((id) => [id, extracted[id].description ? extracted[id] : { defaultMessage: extracted[id].defaultMessage }]),
);
const serialized = `${JSON.stringify(catalog, null, 2)}\n`;

if (errors.length) {
  console.error('Message checks failed:');
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exit(1);
}

if (mode === 'write') {
  fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
  fs.writeFileSync(catalogPath, serialized);
  console.log(`✓ ${Object.keys(catalog).length} messages from ${messageFiles.length} files → ${rel(catalogPath)}`);
  if (translationErrors.length) {
    console.error('Translations to update (locales/<locale>.json):');
    for (const error of translationErrors) console.error(`  ✗ ${error}`);
    process.exit(1);
  }
} else {
  const current = fs.existsSync(catalogPath) ? fs.readFileSync(catalogPath, 'utf8') : '';
  if (current !== serialized) {
    console.error(`✗ ${rel(catalogPath)} is out of date — run pnpm i18n:extract and commit the result.`);
    process.exit(1);
  }
  if (translationErrors.length) {
    console.error('Translation checks failed:');
    for (const error of translationErrors) console.error(`  ✗ ${error}`);
    process.exit(1);
  }
  console.log(`✓ ${Object.keys(catalog).length} messages valid and ${rel(catalogPath)} up to date.`);
  console.log(`✓ translations complete (${translationCounts.join(', ')}).`);
}
