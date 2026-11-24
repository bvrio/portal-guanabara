import { describe, expect, it } from 'vitest';

import { defaultFeatureFlags, featureFlags, resolveFeatureFlag } from './featureFlags';

describe('feature flags', () => {
  it('declares owner and removal date for every flag', () => {
    for (const flag of Object.values(featureFlags)) {
      expect(flag.owner).toBeTruthy();
      expect(flag.removeBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('resolves override → configured → default', () => {
    expect(defaultFeatureFlags()).toEqual({ homeGuidedTour: true, catalogPersonNames: false, contributionForms: false });
    expect(resolveFeatureFlag('homeGuidedTour', {})).toBe(true);
    expect(resolveFeatureFlag('homeGuidedTour', { homeGuidedTour: false })).toBe(false);
    expect(resolveFeatureFlag('homeGuidedTour', { homeGuidedTour: false }, { homeGuidedTour: true })).toBe(true);
  });
});
