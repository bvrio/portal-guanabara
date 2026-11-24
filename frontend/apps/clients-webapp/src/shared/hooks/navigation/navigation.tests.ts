import { describe, expect, it } from 'vitest';

import { toSafeRedirect } from './goToRoute';
import { routePath, routePaths } from './routePaths';

describe('navigation', () => {
  it('derives route paths from the Journey Manifests', () => {
    expect(routePaths).toMatchObject({
      home: '/',
      authenticationLogin: '/authentication/login',
      userOverview: '/user/overview',
      userDetails: '/user/details',
      userManagement: '/user/management',
      catalogList: '/catalog',
      institutionsList: '/institutions',
      mapExplore: '/map',
      aboutOverview: '/about',
      catalogDetails: '/catalog/:id',
    });
  });

  it('builds concrete paths for parameterized routes', () => {
    expect(routePath('catalogDetails', { id: 36 })).toBe('/catalog/36');
    expect(routePath('catalogList')).toBe('/catalog');
  });

  it('accepts only internal redirects', () => {
    expect(toSafeRedirect('/user/management')).toBe('/user/management');
    expect(toSafeRedirect('//evil.example.com')).toBeUndefined();
    expect(toSafeRedirect('https://evil.example.com')).toBeUndefined();
    expect(toSafeRedirect(undefined)).toBeUndefined();
  });
});
