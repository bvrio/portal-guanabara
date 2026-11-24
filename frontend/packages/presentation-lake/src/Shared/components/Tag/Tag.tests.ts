import { render, screen } from '@testing-library/vue';

import styles from './Tag.module.scss';
import Tag from './Tag.vue';

describe('Tag', () => {
  it('renders a static label', () => {
    render(Tag, { props: { variant: 'outline' }, slots: { default: 'Macrolixo' } });

    const tag = screen.getByText('Macrolixo');
    expect(tag.tagName).toBe('SPAN');
    expect(tag).toHaveClass(styles.outline!);
  });

  it('renders a link when it has an href', () => {
    render(Tag, { props: { href: '/catalog/list?keyword=macrolixo' }, slots: { default: 'Macrolixo' } });

    expect(screen.getByRole('link')).toHaveAttribute('href', '/catalog/list?keyword=macrolixo');
  });
});
