import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { kindMessages, statusMessages } from '../Catalog.messages';
import { defaultMessages as periodMessages } from '../CatalogPeriod/CatalogPeriod.messages';

import { defaultMessages } from './CatalogEntryHeader.messages';
import CatalogEntryHeader from './CatalogEntryHeader.vue';

const descriptors = [
  ...Object.values(defaultMessages),
  ...Object.values(kindMessages),
  ...Object.values(statusMessages),
  ...Object.values(periodMessages),
];

const study = {
  refId: 36,
  kind: 'study' as const,
  status: null,
  name: 'Microplastic in the sediments',
  start: null,
  end: null,
  ongoing: false,
  publicationYears: [2019],
};

describe('CatalogEntryHeader', () => {
  it('shows one kind icon (in the chip), the ID beside it and “Publicado em” alone', () => {
    const { container } = renderWithIntl(CatalogEntryHeader, { locale: 'pt-BR', descriptors, props: study });
    expect(container.querySelectorAll('[data-icon^="kind-"]')).toHaveLength(1);
    expect(container.querySelector('[data-entry-ref]')).toHaveTextContent('ID 36');
    expect(container.querySelector('[data-entry-when]')).toHaveTextContent('Publicado em 2019');
    expect(container.querySelector('[data-entry-photo] [data-photo-placeholder]')).toHaveTextContent('Foto em breve');
  });

  it('shows the period of an initiative and a photo when there is one', () => {
    const { container } = renderWithIntl(CatalogEntryHeader, {
      locale: 'pt-BR',
      descriptors,
      props: {
        ...study,
        kind: 'project',
        publicationYears: undefined,
        start: { date: '2021-12-01', precision: 'month' },
        ongoing: true,
        photo: '/photo.jpg',
      },
    });
    expect(container.querySelector('[data-entry-when] [data-icon="calendar"]')).not.toBeNull();
    expect(container.querySelector('[data-entry-when]')).toHaveTextContent('2021');
    expect(container.querySelector('[data-entry-photo] img')).toHaveAttribute('src', '/photo.jpg');
    expect(container.querySelector('[data-photo-placeholder]')).toBeNull();
  });
});
