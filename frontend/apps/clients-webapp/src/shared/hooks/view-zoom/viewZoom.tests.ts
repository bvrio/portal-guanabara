import { describe, expect, it } from 'vitest';

import { defaultViewZoom, toViewZoomLevel, viewZoomFactor, viewZoomLevels } from './viewZoom';

describe('view zoom', () => {
  it('offers 100, 110 and 120%, starting at the designed 100%', () => {
    expect(viewZoomLevels).toEqual([100, 110, 120]);
    expect(defaultViewZoom).toBe(100);
    expect(viewZoomFactor).toEqual({ 100: 1, 110: 1.125, 120: 1.25 });
  });

  it('reads a stored level and falls back to the default', () => {
    expect(toViewZoomLevel('120')).toBe(120);
    expect(toViewZoomLevel(110)).toBe(110);
    expect(toViewZoomLevel('80')).toBe(100);
    expect(toViewZoomLevel('150')).toBe(100);
    expect(toViewZoomLevel(undefined)).toBe(100);
  });
});
