import { describe, expect, it } from 'vitest';

import { homeManifest, userManifest } from '@portal-guanabara/journey-manifests';

import { resolveJourneyDecision, type AuthorizationContext } from './featureManagement';

const anonymous: AuthorizationContext = { authenticated: false, capabilities: [] };
const interested: AuthorizationContext = { authenticated: true, userType: 'interested', capabilities: [] };
const holder: AuthorizationContext = { authenticated: true, userType: 'holder', capabilities: [] };
const premium: AuthorizationContext = {
  authenticated: true,
  userType: 'holder',
  capabilities: ['holder-premium'],
};
const partner: AuthorizationContext = { authenticated: true, userType: 'partner', capabilities: [] };

describe('mock BFF Feature Management', () => {
  it('grants public Journeys to anonymous visitors', () => {
    expect(resolveJourneyDecision(homeManifest, anonymous)).toMatchObject({ granted: true, reason: null });
  });

  it('denies authenticated Journeys to anonymous visitors with reason "unauthenticated"', () => {
    const decision = resolveJourneyDecision(userManifest, anonymous);

    expect(decision).toMatchObject({ granted: false, reason: 'unauthenticated' });
    expect(Object.values(decision.features).every((enabled) => !enabled)).toBe(true);
  });

  it('denies Journeys to User Types outside the requirement with reason "forbidden"', () => {
    expect(resolveJourneyDecision(userManifest, partner)).toMatchObject({
      granted: false,
      reason: 'forbidden',
    });
  });

  it('resolves Feature access per User Type and Capability', () => {
    expect(resolveJourneyDecision(userManifest, interested).features).toMatchObject({
      'user.profile-edit': true,
      'user.communication-preferences': false,
      'user.premium-benefits': false,
    });

    expect(resolveJourneyDecision(userManifest, holder).features).toMatchObject({
      'user.communication-preferences': true,
      'user.premium-benefits': false,
    });

    expect(resolveJourneyDecision(userManifest, premium).features).toMatchObject({
      'user.communication-preferences': true,
      'user.premium-benefits': true,
    });
  });
});
