import { describe, expect, it } from 'vitest';

import { initialsOf } from './session';

describe('session', () => {
  it('takes the first letters of the first and second names', () => {
    expect(initialsOf('Maria Silva Santos')).toBe('MS');
    expect(initialsOf('  ana   interessada ')).toBe('AI');
    expect(initialsOf('Élida')).toBe('É');
    expect(initialsOf('')).toBe('');
  });
});
