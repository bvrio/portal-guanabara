<script lang="ts">
import type { FlagCountry } from '../../foundations/Flag';
import type { IconName } from '../../foundations/Icon';
import type { MessageDescriptor } from '../../foundations/i18n/types';

/** A language of the site, named in itself (e.g. "Español", short "ES"), with its flag. */
export interface SiteLocaleOption {
  value: string;
  label: string;
  short: string;
  /** Drawn beside the name in Opções and in the phone menu (v0.9.17). */
  flag?: FlagCountry;
}

/** The signed-in visitor, shown as an avatar with their initials. */
export interface SiteAccount {
  name: string;
  /** First letters of the first and second names, e.g. "MS". */
  initials: string;
  href: string;
}

export interface SiteNavItem {
  id: string;
  href: string;
  label: MessageDescriptor;
  icon?: IconName;
}

/** How much of the bar fits (v0.9.17): everything, words dropped, or the phone bar. */
export type SiteHeaderFit = 'full' | 'icons' | 'compact';

/**
 * The site's top bar in the deep structure colour, in ONE row (v0.9.17): the
 * colour mark and the name at the far left, the tabs in the middle, then
 * **Opções** — language (with flags) and view size in one panel — and the
 * account at the far right: an avatar with the visitor's initials (`account`)
 * or “Entrar” (`signInHref`). The `tools` slot can add other App controls.
 *
 * The bar measures itself and sheds in two steps: first the name beside the
 * mark and the words of Opções and Entrar go (icons stay); when even that does
 * not fit — a narrow window, 120%, a long language — it turns into the phone
 * bar: mark, account and a menu button that opens a panel with the tabs,
 * language and view size. `data-fit` on the bar says which step is showing.
 *
 * `data-site-nav`, `data-site-options` and `data-nav="<id>"` are stable hooks
 * (e.g. for a guided tour).
 */
export interface SiteHeaderProps {
  homeHref: string;
  items: readonly SiteNavItem[];
  currentId?: string;
  /** View sizes offered in Opções, in percent (e.g. 100, 110, 120). */
  zoomLevels?: readonly number[];
  /** Languages offered in Opções and in the phone menu. */
  locales?: readonly SiteLocaleOption[];
  /** Signed-in visitor; null or omitted shows “Entrar” when `signInHref` is set. */
  account?: SiteAccount | null;
  signInHref?: string;
  /**
   * How much the mark and the name show, from 0 (hidden, place kept) to 1
   * (default), where a PageHero shows its aside (from 880px). Início follows its
   * own hero's mark and name: as they scroll under the bar, these fade in
   * (v0.9.17; gradual since v0.9.20).
   */
  brandReveal?: number;
}
</script>

<script setup lang="ts">
import { useIntl } from 'vue-intl';

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import Drawer from '../../components/Drawer/Drawer.vue';
import Link from '../../components/Link/Link.vue';
import Popover from '../../components/Popover/Popover.vue';
import BrandMark from '../../foundations/BrandMark/BrandMark.vue';
import Flag from '../../foundations/Flag/Flag.vue';
import Icon from '../../foundations/Icon/Icon.vue';
import FormattedMessage from '../../foundations/i18n/FormattedMessage.vue';
import { formatMessage } from '../../foundations/i18n/formatMessage';

import { defaultMessages } from './SiteHeader.messages';
import styles from './SiteHeader.module.scss';

const { homeHref, items, currentId, zoomLevels, locales, account, signInHref, brandReveal = 1 } = defineProps<SiteHeaderProps>();

const reveal = computed(() => Math.min(Math.max(brandReveal, 0), 1));

const zoom = defineModel<number>('zoom', { default: 100 });
const locale = defineModel<string>('locale', { default: 'pt-BR' });

const intl = useIntl();
const zoomOptions = computed(() =>
  (zoomLevels ?? []).map((level) => ({ level, label: formatMessage(intl, defaultMessages.zoomLevel, { level }) })),
);
const currentLocale = computed(() => locales?.find((option) => option.value === locale.value));
const hasOptions = computed(() => Boolean(locales?.length) || zoomOptions.value.length > 0);

// ------------------------------------------------------------- Opções
const optionsOpen = ref(false);
const optionsButton = ref<HTMLElement | null>(null);

function chooseLocale(value: string) {
  optionsOpen.value = false;
  menuOpen.value = false;
  locale.value = value;
}

function chooseZoom(level: number) {
  optionsOpen.value = false;
  zoom.value = level;
}

// ----------------------------------------------------------- phone menu
const menuOpen = ref(false);
/** The language row opens in place to show the four languages (v0.8). */
const languagesOpen = ref(false);
const closeMenu = () => {
  menuOpen.value = false;
};
watch(menuOpen, (open) => {
  if (!open) languagesOpen.value = false;
});

// -------------------------------------------------------------- fitting
// The bar tries each step in order and keeps the first that fits. Before it
// has measured (server render, first paint) CSS container queries pick a step.
const FITS: readonly SiteHeaderFit[] = ['full', 'icons', 'compact'];
const root = ref<HTMLElement | null>(null);
const inner = ref<HTMLElement | null>(null);
const fit = ref<SiteHeaderFit | null>(null);

function fitsNow(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  const available = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const gap = parseFloat(style.columnGap) || 0;
  const brand = el.querySelector<HTMLElement>('[data-site-brand]')?.offsetWidth ?? 0;
  const tabs = el.querySelector<HTMLElement>('[data-site-nav] ul')?.scrollWidth ?? 0;
  const actions = el.querySelector<HTMLElement>('[data-site-actions]')?.offsetWidth ?? 0;
  return brand + tabs + actions + gap * 2 <= available;
}

function measure() {
  const el = inner.value;
  if (!el) return;
  for (const step of FITS) {
    el.dataset.fit = step;
    if (step === 'compact' || fitsNow(el)) {
      fit.value = step;
      return;
    }
  }
}

let observer: ResizeObserver | undefined;
let frame = 0;
const scheduleMeasure = () => {
  if (typeof window === 'undefined') return;
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(measure);
};

onMounted(() => {
  measure();
  if (typeof ResizeObserver !== 'undefined' && root.value) {
    observer = new ResizeObserver(scheduleMeasure);
    observer.observe(root.value);
  }
  document.fonts?.ready.then(scheduleMeasure).catch(() => undefined);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  if (typeof window !== 'undefined') cancelAnimationFrame(frame);
});

watch(
  () => [account, signInHref, items.length, locales?.length, zoomOptions.value.length],
  () => nextTick(scheduleMeasure),
);
// A panel belongs to one bar: leaving the phone bar closes its menu, entering it closes Opções.
watch(fit, (step, previous) => {
  if (step === 'compact') optionsOpen.value = false;
  else if (previous === 'compact') menuOpen.value = false;
});
</script>

<template>
  <header ref="root" :class="styles.root">
    <div
      ref="inner"
      :class="[styles.inner, reveal === 0 && styles.brandHidden]"
      :style="reveal < 1 ? { '--site-brand-reveal': reveal } : undefined"
      :data-fit="fit ?? undefined"
    >
      <Link
        :href="homeHref"
        :class="styles.brand"
        :aria-label="formatMessage(intl, defaultMessages.brand)"
        :data-hidden="reveal === 0 || undefined"
        data-site-brand
      >
        <BrandMark :size="40" :class="styles.mark" />
        <span :class="styles.name" aria-hidden="true"><FormattedMessage v-bind="defaultMessages.brand" /></span>
      </Link>

      <nav :class="styles.nav" :aria-label="formatMessage(intl, defaultMessages.navigation)" data-site-nav>
        <ul :class="styles.list">
          <li v-for="item in items" :key="item.id">
            <Link
              :href="item.href"
              :class="[styles.item, item.id === currentId && styles.current]"
              :aria-current="item.id === currentId ? 'page' : undefined"
              :data-nav="item.id"
            >
              <Icon v-if="item.icon" :name="item.icon" size="sm" :class="styles.itemIcon" />
              <FormattedMessage v-bind="item.label" />
            </Link>
          </li>
        </ul>
      </nav>

      <div :class="styles.actions" data-site-actions>
        <div v-if="$slots.tools" :class="styles.tools" data-site-tools><slot name="tools" /></div>

        <button
          v-if="hasOptions"
          ref="optionsButton"
          type="button"
          :class="[styles.optionsButton, optionsOpen && styles.optionsButtonOpen]"
          :aria-label="formatMessage(intl, defaultMessages.options)"
          aria-haspopup="dialog"
          :aria-expanded="optionsOpen"
          data-site-options
          @click="optionsOpen = !optionsOpen"
        >
          <Icon name="sliders" size="sm" />
          <span :class="styles.optionsLabel" aria-hidden="true"><FormattedMessage v-bind="defaultMessages.options" /></span>
          <Icon name="chevron-down" size="xs" :class="styles.optionsChevron" />
        </button>

        <Link
          v-if="account"
          :href="account.href"
          :class="[styles.account, styles.avatar]"
          :aria-label="formatMessage(intl, defaultMessages.accountOf, { name: account.name })"
          :title="account.name"
          data-site-account="signed-in"
        >
          <span aria-hidden="true">{{ account.initials }}</span>
        </Link>
        <Link
          v-else-if="signInHref"
          :href="signInHref"
          :class="[styles.account, styles.signIn]"
          :aria-label="formatMessage(intl, defaultMessages.signIn)"
          data-site-account="signed-out"
        >
          <Icon name="user" size="sm" />
          <span :class="styles.signInLabel" aria-hidden="true"><FormattedMessage v-bind="defaultMessages.signIn" /></span>
        </Link>

        <button
          type="button"
          :class="styles.menuButton"
          :aria-label="formatMessage(intl, defaultMessages.openMenu)"
          :aria-expanded="menuOpen"
          data-site-menu-button
          @click="menuOpen = true"
        >
          <Icon name="menu" size="md" />
        </button>
      </div>
    </div>

    <!-- Opções (v0.9.17): language and view size, every choice in sight. -->
    <Popover
      v-model:open="optionsOpen"
      :anchor="optionsButton"
      align="end"
      width="15rem"
      :label="formatMessage(intl, defaultMessages.options)"
    >
      <div :class="styles.options" data-site-options-panel>
        <section v-if="locales?.length" :class="styles.optionsSection" aria-labelledby="site-options-language">
          <h3 id="site-options-language" :class="styles.optionsHeading">
            <Icon name="translate" size="sm" /><FormattedMessage v-bind="defaultMessages.language" />
          </h3>
          <ul :class="styles.optionsList">
            <li v-for="option in locales" :key="option.value">
              <button
                type="button"
                :class="[styles.optionsChoice, option.value === locale && styles.optionsChoiceCurrent]"
                :aria-pressed="option.value === locale"
                :lang="option.value"
                :data-locale="option.value"
                @click="chooseLocale(option.value)"
              >
                <Flag v-if="option.flag" :country="option.flag" :size="20" />
                <span :class="styles.optionsChoiceLabel">{{ option.label }}</span>
                <Icon v-if="option.value === locale" name="check" size="sm" />
              </button>
            </li>
          </ul>
        </section>

        <section v-if="zoomOptions.length" :class="styles.optionsSection" aria-labelledby="site-options-zoom">
          <h3 id="site-options-zoom" :class="styles.optionsHeading">
            <Icon name="zoom-in" size="sm" /><FormattedMessage v-bind="defaultMessages.zoom" />
          </h3>
          <div :class="styles.optionsZooms" role="group" aria-labelledby="site-options-zoom">
            <button
              v-for="option in zoomOptions"
              :key="option.level"
              type="button"
              :class="[styles.optionsChoice, styles.optionsZoom, option.level === zoom && styles.optionsChoiceCurrent]"
              :aria-pressed="option.level === zoom"
              :data-zoom="option.level"
              @click="chooseZoom(option.level)"
            >
              {{ option.label }}
            </button>
          </div>
        </section>
      </div>
    </Popover>

    <Drawer v-model:open="menuOpen" width="22rem" plain>
      <template #title><FormattedMessage v-bind="defaultMessages.menu" /></template>
      <div :class="styles.menu" data-site-menu>
        <nav :aria-label="formatMessage(intl, defaultMessages.navigation)">
          <ul :class="styles.menuList">
            <li v-for="item in items" :key="item.id">
              <Link
                :href="item.href"
                :class="[styles.menuItem, item.id === currentId && styles.menuCurrent]"
                :aria-current="item.id === currentId ? 'page' : undefined"
                @click="closeMenu"
              >
                <Icon v-if="item.icon" :name="item.icon" size="md" />
                <FormattedMessage v-bind="item.label" />
              </Link>
            </li>
            <li v-if="locales?.length">
              <button
                type="button"
                :class="[styles.menuItem, styles.menuDisclosure]"
                :aria-expanded="languagesOpen"
                aria-controls="site-menu-languages"
                data-site-menu-language
                @click="languagesOpen = !languagesOpen"
              >
                <Icon name="translate" size="md" />
                <span :class="styles.menuItemText">
                  <FormattedMessage v-bind="defaultMessages.language" />
                  <span :class="styles.menuItemDetail" :lang="locale">{{ currentLocale?.label }}</span>
                </span>
                <Icon name="chevron-down" size="sm" :class="[styles.menuChevron, languagesOpen && styles.menuChevronOpen]" />
              </button>
              <ul v-if="languagesOpen" id="site-menu-languages" :class="styles.menuOptions">
                <li v-for="option in locales" :key="option.value">
                  <button
                    type="button"
                    :class="[styles.menuOption, option.value === locale && styles.menuOptionCurrent]"
                    :aria-pressed="option.value === locale"
                    :lang="option.value"
                    @click="chooseLocale(option.value)"
                  >
                    <Flag v-if="option.flag" :country="option.flag" :size="22" />
                    <span :class="styles.menuOptionLabel">{{ option.label }}</span>
                    <Icon v-if="option.value === locale" name="check" size="sm" />
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        <section v-if="zoomOptions.length" :class="[styles.menuSection, styles.menuZoom]" aria-labelledby="site-menu-zoom">
          <h3 id="site-menu-zoom" :class="styles.menuHeading">
            <Icon name="zoom-in" size="sm" /><FormattedMessage v-bind="defaultMessages.zoom" />
          </h3>
          <div :class="styles.menuZooms" role="group" aria-labelledby="site-menu-zoom">
            <button
              v-for="option in zoomOptions"
              :key="option.level"
              type="button"
              :class="[styles.menuOption, option.level === zoom && styles.menuOptionCurrent]"
              :aria-pressed="option.level === zoom"
              @click="zoom = option.level"
            >
              {{ option.label }}
            </button>
          </div>
        </section>
      </div>
    </Drawer>
  </header>
</template>
