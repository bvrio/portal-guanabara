import { render, screen } from '@testing-library/vue';
import { defineComponent, h } from 'vue';

import Link from './Link.vue';
import { provideLinkComponent } from './linkComponent';

describe('Link', () => {
  it('renders an anchor with the provided href', () => {
    render(Link, {
      props: { href: '/test-destination' },
      slots: { default: 'Test link' },
    });

    expect(screen.getByRole('link')).toHaveAttribute('href', '/test-destination');
  });

  it('forwards native anchor attributes', () => {
    render(Link, {
      props: { href: 'https://example.com' },
      attrs: { target: '_blank', rel: 'noreferrer' },
      slots: { default: 'External' },
    });

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('renders through an App-provided link component', () => {
    const RouterLinkStub = defineComponent({
      props: { href: { type: String, required: true } },
      setup: (props, { slots }) => () => h('a', { href: props.href, 'data-router': 'true' }, slots.default?.()),
    });

    const Harness = defineComponent({
      setup() {
        provideLinkComponent(RouterLinkStub);
        return () => h(Link, { href: '/internal' }, () => 'Internal');
      },
    });

    render(Harness);

    expect(screen.getByRole('link')).toHaveAttribute('data-router', 'true');
  });
});
