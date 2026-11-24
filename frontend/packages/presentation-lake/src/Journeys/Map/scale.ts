/**
 * Four classes of "how many entries name this municipality" (v0.9.5; by
 * initiatives in v0.8), from the busiest one down: 1 · max/8 · max/4 · max/2
 * (rounded up). With a maximum of 22: 1–2, 3–5, 6–10, 11–22.
 */
export interface MapBin {
  /** 1 (fewest) … 4 (most). */
  level: 1 | 2 | 3 | 4;
  from: number;
  to: number;
}

export function mapBins(max: number): MapBin[] {
  if (max <= 0) return [];
  const starts = [1, Math.ceil(max / 8), Math.ceil(max / 4), Math.ceil(max / 2)];
  // Small maxima collapse classes: keep strictly increasing starts.
  const unique = starts.filter((start, index) => index === 0 || start > starts[index - 1]!);
  return unique.map((from, index) => ({
    level: (4 - unique.length + index + 1) as MapBin['level'],
    from,
    to: index + 1 < unique.length ? unique[index + 1]! - 1 : max,
  }));
}

/** Fill of each class (v0.9.5): four steps of the mangue green, lightest = fewest entries. */
export const mapLevelFill: Readonly<Record<MapBin['level'], string>> = {
  1: 'var(--color-map-place-1)',
  2: 'var(--color-map-place-2)',
  3: 'var(--color-map-place-3)',
  4: 'var(--color-map-place-4)',
};

export function binOf(count: number, bins: readonly MapBin[]): MapBin | undefined {
  if (count <= 0) return undefined;
  return [...bins].reverse().find((bin) => count >= bin.from);
}

/** Radius of an initiatives badge, in map units. */
export const INITIATIVES_BADGE_RADIUS = 19;

/**
 * Radius of a studies circle (v0.8): its area grows with the count, from a
 * readable minimum up to `largest` for the place with the most studies.
 */
export function studyRadius(count: number, max: number, min = 12, largest = 29): number {
  if (count <= 0) return 0;
  if (max <= 0) return min;
  return Math.round(Math.max(min, largest * Math.sqrt(Math.min(count, max) / max)) * 10) / 10;
}
