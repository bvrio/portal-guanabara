<script lang="ts">
export type PageHeroSize = 'lg' | 'md' | 'sm';

/**
 * The page's opening band in the structure colour (the "30%" of 60/30/10):
 * eyebrow, title, description and actions, with an optional aside (an
 * illustration) and a bottom slot (e.g. a search field).
 *
 * With `overlap`, the band leaves room at the bottom so the first block of the
 * page can rise over it (pair with `PageHero`'s `--page-hero-overlap`).
 */
export interface PageHeroProps {
  size?: PageHeroSize;
  overlap?: boolean;
  /** Heading level of the title; pages have exactly one h1. */
  titleLevel?: 1 | 2;
  /**
   * Keep the title for assistive tech only — when the header already names
   * the page (e.g. the "Catálogo" tab) and the band shows just the explanation.
   */
  titleHidden?: boolean;
  /**
   * Where the aside sits in its column: `center` (default) or `end` — flush
   * with the content's right edge, under the header's Buscar (Início, v0.9.2).
   */
  asideAlign?: 'center' | 'end';
  /** Which side the aside takes: `end` (right, default) or `start` — left of the text (Início, v0.9.4). */
  asideSide?: 'start' | 'end';
  /** `measure` (default): about 62 characters a line. `full` (v0.9.12): the description takes the content's full width (Sobre nós). */
  descriptionWidth?: 'measure' | 'full';
  /** `measure` (default): about 24 characters a line. `full` (v0.9.17): the title takes its column's width (Início, whose title sets its own lines). */
  titleWidth?: 'measure' | 'full';
}
</script>

<script setup lang="ts">
import styles from './PageHero.module.scss';

const {
  size = 'md',
  overlap = false,
  titleLevel = 1,
  titleHidden = false,
  asideAlign = 'center',
  asideSide = 'end',
  descriptionWidth = 'measure',
  titleWidth = 'measure',
} = defineProps<PageHeroProps>();
</script>

<template>
  <section :class="[styles.root, styles[size], overlap && styles.overlap]">
    <div :class="[styles.inner, $slots.aside && styles.withAside, $slots.aside && asideSide === 'start' && styles.asideStart]">
      <div :class="styles.body">
        <div v-if="$slots.breadcrumb" :class="styles.breadcrumb"><slot name="breadcrumb" /></div>
        <p v-if="$slots.eyebrow" :class="styles.eyebrow"><slot name="eyebrow" /></p>
        <component
          :is="`h${titleLevel}`"
          :class="titleHidden ? styles.visuallyHidden : [styles.title, titleWidth === 'full' && styles.titleFull]"
        >
          <slot name="title" />
        </component>
        <p v-if="$slots.description" :class="[styles.description, descriptionWidth === 'full' && styles.descriptionFull]">
          <slot name="description" />
        </p>
        <div v-if="$slots.actions" :class="styles.actions"><slot name="actions" /></div>
        <div v-if="$slots.default" :class="styles.extra"><slot /></div>
      </div>
      <div v-if="$slots.aside" :class="[styles.aside, asideAlign === 'end' && styles.asideEnd]" aria-hidden="true"><slot name="aside" /></div>
    </div>
  </section>
</template>
