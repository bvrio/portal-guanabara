<script lang="ts">
import type { CatalogEntryKind, CatalogEntryStatus, CatalogPartialDate } from '../types';

/**
 * Head of the entry page (v0.9.1): a card the width of the page content, with
 * the kind colour as a stripe on top. First line: the kind chip (the page's
 * only kind icon), the status and the workbook ID; then the name, the objective
 * (default slot) and, alone and larger, *when* — the publication years of a
 * study, otherwise the period. On the right, a place for a photo: `photo`
 * (URL) when there is one, a dashed placeholder until then.
 * `#breadcrumb` (optional) goes above everything.
 */
export interface CatalogEntryHeaderProps {
  refId: number;
  kind: CatalogEntryKind;
  status: CatalogEntryStatus | null;
  name: string;
  start: CatalogPartialDate | null;
  end: CatalogPartialDate | null;
  ongoing: boolean;
  /** Studies: shown as “Publicado em …” instead of the period. */
  publicationYears?: readonly number[];
  /** A photo of the initiative or study; a placeholder keeps its place meanwhile. */
  photo?: string;
  /** Hide the photo column altogether (e.g. stories of the text alone). */
  withoutPhoto?: boolean;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import CatalogEntryBadges from '../CatalogEntryBadges/CatalogEntryBadges.vue';
import CatalogPeriod from '../CatalogPeriod/CatalogPeriod.vue';

import { CATALOG_CONTENT_LANG } from '../types';

import { defaultMessages } from './CatalogEntryHeader.messages';
import styles from './CatalogEntryHeader.module.scss';

const {
  refId,
  kind,
  status,
  name,
  start,
  end,
  ongoing,
  publicationYears,
  photo,
  withoutPhoto = false,
} = defineProps<CatalogEntryHeaderProps>();

const years = computed(() => [...(publicationYears ?? [])].sort((a, b) => a - b).join(', '));
</script>

<template>
  <header :class="[styles.root, styles[kind], withoutPhoto && styles.textOnly]" :data-kind="kind">
    <div v-if="$slots.breadcrumb" :class="styles.breadcrumb"><slot name="breadcrumb" /></div>
    <div :class="styles.text">
      <div :class="styles.top">
        <CatalogEntryBadges :kind="kind" :status="status" size="lg" />
        <span :class="styles.reference" data-entry-ref>
          <FormattedMessage v-bind="defaultMessages.reference" :values="{ ref: refId }" />
        </span>
      </div>
      <h1 :class="styles.title" :lang="CATALOG_CONTENT_LANG">{{ name }}</h1>
      <div v-if="$slots.default" :class="styles.lead"><slot /></div>
      <p :class="styles.when" data-entry-when>
        <Icon :name="years ? 'document' : 'calendar'" size="md" :class="styles.whenIcon" />
        <FormattedMessage v-if="years" v-bind="defaultMessages.publishedIn" :values="{ years }" />
        <CatalogPeriod v-else :start="start" :end="end" :ongoing="ongoing" />
      </p>
    </div>
    <figure v-if="!withoutPhoto" :class="[styles.photo, !photo && styles.photoEmpty]" data-entry-photo>
      <img v-if="photo" :src="photo" alt="" :class="styles.image" />
      <figcaption v-else :class="styles.photoPending" data-photo-placeholder>
        <Icon name="bay" size="lg" :class="styles.photoIcon" />
        <FormattedMessage v-bind="defaultMessages.photoPending" />
      </figcaption>
    </figure>
  </header>
</template>
