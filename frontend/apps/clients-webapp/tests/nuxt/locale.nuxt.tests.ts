import { afterEach, describe, expect, it } from 'vitest';

import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { homeManifest } from '@portal-guanabara/journey-manifests';

import { loadLocaleMessages, localeState } from '~/lib/i18n';
import HomePage from '~/pages/common/home/HomePage.vue';
import MapPage from '~/pages/common/map/explore/ExplorePage.vue';

import { resolveJourneyDecision } from '../../server/mock-bff/featureManagement';

import { registerCatalogEndpoints } from './catalogEndpoints';
import { withProviders } from './withProviders';

registerCatalogEndpoints();
registerEndpoint('/mock-bff/feature-management/home', () =>
  resolveJourneyDecision(homeManifest, { authenticated: false, capabilities: [] }),
);

afterEach(() => {
  localeState().value = 'pt-BR';
});

describe('Languages (Nuxt runtime)', () => {
  it('renders Home in English, with the controlled vocabularies translated by the API', async () => {
    localeState().value = 'en';
    const messages = await loadLocaleMessages('en');
    const wrapper = await mountSuspended(withProviders(HomePage, { locale: 'en', messages }), { route: '/' });

    expect(wrapper.find('h1').text()).toBe('Who studies and who acts for Guanabara Bay, in one place');
    expect(wrapper.find('#home-duo-title').text()).toBe('Explore the catalogue');
    expect(wrapper.find('[data-sector="interior"]').text()).toContain('Inner bay');
    expect(wrapper.find('[data-dimension="keyword"]').text()).toContain('Macro-litter');
    // Proper names stay as they are.
    expect(wrapper.find('#home-academia').text()).toContain('UFRJ');
  });

  it('renders the Map in French', async () => {
    localeState().value = 'fr';
    const messages = await loadLocaleMessages('fr');
    const wrapper = await mountSuspended(withProviders(MapPage, { locale: 'fr', messages }), { route: '/map' });

    expect(wrapper.find('h1').text()).toBe('Carte du catalogue');
    expect(wrapper.find('[data-municipality-map] g[role="button"][data-municipality]').attributes('aria-label')).toMatch(
      /^Rio de Janeiro : 2\d fiches$/,
    );
    expect(wrapper.find('[data-municipality-map] g[data-sector="interior"]').attributes('aria-label')).toBe('Secteur Intérieur : 13 fiches');
  });
});
