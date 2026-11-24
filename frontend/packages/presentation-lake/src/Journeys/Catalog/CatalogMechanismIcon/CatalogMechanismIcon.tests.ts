import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { catalogMechanismIcons } from './catalogMechanismIcons';
import CatalogMechanismIcon from './CatalogMechanismIcon.vue';

describe('CatalogMechanismIcon', () => {
  it('draws the mechanism glyph in its orange slot (v0.9.18)', () => {
    const { container } = renderWithIntl(CatalogMechanismIcon, {
      props: { code: 'reciclagem-e-destinacao', name: 'Reciclagem e destinação' },
    });
    const tile = container.querySelector('[data-mechanism-icon="glyph"]');
    expect(tile).toHaveAttribute('aria-hidden', 'true');
    expect(tile?.querySelector('svg')).not.toBeNull();
  });

  it('has a glyph for each of the ten mechanisms of the vocabulary', () => {
    expect(Object.keys(catalogMechanismIcons).sort()).toEqual([
      'contencao',
      'desenvolvimento-tecnologico',
      'educativa',
      'fiscalizacao',
      'incidencia-politica',
      'limpeza',
      'monitoramento',
      'reciclagem-e-destinacao',
      'transacional',
      'voluntaria',
    ]);
  });

  it('keeps a monogram slot for a mechanism without a glyph', () => {
    const { container } = renderWithIntl(CatalogMechanismIcon, { props: { code: 'novo-mecanismo', name: 'Novo mecanismo' } });
    const slot = container.querySelector('[data-mechanism-icon="slot"]');
    expect(slot).toHaveTextContent('NM');
    expect(slot).toHaveAttribute('aria-hidden', 'true');
  });
});
