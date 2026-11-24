import { screen, within } from '@testing-library/vue';

import { projectEntry, studyEntry } from '../../../../tests/fixtures/catalog';
import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { defaultMessages } from './CatalogHighlights.messages';
import CatalogHighlights from './CatalogHighlights.vue';

describe('CatalogHighlights', () => {
  it('shows ongoing initiatives and recent studies as small entry cards', () => {
    const { container } = renderWithIntl(CatalogHighlights, {
      descriptors: Object.values(defaultMessages),
      props: { ongoing: [projectEntry], recent: [studyEntry] },
    });

    const ongoing = screen.getByRole('region', { name: defaultMessages.ongoingTitle.defaultMessage as string });
    expect(within(ongoing).getByRole('link', { name: projectEntry.name })).toHaveAttribute('href', '/catalog/1');
    expect(screen.getByRole('link', { name: studyEntry.name })).toHaveAttribute('href', '/catalog/36');
    expect([...container.querySelectorAll('article')].map((card) => card.getAttribute('data-size'))).toEqual(['sm', 'sm']);
  });

  it('keeps three entries per column', () => {
    const many = [1, 2, 3, 4].map((ref) => ({ ...projectEntry, ref, href: `/catalog/${ref}` }));
    const { container } = renderWithIntl(CatalogHighlights, {
      descriptors: Object.values(defaultMessages),
      props: { ongoing: many, recent: [] },
    });
    expect(container.querySelectorAll('li[data-ref]')).toHaveLength(3);
  });

  it('omits an empty column', () => {
    renderWithIntl(CatalogHighlights, { descriptors: Object.values(defaultMessages), props: { ongoing: [], recent: [studyEntry] } });
    expect(screen.queryByRole('region', { name: defaultMessages.ongoingTitle.defaultMessage as string })).toBeNull();
  });
});
