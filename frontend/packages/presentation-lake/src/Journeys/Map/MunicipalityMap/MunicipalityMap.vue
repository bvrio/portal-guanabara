<script lang="ts">
import type { MapBounds, MapMunicipality, MapSector } from '../types';

/**
 * The municipalities around Guanabara Bay and the bay's sectors (v0.8).
 *
 * - Municipalities with entries are shaded by their **entries** (four classes
 *   of the mangue green, v0.9.5 — green is neither kind) and carry an orange
 *   badge counting their **initiatives** and a purple circle counting their
 *   **studies** — the more studies, the bigger the circle. Neighbours are grey
 *   context. Since v0.9.30 each one's **name** sits over its markers (a long
 *   name gives way to its short one, e.g. "S.J. Meriti"), in a layer above the
 *   land so no neighbour covers it.
 * - Bay sectors with a zone (`geometry`) are drawn in the water behind the land
 *   with dashed borders, their name and the same two markers.
 *
 * - Sectors without a zone (the whole bay) are pills over the sea (v0.9.9),
 *   with the same markers.
 * - The caption (top left) takes the colour of the place under the pointer and
 *   says its initiatives over its studies, on light orange and light purple; the
 *   line of the marker under the pointer turns to the marker's own colour.
 *
 * Municipalities and sectors are buttons — click, Enter or Space emits `select`
 * or `selectSector`. A click on a marker itself (v0.9.6) adds its kind: the
 * orange badge emits `('project')`, the purple circle `('study')`. Hovering or focusing one names it with its counts;
 * `v-model:highlighted` and `v-model:highlighted-sector` keep the map in step
 * with the lists beside it.
 */
/** The kind a marker stands for: the orange badge (`project`) or the purple circle (`study`). */
export type MapMarkerKind = 'project' | 'study';

export interface MunicipalityMapProps {
  bounds: MapBounds;
  municipalities: readonly MapMunicipality[];
  sectors?: readonly MapSector[];
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useIntl } from 'vue-intl';

import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { formatMessage } from '../../../Shared/foundations/i18n/formatMessage';
import { mapMessages } from '../Map.messages';
import { createProjection, geometryPath, labelPoint } from '../projection';
import { binOf, INITIATIVES_BADGE_RADIUS, mapBins, mapLevelFill, studyRadius } from '../scale';

import { defaultMessages } from './MunicipalityMap.messages';
import styles from './MunicipalityMap.module.scss';

const { bounds, municipalities, sectors = [] } = defineProps<MunicipalityMapProps>();

const highlighted = defineModel<string | null>('highlighted', { default: null });
const highlightedSector = defineModel<string | null>('highlightedSector', { default: null });

const emit = defineEmits<{
  select: [municipality: MapMunicipality, kind?: MapMarkerKind];
  selectSector: [sector: MapSector, kind?: MapMarkerKind];
}>();

const intl = useIntl();
const projection = computed(() => createProjection(bounds));
const bins = computed(() => mapBins(Math.max(0, ...municipalities.map((item) => item.entries))));
const maxStudies = computed(() => Math.max(0, ...municipalities.map((item) => item.studies), ...sectors.map((item) => item.studies)));

const BADGE = INITIATIVES_BADGE_RADIUS;
const GAP = 3;

interface Marker {
  kind: 'project' | 'study';
  count: number;
  x: number;
  r: number;
}

/**
 * The orange badge (initiatives) and the purple circle (studies) of a place.
 * `centered` keeps the pair centred on the anchor (sectors); otherwise the
 * badge sits on the anchor and the circle beside it (municipalities).
 */
function markersOf(projects: number, studies: number, centered: boolean): Marker[] {
  const radius = studyRadius(studies, maxStudies.value);
  const markers: Marker[] = [];
  if (projects > 0) markers.push({ kind: 'project', count: projects, x: 0, r: BADGE });
  if (studies > 0) markers.push({ kind: 'study', count: studies, x: projects > 0 ? BADGE + GAP + radius : 0, r: radius });
  if (centered && markers.length === 2) {
    const shift = (BADGE + GAP + 2 * radius - BADGE) / 2;
    for (const marker of markers) marker.x -= shift;
  }
  return markers;
}

const shapes = computed(() =>
  municipalities.map((municipality) => ({
    municipality,
    d: geometryPath(municipality.geometry, projection.value),
    level: binOf(municipality.entries, bins.value)?.level,
  })),
);
const context = computed(() => shapes.value.filter((shape) => shape.municipality.entries <= 0));
const active = computed(() =>
  shapes.value
    .filter((shape) => shape.municipality.entries > 0)
    .map((shape) => {
      const markers = markersOf(shape.municipality.projects, shape.municipality.studies, false);
      const left = Math.min(...markers.map((marker) => marker.x - marker.r));
      const right = Math.max(...markers.map((marker) => marker.x + marker.r));
      return {
        ...shape,
        anchor: labelPoint(shape.municipality.geometry, projection.value),
        markers,
        // The name (v0.9.30) is centred over the markers, just above the taller one.
        name: {
          x: markers.length ? (left + right) / 2 : 0,
          y: -(Math.max(BADGE, ...markers.map((marker) => marker.r)) + 7),
        },
      };
    }),
);
// The highlighted one is drawn last, so its outline is never covered.
const ordered = computed(() =>
  [...active.value].sort((a, b) => Number(a.municipality.code === highlighted.value) - Number(b.municipality.code === highlighted.value)),
);

const zones = computed(() =>
  sectors
    .filter((sector) => sector.entries > 0 && sector.geometry && sector.label)
    .map((sector) => ({
      sector,
      d: geometryPath(sector.geometry!, projection.value),
      anchor: projection.value.project(sector.label!),
      markers: markersOf(sector.projects, sector.studies, true),
    }))
    // The name sits just above the taller of its two markers.
    .map((zone) => ({ ...zone, nameY: -(Math.max(BADGE, ...zone.markers.map((marker) => marker.r)) + 8) })),
);

/** Sectors that are no one area (the whole bay): pills over the sea, not zones. */
const wholeSectors = computed(() =>
  sectors
    .filter((sector) => sector.entries > 0 && !sector.geometry)
    .map((sector) => ({ sector, markers: markersOf(sector.projects, sector.studies, false) })),
);

const current = computed(() => {
  const shape = active.value.find((item) => item.municipality.code === highlighted.value);
  if (shape) return { place: shape.municipality, fill: shape.level ? mapLevelFill[shape.level] : 'var(--color-nevoa-200)' };
  const sector =
    zones.value.find((zone) => zone.sector.code === highlightedSector.value)?.sector ??
    wholeSectors.value.find((item) => item.sector.code === highlightedSector.value)?.sector;
  return sector ? { place: sector, fill: 'var(--color-agua-200)' } : undefined;
});

/** The marker under the pointer: its line in the caption takes the marker's colour. */
const hoveredMarker = ref<MapMarkerKind | null>(null);

/** On the map, a name longer than 16 characters gives way to its short one ("São João de Meriti" → "S.J. Meriti"). */
const mapName = (municipality: MapMunicipality) =>
  municipality.name.length > 16 && municipality.shortName ? municipality.shortName : municipality.name;

const nameOf = (municipality: MapMunicipality) =>
  formatMessage(intl, defaultMessages.municipality, { name: municipality.name, count: municipality.entries });
const sectorNameOf = (sector: MapSector) =>
  formatMessage(intl, defaultMessages.sector, { name: sector.name, count: sector.entries });

function onKey(event: KeyboardEvent, select: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    select();
  }
}

const legendStudies = computed(() => {
  const max = maxStudies.value;
  if (max <= 0) return [];
  return max === 1 ? [1] : [1, max];
});
</script>

<template>
  <figure :class="styles.root" data-municipality-map>
    <div :class="styles.frame">
      <svg
        :class="styles.map"
        :viewBox="`0 0 ${projection.width} ${projection.height}`"
        role="group"
        :aria-label="formatMessage(intl, defaultMessages.label)"
      >
        <rect :class="styles.water" :width="projection.width" :height="projection.height" />

        <!-- Bay sectors: zones in the water, behind the land that hides their overshoot. -->
        <g
          v-for="zone in zones"
          :key="zone.sector.code"
          :class="[styles.zone, zone.sector.code === highlightedSector && styles.zoneHighlighted]"
          role="button"
          tabindex="0"
          :aria-label="sectorNameOf(zone.sector)"
          :data-sector="zone.sector.code"
          @click="emit('selectSector', zone.sector)"
          @keydown="onKey($event, () => emit('selectSector', zone.sector))"
          @mouseenter="highlightedSector = zone.sector.code"
          @mouseleave="highlightedSector = null"
          @focus="highlightedSector = zone.sector.code"
          @blur="highlightedSector = null"
        >
          <path :class="styles.zoneShape" :d="zone.d" fill-rule="evenodd" />
        </g>

        <path
          v-for="shape in context"
          :key="shape.municipality.code"
          :class="styles.context"
          :d="shape.d"
          fill-rule="evenodd"
          aria-hidden="true"
        />
        <g
          v-for="shape in ordered"
          :key="shape.municipality.code"
          :class="[styles.municipality, shape.municipality.code === highlighted && styles.highlighted]"
          :style="{ '--map-fill': shape.level ? mapLevelFill[shape.level] : 'var(--color-nevoa-200)' }"
          role="button"
          tabindex="0"
          :aria-label="nameOf(shape.municipality)"
          :data-municipality="shape.municipality.code"
          @click="emit('select', shape.municipality)"
          @keydown="onKey($event, () => emit('select', shape.municipality))"
          @mouseenter="highlighted = shape.municipality.code"
          @mouseleave="highlighted = null"
          @focus="highlighted = shape.municipality.code"
          @blur="highlighted = null"
        >
          <path :class="styles.shape" :d="shape.d" fill-rule="evenodd" />
          <g :transform="`translate(${shape.anchor[0]} ${shape.anchor[1]})`" aria-hidden="true">
            <g :class="styles.cluster">
              <g
                v-for="marker in shape.markers"
                :key="marker.kind"
                :class="[styles.marker, marker.kind === 'project' ? styles.markerProject : styles.markerStudy]"
                :data-marker="marker.kind"
                @click.stop="emit('select', shape.municipality, marker.kind)"
                @mouseenter="hoveredMarker = marker.kind"
                @mouseleave="hoveredMarker = null"
              >
                <circle :cx="marker.x" :r="marker.r" />
                <text :x="marker.x" text-anchor="middle" dominant-baseline="central">{{ intl.formatNumber(marker.count) }}</text>
              </g>
            </g>
          </g>
        </g>

        <!-- Municipality names (v0.9.30), over every shape; the pointer passes through to the shape below. -->
        <g :class="styles.municipalityNames" aria-hidden="true">
          <text
            v-for="shape in active"
            :key="`name-${shape.municipality.code}`"
            :class="[styles.municipalityName, shape.municipality.code === highlighted && styles.municipalityNameActive]"
            :x="shape.anchor[0] + shape.name.x"
            :y="shape.anchor[1] + shape.name.y"
            text-anchor="middle"
            :data-municipality-name="shape.municipality.code"
          >
            {{ mapName(shape.municipality) }}
          </text>
        </g>

        <!-- Sector names and markers, over the land so a narrow zone stays readable. -->
        <g
          v-for="zone in zones"
          :key="`label-${zone.sector.code}`"
          :class="styles.sectorLabel"
          :transform="`translate(${zone.anchor[0]} ${zone.anchor[1]})`"
          aria-hidden="true"
          :data-sector-label="zone.sector.code"
          @click="emit('selectSector', zone.sector)"
          @mouseenter="highlightedSector = zone.sector.code"
          @mouseleave="highlightedSector = null"
        >
          <g :class="styles.cluster">
            <text :class="styles.sectorName" :y="zone.nameY" text-anchor="middle">{{ zone.sector.name }}</text>
            <g
              v-for="marker in zone.markers"
              :key="marker.kind"
              :class="[styles.marker, marker.kind === 'project' ? styles.markerProject : styles.markerStudy]"
              :data-marker="marker.kind"
              @click.stop="emit('selectSector', zone.sector, marker.kind)"
              @mouseenter="hoveredMarker = marker.kind"
              @mouseleave="hoveredMarker = null"
            >
              <circle :cx="marker.x" :r="marker.r" />
              <text :x="marker.x" text-anchor="middle" dominant-baseline="central">{{ intl.formatNumber(marker.count) }}</text>
            </g>
          </g>
        </g>
      </svg>

      <!-- The whole bay is no one area: a pill over the sea, with its markers. -->
      <div v-if="wholeSectors.length" :class="styles.wholeBay">
        <button
          v-for="item in wholeSectors"
          :key="item.sector.code"
          type="button"
          :class="[styles.wholeBayButton, item.sector.code === highlightedSector && styles.wholeBayHighlighted]"
          :aria-label="sectorNameOf(item.sector)"
          :data-sector="item.sector.code"
          @click="emit('selectSector', item.sector)"
          @mouseenter="highlightedSector = item.sector.code"
          @mouseleave="highlightedSector = null"
          @focus="highlightedSector = item.sector.code"
          @blur="highlightedSector = null"
        >
          <span :class="styles.wholeBayName">{{ item.sector.name }}</span>
          <span
            v-for="marker in item.markers"
            :key="marker.kind"
            :class="[styles.pillMarker, marker.kind === 'project' ? styles.pillProject : styles.pillStudy]"
            :data-marker="marker.kind"
            aria-hidden="true"
            @click.stop="emit('selectSector', item.sector, marker.kind)"
            @mouseenter="hoveredMarker = marker.kind"
            @mouseleave="hoveredMarker = null"
          >
            {{ intl.formatNumber(marker.count) }}
          </span>
        </button>
      </div>

    </div>

    <!--
      The caption (v0.9.13): outside the frame so it can sit across the map's
      left edge (--map-caption-left, set by the Page where there is room).
    -->
    <p
      :class="[styles.caption, current && styles.captionPlace]"
      :style="current ? { '--caption-fill': current.fill } : undefined"
      aria-hidden="true"
      data-map-caption
    >
      <template v-if="current">
        <strong :class="styles.captionName">{{ current.place.name }}</strong>
        <span
          :class="[styles.captionKind, styles.captionProject, hoveredMarker === 'project' && styles.captionKindActive]"
          data-caption-kind="project"
        >
          <strong :class="styles.captionCount">{{ intl.formatNumber(current.place.projects) }}</strong>
          <FormattedMessage v-bind="mapMessages.projectsLabel" :values="{ count: current.place.projects }" />
        </span>
        <span
          :class="[styles.captionKind, styles.captionStudy, hoveredMarker === 'study' && styles.captionKindActive]"
          data-caption-kind="study"
        >
          <strong :class="styles.captionCount">{{ intl.formatNumber(current.place.studies) }}</strong>
          <FormattedMessage v-bind="mapMessages.studiesLabel" :values="{ count: current.place.studies }" />
        </span>
      </template>
      <span v-else :class="styles.hint"><FormattedMessage v-bind="defaultMessages.hint" /></span>
    </p>

    <figcaption :class="styles.legend">
      <span :class="styles.legendGroup">
        <span :class="styles.legendTitle"><FormattedMessage v-bind="defaultMessages.legendEntries" /></span>
        <ul :class="styles.legendList">
          <li v-for="bin in bins" :key="bin.level" :data-level="bin.level">
            <span :class="styles.swatch" :style="{ '--map-fill': mapLevelFill[bin.level] }" />
            <FormattedMessage
              v-bind="bin.from === bin.to ? defaultMessages.legendSingle : defaultMessages.legendRange"
              :values="{ from: bin.from, to: bin.to }"
            />
          </li>
        </ul>
      </span>
      <span :class="styles.legendGroup">
        <span :class="styles.legendTitle"><FormattedMessage v-bind="defaultMessages.legendProjects" /></span>
        <ul :class="styles.legendList">
          <li data-legend-projects>
            <svg :class="styles.legendBadge" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" /></svg>
          </li>
        </ul>
      </span>
      <span v-if="legendStudies.length" :class="styles.legendGroup">
        <span :class="styles.legendTitle"><FormattedMessage v-bind="defaultMessages.legendStudies" /></span>
        <ul :class="styles.legendList">
          <li v-for="count in legendStudies" :key="count" data-legend-studies>
            <svg :class="styles.legendCircle" :width="studyRadius(count, legendStudies.at(-1)!, 5, 9) * 2 + 2" height="20" aria-hidden="true">
              <circle
                :cx="studyRadius(count, legendStudies.at(-1)!, 5, 9) + 1"
                cy="10"
                :r="studyRadius(count, legendStudies.at(-1)!, 5, 9)"
              />
            </svg>
            {{ intl.formatNumber(count) }}
          </li>
        </ul>
      </span>
      <ul :class="styles.legendList">
        <li><span :class="[styles.swatch, styles.swatchNone]" /><FormattedMessage v-bind="defaultMessages.legendNone" /></li>
        <li><span :class="[styles.swatch, styles.swatchWater]" /><FormattedMessage v-bind="defaultMessages.legendWater" /></li>
        <li v-if="zones.length">
          <span :class="[styles.swatch, styles.swatchSector]" /><FormattedMessage v-bind="defaultMessages.legendSectors" />
        </li>
      </ul>
      <slot name="source" />
    </figcaption>
  </figure>
</template>
