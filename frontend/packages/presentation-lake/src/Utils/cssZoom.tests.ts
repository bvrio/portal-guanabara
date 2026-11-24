import { cssZoom } from './cssZoom';

describe('cssZoom', () => {
  it('reads the zoom in effect, defaulting to 1', () => {
    expect(cssZoom()).toBe(1);
    const element = document.createElement('div');
    Object.defineProperty(element, 'currentCSSZoom', { value: 1.25 });
    expect(cssZoom(element)).toBe(1.25);
  });
});
