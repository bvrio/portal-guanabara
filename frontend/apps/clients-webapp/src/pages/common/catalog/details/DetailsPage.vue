<script setup lang="ts">
/**
 * Catalog · Details (clients-webapp · common · Catalog Journey; compact summary v0.9).
 * The header answers first — kind, status, name, objective and a strip of key
 * facts (when, where, ID). Then the reported results, Onde / O quê side by
 * side, a mini map, and the mapping notes behind one disclosure; on the side,
 * who takes part (each institution opens its entries in the drawer) and the
 * sources.
 */
import { computed, onMounted } from 'vue';
import { useIntl } from 'vue-intl';

import { setResponseStatus, useHead, useRoute } from '#imports';
import {
  Alert,
  Button,
  Card,
  CatalogEntryFacts,
  CatalogEntryHeader,
  CatalogEntryKeyFacts,
  CatalogEntryNarrative,
  CatalogEntryParties,
  CatalogEntrySources,
  CatalogResultsDrawer,
  type CatalogPartyItem,
  EmptyState,
  FormattedMessage,
  formatMessage,
  Icon,
  Link,
  MapLocator,
} from '@portal-guanabara/presentation-lake';

import { useGetCatalogEntry } from '~/hooks/common/catalog';
import { useGetCatalogMap } from '~/hooks/common/map';
import { errorCodeOf } from '~/lib/http';
import { useEmblems } from '~/shared/hooks/emblems';
import { useFeatureFlag } from '~/shared/hooks/feature-flag';
import { routePath } from '~/shared/hooks/navigation';
import { useTracking } from '~/shared/hooks/tracking';

import { toMapMunicipalities, toMapSectors } from '../../map/mapPageModels';
import { toTagItems } from '../catalogPageModels';
import { useCatalogResultsDrawer } from '../catalogResultsDrawer';

import { defaultMessages } from './DetailsPage.messages';
import styles from './DetailsPage.module.scss';

const intl = useIntl();
const route = useRoute();
const tracking = useTracking();
const personNames = useFeatureFlag('catalogPersonNames');
const contributions = useFeatureFlag('contributionForms');

/** Workbook ID from the URL (`/catalog/36`); anything else is not an entry. */
const rawId = computed(() => String(route.params.id ?? ''));
const entryRef = computed(() => (/^[1-9]\d{0,8}$/.test(rawId.value) ? Number(rawId.value) : 0));

// Page → Hooks → Services → /api/catalog (an invalid ID is asked as 0 and answers 404).
// The map is only the picture of where the entry is: without it the page is complete.
const [{ data: entry, error, refresh, status }, { data: map }] = await Promise.all([
  useGetCatalogEntry(entryRef),
  useGetCatalogMap(),
]);

const notFound = computed(() => entryRef.value === 0 || errorCodeOf(error.value) === 'CATALOG_ENTRY_NOT_FOUND');
if (notFound.value) setResponseStatus(404);

useHead({
  title: computed(() =>
    entry.value
      ? formatMessage(intl, defaultMessages.documentTitle, { name: entry.value.name })
      : formatMessage(intl, defaultMessages.notFoundDocumentTitle),
  ),
});

const facts = computed(() => {
  const value = entry.value;
  if (!value) return null;
  return {
    start: value.start,
    end: value.end,
    ongoing: value.ongoing,
    periodicity: value.periodicity,
    places: value.places,
    siteTypes: value.siteTypes,
    indicators: value.indicators,
    mechanisms: toTagItems(value.mechanisms, 'mechanism'),
    keywords: toTagItems(value.keywords, 'keyword'),
    sectors: toTagItems(value.sectors, 'sector'),
  };
});
/**
 * Onde, without what the map card already says (v0.9.1): the municipalities
 * and bay sectors sit on top of the mini map; neighbourhoods, rivers,
 * protected areas and site types stay here.
 */
const whereFacts = computed(() => {
  const value = facts.value;
  if (!value) return null;
  const places = value.places.filter((group) => group.type !== 'municipality' && group.type !== 'sector');
  return places.length || value.siteTypes.length ? { ...value, places, sectors: [] } : null;
});

// ------------------------------------------------------------ key facts
const municipalityNames = computed(() => entry.value?.places.find((group) => group.type === 'municipality')?.names ?? []);
const sectorItems = computed(() => toTagItems(entry.value?.sectors ?? [], 'sector'));

// ------------------------------------------------------------- mini map
const mapMunicipalities = computed(() => toMapMunicipalities(map.value));
const mapSectors = computed(() => toMapSectors(map.value));
const highlightedMunicipalities = computed(() =>
  mapMunicipalities.value.filter((item) => municipalityNames.value.includes(item.name)).map((item) => item.code),
);
const highlightedSectors = computed(() => sectorItems.value.map((item) => item.code));
const showsMap = computed(() => Boolean(map.value) && (highlightedMunicipalities.value.length > 0 || highlightedSectors.value.length > 0));
const mapLabel = computed(() => {
  const places = [...municipalityNames.value, ...sectorItems.value.map((item) => item.label)];
  return formatMessage(intl, defaultMessages.mapLabel, { places: intl.formatList(places, { type: 'conjunction' }) });
});

// ------------------------------------- participants → institution drawer
const emblems = useEmblems();
const logos = computed(() =>
  Object.fromEntries(
    (entry.value?.parties ?? [])
      .flatMap((group) => group.parties)
      .flatMap((party) => {
        const logo = party.code ? emblems.institutionLogo(party.code) : undefined;
        return party.code && logo ? [[party.code, logo]] : [];
      }),
  ),
);
const drawer = useCatalogResultsDrawer({ feature: 'catalog.entry-drawer', tracking });
function openInstitution(party: CatalogPartyItem) {
  if (!party.code) return;
  tracking.success('catalog.entry.institution-select', { code: party.code });
  drawer.show([{ dimension: 'institution', code: party.code, label: party.name }]);
}

const showsPersons = computed(() =>
  Boolean(entry.value?.parties.some((group) => group.parties.some((party) => party.kind === 'person'))),
);

onMounted(() => {
  if (notFound.value) {
    tracking.empty('catalog.entry-details');
    return;
  }
  if (!entry.value) {
    tracking.error('catalog.entry.load', { code: errorCodeOf(error.value) });
    return;
  }
  tracking.featureExposure('catalog.entry-details');
  if (showsMap.value) tracking.featureExposure('catalog.entry-map');
  if (personNames.value && showsPersons.value) tracking.featureExposure('catalog.person-names');
});
</script>

<template>
  <main :class="styles.root">
    <!-- data-tour: the guided tour lights the whole entry page (v0.9.33; the header card in v0.9.32). -->
    <article v-if="entry && facts && !notFound && !error" :class="styles.entry" :data-ref="entry.ref" data-tour="entry">
      <div :class="styles.content">
        <CatalogEntryHeader
          :ref-id="entry.ref"
          :kind="entry.kind"
          :status="entry.status"
          :name="entry.name"
          :start="entry.start"
          :end="entry.end"
          :ongoing="entry.ongoing"
          :publication-years="entry.kind === 'study' ? entry.publicationYears : undefined"
        >
          <p v-if="entry.objective">{{ entry.objective }}</p>
        </CatalogEntryHeader>

        <div :class="styles.layout">
          <div :class="styles.main">
            <CatalogEntryNarrative
              v-if="entry.resultsSummary"
              part="results"
              :kind="entry.kind"
              :results-summary="entry.resultsSummary"
              :data-availability="null"
              :detail-notes="[]"
            />

            <Card :class="styles.factsCard">
              <div :class="[styles.factGroups, !whereFacts && styles.single]">
                <section v-if="whereFacts" :class="styles.factGroup" aria-labelledby="entry-where-title" data-facts-group="where">
                  <h2 id="entry-where-title" :class="styles.cardTitle">
                    <Icon name="map-pin" size="md" :class="styles.cardIcon" />
                    <FormattedMessage v-bind="defaultMessages.whereTitle" />
                  </h2>
                  <CatalogEntryFacts v-bind="whereFacts" group="where" />
                </section>
                <section :class="styles.factGroup" aria-labelledby="entry-what-title" data-facts-group="what">
                  <h2 id="entry-what-title" :class="styles.cardTitle">
                    <Icon name="target" size="md" :class="styles.cardIcon" />
                    <FormattedMessage v-bind="defaultMessages.whatTitle" />
                  </h2>
                  <CatalogEntryFacts v-bind="facts" group="what" />
                </section>
              </div>
            </Card>

            <CatalogEntryNarrative
              v-if="entry.dataAvailability || entry.detailNotes.length"
              part="notes"
              :results-summary="null"
              :data-availability="entry.dataAvailability"
              :detail-notes="entry.detailNotes"
            />

            <Card data-entry-sources>
              <h2 :class="styles.cardTitle">
                <Icon name="external-link" size="md" :class="styles.cardIcon" />
                <FormattedMessage v-bind="defaultMessages.sourcesTitle" />
              </h2>
              <CatalogEntrySources
                :sources="entry.sources"
                :source-types="entry.sourceTypes"
                :venues="entry.venues"
                :publication-years="entry.publicationYears"
              />
            </Card>

            <Link
              v-if="contributions"
              :href="`${routePath('catalogContribute')}?entry=${entry.ref}`"
              :class="styles.mapLink"
              data-testid="catalog-entry-suggest"
            >
              <Icon name="document" size="sm" />
              <FormattedMessage v-bind="defaultMessages.suggestFix" />
            </Link>
          </div>

          <aside :class="styles.aside">
            <Card v-if="showsMap || municipalityNames.length || sectorItems.length" :class="styles.mapCard" data-entry-map>
              <h2 :class="styles.cardTitle">
                <Icon name="map" size="md" :class="styles.cardIcon" />
                <FormattedMessage v-bind="defaultMessages.mapTitle" />
              </h2>
              <CatalogEntryKeyFacts
                :municipalities="municipalityNames"
                :sectors="sectorItems"
                :parts="['municipalities', 'sectors']"
                layout="row"
              />
              <MapLocator
                v-if="showsMap && map"
                :bounds="map.view"
                :municipalities="mapMunicipalities"
                :sectors="mapSectors"
                :highlighted="highlightedMunicipalities"
                :highlighted-sectors="highlightedSectors"
                :label="mapLabel"
              />
              <Link v-if="showsMap" :href="routePath('mapExplore')" :class="styles.mapLink">
                <FormattedMessage v-bind="defaultMessages.mapLink" />
                <Icon name="arrow-right" size="xs" />
              </Link>
            </Card>

            <Card>
              <h2 :class="styles.cardTitle">
                <Icon name="people" size="md" :class="styles.cardIcon" />
                <FormattedMessage v-bind="defaultMessages.partiesTitle" />
              </h2>
              <CatalogEntryParties
                :groups="entry.parties"
                :persons-hidden="entry.personsHidden"
                :logos="logos"
                selectable
                @select="openInstitution"
              />
            </Card>
          </aside>
        </div>
      </div>
    </article>

    <div v-else :class="[styles.content, styles.state]">
      <EmptyState v-if="notFound" data-testid="catalog-entry-not-found">
        <template #title><FormattedMessage v-bind="defaultMessages.notFoundTitle" /></template>
        <FormattedMessage v-bind="defaultMessages.notFoundDescription" :values="{ id: rawId }" />
        <template #actions>
          <Link :href="routePath('catalogList')"><FormattedMessage v-bind="defaultMessages.browseAll" /></Link>
        </template>
      </EmptyState>

      <Alert v-else variant="error">
        <FormattedMessage v-bind="defaultMessages.loadError" />
        <Button variant="secondary" size="sm" :loading="status === 'pending'" @click="refresh()">
          <FormattedMessage v-bind="defaultMessages.retry" />
        </Button>
      </Alert>
    </div>

    <CatalogResultsDrawer
      v-model:open="drawer.open.value"
      :filters="drawer.filters.value"
      :facets="drawer.facets.value"
      :items="drawer.items.value"
      :total="drawer.total.value"
      :loading="drawer.loading.value"
      :error="drawer.error.value"
      :list-href="drawer.listHref.value"
      :emblem="drawer.emblem.value"
      @add="drawer.add"
      @remove="drawer.remove"
      @clear="drawer.clear"
      @retry="drawer.retry"
    />
  </main>
</template>
