import { describe, expect, it } from 'vitest';

import { parseContribution } from './contributions';

describe('parseContribution', () => {
  it('accepts what the form asks for and drops the rest', () => {
    expect(
      parseContribution({ audience: 'public', subject: 'fix-entry', target: ' 36 ', details: 'Ano errado', extra: 'x' }),
    ).toEqual({ audience: 'public', subject: 'fix-entry', fields: { target: '36', details: 'Ano errado' } });
  });

  it('refuses what the form would not send', () => {
    expect(parseContribution({ audience: 'public', subject: 'new-entry', details: 'Sem nome' })).toBeNull();
    expect(parseContribution({ audience: 'team', subject: 'new-entry', name: 'X', details: 'Y' })).toBeNull();
    expect(parseContribution({ audience: 'public', subject: 'new-entry', name: 'X', details: 'Y', contactEmail: 'nope' })).toBeNull();
    expect(parseContribution({ audience: 'admin', subject: 'new-entry', name: 'X', details: 'Y' })).toBeNull();
  });
});
