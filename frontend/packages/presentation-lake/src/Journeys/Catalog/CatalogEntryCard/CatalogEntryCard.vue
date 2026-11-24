<script lang="ts">
import type { CatalogEntryItem } from '../types';

/**
 * One initiative or study in a list of results (v0.8, option 2 “Estruturado e
 * Escaneável”). The kind leads as a tinted tile with its name and the status;
 * the entry's name is the title and the objective follows; then the facts in
 * fixed blocks — Local and Período (Publicação for studies) side by side, and
 * the Temas (keywords and bay sectors) — so cards read and compare at a
 * glance. The whole card opens the entry; the tags keep their own links.
 */
export interface CatalogEntryCardProps {
  entry: CatalogEntryItem;
  /** Heading level of the entry name inside the surrounding page. */
  headingLevel?: 2 | 3 | 4;
  /**
   * `md` (default) — lists and the side drawer; `sm` (v0.9.18) — the same card,
   * smaller (Início's Destaques): tighter, one size down, at most three themes.
   */
  size?: 'md' | 'sm';
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import Link from '../../../Shared/components/Link/Link.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { kindMessages } from '../Catalog.messages';
import CatalogEntryBadges from '../CatalogEntryBadges/CatalogEntryBadges.vue';
import CatalogIcon from '../CatalogIcon/CatalogIcon.vue';
import CatalogPeriod from '../CatalogPeriod/CatalogPeriod.vue';
import CatalogTag from '../CatalogTag/CatalogTag.vue';
import { CATALOG_CONTENT_LANG } from '../types';

import { defaultMessages } from './CatalogEntryCard.messages';
import styles from './CatalogEntryCard.module.scss';

const { entry, headingLevel = 2, size = 'md' } = defineProps<CatalogEntryCardProps>();

/** The small card keeps three themes and says how many more. */
const SMALL_TOPICS = 3;

/** Studies are placed in time by their publication; initiatives by their period. */
const showsPublication = computed(() => entry.kind === 'study' && entry.publicationYears.length > 0);
const hasPeriod = computed(() => Boolean(entry.start || entry.end || entry.ongoing));
const topics = computed(() => [
  ...entry.keywords.map((item) => ({ item, dimension: 'keyword' as const })),
  ...entry.sectors.map((item) => ({ item, dimension: 'sector' as const })),
]);
const shownTopics = computed(() => (size === 'sm' ? topics.value.slice(0, SMALL_TOPICS) : topics.value));
const moreTopics = computed(() => topics.value.length - shownTopics.value.length);
</script>

<template>
  <article :class="[styles.root, styles[entry.kind], size === 'sm' && styles.sm]" :data-ref="entry.ref" :data-kind="entry.kind" :data-size="size">
    <div :class="styles.head">
      <CatalogIcon :kind="entry.kind" :size="size === 'sm' ? 'sm' : 'md'" framed :class="styles.kindTile" />
      <span :class="styles.kind"><FormattedMessage v-bind="kindMessages[entry.kind]" /></span>
      <CatalogEntryBadges :status="entry.status" />
    </div>

    <component :is="`h${headingLevel}`" :class="styles.title" :title="entry.name" :lang="CATALOG_CONTENT_LANG">
      <Link :href="entry.href">{{ entry.name }}</Link>
    </component>

    <p v-if="entry.objective" :class="styles.objective" :lang="CATALOG_CONTENT_LANG">{{ entry.objective }}</p>

    <dl :class="styles.meta">
      <div :class="styles.metaItem" data-meta="place">
        <dt><Icon name="map-pin" size="xs" /><FormattedMessage v-bind="defaultMessages.place" /></dt>
        <dd>
          <template v-if="entry.municipalities.length">{{ entry.municipalities.join(', ') }}</template>
          <span v-else :class="styles.notGiven"><FormattedMessage v-bind="defaultMessages.notGiven" /></span>
        </dd>
      </div>
      <div :class="styles.metaItem" :data-meta="showsPublication ? 'publication' : 'period'">
        <template v-if="showsPublication">
          <dt><Icon name="document" size="xs" /><FormattedMessage v-bind="defaultMessages.publication" /></dt>
          <dd>{{ entry.publicationYears.join(', ') }}</dd>
        </template>
        <template v-else>
          <dt><Icon name="calendar" size="xs" /><FormattedMessage v-bind="defaultMessages.period" /></dt>
          <dd>
            <CatalogPeriod v-if="hasPeriod" :start="entry.start" :end="entry.end" :ongoing="entry.ongoing" />
            <span v-else :class="styles.notGiven"><FormattedMessage v-bind="defaultMessages.notGiven" /></span>
          </dd>
        </template>
      </div>
    </dl>

    <div v-if="topics.length" :class="styles.topics" data-meta="topics">
      <p :class="styles.topicsLabel"><Icon name="tag" size="xs" /><FormattedMessage v-bind="defaultMessages.topics" /></p>
      <ul :class="styles.tags">
        <li v-for="topic in shownTopics" :key="`${topic.dimension}-${topic.item.code}`">
          <CatalogTag :item="topic.item" :dimension="topic.dimension" />
        </li>
        <li v-if="moreTopics > 0" :class="styles.moreTopics" data-more-topics>
          <FormattedMessage v-bind="defaultMessages.moreTopics" :values="{ count: moreTopics }" />
        </li>
      </ul>
    </div>
  </article>
</template>
