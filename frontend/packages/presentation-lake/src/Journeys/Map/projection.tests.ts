import { createProjection, geometryPath, labelPoint } from './projection';
import { binOf, mapBins, studyRadius } from './scale';

const bounds = { west: -43.5, south: -23, east: -42.5, north: -22.5 };
const square = [
  [
    [
      [-43, -22.6],
      [-42.9, -22.6],
      [-42.9, -22.7],
      [-43, -22.7],
      [-43, -22.6],
    ],
  ],
] as const;

describe('map projection', () => {
  it('fits the bounds to the width and keeps north up', () => {
    const projection = createProjection(bounds, 1000);
    expect(projection.project([-43.5, -22.5])).toEqual([0, 0]);
    const [x, y] = projection.project([-42.5, -23]);
    expect(x).toBeCloseTo(1000);
    expect(y).toBeCloseTo(projection.height, 0);
    // Half a degree of latitude is taller than half a degree of longitude is wide.
    expect(projection.height).toBeGreaterThan(500);
  });

  it('draws rings as closed paths and badges at the centroid', () => {
    const projection = createProjection(bounds, 1000);
    expect(geometryPath(square, projection)).toMatch(/^M500 \d+(\.\d)?L.*Z$/);
    const [x, y] = labelPoint(square, projection);
    expect(x).toBeCloseTo(550, 0);
    expect(y).toBeCloseTo(projection.project([-42.95, -22.65])[1], 0);
  });
});

describe('map scale', () => {
  it('splits counts into four classes from the maximum', () => {
    expect(mapBins(22)).toEqual([
      { level: 1, from: 1, to: 2 },
      { level: 2, from: 3, to: 5 },
      { level: 3, from: 6, to: 10 },
      { level: 4, from: 11, to: 22 },
    ]);
    expect(binOf(11, mapBins(22))?.level).toBe(4);
    expect(binOf(1, mapBins(22))?.level).toBe(1);
    expect(binOf(0, mapBins(22))).toBeUndefined();
  });

  it('keeps classes distinct for small maxima', () => {
    expect(mapBins(3)).toEqual([
      { level: 3, from: 1, to: 1 },
      { level: 4, from: 2, to: 3 },
    ]);
    expect(mapBins(0)).toEqual([]);
  });

  it('sizes studies circles by area, from a readable minimum to the largest', () => {
    expect(studyRadius(0, 10)).toBe(0);
    expect(studyRadius(1, 10)).toBe(12);
    expect(studyRadius(10, 10)).toBe(29);
    expect(studyRadius(5, 10)).toBeCloseTo(29 * Math.sqrt(0.5), 0);
    expect(studyRadius(3, 0)).toBe(12);
  });
});
