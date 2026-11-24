import { screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { catalogLabelMessages } from '../Catalog.messages';

import { defaultMessages } from './CatalogKindDuo.messages';
import CatalogKindDuo from './CatalogKindDuo.vue';

describe('CatalogKindDuo', () => {
  it('links each half of the catalogue with its icon and count', () => {
    const { container } = renderWithIntl(CatalogKindDuo, {
      locale: 'pt-BR',
      descriptors: [...catalogLabelMessages, ...Object.values(defaultMessages)],
      props: {
        projects: { count: 24, active: 10, href: '/catalog/list?kind=project' },
        studies: { count: 17, href: '/catalog/list?kind=study' },
      },
    });

    const project = container.querySelector('[data-kind="project"]');
    expect(project).toHaveAttribute('href', '/catalog/list?kind=project');
    expect(project).toHaveTextContent('24');
    expect(project).toHaveTextContent('10 ativas');
    expect(project?.querySelector('[data-icon="kind-project"]')).not.toBeNull();
    expect(container.querySelector('[data-kind="study"] [data-icon="kind-study"]')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Estudos' })).toBeInTheDocument();
  });
});
