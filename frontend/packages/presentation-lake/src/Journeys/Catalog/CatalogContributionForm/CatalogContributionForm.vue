<script lang="ts">
export type CatalogContributionAudience = 'public' | 'team';
export type CatalogContributionSubject = 'new-entry' | 'fix-entry' | 'new-institution' | 'fix-institution';

export interface CatalogContributionValue {
  audience: CatalogContributionAudience;
  subject: CatalogContributionSubject;
  /** The entry ID or the institution being corrected. */
  target: string;
  kind: 'project' | 'study';
  name: string;
  details: string;
  places: string;
  institutions: string;
  source: string;
  contactName: string;
  contactEmail: string;
  consent: boolean;
}

/**
 * One form for every contribution to the catalogue (v0.9.25): the public
 * suggests a new initiative, study or institution, or a correction; the
 * internal team uses the same form to record the change in their name. The
 * fields follow what is asked; `submit` fires only when the required ones are
 * filled. The Page decides what happens with it.
 */
export interface CatalogContributionFormProps {
  /** Shows the "Equipe interna" choice. */
  teamAvailable?: boolean;
  busy?: boolean;
}

export function emptyCatalogContribution(): CatalogContributionValue {
  return {
    audience: 'public',
    subject: 'new-entry',
    target: '',
    kind: 'project',
    name: '',
    details: '',
    places: '',
    institutions: '',
    source: '',
    contactName: '',
    contactEmail: '',
    consent: false,
  };
}

type Field = 'target' | 'name' | 'details' | 'contactName' | 'consent';

/** The fields still missing for this value (empty when it can be sent). */
export function missingContributionFields(value: CatalogContributionValue): Field[] {
  const missing: Field[] = [];
  const fix = value.subject === 'fix-entry' || value.subject === 'fix-institution';
  if (fix && !value.target.trim()) missing.push('target');
  if (!fix && !value.name.trim()) missing.push('name');
  if (!value.details.trim()) missing.push('details');
  if (value.audience === 'team' && !value.contactName.trim()) missing.push('contactName');
  if (value.audience === 'public' && value.contactEmail.trim() && !value.consent) missing.push('consent');
  return missing;
}
</script>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { useIntl } from 'vue-intl';

import Button from '../../../Shared/components/Button/Button.vue';
import Checkbox from '../../../Shared/components/Checkbox/Checkbox.vue';
import Input from '../../../Shared/components/Input/Input.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { formatMessage } from '../../../Shared/foundations/i18n/formatMessage';

import { defaultMessages } from './CatalogContributionForm.messages';
import styles from './CatalogContributionForm.module.scss';

const { teamAvailable = false, busy = false } = defineProps<CatalogContributionFormProps>();

const value = defineModel<CatalogContributionValue>({ required: true });

const emit = defineEmits<{ submit: [value: CatalogContributionValue] }>();

const intl = useIntl();
const uid = useId();
const t = (descriptor: Parameters<typeof formatMessage>[1]) => formatMessage(intl, descriptor);

const tried = ref(false);
const missing = computed(() => (tried.value ? missingContributionFields(value.value) : []));
const errorOf = (field: Field) => (missing.value.includes(field) ? t(defaultMessages.required) : undefined);

const isFix = computed(() => value.value.subject === 'fix-entry' || value.value.subject === 'fix-institution');
const isEntry = computed(() => value.value.subject === 'new-entry' || value.value.subject === 'fix-entry');

const subjects = computed(() => [
  { value: 'new-entry' as const, label: t(defaultMessages.newEntry) },
  { value: 'fix-entry' as const, label: t(defaultMessages.fixEntry) },
  { value: 'new-institution' as const, label: t(defaultMessages.newInstitution) },
  { value: 'fix-institution' as const, label: t(defaultMessages.fixInstitution) },
]);

function update(patch: Partial<CatalogContributionValue>) {
  value.value = { ...value.value, ...patch };
}

function submit() {
  tried.value = true;
  if (missingContributionFields(value.value).length === 0) emit('submit', value.value);
}
</script>

<template>
  <form :class="styles.root" novalidate :aria-busy="busy || undefined" @submit.prevent="submit">
    <fieldset v-if="teamAvailable" :class="styles.group">
      <legend :class="styles.legend"><FormattedMessage v-bind="defaultMessages.audience" /></legend>
      <div :class="styles.choices" role="radiogroup">
        <label
          v-for="option in (['public', 'team'] as const)"
          :key="option"
          :class="[styles.choice, value.audience === option && styles.selected]"
          :data-audience="option"
        >
          <input
            :class="styles.radio"
            type="radio"
            :name="`${uid}-audience`"
            :checked="value.audience === option"
            @change="update({ audience: option })"
          />
          <FormattedMessage v-bind="option === 'public' ? defaultMessages.audiencePublic : defaultMessages.audienceTeam" />
        </label>
      </div>
      <p v-if="value.audience === 'team'" :class="styles.note"><FormattedMessage v-bind="defaultMessages.teamNote" /></p>
    </fieldset>

    <fieldset :class="styles.group">
      <legend :class="styles.legend"><FormattedMessage v-bind="defaultMessages.subject" /></legend>
      <div :class="styles.choices" role="radiogroup">
        <label
          v-for="option in subjects"
          :key="option.value"
          :class="[styles.choice, value.subject === option.value && styles.selected]"
          :data-subject="option.value"
        >
          <input
            :class="styles.radio"
            type="radio"
            :name="`${uid}-subject`"
            :checked="value.subject === option.value"
            @change="update({ subject: option.value })"
          />
          {{ option.label }}
        </label>
      </div>
    </fieldset>

    <div :class="styles.fields">
      <Input
        v-if="isFix"
        :model-value="value.target"
        name="target"
        :label="t(isEntry ? defaultMessages.entryTarget : defaultMessages.institutionTarget)"
        :error="errorOf('target')"
        required
        full-width
        @update:model-value="update({ target: $event })"
      />

      <fieldset v-if="value.subject === 'new-entry'" :class="styles.group">
        <legend :class="styles.label"><FormattedMessage v-bind="defaultMessages.kind" /></legend>
        <div :class="styles.choices">
          <label
            v-for="kind in (['project', 'study'] as const)"
            :key="kind"
            :class="[styles.choice, value.kind === kind && styles.selected]"
            :data-kind="kind"
          >
            <input
              :class="styles.radio"
              type="radio"
              :name="`${uid}-kind`"
              :checked="value.kind === kind"
              @change="update({ kind })"
            />
            <FormattedMessage v-bind="defaultMessages[kind]" />
          </label>
        </div>
      </fieldset>

      <Input
        v-if="!isFix"
        :model-value="value.name"
        name="name"
        :label="t(defaultMessages.name)"
        :error="errorOf('name')"
        required
        full-width
        @update:model-value="update({ name: $event })"
      />

      <label :class="styles.area">
        <span :class="styles.label"><FormattedMessage v-bind="isFix ? defaultMessages.detailsFix : defaultMessages.detailsNew" /></span>
        <textarea
          :class="styles.textarea"
          name="details"
          rows="5"
          required
          :value="value.details"
          :aria-invalid="errorOf('details') ? true : undefined"
          @input="update({ details: ($event.target as HTMLTextAreaElement).value })"
        />
        <span v-if="errorOf('details')" :class="styles.error" role="alert">{{ errorOf('details') }}</span>
      </label>

      <template v-if="value.subject === 'new-entry'">
        <Input
          :model-value="value.places"
          name="places"
          :label="t(defaultMessages.places)"
          full-width
          @update:model-value="update({ places: $event })"
        />
        <Input
          :model-value="value.institutions"
          name="institutions"
          :label="t(defaultMessages.institutions)"
          full-width
          @update:model-value="update({ institutions: $event })"
        />
      </template>

      <Input
        :model-value="value.source"
        name="source"
        :label="t(defaultMessages.source)"
        full-width
        @update:model-value="update({ source: $event })"
      />

      <div :class="styles.contact">
        <Input
          :model-value="value.contactName"
          name="contactName"
          :label="t(defaultMessages.contactName)"
          :error="errorOf('contactName')"
          :required="value.audience === 'team'"
          full-width
          @update:model-value="update({ contactName: $event })"
        />
        <Input
          v-if="value.audience === 'public'"
          :model-value="value.contactEmail"
          name="contactEmail"
          type="email"
          :label="t(defaultMessages.contactEmail)"
          full-width
          @update:model-value="update({ contactEmail: $event })"
        />
      </div>

      <div v-if="value.audience === 'public' && value.contactEmail.trim()" :class="styles.consent">
        <Checkbox
          :id="`${uid}-consent`"
          :model-value="value.consent"
          :label="t(defaultMessages.consent)"
          @update:model-value="update({ consent: $event })"
        />
        <span v-if="missing.includes('consent')" :class="styles.error" role="alert">
          <FormattedMessage v-bind="defaultMessages.consentRequired" />
        </span>
      </div>
    </div>

    <div :class="styles.actions">
      <Button type="submit" :loading="busy">
        <FormattedMessage v-bind="value.audience === 'team' ? defaultMessages.submitTeam : defaultMessages.submitPublic" />
      </Button>
    </div>
  </form>
</template>
