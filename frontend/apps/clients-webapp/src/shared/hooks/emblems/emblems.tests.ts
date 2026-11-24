import { describe, expect, it } from 'vitest';

import { createEmblems } from './useEmblems';

describe('emblems', () => {
  it('serves registered files and nothing for the rest', () => {
    const emblems = createEmblems({ niteroi: 'niteroi.svg' }, { uff: 'uff.png' });
    expect(emblems.municipalityFlag('niteroi')).toBe('/emblems/municipalities/niteroi.svg');
    expect(emblems.municipalityFlag('mage')).toBeUndefined();
    expect(emblems.institutionLogo('uff')).toBe('/emblems/institutions/uff.png');
    expect(emblems.institutionLogo('inea')).toBeUndefined();
  });
});
