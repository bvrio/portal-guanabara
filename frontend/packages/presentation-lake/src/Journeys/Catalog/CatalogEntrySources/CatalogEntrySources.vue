<script lang="ts">
export interface CatalogSourceItem {
  url: string;
  doi: string | null;
  note: string | null;
  sourceType: string | null;
  venue: string | null;
  publishedYear: number | null;
}

/**
 * Where the information comes from. Facts that the workbook gives once for
 * several links (type, venue, year) are shown above the list rather than
 * guessed per link.
 */
export interface CatalogEntrySourcesProps {
  sources: readonly CatalogSourceItem[];
  sourceTypes: readonly string[];
  venues: readonly string[];
  publicationYears: readonly number[];
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import DescriptionList from '../../../Shared/components/DescriptionList/DescriptionList.vue';
import DescriptionListItem from '../../../Shared/components/DescriptionList/DescriptionListItem.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';

import { defaultMessages } from './CatalogEntrySources.messages';
import styles from './CatalogEntrySources.module.scss';

const { sources, sourceTypes, venues, publicationYears } = defineProps<CatalogEntrySourcesProps>();

/** Facts already printed on a link are not repeated above the list. */
const paired = computed(() => sources.length === 1 && Boolean(sources[0]?.sourceType || sources[0]?.venue));

/**
 * A link said compactly (v0.9): the site in bold, the rest of the address on
 * one short line under it (the full address is the link's title).
 */
function display(source: CatalogSourceItem): { host: string; path: string } {
  if (source.doi) return { host: 'doi', path: source.doi };
  try {
    const url = new URL(source.url);
    const path = url.pathname.length > 1 ? decodeURI(url.pathname.replace(/\/$/, '')) : '';
    return { host: url.hostname.replace(/^www\./, ''), path };
  } catch {
    return { host: source.url, path: '' };
  }
}
</script>

<template>
  <div :class="styles.root">
    <DescriptionList v-if="!paired && (sourceTypes.length || venues.length || publicationYears.length)" layout="stacked" :class="styles.facts">
      <DescriptionListItem v-if="sourceTypes.length">
        <template #term><FormattedMessage v-bind="defaultMessages.sourceTypes" /></template>
        {{ sourceTypes.join(', ') }}
      </DescriptionListItem>
      <DescriptionListItem v-if="venues.length">
        <template #term><FormattedMessage v-bind="defaultMessages.venues" /></template>
        {{ venues.join(', ') }}
      </DescriptionListItem>
      <DescriptionListItem v-if="publicationYears.length">
        <template #term><FormattedMessage v-bind="defaultMessages.years" /></template>
        {{ publicationYears.join(', ') }}
      </DescriptionListItem>
    </DescriptionList>

    <ul v-if="sources.length" :class="styles.list">
      <li v-for="source in sources" :key="source.url" :class="styles.item">
        <a :href="source.url" :class="styles.link" :title="source.url" target="_blank" rel="noopener noreferrer">
          <Icon name="document" size="xs" :class="styles.linkIcon" />
          <span :class="styles.linkText">
            <strong :class="styles.host">{{ display(source).host }}</strong>
            <span v-if="display(source).path" :class="styles.path">{{ display(source).path }}</span>
          </span>
          <Icon name="external-link" size="xs" :class="styles.linkIcon" />
          <span :class="styles.visuallyHidden"><FormattedMessage v-bind="defaultMessages.newTab" /></span>
        </a>
        <span v-if="source.sourceType || source.venue || source.publishedYear || source.note" :class="styles.meta">
          {{ [source.sourceType, source.venue, source.publishedYear, source.note].filter(Boolean).join(' · ') }}
        </span>
      </li>
    </ul>
    <p v-else :class="styles.empty"><FormattedMessage v-bind="defaultMessages.empty" /></p>
  </div>
</template>
