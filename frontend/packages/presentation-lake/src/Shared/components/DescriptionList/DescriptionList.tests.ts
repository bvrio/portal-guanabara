import { render, screen } from '@testing-library/vue';
import { h } from 'vue';

import styles from './DescriptionList.module.scss';
import DescriptionList from './DescriptionList.vue';
import DescriptionListItem from './DescriptionListItem.vue';

describe('DescriptionList', () => {
  it('renders terms and descriptions as a definition list', () => {
    const { container } = render(DescriptionList, {
      props: { layout: 'stacked' },
      slots: {
        default: () => [
          h(DescriptionListItem, { term: 'Período' }, () => 'março de 2017'),
          h(DescriptionListItem, null, { term: () => 'Status', default: () => 'Ativa' }),
        ],
      },
    });

    expect(container.querySelector('dl')).toHaveClass(styles.stacked!);
    expect(screen.getByText('Período').tagName).toBe('DT');
    expect(screen.getByText('março de 2017').tagName).toBe('DD');
    expect(screen.getByText('Status').tagName).toBe('DT');
  });
});
