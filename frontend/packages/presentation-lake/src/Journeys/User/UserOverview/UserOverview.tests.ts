import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { defaultMessages as buttonMessages } from '../../../Shared/components/Button/Button.messages';

import UserOverview from './UserOverview.vue';
import { defaultMessages } from './UserOverview.messages';

const descriptors = [...Object.values(defaultMessages), buttonMessages.loading];
const props = { fullName: 'Test Person Name', detailsHref: '/details', managementHref: '/management' };

describe('UserOverview', () => {
  it('greets by first name and links to details and management', () => {
    renderWithIntl(UserOverview, { props, descriptors });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test');
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/details',
      '/management',
    ]);
  });

  it('renders premium benefits only when requested', () => {
    const { container, rerender } = renderWithIntl(UserOverview, { props, descriptors });

    expect(container.querySelector('[data-card="premium-benefits"]')).toBeNull();

    return rerender({ ...props, showPremiumBenefits: true }).then(() => {
      expect(container.querySelector('[data-card="premium-benefits"]')).not.toBeNull();
    });
  });

  it('emits logout', async () => {
    const { emitted } = renderWithIntl(UserOverview, { props, descriptors });

    await fireEvent.click(screen.getByRole('button', { name: defaultMessages.logout.defaultMessage as string }));

    expect(emitted('logout')).toHaveLength(1);
  });
});
