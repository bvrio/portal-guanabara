import { buildPagePath, matchPagePath, pathParamNames, pathPatternError, routeFolderOf } from './paths.ts';
import { validateManifests } from './validateManifests.ts';
import { catalogManifest } from './journeys/catalog.manifest.ts';

describe('page path patterns', () => {
  it('accepts static and :camelCase segments only', () => {
    expect(pathPatternError('/catalog/:id')).toBeNull();
    expect(pathPatternError('/')).toBeNull();
    expect(pathPatternError('catalog')).toBe('path must start with "/"');
    expect(pathPatternError('/catalog/')).toBe('path must not end with "/"');
    expect(pathPatternError('/catalog/[id]')).toContain('must be kebab-case or a :camelCase parameter');
    expect(pathPatternError('/a/:id/b/:id')).toBe('parameter :id is declared twice');
  });

  it('matches concrete paths and extracts parameters', () => {
    expect(matchPagePath('/catalog/:id', '/catalog/36')).toEqual({ id: '36' });
    expect(matchPagePath('/catalog/:id', '/catalog/36?from=list')).toEqual({ id: '36' });
    expect(matchPagePath('/catalog/list', '/catalog/list')).toEqual({});
    expect(matchPagePath('/catalog/:id', '/catalog')).toBeNull();
    expect(matchPagePath('/user/overview', '/user/details')).toBeNull();
  });

  it('builds paths and route folders', () => {
    expect(buildPagePath('/catalog/:id', { id: 36 })).toBe('/catalog/36');
    expect(buildPagePath('/')).toBe('/');
    expect(() => buildPagePath('/catalog/:id')).toThrow('Missing path parameter "id"');
    expect(routeFolderOf('/catalog/:id')).toBe('catalog/[id]');
    expect(pathParamNames('/catalog/:id')).toEqual(['id']);
  });

  it('treats patterns that differ only in parameter names as the same route', () => {
    const duplicated = {
      ...catalogManifest,
      pages: [...catalogManifest.pages, { ...catalogManifest.pages[1]!, key: 'copy', path: '/catalog/:ref' }],
    };
    expect(validateManifests([duplicated]).some((error) => error.includes('declared twice'))).toBe(true);
  });
});
