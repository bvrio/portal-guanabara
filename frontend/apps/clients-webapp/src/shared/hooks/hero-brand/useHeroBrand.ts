import { onBeforeUnmount, onMounted, type Ref } from 'vue';

import { useState } from '#imports';

/** Steps the observer reports at: fine enough for the fade to follow the scroll. */
const STEPS = Array.from({ length: 41 }, (_, index) => index / 40);

/**
 * How much of a Page's own mark and name — Início's hero shows them — is still
 * on screen below the header, from 1 (all) to 0 (gone) (v0.9.17; gradual since
 * v0.9.20). The App fades the header's mark and name in by the same amount, so
 * one hands over to the other as the visitor scrolls, instead of waiting for the
 * whole hero band to leave.
 *
 * The App reads `heroBrandShown`; the Page calls `watchHero(element)` in its
 * setup with the element that holds its mark and name. The state starts at 1,
 * so the server and the first paint already agree (a page opens at its top).
 */
export function useHeroBrand() {
  const heroBrandShown = useState<number>('pg:hero-brand-shown', () => 1);

  function watchHero(target: Ref<Element | null | undefined>, headerHeight = 64) {
    heroBrandShown.value = 1;
    let observer: IntersectionObserver | undefined;

    onMounted(() => {
      const element = target.value;
      if (!element || typeof IntersectionObserver === 'undefined') return;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          const box = entry.boundingClientRect;
          // Not laid out (the hero hides its mark on small screens): nothing to hand over.
          if (!box.height) {
            heroBrandShown.value = 0;
            return;
          }
          // Only what has gone behind the header counts, not what is still below the fold.
          const top = entry.rootBounds?.top;
          heroBrandShown.value =
            top === undefined ? entry.intersectionRatio : 1 - Math.min(Math.max((top - box.top) / box.height, 0), 1);
        },
        // The window under the header: what has scrolled behind the bar counts as gone.
        { rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: STEPS },
      );
      observer.observe(element);
    });

    onBeforeUnmount(() => {
      observer?.disconnect();
      heroBrandShown.value = 1;
    });
  }

  return { heroBrandShown, watchHero };
}
