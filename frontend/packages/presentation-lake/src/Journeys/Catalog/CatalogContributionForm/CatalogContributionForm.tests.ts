import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { defaultMessages } from './CatalogContributionForm.messages';
import CatalogContributionForm, {
  emptyCatalogContribution,
  missingContributionFields,
  type CatalogContributionValue,
} from './CatalogContributionForm.vue';

const descriptors = Object.values(defaultMessages);
const label = (key: keyof typeof defaultMessages) => defaultMessages[key].defaultMessage as string;

function renderForm(modelValue: CatalogContributionValue, teamAvailable = true) {
  const updates: CatalogContributionValue[] = [];
  const result = renderWithIntl(CatalogContributionForm, {
    locale: 'pt-BR',
    descriptors,
    props: { modelValue, teamAvailable, 'onUpdate:modelValue': (value: CatalogContributionValue) => updates.push(value) },
  });
  return { ...result, updates };
}

describe('CatalogContributionForm', () => {
  it('asks for what each kind of contribution needs', () => {
    const value = emptyCatalogContribution();
    expect(missingContributionFields(value)).toEqual(['name', 'details']);
    expect(missingContributionFields({ ...value, subject: 'fix-entry', details: 'Ano errado' })).toEqual(['target']);
    expect(missingContributionFields({ ...value, audience: 'team', name: 'X', details: 'Y' })).toEqual(['contactName']);
    expect(missingContributionFields({ ...value, name: 'X', details: 'Y', contactEmail: 'a@b.org' })).toEqual(['consent']);
  });

  it('does not send until the required fields are filled', async () => {
    const { emitted } = renderForm(emptyCatalogContribution());
    await fireEvent.click(screen.getByRole('button', { name: label('submitPublic') }));
    expect(emitted('submit')).toBeUndefined();
    expect(screen.getAllByText(label('required'))).toHaveLength(2);
  });

  it('sends a correction, and offers the team mode', async () => {
    const value = { ...emptyCatalogContribution(), subject: 'fix-entry' as const, target: '36', details: 'Publicado em 2020' };
    const { emitted, updates } = renderForm(value);
    expect(screen.getByDisplayValue('36')).toHaveAttribute('name', 'target');
    await fireEvent.click(screen.getByRole('button', { name: label('submitPublic') }));
    expect(emitted('submit')?.[0]).toEqual([value]);
    await fireEvent.click(screen.getByLabelText(label('audienceTeam')));
    expect(updates.at(-1)).toMatchObject({ audience: 'team' });
  });

  it('hides the team mode when it is not available', () => {
    renderForm(emptyCatalogContribution(), false);
    expect(screen.queryByText(label('audienceTeam'))).not.toBeInTheDocument();
  });
});
