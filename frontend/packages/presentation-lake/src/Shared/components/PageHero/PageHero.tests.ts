import { render, screen } from '@testing-library/vue';

import PageHero from './PageHero.vue';

describe('PageHero', () => {
  it('renders the title as the page heading with its slots', () => {
    render(PageHero, {
      slots: {
        eyebrow: 'Catálogo',
        title: 'Todas as entradas',
        description: 'Descrição',
        actions: '<button>Explorar</button>',
      },
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Todas as entradas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explorar' })).toBeInTheDocument();
  });

  it('hides the decorative aside from assistive tech', () => {
    const { container } = render(PageHero, {
      props: { titleLevel: 2 },
      slots: { title: 'Título', aside: '<svg data-testid="art" />' },
    });

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"] [data-testid="art"]')).not.toBeNull();
  });

  it('can put the aside on the left of the text', () => {
    const { container } = render(PageHero, {
      props: { asideSide: 'start' },
      slots: { title: 'Título', aside: '<svg data-testid="art" />' },
    });
    expect(container.querySelector('section > div')?.className).toMatch(/asideStart/);
  });

  it('can keep the title for assistive tech only', () => {
    render(PageHero, { props: { titleHidden: true }, slots: { title: 'Catálogo', description: 'Explicação' } });

    const heading = screen.getByRole('heading', { level: 1, name: 'Catálogo' });
    expect(heading.className).not.toContain('title');
    expect(screen.getByText('Explicação')).toBeInTheDocument();
  });

  it('can let the description take the full content width', () => {
    const { container } = render(PageHero, { props: { descriptionWidth: 'full' }, slots: { title: 'Sobre nós', description: 'Texto' } });
    expect(container.querySelector('p')?.className).toMatch(/descriptionFull/);
  });
});
