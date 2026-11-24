<script lang="ts">
import type { IconName } from '../../foundations/Icon/glyphs';
import type { MessageDescriptor } from '../../foundations/i18n/types';

export interface GuidedTourStep {
  id: string;
  /**
   * CSS selector of the element to highlight. A comma-separated list gives
   * fallbacks, in order: the first selector with a shown match wins (e.g. a
   * header tab, else a card on the page). Steps whose target is missing or
   * hidden are skipped.
   */
  target: string;
  /** Icon of the step, shown next to its title. */
  icon?: IconName;
  /** A few words. */
  title: MessageDescriptor;
  /** One short sentence — about as long as the title (a passing step may go without). */
  body?: MessageDescriptor;
  /**
   * The target appears only when the step is reached: whoever listens to
   * `step` brings it in (opens the drawer, or goes to another page). Kept when
   * the tour starts although it is missing.
   */
  appears?: boolean;
  /**
   * A passing step (v0.9.32): a small balloon with no buttons and a countdown,
   * not counted in "Passo x de y", that moves on by itself after `auto`
   * milliseconds — e.g. "Vamos voltar para o Início" between two pages. With
   * no target shown it sits in the middle of the screen.
   */
  auto?: number;
  /** On a passing step, a pointer travels to the target and taps it, as if the visitor clicked it. */
  pointer?: boolean;
}

/**
 * Guided tour (Shared since v0.9.31; `Journeys/Home/HomeGuidedTour` before —
 * the site's tour now visits the Mapa too): dims the page and spotlights one
 * element at a time, with a compact card that points at it (an arrow toward
 * the spotlight) and says what the visitor can do there — an icon, a few
 * words and one short sentence, both at the same size. The App decides the
 * steps (targets, icons and copy); the tour only knows the DOM. On phones the
 * card sits at the bottom of the screen.
 *
 * A step whose target is not on the page when it is reached (another page
 * still loading, a drawer opening) is waited for, up to five seconds, with
 * the card shown and no spotlight; if it never shows, the tour passes it by.
 *
 * Keyboard: → next, ← previous, Esc skips. Emits `step` on every step shown
 * (before its target is looked up, so the Page can bring it in), `finish`
 * after the last one and `skip` when left early. A target taller than the
 * screen with room on its left (a drawer) gets the card beside it.
 *
 * Passing steps (v0.9.32, `auto`): a balloon that moves on by itself, with a
 * pointer that taps its target — the transitions between pages. The counter
 * and the dots count only the other steps; ← from the next step goes back
 * past them.
 *
 * Ending (v0.9.29): the tour fades out and the page does not move — focus
 * goes back without scrolling, or into a dialog the tour left open (the
 * drawer of its last steps).
 */
export interface GuidedTourProps {
  steps: readonly GuidedTourStep[];
}
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import { useIntl } from 'vue-intl';

import Icon from '../../foundations/Icon/Icon.vue';
import FormattedMessage from '../../foundations/i18n/FormattedMessage.vue';
import { formatMessage } from '../../foundations/i18n/formatMessage';

import { cssZoom } from '../../../Utils/cssZoom';

import { defaultMessages } from './GuidedTour.messages';

import styles from './GuidedTour.module.scss';

const { steps } = defineProps<GuidedTourProps>();

const open = defineModel<boolean>('open', { required: true });

const emit = defineEmits<{
  step: [index: number, id: string];
  /** `steps` = how many were shown (targets missing or hidden on this screen are skipped). */
  finish: [steps: number];
  skip: [index: number, id: string];
}>();

const intl = useIntl();
const titleId = useId();
const bodyId = useId();
const card = ref<HTMLElement | null>(null);
const available = ref<GuidedTourStep[]>([]);
const index = ref(0);
const spot = ref<{ top: number; left: number; width: number; height: number } | null>(null);
const cardStyle = ref<Record<string, string>>({});
/**
 * Where the card sits relative to the spotlight: below or above it (with an
 * arrow), `beside` it on the left when it is taller than the screen and there
 * is room (with an arrow), `inside` its lower edge otherwise, `sheet` at the
 * bottom on phones.
 */
const placement = ref<'below' | 'above' | 'beside' | 'inside' | 'center' | 'sheet'>('below');
/** The pointer of a passing step: from where it starts to the target, in CSS pixels. */
const pointer = ref<{ fromX: number; fromY: number; toX: number; toY: number } | null>(null);
let autoTimer = 0;
const arrowLeft = ref(0);
const arrowTop = ref(0);
/** Each `show` call; a newer one wins over one still waiting for its target. */
let showing = 0;
let frame = 0;
/**
 * After scrolling to a page target the tour watches for a moment (v0.9.31): a
 * page that has just opened may still jump to its top once it finishes, so
 * the target is brought back under the header if the page settles elsewhere.
 */
const SETTLE_MS = 1500;
let settleUntil = 0;
let settleTries = 0;
let lastScrollY = -1;
let stillFrames = 0;
let returnFocus: HTMLElement | null = null;

const current = computed(() => available.value[index.value]);
const isLast = computed(() => index.value === available.value.length - 1);
/** The steps the counter and the dots count: all but the passing ones. */
const counted = computed(() => available.value.filter((step) => !step.auto));
/** Where the visitor is among the counted steps (a passing step counts as the one before it). */
const position = computed(() => {
  for (let at = index.value; at >= 0; at -= 1) {
    const step = available.value[at];
    if (step && !step.auto) return counted.value.indexOf(step);
  }
  return 0;
});

const PAD = 8;
const GAP = 16;
/** Room for the sticky site header above a page target. */
const TOP_OFFSET = 96;
/** How long a step waits for a target that is not on the page yet (another page loading, a drawer opening). */
const APPEAR_TIMEOUT = 5000;

const schedule = (callback: () => void) =>
  typeof requestAnimationFrame === 'function' ? requestAnimationFrame(callback) : window.setTimeout(callback, 16);
const cancel = (id: number) =>
  typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : window.clearTimeout(id);

function targetOf(step: GuidedTourStep | undefined) {
  if (!step) return null;
  let fallback: HTMLElement | null = null;
  // Selectors in the order given (not document order): the first one with a shown match wins.
  for (const selector of step.target.split(',')) {
    const matches = [...document.querySelectorAll<HTMLElement>(selector.trim())];
    const shown = matches.find((element) => isShown(element));
    if (shown) return shown;
    fallback ??= matches[0] ?? null;
  }
  return fallback;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Where focus goes when the tour ends: into a dialog opened during the tour
 * and still open (its first control), else back where it was — never
 * scrolling the page.
 */
function giveFocusBack() {
  const dialog = [...document.querySelectorAll<HTMLElement>('[aria-modal="true"]')].find(
    (element) => !element.closest('[data-guided-tour]') && !(returnFocus && element.contains(returnFocus)),
  );
  const goal = dialog ? (dialog.querySelector<HTMLElement>(FOCUSABLE) ?? dialog) : returnFocus;
  goal?.focus?.({ preventScroll: true });
}

/** A target that is in the page but hidden (e.g. a desktop-only control on a phone) is skipped too. */
function isShown(element: HTMLElement | null) {
  if (!element) return false;
  // checkVisibility() sees `display: none` up the tree; without it, assume shown.
  return typeof element.checkVisibility === 'function' ? element.checkVisibility() : true;
}

/** A target in a fixed layer (a drawer) does not move with the page, so the page is not scrolled for it. */
function inFixedLayer(element: HTMLElement) {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    if (getComputedStyle(node).position === 'fixed') return true;
  }
  return false;
}

/** Resolves with the step's target once it is shown, or null after APPEAR_TIMEOUT. */
function waitForTarget(step: GuidedTourStep) {
  return new Promise<HTMLElement | null>((resolve) => {
    const started = Date.now();
    const poll = () => {
      const target = targetOf(step);
      if (isShown(target)) resolve(target);
      else if (!open.value || Date.now() - started > APPEAR_TIMEOUT) resolve(null);
      else schedule(poll);
    };
    poll();
  });
}

/** Where the page should be for a page target to sit just under the sticky header. */
function scrollTopFor(target: HTMLElement) {
  const top = window.scrollY + target.getBoundingClientRect().top - TOP_OFFSET * cssZoom(target);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return Math.max(Math.min(top, max), 0);
}

/** Room the card needs under a target that fits on screen. */
const CARD_ROOM = 220;

/**
 * A target already in view, under the header and with room for the card below
 * it, needs no scroll (v0.9.33): the page stays put instead of moving for
 * nothing. A target taller than the screen never fits and goes to the top.
 */
function inView(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  return rect.top >= TOP_OFFSET * cssZoom(target) && rect.bottom <= window.innerHeight - CARD_ROOM;
}

/** Brings a page target back once, if the page came to rest elsewhere right after the step (see SETTLE_MS). */
function settle(target: HTMLElement) {
  if (Date.now() > settleUntil || settleTries >= 2) return;
  const y = window.scrollY;
  stillFrames = y === lastScrollY ? stillFrames + 1 : 0;
  lastScrollY = y;
  if (stillFrames < 3 || inView(target)) return;
  const wanted = scrollTopFor(target);
  if (Math.abs(wanted - y) <= 4) return;
  settleTries += 1;
  stillFrames = 0;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo?.({ top: wanted, behavior: reduced ? 'auto' : 'smooth' });
}

/** Follows the target while the page scrolls or resizes. */
function track() {
  const target = targetOf(current.value);
  if (target && card.value && !target.closest('header') && !inFixedLayer(target)) settle(target);
  if (!target && card.value && current.value?.auto) {
    // A passing step with nothing to point at: the balloon in the middle of the screen.
    const cardRect = card.value.getBoundingClientRect();
    const zoom = cssZoom(card.value);
    placement.value = window.innerWidth < 560 ? 'sheet' : 'center';
    cardStyle.value =
      placement.value === 'sheet'
        ? {}
        : {
            top: `${Math.round((window.innerHeight - cardRect.height) / 2 / zoom)}px`,
            left: `${Math.round((window.innerWidth - cardRect.width) / 2 / zoom)}px`,
          };
  }
  if (target && card.value) {
    const rect = target.getBoundingClientRect();
    // Rects are on-screen pixels; under a page zoom, CSS pixels are larger.
    const zoom = cssZoom(target);
    // A target taller than the screen is lit only where it is visible.
    const spotTop = Math.max(rect.top - PAD, 0);
    const spotBottom = Math.min(rect.bottom + PAD, window.innerHeight);
    spot.value = {
      top: spotTop / zoom,
      left: (rect.left - PAD) / zoom,
      width: (rect.width + PAD * 2) / zoom,
      height: Math.max(spotBottom - spotTop, 0) / zoom,
    };

    const cardRect = card.value.getBoundingClientRect();
    const narrow = window.innerWidth < 560;
    if (narrow) {
      placement.value = 'sheet';
      cardStyle.value = {};
    } else {
      const below = rect.bottom + PAD + GAP;
      const fitsBelow = below + cardRect.height < window.innerHeight - GAP;
      const above = rect.top - PAD - GAP - cardRect.height;
      const fitsAbove = above >= GAP;
      const besideLeft = rect.left - PAD - GAP - cardRect.width;
      const fitsBeside = !fitsBelow && !fitsAbove && besideLeft >= GAP;
      if (fitsBeside) {
        // Level with the middle of the lit part, kept inside the viewport.
        const middle = (spotTop + spotBottom) / 2;
        const top = Math.min(Math.max(middle - cardRect.height / 2, GAP), window.innerHeight - cardRect.height - GAP);
        placement.value = 'beside';
        arrowTop.value = Math.min(Math.max(middle - top, 28), cardRect.height - 28) / zoom;
        cardStyle.value = { top: `${Math.round(top / zoom)}px`, left: `${Math.round(besideLeft / zoom)}px` };
      } else {
        const top = fitsBelow ? below : fitsAbove ? above : window.innerHeight - cardRect.height - GAP * 2;
        // Centred on the target, kept inside the viewport.
        const centre = rect.left + rect.width / 2;
        const left = Math.min(Math.max(centre - cardRect.width / 2, GAP), window.innerWidth - cardRect.width - GAP);
        placement.value = fitsBelow ? 'below' : fitsAbove ? 'above' : 'inside';
        arrowLeft.value = Math.min(Math.max(centre - left, 28), cardRect.width - 28) / zoom;
        cardStyle.value = { top: `${Math.round(top / zoom)}px`, left: `${Math.round(left / zoom)}px` };
      }
    }
  }
  frame = schedule(track);
}

async function show(to: number, direction: 1 | -1 = 1) {
  const run = ++showing;
  clearAuto();
  index.value = to;
  const step = current.value;
  if (!step) return;
  emit('step', to, step.id);
  let target = targetOf(step);
  if (step.auto) {
    // A passing step does not wait: without its target it sits in the middle.
    if (!isShown(target)) {
      spot.value = null;
      target = null;
    }
    startAuto(step, target, run);
  } else if (!isShown(target)) {
    // Brought in on `step` (a drawer, another page): no spotlight until it shows.
    spot.value = null;
    target = await waitForTarget(step);
    if (run !== showing || !open.value) return;
    if (!target) {
      const following = to + direction;
      if (following >= available.value.length) close('finish');
      else if (following < 0) close('skip');
      else await show(following, direction);
      return;
    }
  }
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (target && !target.closest('header') && !inFixedLayer(target)) {
    // Page targets sit just below the sticky site header, so the card fits under them (unless already in view).
    if (!inView(target)) window.scrollTo?.({ top: scrollTopFor(target), behavior: reduced ? 'auto' : 'smooth' });
    settleUntil = Date.now() + SETTLE_MS;
    settleTries = 0;
    stillFrames = 0;
    lastScrollY = -1;
  } else {
    settleUntil = 0;
  }
  await nextTick();
  card.value?.focus();
}

function stop() {
  cancel(frame);
  frame = 0;
  spot.value = null;
}

function clearAuto() {
  if (autoTimer) window.clearTimeout(autoTimer);
  autoTimer = 0;
  pointer.value = null;
}

/** Runs a passing step: the pointer travels to the target and taps it, then the tour moves on. */
function startAuto(step: GuidedTourStep, target: HTMLElement | null, run: number) {
  if (step.pointer && target) {
    // Two frames, so the balloon has its place: the pointer leaves from it.
    schedule(() =>
      schedule(() => {
        if (run !== showing || !card.value) return;
        const zoom = cssZoom(target);
        const from = card.value.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        pointer.value = {
          fromX: (from.left + from.width / 2) / zoom,
          fromY: (from.top + from.height / 2) / zoom,
          toX: (to.left + to.width / 2) / zoom,
          toY: (to.top + to.height / 2) / zoom,
        };
      }),
    );
  }
  autoTimer = window.setTimeout(() => {
    autoTimer = 0;
    if (run === showing && open.value) next();
  }, step.auto);
}

function close(reason: 'finish' | 'skip') {
  const step = current.value;
  clearAuto();
  open.value = false;
  if (reason === 'finish') emit('finish', counted.value.length);
  else if (step) emit('skip', position.value, step.id);
}

function next() {
  if (isLast.value) close('finish');
  else void show(index.value + 1);
}

/** Back to the step before, past any passing step. */
function previous() {
  let to = index.value - 1;
  while (to > 0 && available.value[to]?.auto) to -= 1;
  if (to >= 0 && !available.value[to]?.auto) void show(to, -1);
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    close('skip');
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    next();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    previous();
  } else if (event.key === 'Tab' && card.value) {
    const focusable = [...card.value.querySelectorAll<HTMLElement>('button')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === card.value)) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
}

watch(
  open,
  async (value, previousValue) => {
    if (typeof document === 'undefined') return;
    if (value) {
      returnFocus = document.activeElement as HTMLElement | null;
      available.value = steps.filter((step) => step.appears || step.auto || isShown(targetOf(step)));
      if (!available.value.some((step) => !step.appears && !step.auto)) {
        open.value = false;
        return;
      }
      await show(0);
      track();
    } else if (previousValue) {
      stop();
      giveFocusBack();
      returnFocus = null;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearAuto();
  stop();
});
</script>

<template>
  <Teleport to="body">
    <Transition :leave-active-class="styles.leaving" :leave-to-class="styles.left">
    <div v-if="open && current" :class="styles.root" data-guided-tour @keydown="onKeyDown">
      <div :class="styles.blocker" aria-hidden="true" />
      <div
        v-if="spot"
        :class="styles.spotlight"
        :style="{ top: `${spot.top}px`, left: `${spot.left}px`, width: `${spot.width}px`, height: `${spot.height}px` }"
        aria-hidden="true"
      />
      <section
        ref="card"
        :class="[styles.card, styles[placement], current.auto && styles.passing]"
        :style="cardStyle"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="current.body ? bodyId : undefined"
        tabindex="-1"
        :data-tour-step="current.id"
        :data-placement="placement"
        :data-passing="current.auto ? '' : undefined"
      >
        <span v-if="placement === 'below' || placement === 'above'" :class="styles.arrow" :style="{ left: `${arrowLeft}px` }" aria-hidden="true" />
        <span v-else-if="placement === 'beside'" :class="styles.arrow" :style="{ top: `${arrowTop}px` }" aria-hidden="true" />

        <header :class="styles.header">
          <span :class="styles.progress">
            <FormattedMessage v-if="!current.auto" v-bind="defaultMessages.progress" :values="{ current: position + 1, total: counted.length }" />
          </span>
          <button
            type="button"
            :class="styles.close"
            :aria-label="formatMessage(intl, defaultMessages.skip)"
            @click="close('skip')"
          >
            <Icon name="close" size="sm" />
          </button>
        </header>

        <div :class="styles.content">
          <span v-if="current.icon" :class="styles.icon" aria-hidden="true"><Icon :name="current.icon" size="md" /></span>
          <div :class="styles.text">
            <h2 :id="titleId" :class="styles.title"><FormattedMessage v-bind="current.title" /></h2>
            <p v-if="current.body" :id="bodyId" :class="styles.body"><FormattedMessage v-bind="current.body" /></p>
          </div>
        </div>

        <!-- A passing step: a countdown instead of the buttons; it moves on by itself. -->
        <span
          v-if="current.auto"
          :key="`countdown-${index}`"
          :class="styles.countdown"
          :style="{ '--tour-auto': `${current.auto}ms` }"
          aria-hidden="true"
          data-tour-countdown
        />
        <footer v-else :class="styles.footer">
          <div :class="styles.dots" aria-hidden="true">
            <span
              v-for="(step, at) in counted"
              :key="step.id"
              :class="[styles.dot, at === position && styles.dotActive, at < position && styles.dotDone]"
            />
          </div>
          <button
            v-if="position > 0"
            type="button"
            :class="styles.secondary"
            :aria-label="formatMessage(intl, defaultMessages.previous)"
            data-tour-previous
            @click="previous"
          >
            <Icon name="arrow-left" size="sm" />
          </button>
          <button type="button" :class="styles.primary" data-tour-next @click="next">
            <FormattedMessage v-bind="isLast ? defaultMessages.done : defaultMessages.next" />
            <Icon :name="isLast ? 'check' : 'arrow-right'" size="xs" />
          </button>
        </footer>
      </section>

      <!-- The pointer of a passing step: it travels to the target and taps it. -->
      <div
        v-if="pointer && current.auto"
        :key="`pointer-${index}`"
        :class="styles.pointer"
        :style="{
          '--from-x': `${pointer.fromX}px`,
          '--from-y': `${pointer.fromY}px`,
          '--to-x': `${pointer.toX}px`,
          '--to-y': `${pointer.toY}px`,
          '--tour-auto': `${current.auto}ms`,
        }"
        aria-hidden="true"
        data-tour-pointer
      >
        <span :class="styles.tap" />
        <svg :class="styles.cursor" viewBox="0 0 24 24" width="30" height="30">
          <path d="M4 2.5v16.8l4.4-4.1 2.9 6.6 2.9-1.3-2.9-6.5 6-.3z" />
        </svg>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>
