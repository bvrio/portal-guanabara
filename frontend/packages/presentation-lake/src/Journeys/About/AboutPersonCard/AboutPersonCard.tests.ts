import { render, screen } from '@testing-library/vue';

import AboutPersonCard from './AboutPersonCard.vue';

describe('AboutPersonCard', () => {
  it('shows a placeholder until the photo is supplied, then the photo', () => {
    const placeholder = render(AboutPersonCard, { slots: { name: 'Mestrando', role: 'Bolsista FAPERJ', default: 'Pesquisa.' } });
    expect(screen.getByRole('heading', { level: 3, name: 'Mestrando' })).toBeInTheDocument();
    expect(placeholder.container.querySelector('[data-photo-placeholder]')).not.toBeNull();
    expect(placeholder.container.querySelector('article')).toHaveTextContent('MestrandoBolsista FAPERJPesquisa.');
    placeholder.unmount();

    const { container } = render(AboutPersonCard, { props: { photo: '/team/a.jpg', headingLevel: 2 }, slots: { name: 'Ana' } });
    expect(container.querySelector('img')).toHaveAttribute('src', '/team/a.jpg');
    expect(container.querySelector('[data-photo-placeholder]')).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Ana' })).toBeInTheDocument();
  });

  it('shows the main field of work under the role', () => {
    const { container } = render(AboutPersonCard, {
      props: { headingLevel: 4 },
      slots: { name: 'Raissa Celina da Costa Sousa', role: 'Bolsista Doutor-Empresa (DE2)', area: 'Área principal: Oceanografia Física' },
    });
    expect(screen.getByRole('heading', { level: 4, name: 'Raissa Celina da Costa Sousa' })).toBeInTheDocument();
    expect(container.querySelector('[data-person-area]')).toHaveTextContent('Área principal: Oceanografia Física');
  });
});
