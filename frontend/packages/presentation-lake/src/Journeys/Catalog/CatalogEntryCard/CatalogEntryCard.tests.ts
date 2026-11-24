import { screen } from '@testing-library/vue';

import { projectEntry, studyEntry } from '../../../../tests/fixtures/catalog';
import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { catalogLabelMessages, kindMessages, statusMessages } from '../Catalog.messages';
import { defaultMessages as periodMessages } from '../CatalogPeriod/CatalogPeriod.messages';

import { defaultMessages } from './CatalogEntryCard.messages';
import CatalogEntryCard from './CatalogEntryCard.vue';

const descriptors = [...catalogLabelMessages, ...Object.values(periodMessages), ...Object.values(defaultMessages)];

const meta = (container: Element, key: string) => container.querySelector(`[data-meta="${key}"]`);

describe('CatalogEntryCard (option 2)', () => {
  it('leads with the kind tile, its name and the status, then the entry name as the title', () => {
    const { container } = renderWithIntl(CatalogEntryCard, { locale: 'pt-BR', descriptors, props: { entry: projectEntry } });

    const article = container.querySelector('article')!;
    expect(article).toHaveAttribute('data-kind', 'project');
    expect(article.querySelector('[data-icon="kind-project"]')).not.toBeNull();
    expect(screen.getByText(kindMessages.project.defaultMessage as string)).toBeInTheDocument();
    expect(screen.getByText(statusMessages.active.defaultMessage as string)).toBeInTheDocument();
    // The kind is the tile + label, not a second chip.
    expect(article.querySelectorAll('[data-kind]')).toHaveLength(0);

    const heading = screen.getByRole('heading', { level: 2, name: projectEntry.name });
    expect(heading).toHaveAttribute('title', projectEntry.name);
    expect(heading).toHaveAttribute('lang', 'pt-BR');
    expect(screen.getByRole('link', { name: projectEntry.name })).toHaveAttribute('href', '/catalog/1');
    expect(heading.nextElementSibling?.textContent).toBe(projectEntry.objective);
  });

  it('puts Local and Período side by side, then the Temas', () => {
    const { container } = renderWithIntl(CatalogEntryCard, { locale: 'pt-BR', descriptors, props: { entry: projectEntry } });

    expect(meta(container, 'place')).toHaveTextContent('LocalRio de Janeiro');
    expect(meta(container, 'period')).toHaveTextContent('Período');
    expect(meta(container, 'period')?.querySelector('time')).toHaveAttribute('datetime', '2021-12');
    expect(meta(container, 'topics')).toHaveTextContent('Temas');
    expect(screen.getByRole('link', { name: 'Macrolixo' })).toHaveAttribute('href', '/catalog/list?keyword=macrolixo');
    expect(screen.getByRole('link', { name: 'Interior' })).toHaveAttribute('href', '/catalog/list?sector=interior');
    expect(container.querySelector('[data-icon="sector-inner"]')).not.toBeNull();
  });

  it('places studies by their publication years and shows no status when unconfirmed', () => {
    const { container } = renderWithIntl(CatalogEntryCard, { descriptors, props: { entry: studyEntry, headingLevel: 3 } });

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(meta(container, 'publication')).toHaveTextContent('Publicação2019');
    expect(meta(container, 'period')).toBeNull();
    expect(meta(container, 'place')).toHaveTextContent('São Gonçalo, Rio de Janeiro');
    expect(container.querySelector('[data-status]')).toBeNull();
  });

  it('says when place or period are not given and drops empty blocks', () => {
    const { container } = renderWithIntl(CatalogEntryCard, {
      descriptors,
      props: {
        entry: { ...projectEntry, objective: null, municipalities: [], start: null, end: null, ongoing: false, keywords: [], sectors: [] },
      },
    });
    expect(meta(container, 'place')).toHaveTextContent('Não informado');
    expect(meta(container, 'period')).toHaveTextContent('Não informado');
    expect(meta(container, 'topics')).toBeNull();
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });
});
