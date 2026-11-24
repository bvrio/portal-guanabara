<script lang="ts">
import type { CatalogEntryItem } from '../types';

/**
 * Ongoing initiatives and the most recent studies, side by side (Início). Since
 * v0.9.18 each column has its kind icon and title centred, then three entries
 * as small cards — the side drawer's card one size down.
 */
export interface CatalogHighlightsProps {
  ongoing: readonly CatalogEntryItem[];
  recent: readonly CatalogEntryItem[];
  /** Entries per column. */
  limit?: number;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import CardGrid from '../../../Shared/primitives/CardGrid/CardGrid.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import CatalogEntryCard from '../CatalogEntryCard/CatalogEntryCard.vue';
import CatalogIcon from '../CatalogIcon/CatalogIcon.vue';

import { defaultMessages } from './CatalogHighlights.messages';
import styles from './CatalogHighlights.module.scss';

const { ongoing, recent, limit = 3 } = defineProps<CatalogHighlightsProps>();

const ongoingShown = computed(() => ongoing.slice(0, limit));
const recentShown = computed(() => recent.slice(0, limit));
</script>

<template>
  <CardGrid :max-columns="2">
    <section v-if="ongoingShown.length" :class="[styles.column, styles.project]" aria-labelledby="catalog-highlights-ongoing">
      <h3 id="catalog-highlights-ongoing" :class="styles.title">
        <CatalogIcon kind="project" size="lg" framed />
        <FormattedMessage v-bind="defaultMessages.ongoingTitle" />
      </h3>
      <ul :class="styles.list">
        <li v-for="entry in ongoingShown" :key="entry.ref" :data-ref="entry.ref">
          <CatalogEntryCard :entry="entry" :heading-level="4" size="sm" />
        </li>
      </ul>
    </section>

    <section v-if="recentShown.length" :class="[styles.column, styles.study]" aria-labelledby="catalog-highlights-recent">
      <h3 id="catalog-highlights-recent" :class="styles.title">
        <CatalogIcon kind="study" size="lg" framed />
        <FormattedMessage v-bind="defaultMessages.recentTitle" />
      </h3>
      <ul :class="styles.list">
        <li v-for="entry in recentShown" :key="entry.ref" :data-ref="entry.ref">
          <CatalogEntryCard :entry="entry" :heading-level="4" size="sm" />
        </li>
      </ul>
    </section>
  </CardGrid>
</template>
