<script setup lang="ts">
/**
 * Mapa · Explore (clients-webapp · common · Map Journey, v0.7; sectors v0.8).
 * The municipalities around the bay, coloured by their initiatives, with a
 * purple circle for their studies, and the bay's sectors as zones in the
 * water; a click on the map or a list opens the place's entries in the
 * catalogue drawer, where more filters can be stacked. Outlines and zones are
 * provisional.
 */
import { computed, onMounted, ref } from 'vue';
import { useIntl } from 'vue-intl';

import { useHead } from '#imports';
import {
  Alert,
  Button,
  CatalogResultsDrawer,
  FormattedMessage,
  formatMessage,
  type MapMarkerKind,
  type MapMunicipality,
  type MapSector,
  MunicipalityMap,
} from '@portal-guanabara/presentation-lake';

import { useGetCatalogMap } from '~/hooks/common/map';
import { useTracking } from '~/shared/hooks/tracking';

import { useCatalogResultsDrawer } from '../../catalog/catalogResultsDrawer';
import { toMapMunicipalities, toMapSectors } from '../mapPageModels';

import { defaultMessages } from './ExplorePage.messages';
import styles from './ExplorePage.module.scss';

const intl = useIntl();
const tracking = useTracking();

useHead({ title: formatMessage(intl, defaultMessages.documentTitle) });

const { data: map, error, status, refresh } = await useGetCatalogMap();

const municipalities = computed(() => toMapMunicipalities(map.value));
const sectors = computed(() => toMapSectors(map.value));
const highlighted = ref<string | null>(null);
const highlightedSector = ref<string | null>(null);

// ------------------------------------------------------ entries drawer
const drawer = useCatalogResultsDrawer({ feature: 'map.drawer', tracking });

/** A marker click (v0.9.6) adds its kind: the orange badge → initiatives, the purple circle → studies. */
const kindFilter = (kind?: MapMarkerKind) => (kind ? [{ dimension: 'kind' as const, code: kind, label: kind }] : []);

function openMunicipality(municipality: MapMunicipality, source: 'map' | 'list', kind?: MapMarkerKind) {
  tracking.success('map.municipality.select', { code: municipality.code, source, ...(kind ? { kind } : {}) });
  drawer.show([{ dimension: 'municipality', code: municipality.code, label: municipality.name }, ...kindFilter(kind)]);
}

function openSector(sector: MapSector, source: 'map' | 'list', kind?: MapMarkerKind) {
  tracking.success('map.sector.select', { code: sector.code, source, ...(kind ? { kind } : {}) });
  drawer.show([{ dimension: 'sector', code: sector.code, label: sector.name }, ...kindFilter(kind)]);
}

onMounted(() => {
  if (map.value) tracking.featureExposure('map.municipalities');
  if (sectors.value.length) tracking.featureExposure('map.sectors');
  if (error.value) tracking.error('catalog.map.load');
});
</script>

<template>
  <main :class="styles.root">
    <!-- The header already says "Mapa"; the map, its legend and the two cards say the rest (v0.9.8). -->
    <h1 id="map-title" :class="styles.visuallyHidden"><FormattedMessage v-bind="defaultMessages.title" /></h1>
    <div :class="styles.band" aria-hidden="true" />

    <div :class="styles.content">
      <Alert v-if="error && !map" variant="error">
        <FormattedMessage v-bind="defaultMessages.loadError" />
        <Button variant="secondary" size="sm" :loading="status === 'pending'" @click="refresh()">
          <FormattedMessage v-bind="defaultMessages.retry" />
        </Button>
      </Alert>

      <!-- data-tour: the guided tour's Mapa step lights the panel, caption included (v0.9.31). -->
      <section v-else-if="map" :class="styles.panel" aria-labelledby="map-title" data-testid="map-panel" data-tour="map">
        <MunicipalityMap
          v-model:highlighted="highlighted"
          v-model:highlighted-sector="highlightedSector"
          :bounds="map.view"
          :municipalities="municipalities"
          :sectors="sectors"
          @select="(municipality, kind) => openMunicipality(municipality, 'map', kind)"
          @select-sector="(sector, kind) => openSector(sector, 'map', kind)"
        >
          <template #source>
            <p :class="styles.source">
              <FormattedMessage v-bind="defaultMessages.source" />
              <a :href="map.source.url" target="_blank" rel="noopener noreferrer">
                <FormattedMessage v-bind="defaultMessages.sourceLink" />
              </a>
            </p>
          </template>
        </MunicipalityMap>

        <!-- v0.9.9: the map alone; what it cannot show is said in one line under it. -->
        <p v-if="map.unknown || map.unknownSectors" :class="styles.unknown" data-map-unknown>
          <span v-if="map.unknown"><FormattedMessage v-bind="defaultMessages.unknown" :values="{ count: map.unknown }" /></span>
          <span v-if="map.unknownSectors">
            <FormattedMessage v-bind="defaultMessages.unknownSectors" :values="{ count: map.unknownSectors }" />
          </span>
        </p>
      </section>
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
