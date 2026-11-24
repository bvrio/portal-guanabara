<script setup lang="ts">
/**
 * Catalog Journey · Contribute (`/catalog/contribute`, v0.9.25). One form for
 * the public's suggestions and the internal team's changes, behind the
 * `contributionForms` Feature Flag. `?entry=36` or `?institution=uff` opens
 * the matching correction. Page → useSubmitCatalogContribution →
 * CatalogService → POST /api/submissions.
 */
import { ref } from 'vue';
import { useIntl } from 'vue-intl';

import { setResponseStatus, useHead, useRoute } from '#imports';
import {
  Alert,
  Button,
  CatalogContributionForm,
  type CatalogContributionValue,
  EmptyState,
  emptyCatalogContribution,
  FormattedMessage,
  formatMessage,
  PageHero,
} from '@portal-guanabara/presentation-lake';

import { type CatalogContributionReceipt, useSubmitCatalogContribution } from '~/hooks/common/catalog';
import { useFeatureFlag } from '~/shared/hooks/feature-flag';
import { useTracking } from '~/shared/hooks/tracking';

import { defaultMessages } from './ContributePage.messages';
import styles from './ContributePage.module.scss';

const intl = useIntl();
const route = useRoute();
const tracking = useTracking();
const enabled = useFeatureFlag('contributionForms');

useHead({ title: formatMessage(intl, defaultMessages.documentTitle) });
if (!enabled.value) setResponseStatus(404);

function initialValue(): CatalogContributionValue {
  const value = emptyCatalogContribution();
  const entry = typeof route.query.entry === 'string' ? route.query.entry : '';
  const institution = typeof route.query.institution === 'string' ? route.query.institution : '';
  if (entry) return { ...value, subject: 'fix-entry', target: entry };
  if (institution) return { ...value, subject: 'fix-institution', target: institution };
  return value;
}

const form = ref(initialValue());
const receipt = ref<CatalogContributionReceipt | null>(null);
const { execute, status, error } = useSubmitCatalogContribution();

async function submit(value: CatalogContributionValue) {
  const fix = value.subject.startsWith('fix-');
  try {
    receipt.value = await execute({
      audience: value.audience,
      subject: value.subject,
      target: fix ? value.target : undefined,
      kind: value.subject === 'new-entry' ? value.kind : undefined,
      name: fix ? undefined : value.name,
      details: value.details,
      places: value.subject === 'new-entry' ? value.places : undefined,
      institutions: value.subject === 'new-entry' ? value.institutions : undefined,
      source: value.source || undefined,
      contactName: value.contactName || undefined,
      contactEmail: value.audience === 'public' && value.consent ? value.contactEmail : undefined,
    });
    tracking.success('catalog.contribution.submit', { audience: value.audience, subject: value.subject });
  } catch {
    tracking.error('catalog.contribution.submit');
  }
}

function another() {
  receipt.value = null;
  form.value = { ...emptyCatalogContribution(), audience: form.value.audience, contactName: form.value.contactName };
}
</script>

<template>
  <main :class="styles.root">
    <PageHero size="sm">
      <template #title><FormattedMessage v-bind="defaultMessages.title" /></template>
      <template #description><FormattedMessage v-bind="defaultMessages.description" /></template>
    </PageHero>

    <div :class="styles.content">
      <EmptyState v-if="!enabled" data-testid="contribution-disabled">
        <template #title><FormattedMessage v-bind="defaultMessages.disabledTitle" /></template>
        <FormattedMessage v-bind="defaultMessages.disabledDescription" />
      </EmptyState>

      <EmptyState v-else-if="receipt" data-testid="contribution-receipt">
        <template #title>
          <FormattedMessage v-bind="receipt.status === 'recorded' ? defaultMessages.recordedTitle : defaultMessages.sentTitle" />
        </template>
        <FormattedMessage v-bind="defaultMessages.receipt" :values="{ id: receipt.id }" />
        <template #actions>
          <Button variant="secondary" @click="another"><FormattedMessage v-bind="defaultMessages.another" /></Button>
        </template>
      </EmptyState>

      <section v-else :class="styles.panel">
        <Alert v-if="error" variant="error"><FormattedMessage v-bind="defaultMessages.error" /></Alert>
        <CatalogContributionForm v-model="form" team-available :busy="status === 'pending'" @submit="submit" />
      </section>
    </div>
  </main>
</template>
