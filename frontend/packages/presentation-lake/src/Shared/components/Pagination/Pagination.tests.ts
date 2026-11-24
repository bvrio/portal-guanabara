import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { defaultMessages } from './Pagination.messages';
import Pagination from './Pagination.vue';

const descriptors = Object.values(defaultMessages);

describe('Pagination', () => {
  it('emits the requested page and disables the edges', async () => {
    const { emitted } = renderWithIntl(Pagination, { descriptors, props: { page: 1, pageCount: 3 } });

    expect(screen.getByRole('navigation', { name: defaultMessages.label.defaultMessage as string })).toBeTruthy();
    expect(screen.getByTestId('pagination-previous')).toBeDisabled();
    await fireEvent.click(screen.getByTestId('pagination-next'));
    expect(emitted('change')).toEqual([[2]]);
  });

  it('renders nothing for a single page', () => {
    renderWithIntl(Pagination, { descriptors, props: { page: 1, pageCount: 1 } });
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});
