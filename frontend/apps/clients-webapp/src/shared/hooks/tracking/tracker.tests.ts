import { describe, expect, it } from 'vitest';

import { createTracker, resolveTrackingContext, type TrackingEvent } from './tracker';

describe('tracking', () => {
  it('derives Journey and Page from the route path', () => {
    expect(resolveTrackingContext('clients-webapp', '/user/management/')).toEqual({
      app: 'clients-webapp',
      journey: 'user',
      page: 'management',
    });
    expect(resolveTrackingContext('clients-webapp', '/')).toMatchObject({ journey: 'home', page: 'home' });
    expect(resolveTrackingContext('clients-webapp', '/nowhere')).toBeNull();
  });

  it('matches parameterized paths after static ones', () => {
    expect(resolveTrackingContext('clients-webapp', '/catalog/36')).toMatchObject({ journey: 'catalog', page: 'details' });
    expect(resolveTrackingContext('clients-webapp', '/catalog')).toMatchObject({ journey: 'catalog', page: 'list' });
  });

  it('sends events with derived context', () => {
    const events: TrackingEvent[] = [];
    const tracker = createTracker('clients-webapp', () => '/user/overview', { send: (e) => events.push(e) });

    tracker.featureExposure('user.premium-benefits');

    expect(events[0]).toMatchObject({
      event: 'feature_exposure',
      journey: 'user',
      page: 'overview',
      subject: 'user.premium-benefits',
    });
  });
});
