import { fireEvent, screen, within } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { defineMessages } from '../../foundations/i18n';

import { defaultMessages } from './SiteHeader.messages';
import SiteHeader from './SiteHeader.vue';

const nav = defineMessages({
  home: { id: 'test.nav.home', defaultMessage: 'Início' },
  catalog: { id: 'test.nav.catalog', defaultMessage: 'Catálogo' },
});

const locales = [
  { value: 'pt-BR', label: 'Português', short: 'PT', flag: 'br' },
  { value: 'en', label: 'English', short: 'EN', flag: 'gb' },
  { value: 'es', label: 'Español', short: 'ES', flag: 'es' },
  { value: 'fr', label: 'Français', short: 'FR', flag: 'fr' },
] as const;

describe('SiteHeader', () => {
  it('links home and marks the current navigation item', () => {
    renderWithIntl(SiteHeader, {
      props: {
        homeHref: '/',
        currentId: 'catalog',
        items: [
          { id: 'home', href: '/', label: nav.home },
          { id: 'catalog', href: '/catalog', label: nav.catalog, icon: 'catalog' },
        ],
      },
      descriptors: [...Object.values(defaultMessages), nav.home, nav.catalog],
    });

    const navigation = screen.getByRole('navigation', { name: defaultMessages.navigation.defaultMessage });
    expect(navigation).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Catálogo' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: defaultMessages.brand.defaultMessage })).toHaveAttribute('href', '/');
  });

  it('renders App tools beside Opções', () => {
    const { container } = renderWithIntl(SiteHeader, {
      props: { homeHref: '/', items: [] },
      slots: { tools: '<button>Extra</button>' },
      descriptors: Object.values(defaultMessages),
    });
    expect(container.querySelector('[data-site-actions] [data-site-tools]')).toHaveTextContent('Extra');
  });

  it('gathers language (with flags) and view size in Opções, every choice in sight', async () => {
    const { emitted } = renderWithIntl(SiteHeader, {
      props: { homeHref: '/', items: [], zoomLevels: [100, 110, 120], zoom: 100, locale: 'pt-BR', locales },
      descriptors: Object.values(defaultMessages),
    });

    const button = screen.getByRole('button', { name: defaultMessages.options.defaultMessage });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    const panel = await screen.findByRole('dialog', { name: defaultMessages.options.defaultMessage });
    // Four languages, each with its flag; the current one pressed.
    const languages = [...panel.querySelectorAll('[data-locale]')];
    expect(languages.map((node) => node.textContent?.trim())).toEqual(['Português', 'English', 'Español', 'Français']);
    expect(languages.map((node) => node.querySelector('[data-flag]')?.getAttribute('data-flag'))).toEqual(['br', 'gb', 'es', 'fr']);
    expect(within(panel).getByRole('button', { name: 'Português' })).toHaveAttribute('aria-pressed', 'true');
    // The three sizes as buttons, no second menu to open.
    expect(within(panel).getAllByRole('button', { name: /%$/ }).map((node) => node.textContent?.trim())).toEqual([
      '100%',
      '110%',
      '120%',
    ]);

    await fireEvent.click(within(panel).getByRole('button', { name: '120%' }));
    expect(emitted('update:zoom')).toEqual([[120]]);
    expect(screen.queryByRole('dialog')).toBeNull();

    await fireEvent.click(button);
    await fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Español' }));
    expect(emitted('update:locale')).toEqual([['es']]);
  });

  it('shows the signed-in visitor as their initials, or an “Entrar” button', () => {
    const signedIn = renderWithIntl(SiteHeader, {
      props: { homeHref: '/', items: [], signInHref: '/login', account: { name: 'Maria Silva', initials: 'MS', href: '/conta' } },
      descriptors: Object.values(defaultMessages),
    });
    const avatar = signedIn.getByRole('link', { name: 'Minha conta: Maria Silva' });
    expect(avatar).toHaveAttribute('href', '/conta');
    expect(avatar).toHaveTextContent('MS');
    signedIn.unmount();

    renderWithIntl(SiteHeader, {
      props: { homeHref: '/', items: [], signInHref: '/login', account: null },
      descriptors: Object.values(defaultMessages),
    });
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login');
  });

  it('fades the mark and the name in by the amount a page asks (Início)', () => {
    const hidden = renderWithIntl(SiteHeader, {
      props: { homeHref: '/', items: [], brandReveal: 0 },
      descriptors: Object.values(defaultMessages),
    });
    expect(hidden.container.querySelector('[data-site-brand]')).toHaveAttribute('data-hidden', 'true');
    expect(hidden.container.querySelector('[data-site-brand] [data-brand-mark]')).not.toBeNull();
    hidden.unmount();

    const half = renderWithIntl(SiteHeader, {
      props: { homeHref: '/', items: [], brandReveal: 0.5 },
      descriptors: Object.values(defaultMessages),
    });
    expect(half.container.querySelector('[data-site-brand]')).not.toHaveAttribute('data-hidden');
    expect(half.container.querySelector<HTMLElement>('[data-fit], header > div')?.style.getPropertyValue('--site-brand-reveal')).toBe('0.5');
  });

  it('opens a phone menu: the tabs, then the language row that opens in place to the flagged languages', async () => {
    const { emitted } = renderWithIntl(SiteHeader, {
      props: {
        homeHref: '/',
        currentId: 'home',
        signInHref: '/login',
        items: [
          { id: 'home', href: '/', label: nav.home, icon: 'home' },
          { id: 'catalog', href: '/catalog', label: nav.catalog },
        ],
        locale: 'pt-BR',
        locales,
      },
      descriptors: [...Object.values(defaultMessages), nav.home, nav.catalog],
    });

    // Shown only on the phone bar (CSS hides it here, so it has no computed name in this test).
    const button = document.querySelector<HTMLButtonElement>('[data-site-menu-button]')!;
    expect(button).toHaveAttribute('aria-label', defaultMessages.openMenu.defaultMessage);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await fireEvent.click(button);

    const menu = await screen.findByRole('dialog', { name: defaultMessages.menu.defaultMessage });
    const links = [...menu.querySelectorAll('a')].map((link) => [link.textContent?.trim(), link.getAttribute('href')]);
    expect(links).toEqual([
      ['Início', '/'],
      ['Catálogo', '/catalog'],
    ]);
    expect(menu.querySelector('a[aria-current="page"]')).toHaveTextContent('Início');

    // Idioma: closed, with the chosen language under its name; it opens to the four options.
    const language = menu.querySelector<HTMLButtonElement>('[data-site-menu-language]')!;
    expect(language).toHaveTextContent(`${defaultMessages.language.defaultMessage}Português`);
    expect(language).toHaveAttribute('aria-expanded', 'false');
    expect(within(menu).queryByRole('button', { name: 'Français' })).toBeNull();
    await fireEvent.click(language);
    expect(language).toHaveAttribute('aria-expanded', 'true');
    expect(within(menu).getByRole('button', { name: 'Português' })).toHaveAttribute('aria-pressed', 'true');
    expect(menu.querySelectorAll('#site-menu-languages [data-flag]')).toHaveLength(4);

    await fireEvent.click(within(menu).getByRole('button', { name: 'Français' }));
    expect(emitted('update:locale')).toEqual([['fr']]);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
