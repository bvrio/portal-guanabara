import { fireEvent, screen } from '@testing-library/vue';

import { partyGroups } from '../../../../tests/fixtures/catalog';
import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { catalogLabelMessages, roleMessages } from '../Catalog.messages';

import { defaultMessages } from './CatalogEntryParties.messages';
import CatalogEntryParties from './CatalogEntryParties.vue';

const descriptors = [...catalogLabelMessages, ...Object.values(defaultMessages)];

describe('CatalogEntryParties', () => {
  it('groups parties by role and shows the context of a person', () => {
    renderWithIntl(CatalogEntryParties, { descriptors, props: { groups: partyGroups } });

    expect(screen.getByRole('heading', { name: roleMessages.executor.defaultMessage as string })).toBeInTheDocument();
    expect(screen.getByText('Instituto BVRio')).toBeInTheDocument();
    expect(screen.getByText('coordenação do projeto')).toBeInTheDocument();
    expect(screen.queryByTestId('persons-hidden')).toBeNull();
  });

  it('notes when person names were left out', () => {
    renderWithIntl(CatalogEntryParties, {
      descriptors,
      props: { groups: partyGroups.filter((group) => group.role !== 'coordinator'), personsHidden: true },
    });

    expect(screen.queryByText('Maria Silva')).toBeNull();
    expect(screen.getByTestId('persons-hidden')).toBeInTheDocument();
  });

  it('opens an institution from its name, with its logo slot; people stay plain text', async () => {
    const { container, emitted } = renderWithIntl(CatalogEntryParties, {
      descriptors,
      props: { groups: partyGroups, selectable: true, logos: { ogyre: '/emblems/ogyre.svg' } },
    });

    await fireEvent.click(screen.getByRole('button', { name: 'COOPAMA' }));
    expect(emitted('select')).toEqual([[partyGroups[0]!.parties[1]]]);
    expect(screen.queryByRole('button', { name: 'Maria Silva' })).toBeNull();
    expect(container.querySelector('[data-party="instituto-bvrio"] [data-emblem="monogram"]')).toHaveTextContent('IB');
    expect(container.querySelector('[data-party="ogyre"] img')).toHaveAttribute('src', '/emblems/ogyre.svg');
  });
});
