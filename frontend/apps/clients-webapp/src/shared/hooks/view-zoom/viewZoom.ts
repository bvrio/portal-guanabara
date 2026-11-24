/**
 * View size: the "Tamanho" menu in the site header. 100% (the default) is the
 * size the portal was designed at; 110% and 120% enlarge everything — text,
 * icons, spacing — for easier reading. Applied as CSS `zoom` on <html> from
 * tablets up (`app/globals.scss`); phones keep their own text settings.
 *
 * v0.7 rescale: today's 100% is v0.6's 80%, 120% is v0.6's 100%, and 110% sits
 * between them. A stored v0.6 value still reads sensibly (80 → default 100).
 */
export const viewZoomLevels = [100, 110, 120] as const;
export type ViewZoomLevel = (typeof viewZoomLevels)[number];
export const defaultViewZoom: ViewZoomLevel = 100;

/** CSS zoom of each level, relative to the designed (100%) size. */
export const viewZoomFactor: Record<ViewZoomLevel, number> = { 100: 1, 110: 1.125, 120: 1.25 };

export function toViewZoomLevel(value: unknown): ViewZoomLevel {
  const level = Number(value);
  return viewZoomLevels.find((candidate) => candidate === level) ?? defaultViewZoom;
}
