<script lang="ts">
/** Countries with a drawn flag (v0.9.17): one per language of the site. */
export type FlagCountry = 'br' | 'gb' | 'es' | 'fr';

/**
 * A small, simplified national flag drawn on a 20×14 grid (Brazil, United
 * Kingdom, Spain, France) — drawn here, never copied from a file. Decorative:
 * it always sits next to the language's name, so it is hidden from assistive tech.
 * Flags keep their own colours in every theme.
 */
export interface FlagProps {
  country: FlagCountry;
  /** Rendered width in px; the height follows (20:14). */
  size?: number;
}
</script>

<script setup lang="ts">
import styles from './Flag.module.scss';

const { country, size = 20 } = defineProps<FlagProps>();

const clip = `flag-clip-${country}`;
</script>

<template>
  <svg
    :class="styles.root"
    :width="size"
    :height="(size * 14) / 20"
    viewBox="0 0 20 14"
    focusable="false"
    aria-hidden="true"
    :data-flag="country"
  >
    <defs>
      <clipPath :id="clip"><rect width="20" height="14" rx="2" /></clipPath>
    </defs>
    <g :clip-path="`url(#${clip})`">
      <template v-if="country === 'br'">
        <rect width="20" height="14" fill="#009c3b" />
        <path d="M10 1.6L18.2 7L10 12.4L1.8 7Z" fill="#ffdf00" />
        <circle cx="10" cy="7" r="3.3" fill="#002776" />
        <path d="M6.85 6.2C8.9 5.75 11.4 6.05 13.15 7.25" fill="none" stroke="#ffffff" stroke-width="0.7" />
      </template>
      <template v-else-if="country === 'gb'">
        <rect width="20" height="14" fill="#012169" />
        <path d="M0 0L20 14M20 0L0 14" stroke="#ffffff" stroke-width="2.8" />
        <path d="M0 0L20 14M20 0L0 14" stroke="#c8102e" stroke-width="1" />
        <path d="M10 0V14M0 7H20" stroke="#ffffff" stroke-width="4.2" />
        <path d="M10 0V14M0 7H20" stroke="#c8102e" stroke-width="2.4" />
      </template>
      <template v-else-if="country === 'es'">
        <rect width="20" height="14" fill="#aa151b" />
        <rect y="3.5" width="20" height="7" fill="#f1bf00" />
      </template>
      <template v-else>
        <rect width="20" height="14" fill="#ffffff" />
        <rect width="6.67" height="14" fill="#002654" />
        <rect x="13.33" width="6.67" height="14" fill="#ce1126" />
      </template>
    </g>
    <rect :class="styles.edge" x="0.25" y="0.25" width="19.5" height="13.5" rx="1.85" />
  </svg>
</template>
