import type { GuidedTourStep } from '@portal-guanabara/presentation-lake';

import { useState } from '#imports';

/**
 * A step of the site's guided tour, with the path of the page it shows on (v0.9.31). An empty
 * path (the entry page, known only once Início's drawer loads) means "stay where you are".
 */
export interface SiteTourStep extends GuidedTourStep {
  path: string;
}

/**
 * The site's guided tour (v0.9.31): started by a Page (Início's "Começar o
 * tour"), drawn by the App, which keeps it open across pages and goes to each
 * step's page — the Mapa step opens the Mapa. Pages that bring a target in
 * themselves (Início opens its drawer) follow `current`.
 *
 * Shared App state, like the hero hand-over: `open`, the `steps` the Page
 * gave, and the `current` step id (null when closed).
 */
export function useGuidedTour() {
  const open = useState<boolean>('pg:guided-tour-open', () => false);
  const steps = useState<SiteTourStep[]>('pg:guided-tour-steps', () => []);
  const current = useState<string | null>('pg:guided-tour-current', () => null);

  function start(next: SiteTourStep[]) {
    steps.value = next;
    current.value = null;
    open.value = true;
  }

  return { open, steps, current, start };
}
