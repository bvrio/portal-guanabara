import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { institutionRoleMessages } from '../Institutions.messages';

import { defaultMessages } from './InstitutionCard.messages';
import InstitutionCard from './InstitutionCard.vue';

const descriptors = [...Object.values(defaultMessages), ...Object.values(institutionRoleMessages)];
const uff = {
  code: 'uff',
  name: 'UFF',
  type: 'Acadêmica',
  entries: 11,
  projects: 3,
  studies: 8,
  roles: [
    { role: 'author' as const, count: 8 },
    { role: 'executor' as const, count: 2 },
  ],
};

describe('InstitutionCard', () => {
  it('shows the name, type, counts per kind and roles, and opens on click', async () => {
    const { container, emitted } = renderWithIntl(InstitutionCard, { locale: 'pt-BR', descriptors, props: { institution: uff } });

    expect(screen.getByRole('heading', { level: 2, name: 'UFF' })).toBeInTheDocument();
    expect(screen.getByText('Acadêmica')).toBeInTheDocument();
    expect(container.querySelector('[data-count="projects"]')).toHaveTextContent('3 iniciativas');
    expect(container.querySelector('[data-count="studies"]')).toHaveTextContent('8 estudos');
    expect(container.querySelector('[data-role="author"]')).toHaveTextContent('Autora (estudos)8');
    expect(container.querySelector('[data-emblem="monogram"]')).toHaveTextContent('UFF');
    // Initiatives and studies: the stripe carries both kind colours.
    expect(container.querySelector('article')).toHaveAttribute('data-kinds', 'both');

    await fireEvent.click(screen.getByRole('button', { name: 'UFF' }));
    expect(emitted('select')).toEqual([[uff]]);
  });

  it('says when the type is unknown and uses the official logo when supplied', () => {
    const { container } = renderWithIntl(InstitutionCard, {
      locale: 'pt-BR',
      descriptors,
      props: { institution: { ...uff, type: null, studies: 0, logo: '/emblems/institutions/uff.svg' }, headingLevel: 3 },
    });
    expect(screen.getByText(defaultMessages.unknownType.defaultMessage as string)).toBeInTheDocument();
    expect(container.querySelector('[data-count="studies"]')).toBeNull();
    expect(container.querySelector('img')).toHaveAttribute('src', '/emblems/institutions/uff.svg');
  });

  it('carries the colour of the only kind it takes part in', () => {
    const { container, rerender } = renderWithIntl(InstitutionCard, {
      locale: 'pt-BR',
      descriptors,
      props: { institution: { ...uff, studies: 0 } },
    });
    expect(container.querySelector('article')).toHaveAttribute('data-kinds', 'project');
    return rerender({ institution: { ...uff, projects: 0 } }).then(() => {
      expect(container.querySelector('article')).toHaveAttribute('data-kinds', 'study');
    });
  });
});
