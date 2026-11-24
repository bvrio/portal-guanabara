<script lang="ts">
/**
 * A mechanism of action (limpeza, contenção, transacional…) as a small round
 * slot next to its name, in the initiatives' orange, since only initiatives have
 * mechanisms (v0.9). Since v0.9.18 every mechanism has its glyph
 * (`catalogMechanismIcons`); a code without one shows its monogram — the same
 * fallback the Instituições Journey uses for logos. Decorative: the name is
 * always written next to it.
 */
export interface CatalogMechanismIconProps {
  /** Mechanism code, e.g. `limpeza`. */
  code: string;
  /** Its label, for the monogram. */
  name: string;
  /** Side in px. */
  size?: number;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import Emblem from '../../../Shared/components/Emblem/Emblem.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';

import { catalogMechanismIcons } from './catalogMechanismIcons';
import styles from './CatalogMechanismIcon.module.scss';

const { code, name, size = 28 } = defineProps<CatalogMechanismIconProps>();

const glyph = computed(() => catalogMechanismIcons[code]);
</script>

<template>
  <span
    v-if="glyph"
    :class="styles.tile"
    :style="{ width: `${size}px`, height: `${size}px` }"
    aria-hidden="true"
    data-mechanism-icon="glyph"
  >
    <Icon :name="glyph" :size="size >= 36 ? 'md' : size >= 26 ? 'sm' : 'xs'" />
  </span>
  <Emblem v-else :name="name" :size="size" :class="styles.slot" data-mechanism-icon="slot" />
</template>
