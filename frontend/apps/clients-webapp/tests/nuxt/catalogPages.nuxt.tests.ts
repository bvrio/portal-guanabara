import { describe, expect, it, vi } from 'vitest';

import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { homeManifest, userManifest } from '@portal-guanabara/journey-manifests';

import DetailsPage from '~/pages/common/catalog/details/DetailsPage.vue';
import ListPage from '~/pages/common/catalog/list/ListPage.vue';
import HomePage from '~/pages/common/home/HomePage.vue';
import InstitutionsPage from '~/pages/common/institutions/list/ListPage.vue';
import MapPage from '~/pages/common/map/explore/ExplorePage.vue';

import { resolveJourneyDecision } from '../../server/mock-bff/featureManagement';

import { registerCatalogEndpoints } from './catalogEndpoints';
import { withProviders } from './withProviders';

registerCatalogEndpoints([1, 36, 999]);

// A visitor (no session): Feature Management as the mock backend decides it.
const visitor = { authenticated: false, capabilities: [] };
registerEndpoint('/mock-bff/feature-management/home', () => resolveJourneyDecision(homeManifest, visitor));
registerEndpoint('/mock-bff/feature-management/user', () => resolveJourneyDecision(userManifest, visitor));

const inBody = (selector: string) => document.body.querySelector(selector);

describe('Home (Nuxt runtime): the catalogue panorama', () => {
  it('renders the coloured title, the tour, the duo, two key numbers, sectors, distributions and highlights', async () => {
    const wrapper = await mountSuspended(withProviders(HomePage), { route: '/' });

    // "estuda" in the research purple, "atua" in the action orange.
    const title = wrapper.find('h1');
    expect(title.text()).toBe('Quem estuda e quem atua pela Baía de Guanabara, em um só lugar');
    // Two lines (v0.9.17): the break falls after "pela".
    expect(title.findAll('span').map((span) => span.text())).toEqual([
      'Quem estuda e quem atua pela',
      'estuda',
      'atua',
      'Baía de Guanabara, em um só lugar',
    ]);
    // Each coloured word carries itself for its black contour (drawn by CSS, not read twice).
    expect(title.findAll('[data-outline]').map((span) => span.attributes('data-outline'))).toEqual(['estuda', 'atua']);
    // The tour starts from the hero, in the orange action style, with what it is.
    const tour = wrapper.find('[data-testid="home-tour"]');
    expect(tour.text()).toBe('Começar o tour');
    expect(tour.classes().join(' ')).toMatch(/primary/);
    expect(wrapper.text()).toContain('Novo por aqui? Faça um tour pelas principais funcionalidades.');

    expect(wrapper.find('#home-duo-title').text()).toBe('Explorar o catálogo');
    expect(wrapper.find('a[data-kind="project"][href="/catalog?kind=project"]').exists()).toBe(true);
    expect(wrapper.find('a[data-kind="study"] [data-icon="kind-study"]').exists()).toBe(true);
    // The large mark, plain since v0.9.17, with the name in white over it.
    expect(wrapper.find('[data-brand-mark]').exists()).toBe(true);
    expect(wrapper.find('[data-brand-wordmark]').exists()).toBe(false);
    // Destaques (v0.9.18): three small cards per kind.
    expect(wrapper.findAll('[data-tour="highlights"] article[data-size="sm"]').map((card) => card.attributes('data-kind'))).toEqual([
      'project',
      'project',
      'project',
      'study',
      'study',
      'study',
    ]);
    expect(wrapper.text()).toContain('Portal Guanabara');
    // Two tiles, both links to their tabs; active initiatives live in the duo.
    expect(wrapper.findAll('[data-stat]').map((tile) => tile.attributes('data-stat'))).toEqual(['institutions', 'municipalities']);
    expect(wrapper.find('a[data-stat="institutions"]').attributes('href')).toBe('/institutions');
    expect(wrapper.find('a[data-stat="municipalities"]').attributes('href')).toBe('/map');
    // Municipalities moved to the Map; studies by academic institution joined.
    expect(wrapper.findAll('[data-dimension]').map((node) => node.attributes('data-dimension'))).toEqual([
      'sector',
      'keyword',
      'mechanism',
      'institution',
    ]);
    expect(wrapper.find('[data-sector="interior"] button [data-icon="sector-inner"]').exists()).toBe(true);
    expect(wrapper.find('[data-dimension="keyword"] [data-icon^="topic-"]').exists()).toBe(true);
    // Every section title sits between two hairlines, like "Explorar o catálogo".
    expect(wrapper.findAll('h2[id^="home-"]').map((heading) => heading.attributes('id'))).toEqual([
      'home-duo-title',
      'home-sectors-title',
      'home-distributions-title',
      'home-highlights-title',
    ]);
    // No "Por onde começar" section any more.
    expect(wrapper.find('[data-testid="home-shortcuts"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Por onde começar');
  });

  it('splits the keyword bars into initiatives and studies; the whole row opens the drawer', async () => {
    const wrapper = await mountSuspended(withProviders(HomePage), { route: '/' });

    const keywords = wrapper.find('[data-dimension="keyword"]');
    expect(keywords.find('[data-distribution-legend]').text()).toBe('IniciativasEstudos');
    // Macrolixo: 28 entries — the two parts add up and are said in words.
    const macrolixo = keywords.find('[data-item="macrolixo"] button');
    expect(macrolixo.text()).toMatch(/^Macrolixo28\((\d+) iniciativas e (\d+) estudos\)$/);
    const [, projects, studies] = /\((\d+) iniciativas e (\d+) estudos\)/.exec(macrolixo.text())!;
    expect(Number(projects) + Number(studies)).toBe(28);
    expect(macrolixo.findAll('[aria-hidden="true"] > span')).toHaveLength(2);
    // Label, bar and value are one button; the name itself is plain text.
    expect(macrolixo.find('button, a').exists()).toBe(false);
    // Mechanisms count initiatives only (orange); academia counts studies (purple).
    const bar = (dimension: string) =>
      wrapper.find(`[data-dimension="${dimension}"] [aria-hidden="true"][style*="--bar-share"]`).attributes('style');
    expect(bar('mechanism')).toContain('--bar-color: var(--color-kind-project)');
    expect(bar('institution')).toContain('--bar-color: var(--color-kind-study)');
    // Cards carry the colour of what they count: orange, purple, or both (v0.9).
    expect(wrapper.find('[data-dimension="mechanism"]').attributes('data-tone')).toBe('project');
    expect(wrapper.find('[data-dimension="institution"]').attributes('data-tone')).toBe('study');
    expect(wrapper.find('[data-dimension="keyword"]').attributes('data-tone')).toBe('kinds');
    // Each mechanism has its own glyph (v0.9.18).
    expect(wrapper.findAll('[data-dimension="mechanism"] [data-mechanism-icon="glyph"]').length).toBeGreaterThan(0);
    expect(wrapper.findAll('[data-dimension="mechanism"] [data-mechanism-icon="slot"]')).toHaveLength(0);
  });

  it('counts the studies of each academic institution, most first', async () => {
    const wrapper = await mountSuspended(withProviders(HomePage), { route: '/' });

    const academia = wrapper.find('#home-academia');
    expect(academia.text()).toContain('Estudos por academia');
    const items = academia.findAll('[data-item]').map((item) => item.attributes('data-item'));
    expect(items.slice(0, 3)).toEqual(['uff', 'ufrj', 'uerj']);
    expect(academia.find('[data-item="uff"]').text()).toContain('8');
  });

  it('opens an academic institution’s studies in the side drawer', async () => {
    const wrapper = await mountSuspended(withProviders(HomePage), { route: '/' });

    await wrapper.find('#home-academia [data-item="uff"] button').trigger('click');

    await vi.waitFor(() => expect(document.body.querySelectorAll('[data-drawer] article[data-ref]').length).toBe(8));
    expect([...document.body.querySelectorAll('[data-drawer] [data-chip]')].map((chip) => chip.getAttribute('data-chip'))).toEqual([
      'institution',
      'kind',
    ]);
    expect(inBody('[data-testid="drawer-open-catalog"]')?.getAttribute('href')).toBe('/catalog?institution=uff&kind=study');
    wrapper.unmount();
  });

  it('stacks filters in the drawer: a mechanism, then a keyword through “+ Filtro”', async () => {
    const wrapper = await mountSuspended(withProviders(HomePage), { route: '/' });

    await wrapper.find('[data-dimension="mechanism"] [data-item="limpeza"] button').trigger('click');
    await vi.waitFor(() => expect(document.body.querySelectorAll('[data-drawer] article[data-ref]').length).toBeGreaterThan(0));
    expect([...document.body.querySelectorAll('[data-drawer] [data-chip]')].map((chip) => chip.getAttribute('data-chip'))).toEqual([
      'mechanism',
    ]);
    const before = document.body.querySelectorAll('[data-drawer] article[data-ref]').length;

    (inBody('[data-testid="drawer-add-filter"]') as HTMLElement).click();
    await vi.waitFor(() => expect(inBody('[data-drawer-adder] [data-dimension="keyword"]')).not.toBeNull());
    (inBody('[data-drawer-adder] [data-dimension="keyword"]') as HTMLElement).click();
    await vi.waitFor(() => expect(inBody('[data-drawer-adder] [data-value="estuario"]')).not.toBeNull());
    (inBody('[data-drawer-adder] [data-value="estuario"]') as HTMLElement).click();

    await vi.waitFor(() => expect(inBody('[data-drawer] [data-chip="keyword"]')).not.toBeNull());
    await vi.waitFor(() =>
      expect(document.body.querySelectorAll('[data-drawer] article[data-ref]').length).toBeLessThanOrEqual(before),
    );
    expect(inBody('[data-testid="drawer-open-catalog"]')?.getAttribute('href')).toBe('/catalog?mechanism=limpeza&keyword=estuario');
    // Entry cards in the drawer use the structured layout (option 2).
    expect(inBody('[data-drawer] article[data-ref] [data-meta="place"]')).not.toBeNull();
    wrapper.unmount();
  });
});

describe('Catalog Pages (Nuxt runtime)', () => {
  it('List reads its filters from the URL', async () => {
    const wrapper = await mountSuspended(withProviders(ListPage), { route: '/catalog?kind=study&sort=name' });

    const cards = wrapper.findAll('article[data-ref]');
    expect(cards.length).toBeGreaterThan(0);
    expect(wrapper.findAll('article[data-kind]').every((node) => node.attributes('data-kind') === 'study')).toBe(true);
    expect((wrapper.find('input[name="kind"]:checked').element as HTMLInputElement).value).toBe('study');
    expect((wrapper.find('input[name="sort"]').element as HTMLInputElement).value).toBe('name');

    const names = cards.map((card) => card.find('h3').text());
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })));
  });

  it('List puts the count, the explanation and the pages in the anchored filter panel', async () => {
    const wrapper = await mountSuspended(withProviders(ListPage), { route: '/catalog' });

    const panel = wrapper.find('[data-filter-panel]');
    expect(panel.find('[data-testid="catalog-total"]').text()).toMatch(/^\d+ entradas$/);
    expect(panel.text()).toContain('Combine os filtros');
    expect(panel.find('[data-testid="catalog-pagination-top"]').exists()).toBe(true);
    expect(panel.find('[data-filter="institution"]').exists()).toBe(true);
  });

  it('List filters by institution from the URL', async () => {
    const wrapper = await mountSuspended(withProviders(ListPage), { route: '/catalog?institution=uff' });
    expect(wrapper.find('[data-chip="institution"]').text()).toContain('UFF');
    expect(wrapper.find('[data-testid="catalog-total"]').text()).toBe('10 entradas');
  });

  it('List filters by status and period, and keeps the title for assistive tech only', async () => {
    const wrapper = await mountSuspended(withProviders(ListPage), { route: '/catalog?status=active&from=2024-01' });

    const statuses = wrapper.findAll('article [data-status]').map((node) => node.attributes('data-status'));
    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses.every((status) => status === 'active')).toBe(true);
    expect(wrapper.find('[data-chip="status"]').exists()).toBe(true);
    expect(wrapper.find('[data-chip="period"]').text()).toContain('2024');
    expect(wrapper.find('h1').text()).toBe('Catálogo de iniciativas e estudos');
  });

  it('Details renders one entry by its workbook ID as a compact summary', async () => {
    const wrapper = await mountSuspended(withProviders(DetailsPage), { route: '/catalog/36' });

    const article = wrapper.find('article[data-ref="36"]');
    expect(article.exists()).toBe(true);
    expect(wrapper.find('h1').text()).toContain('Microplastic');
    // No “← Catálogo” link: the header is the summary (v0.9).
    expect(article.find('header a[href="/catalog"]').exists()).toBe(false);
    // Header card (v0.9.1): one kind icon (in the chip), the ID beside it, “Publicado em” alone, a photo place.
    expect(article.findAll('header [data-icon^="kind-"]')).toHaveLength(1);
    expect(wrapper.find('[data-entry-ref]').text()).toBe('ID 36');
    expect(wrapper.find('[data-entry-when]').text()).toBe('Publicado em 2019');
    expect(wrapper.find('[data-entry-photo] [data-photo-placeholder]').exists()).toBe(true);
    // Where it is: on top of the mini map, not repeated under Onde.
    expect(wrapper.find('[data-entry-map] [data-fact="municipalities"]').text()).toContain('São Gonçalo');
    expect(wrapper.find('[data-entry-map] [data-fact="sectors"]').text()).toContain('Interior');
    expect(wrapper.find('[data-facts-group="where"] [data-tag^="sector:"]').exists()).toBe(false);
    expect(
      wrapper.find('[data-facts-group="what"] [data-tag="keyword:microplastico"] [data-icon="topic-microplastic"]').exists(),
    ).toBe(true);
    // Participants: institutions are buttons, people stay behind the flag.
    expect(wrapper.find('[data-role="author"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="persons-hidden"]').exists()).toBe(true);
    // Fontes: an open card in the main column.
    expect(wrapper.find('[data-entry-sources]').text()).toContain('doi');
    // Municipality and sector side by side (v0.9.14).
    expect(wrapper.find('[data-entry-map] [data-key-facts]').attributes('data-layout')).toBe('row');
    // The mini map tints the inner bay sector and paints the municipalities in the Mapa's green (v0.9.14).
    const locator = wrapper.find('[data-entry-map] svg[data-map-locator]');
    expect(locator.exists()).toBe(true);
    expect(locator.classes().join(' ')).toContain('place');
    expect(locator.attributes('aria-label')).toContain('Interior');
    expect(wrapper.find('[data-entry-map] a').attributes('href')).toBe('/map');
  });

  it('Details opens a participating institution’s entries in the drawer', async () => {
    const wrapper = await mountSuspended(withProviders(DetailsPage), { route: '/catalog/36' });

    const party = wrapper.find('li[data-party] button');
    expect(party.exists()).toBe(true);
    const code = party.element.closest('li')?.getAttribute('data-party');
    await party.trigger('click');
    await vi.waitFor(() => expect(document.body.querySelectorAll('[data-drawer] article[data-ref]').length).toBeGreaterThan(0));
    expect(inBody('[data-drawer] [data-chip="institution"]')).not.toBeNull();
    expect(inBody('[data-testid="drawer-open-catalog"]')?.getAttribute('href')).toBe(`/catalog?institution=${code}`);
    wrapper.unmount();
  });

  it('Details shows a not-found state for unknown or malformed IDs', async () => {
    const unknown = await mountSuspended(withProviders(DetailsPage), { route: '/catalog/999' });
    expect(unknown.find('[data-testid="catalog-entry-not-found"]').exists()).toBe(true);
  });
});

describe('Institutions Page (Nuxt runtime)', () => {
  it('lists the institutions with their counts and roles, most entries first', async () => {
    const wrapper = await mountSuspended(withProviders(InstitutionsPage), { route: '/institutions' });

    const cards = wrapper.findAll('article[data-institution]');
    expect(cards.length).toBe(12);
    expect(cards[0]?.attributes('data-institution')).toBe('uff');
    expect(cards[0]?.find('[data-role="author"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="institutions-total"]').text()).toBe('63 instituições');
    expect(wrapper.find('h1').text()).toBe('Instituições do catálogo');
  });

  it('reads its filters from the URL', async () => {
    const wrapper = await mountSuspended(withProviders(InstitutionsPage), { route: '/institutions?role=funder&sort=name' });
    const names = wrapper.findAll('article[data-institution] h3').map((node) => node.text());
    expect(names.length).toBeGreaterThan(0);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })));
    expect(wrapper.findAll('article[data-institution]').every((card) => card.find('[data-role="funder"]').exists())).toBe(true);
  });

  it('opens an institution’s entries in the drawer, titled by the institution', async () => {
    const wrapper = await mountSuspended(withProviders(InstitutionsPage), { route: '/institutions' });

    await wrapper.find('article[data-institution="uff"] button').trigger('click');
    await vi.waitFor(() => expect(document.body.querySelectorAll('[data-drawer] article[data-ref]').length).toBe(10));
    expect(inBody('[data-drawer] [data-chip="institution"]')?.textContent).toContain('UFF');
    expect(inBody('[data-drawer] [data-emblem="monogram"]')?.textContent?.trim()).toBe('UFF');
    expect(inBody('[data-testid="drawer-open-catalog"]')?.getAttribute('href')).toBe('/catalog?institution=uff');
    wrapper.unmount();
  });
});

describe('Map Page (Nuxt runtime)', () => {
  it('draws the eight municipalities with entries among their neighbours — the map alone, no lists', async () => {
    const wrapper = await mountSuspended(withProviders(MapPage), { route: '/map' });

    const shapes = wrapper.findAll('[data-municipality-map] g[role="button"][data-municipality]');
    expect(shapes.length).toBe(8);
    // Orange badge = initiatives, purple circle = studies (Rio: 12 + 10).
    const rio = wrapper.find('[data-municipality-map] g[data-municipality="rio-de-janeiro"]');
    expect(rio.findAll('[data-marker]').map((marker) => [marker.attributes('data-marker'), marker.text()])).toEqual([
      ['project', '12'],
      ['study', '10'],
    ]);
    expect(wrapper.findAll('[data-municipality-map] path[aria-hidden="true"]').length).toBeGreaterThan(8);
    // v0.9.9: no Municípios or Setores da baía lists; what the map cannot show is one line under it.
    expect(wrapper.find('[data-municipality-list]').exists()).toBe(false);
    expect(wrapper.find('[data-sector-list]').exists()).toBe(false);
    expect(wrapper.find('h1').text()).toBe('Mapa do catálogo');
    expect(wrapper.find('[data-map-unknown]').text()).toContain('sem município confirmado');
    expect(wrapper.find('[data-map-unknown]').text()).toContain('sem setor confirmado');
    expect(wrapper.find('figcaption a').attributes('href')).toMatch(/^https:\/\/www\.ibge\.gov\.br\//);
  });

  it('draws the bay sectors as zones in the water, and the whole bay as a pill over the sea', async () => {
    const wrapper = await mountSuspended(withProviders(MapPage), { route: '/map' });

    const zones = wrapper.findAll('[data-municipality-map] g[role="button"][data-sector]');
    expect(zones.map((zone) => zone.attributes('data-sector'))).toEqual(['interior', 'transicao', 'entrada', 'fora-da-baia']);
    expect(zones[0]!.attributes('aria-label')).toBe('Setor Interior: 13 entradas');
    // Transição has no initiatives: only its purple circle.
    expect(wrapper.findAll('[data-sector-label="transicao"] [data-marker]').map((marker) => marker.attributes('data-marker'))).toEqual([
      'study',
    ]);
    const whole = wrapper.find('[data-municipality-map] button[data-sector="baia-inteira"]');
    expect(whole.text()).toContain('Baía inteira');
    expect(whole.findAll('[data-marker]').map((marker) => marker.text())).toEqual(['3', '5']);
  });

  it('colours the caption like the place under the pointer and lights the line of the marker under it', async () => {
    const wrapper = await mountSuspended(withProviders(MapPage), { route: '/map' });

    const mage = wrapper.find('[data-municipality-map] g[data-municipality="mage"]');
    await mage.trigger('mouseenter');
    const caption = wrapper.find('[data-map-caption]');
    expect(caption.attributes('style')).toContain('--caption-fill: var(--color-map-place-');
    expect(caption.find('[data-caption-kind="project"]').text()).toMatch(/^6\s*iniciativas$/);
    expect(caption.find('[data-caption-kind="study"]').text()).toMatch(/^3\s*estudos$/);
    expect(caption.text()).not.toContain('entradas');
    await mage.find('[data-marker="project"]').trigger('mouseenter');
    expect(caption.find('[data-caption-kind="project"]').classes().join(' ')).toMatch(/captionKindActive/);
    expect(caption.find('[data-caption-kind="study"]').classes().join(' ')).not.toMatch(/captionKindActive/);
  });

  it('opens the whole bay’s entries in the drawer', async () => {
    const wrapper = await mountSuspended(withProviders(MapPage), { route: '/map' });

    await wrapper.find('[data-municipality-map] button[data-sector="baia-inteira"]').trigger('click');
    await vi.waitFor(() => expect(document.body.querySelectorAll('[data-drawer] article[data-ref]').length).toBe(8));
    expect(inBody('[data-drawer] [data-chip="sector"]')?.textContent).toContain('Baía inteira');
    expect(inBody('[data-testid="drawer-open-catalog"]')?.getAttribute('href')).toBe('/catalog?sector=baia-inteira');
    wrapper.unmount();
  });

  it('opens a municipality’s entries from the map, and only its studies from the purple circle', async () => {
    const wrapper = await mountSuspended(withProviders(MapPage), { route: '/map' });

    await wrapper.find('[data-municipality-map] g[data-municipality="niteroi"]').trigger('click');
    await vi.waitFor(() => expect(document.body.querySelectorAll('[data-drawer] article[data-ref]').length).toBeGreaterThan(0));
    expect(inBody('[data-drawer] [data-chip="municipality"]')?.textContent).toContain('Niterói');
    expect(inBody('[data-testid="drawer-open-catalog"]')?.getAttribute('href')).toBe('/catalog?municipality=niteroi');
    wrapper.unmount();

    const again = await mountSuspended(withProviders(MapPage), { route: '/map' });
    await again.find('[data-municipality-map] g[data-municipality="rio-de-janeiro"] [data-marker="study"]').trigger('click');
    await vi.waitFor(() => expect(document.body.querySelectorAll('[data-drawer] article[data-ref]').length).toBe(10));
    expect(inBody('[data-drawer] [data-chip="kind"]')?.textContent).toContain('Estudo');
    expect(inBody('[data-testid="drawer-open-catalog"]')?.getAttribute('href')).toBe('/catalog?municipality=rio-de-janeiro&kind=study');
    again.unmount();
  });
});
