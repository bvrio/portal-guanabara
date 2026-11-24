/**
 * The API contract (openapi.json) against what the read services really return.
 * The web app's server routes return these values as they are, and the backend
 * that replaces them (docs/architecture/backend.md) must return the same shapes:
 * a change to either side that breaks the other fails here.
 */
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import spec from '../../openapi.json' with { type: 'json' };
import { CATALOG_LOCALES } from '../i18n/catalogLocale.ts';
import { getCatalogReader } from '../read/catalogReader.ts';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema({ $id: 'openapi', components: spec.components });

function expectValid(schema: string, value: unknown) {
  const validate = ajv.getSchema(`openapi#/components/schemas/${schema}`);
  if (!validate) throw new Error(`No schema ${schema} in openapi.json`);
  const valid = validate(value);
  expect(valid ? [] : ajv.errorsText(validate.errors, { separator: '\n' }).split('\n')).toEqual([]);
}

describe('openapi.json', () => {
  it('declares every public read with its response schema', () => {
    const operations = Object.entries(spec.paths).flatMap(([path, item]) =>
      Object.entries(item).map(([method, operation]) => `${method.toUpperCase()} ${path} ${(operation as { operationId: string }).operationId}`),
    );
    expect(operations).toEqual(
      expect.arrayContaining([
        'GET /catalog/overview getOverview',
        'GET /catalog/entries listEntries',
        'GET /catalog/entries/{ref} getEntry',
        'GET /catalog/institutions listInstitutions',
        'GET /catalog/map getMap',
      ]),
    );
  });

  describe.each(CATALOG_LOCALES)('matches the read services (%s)', (locale) => {
    const reader = getCatalogReader(locale);

    it('overview', () => expectValid('Overview', reader.getOverview()));

    it('entry list, with and without filters', () => {
      expectValid('ListResult', reader.listEntries());
      expectValid('ListResult', reader.listEntries({ kind: 'project', status: 'active', sort: 'name', page: 2, pageSize: 5 }));
      expectValid('ListResult', reader.listEntries({ q: 'manguezal', from: '2020-01', to: '2024-12', municipality: 'niteroi' }));
      expectValid('ListResult', reader.listEntries({ keyword: 'unknown-code', q: 'nada-disso' }));
    });

    it('every entry, with and without person names', () => {
      for (const { ref } of reader.listEntries({ pageSize: 48 }).items) {
        expectValid('EntryDetails', reader.getEntry(ref));
        expectValid('EntryDetails', reader.getEntry(ref, { includePersons: true }));
      }
    });

    it('institutions', () => {
      expectValid('InstitutionListResult', reader.listInstitutions());
      expectValid('InstitutionListResult', reader.listInstitutions({ role: 'author', kind: 'study', sort: 'name' }));
    });

    it('map', () => expectValid('Map', reader.getMap()));
  });
});
