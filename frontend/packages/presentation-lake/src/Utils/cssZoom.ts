/**
 * The CSS zoom in effect for an element (1 when none). The App can zoom the
 * whole page (the "Tamanho" control sets `zoom` on <html>); code that turns
 * getBoundingClientRect() — which reports zoomed, on-screen pixels — into
 * `top`/`left` of a fixed element must divide by it.
 */
export function cssZoom(element?: Element | null): number {
  if (typeof document === 'undefined') return 1;
  const target = element ?? document.documentElement;
  const native = (target as Element & { currentCSSZoom?: number }).currentCSSZoom;
  const value = typeof native === 'number' ? native : Number.parseFloat(getComputedStyle(target).zoom);
  return Number.isFinite(value) && value > 0 ? value : 1;
}
