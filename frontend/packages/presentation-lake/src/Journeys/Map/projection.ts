import type { MapBounds, MapGeometry, MapPosition } from './types';

export interface MapProjection {
  /** Width and height of the drawing, in SVG units. */
  readonly width: number;
  readonly height: number;
  project(position: MapPosition): [x: number, y: number];
}

/**
 * Equirectangular projection scaled by the cosine of the middle latitude —
 * accurate enough for a bay-sized area (about 100 km across).
 */
export function createProjection(bounds: MapBounds, width = 1000): MapProjection {
  const middle = ((bounds.north + bounds.south) / 2) * (Math.PI / 180);
  const xScale = Math.cos(middle);
  const spanX = (bounds.east - bounds.west) * xScale || 1;
  const scale = width / spanX;
  const height = Math.round((bounds.north - bounds.south) * scale);
  return {
    width,
    height,
    project: ([longitude, latitude]) => [(longitude - bounds.west) * xScale * scale, (bounds.north - latitude) * scale],
  };
}

const round = (value: number) => Math.round(value * 10) / 10;

/** SVG path data of a MultiPolygon (holes drawn with the even-odd rule). */
export function geometryPath(geometry: MapGeometry, projection: MapProjection): string {
  return geometry
    .flatMap((polygon) =>
      polygon.map((ring) => {
        const points = ring.map((position) => projection.project(position).map(round).join(' '));
        return points.length ? `M${points.join('L')}Z` : '';
      }),
    )
    .join('');
}

function ringArea(points: readonly [number, number][]) {
  let area = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    area += points[j]![0] * points[i]![1] - points[i]![0] * points[j]![1];
  }
  return area / 2;
}

/** Where a badge sits: the centroid of the largest polygon's outer ring. */
export function labelPoint(geometry: MapGeometry, projection: MapProjection): [x: number, y: number] {
  let best: { area: number; points: [number, number][] } | null = null;
  for (const polygon of geometry) {
    const outer = polygon[0];
    if (!outer?.length) continue;
    const points = outer.map((position) => projection.project(position));
    const area = Math.abs(ringArea(points));
    if (!best || area > best.area) best = { area, points };
  }
  if (!best) return [0, 0];

  const signed = ringArea(best.points);
  if (!signed) return best.points[0]!;
  let x = 0;
  let y = 0;
  for (let i = 0, j = best.points.length - 1; i < best.points.length; j = i++) {
    const [x0, y0] = best.points[j]!;
    const [x1, y1] = best.points[i]!;
    const cross = x0 * y1 - x1 * y0;
    x += (x0 + x1) * cross;
    y += (y0 + y1) * cross;
  }
  return [round(x / (6 * signed)), round(y / (6 * signed))];
}
