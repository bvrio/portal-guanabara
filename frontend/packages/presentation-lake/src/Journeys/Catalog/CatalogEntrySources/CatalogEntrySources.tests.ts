import { screen } from '@testing-library/vue';

import { sources } from '../../../../tests/fixtures/catalog';
import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { defaultMessages } from './CatalogEntrySources.messages';
import CatalogEntrySources from './CatalogEntrySources.vue';

const descriptors = Object.values(defaultMessages);

describe('CatalogEntrySources', () => {
  it('opens sources in a new tab and prints facts paired with the link', () => {
    renderWithIntl(CatalogEntrySources, {
      descriptors,
      props: { sources, sourceTypes: ['Artigo científico'], venues: ['Marine Pollution Bulletin'], publicationYears: [2019] },
    });

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', sources[0]!.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('doi10.1016/j.marpolbul.2019.06.042');
    expect(screen.getByText('Artigo científico · Marine Pollution Bulletin · 2019')).toBeInTheDocument();
    // Paired facts are not repeated above the list.
    expect(screen.queryByText(defaultMessages.sourceTypes.defaultMessage as string)).toBeNull();
  });

  it('keeps unpaired facts above several links', () => {
    renderWithIntl(CatalogEntrySources, {
      descriptors,
      props: {
        sources: [
          { url: 'https://www.bvrio.org/pt-br/pescandoresiduos/', doi: null, note: null, sourceType: null, venue: null, publishedYear: null },
          { url: 'https://example.org/a.pdf', doi: null, note: 'PDF do artigo', sourceType: null, venue: null, publishedYear: null },
        ],
        sourceTypes: ['Site institucional', 'Reportagem'],
        venues: [],
        publicationYears: [2024, 2025],
      },
    });

    expect(screen.getByText('Site institucional, Reportagem')).toBeInTheDocument();
    expect(screen.getByText('2024, 2025')).toBeInTheDocument();
    expect(screen.getAllByRole('link')[0]).toHaveTextContent('bvrio.org/pt-br/pescandoresiduos');
    // Site in bold, the rest of the address on its own line; the full address is the title.
    expect(screen.getAllByRole('link')[0]!.querySelector('strong')).toHaveTextContent('bvrio.org');
    expect(screen.getByText('PDF do artigo')).toBeInTheDocument();
  });
});
