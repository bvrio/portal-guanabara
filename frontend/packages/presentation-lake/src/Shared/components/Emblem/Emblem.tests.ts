import { render } from '@testing-library/vue';

import Emblem, { monogram } from './Emblem.vue';

describe('Emblem', () => {
  it('derives a monogram from the name', () => {
    expect(monogram('UFF')).toBe('UFF');
    expect(monogram('Petrobras')).toBe('PETR');
    expect(monogram('CNPq')).toBe('CNPq');
    expect(monogram('Prefeitura de Niterói')).toBe('PN');
    expect(monogram('Colônias de pescadores')).toBe('CP');
  });

  it('shows the official file when there is one, decoratively', () => {
    const { container } = render(Emblem, { props: { name: 'UFF', src: '/emblems/institutions/uff.svg', size: 48 } });
    const img = container.querySelector('img')!;
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('src')).toBe('/emblems/institutions/uff.svg');
  });

  it('falls back to a monogram for logos and to nothing for flags', () => {
    const logo = render(Emblem, { props: { name: 'INEA' } });
    expect(logo.container.querySelector('[data-emblem="monogram"]')?.textContent?.trim()).toBe('INEA');
    const flag = render(Emblem, { props: { name: 'Niterói', shape: 'flag' } });
    expect(flag.container.querySelector('[data-emblem]')).toBeNull();
  });
});
