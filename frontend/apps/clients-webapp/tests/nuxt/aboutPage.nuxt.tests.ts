import { describe, expect, it } from 'vitest';

import { mountSuspended } from '@nuxt/test-utils/runtime';

import AboutPage from '~/pages/common/about/overview/OverviewPage.vue';

import { withProviders } from './withProviders';

describe('About Page (Nuxt runtime): Sobre nós', () => {
  it('tells the FAPERJ project, the people and the scholarships', async () => {
    const wrapper = await mountSuspended(withProviders(AboutPage), { route: '/about' });

    expect(wrapper.find('h1').text()).toBe('Sobre nós');
    // No schedule, milestones or testimonial (v0.9.3).
    expect(wrapper.findAll('[data-section]').map((section) => section.attributes('data-section'))).toEqual([
      'project',
      'team',
      'funding',
    ]);
    const project = wrapper.find('[data-section="project"]');
    expect(project.text()).toContain('Logística reversa costeira e carbono azul');
    expect(project.text()).not.toContain('Marcos');
    expect(project.findAll('[data-fact]').map((fact) => fact.attributes('data-fact'))).toEqual(['institution', 'funding', 'duration', 'pilot']);
    expect(project.findAll('[data-partner]').map((partner) => partner.attributes('data-partner'))).toEqual(['COOPROMAR', 'UFRJ', 'INEA', 'Ogyre']);
    expect(wrapper.findAll('[data-scholarship]').map((item) => item.attributes('data-scholarship'))).toEqual(['me2', 'de2']);
  });

  it('shows the two FAPERJ fellows and the Instituto BVRio team, photos still to come', async () => {
    const wrapper = await mountSuspended(withProviders(AboutPage), { route: '/about' });

    const team = wrapper.find('[data-section="team"]');
    expect(team.find('[data-work-in-progress]').text()).toContain('Fotos chegam em breve.');
    expect(team.findAll('[data-team]').map((group) => group.attributes('data-team'))).toEqual(['fellows', 'bvrio']);

    const fellows = team.find('[data-team="fellows"]');
    expect(fellows.findAll('h4').map((name) => name.text())).toEqual(['Glauber Amarante e Silva', 'Raissa Celina da Costa Sousa']);
    expect(fellows.find('[data-person-role="student"] [data-person-area]').text()).toBe('Área principal: Engenharia de Software');
    expect(fellows.find('[data-person-role="doctor"] [data-person-area]').text()).toBe('Área principal: Oceanografia Física');

    const bvrio = team.find('[data-team="bvrio"]');
    expect(bvrio.findAll('h4').map((name) => name.text())).toEqual(['Pedro Succar', 'Maria Accioly', 'Juliana Miranda', 'Uriel Bertoche']);
    expect(bvrio.find('[data-person-role="bertoche"]').text()).toContain('Gerente de TI');
    expect(team.findAll('[data-photo-placeholder]')).toHaveLength(6);
  });
});
