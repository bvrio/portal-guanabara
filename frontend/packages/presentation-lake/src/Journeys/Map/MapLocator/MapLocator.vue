<script lang="ts">
import type { MapBounds, MapMunicipality, MapSector } from '../types';

/**
 * A small, static map that says where one thing is (v0.9): the given
 * municipalities filled in the map's place green (v0.9.14; the kind's colour
 * on request), the given bay sectors tinted in the water, everything else as
 * quiet context. A picture with a text name —
 * the places are also written next to it on the page.
 */
export interface MapLocatorProps {
  bounds: MapBounds;
  /** Every municipality of the map, for context. */
  municipalities: readonly MapMunicipality[];
  /** Bay sectors with zones (others are ignored). */
  sectors?: readonly MapSector[];
  /** Municipality codes to fill. */
  highlighted: readonly string[];
  /** Sector codes to tint. */
  highlightedSectors?: readonly string[];
  /**
   * Colour of the highlighted municipalities: `place` (default, v0.9.14) is the
   * Mapa's green, so the mini map reads like the big one; `project` / `study`
   * paint them in a kind's colour.
   */
  tone?: 'place' | 'project' | 'study';
  /** Accessible name, e.g. "Mapa: Rio de Janeiro; setor Interior". */
  label: string;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import { createProjection, geometryPath } from '../projection';

import styles from './MapLocator.module.scss';

const { bounds, municipalities, sectors = [], highlighted, highlightedSectors = [], tone = 'place', label } =
  defineProps<MapLocatorProps>();

const projection = computed(() => createProjection(bounds, 600));
const zones = computed(() =>
  sectors
    .filter((sector) => sector.geometry && highlightedSectors.includes(sector.code))
    .map((sector) => ({ code: sector.code, d: geometryPath(sector.geometry!, projection.value) })),
);
const shapes = computed(() =>
  municipalities.map((municipality) => ({
    code: municipality.code,
    d: geometryPath(municipality.geometry, projection.value),
    on: highlighted.includes(municipality.code),
  })),
);
</script>

<template>
  <svg
    :class="[styles.root, styles[tone]]"
    :viewBox="`0 0 ${projection.width} ${projection.height}`"
    role="img"
    :aria-label="label"
    data-map-locator
  >
    <rect :class="styles.water" :width="projection.width" :height="projection.height" />
    <path v-for="zone in zones" :key="zone.code" :class="styles.zone" :d="zone.d" :data-sector="zone.code" />
    <path
      v-for="shape in shapes"
      :key="shape.code"
      :class="shape.on ? styles.on : styles.land"
      :d="shape.d"
      fill-rule="evenodd"
      :data-municipality="shape.on ? shape.code : undefined"
    />
  </svg>
</template>
