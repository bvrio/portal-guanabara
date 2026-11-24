import { render, screen } from '@testing-library/vue';

import Alert from './Alert.vue';
import styles from './Alert.module.scss';

describe('Alert', () => {
  it('renders informative messages as a polite status', () => {
    render(Alert, { slots: { default: 'Test message' } });

    expect(screen.getByRole('status')).toHaveClass(styles.info!);
  });

  it('renders errors as an assertive alert', () => {
    render(Alert, { props: { variant: 'error' }, slots: { default: 'Test error' } });

    expect(screen.getByRole('alert')).toHaveClass(styles.error!);
  });
});
