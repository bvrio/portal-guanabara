import { nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';

import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { homeManifest } from '@portal-guanabara/journey-manifests';

import { useRouter } from '#imports';

import App from '~/app.vue';
import HomePage from '~/pages/common/home/HomePage.vue';
import { useGuidedTour } from '~/shared/hooks/guided-tour';

import { resolveJourneyDecision } from '../../server/mock-bff/featureManagement';

import { registerCatalogEndpoints } from './catalogEndpoints';
import { withProviders } from './withProviders';

registerCatalogEndpoints();
registerEndpoint('/mock-bff/feature-management/home', () =>
  resolveJourneyDecision(homeManifest, { authenticated: false, capabilities: [] }),
);

const inBody = (selector: string) => document.body.querySelector(selector);

describe('Guided tour across pages (Nuxt runtime, v0.9.31)', () => {
  it('starts the site tour with the page of each step and brings its drawer in for the drawer steps', async () => {
    // The App draws the tour (v0.9.31); Início gives the steps and follows the current one.
    const wrapper = await mountSuspended(withProviders(HomePage), { route: '/', attachTo: document.body });
    const tour = useGuidedTour();

    await wrapper.find('[data-testid="home-tour"]').trigger('click');
    expect(tour.open.value).toBe(true);
    expect(tour.steps.value.map((step) => [step.id, step.path])).toEqual([
      ['navigation', '/'],
      ['options', '/'],
      ['explore', '/'],
      ['to-map', '/'],
      ['map', '/map'],
      ['to-home', '/map'],
      ['sectors', '/'],
      ['charts', '/'],
      ['row', '/'],
      ['drawer', '/'],
      ['drawer-filter', '/'],
      ['entry', '/'],
      ['to-entry', '/'],
      ['details', ''],
      ['to-home-end', ''],
      ['goodbye', '/'],
    ]);

    // The drawer steps open the keyword chart's first row…
    tour.current.value = 'drawer';
    await vi.waitFor(() => expect(inBody('[data-drawer] [data-chip="keyword"]')).not.toBeNull());
    // …and the tour's last page becomes the drawer's first entry (v0.9.32).
    await vi.waitFor(() => expect(inBody('[data-drawer] article[data-ref]')).not.toBeNull());
    const first = inBody('[data-drawer] article[data-ref]')?.getAttribute('data-ref');
    await vi.waitFor(() => expect(tour.steps.value.find((step) => step.id === 'details')?.path).toBe(`/catalog/${first}`));
    // …going back to the row closes it…
    tour.current.value = 'row';
    await vi.waitFor(() => expect(inBody('[data-drawer]')).toBeNull());
    // …and when the tour ends on it, it stays open for the visitor (v0.9.29).
    tour.current.value = 'drawer-filter';
    await vi.waitFor(() => expect(inBody('[data-drawer]')).not.toBeNull());
    tour.open.value = false;
    tour.current.value = null;
    await nextTick();
    expect(inBody('[data-drawer]')).not.toBeNull();

    wrapper.unmount();
    tour.steps.value = [];
  });
  it('goes to the page of each step: from Início to the Mapa and back, with passing balloons', { timeout: 30000 }, async () => {
    const wrapper = await mountSuspended(App, { route: '/', attachTo: document.body });
    const router = useRouter();
    const tour = useGuidedTour();

    await vi.waitFor(() => expect(inBody('[data-testid="home-tour"]')).not.toBeNull());
    (inBody('[data-testid="home-tour"]') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(inBody('[data-tour-step]')).not.toBeNull());
    // The passing balloons are not counted: 12 steps (v0.9.33).
    expect(inBody('[data-guided-tour]')?.textContent).toContain('Passo 1 de 12');

    const next = () => (inBody('[data-tour-next]') as HTMLButtonElement).click();
    const stepId = () => inBody('[data-tour-step]')?.getAttribute('data-tour-step');
    // navigation → options → explore → a balloon taps the Mapa tab and moves on by itself.
    for (const id of ['options', 'explore', 'to-map']) {
      next();
      await vi.waitFor(() => expect(stepId()).toBe(id));
    }
    expect(inBody('[data-tour-countdown]')).not.toBeNull();
    expect(inBody('[data-tour-next]')).toBeNull();
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/map'), { timeout: 5000 });
    await vi.waitFor(() => expect(stepId()).toBe('map'), { timeout: 5000 });
    expect(inBody('[data-guided-tour]')?.textContent).toContain('Passo 4 de 12');
    await vi.waitFor(() => expect(inBody('[data-tour="map"]')).not.toBeNull(), { timeout: 5000 });

    // "Vamos voltar para o Início", then the sectors, on Início again.
    next();
    await vi.waitFor(() => expect(stepId()).toBe('to-home'));
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/'), { timeout: 5000 });
    await vi.waitFor(() => expect(stepId()).toBe('sectors'), { timeout: 5000 });
    expect(inBody('[data-guided-tour]')?.textContent).toContain('Passo 5 de 12');

    // Esc leaves the tour; the App forgets the step.
    inBody('[data-tour-step]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await vi.waitFor(() => expect(tour.open.value).toBe(false));
    expect(tour.current.value).toBeNull();
    wrapper.unmount();
  });
});
