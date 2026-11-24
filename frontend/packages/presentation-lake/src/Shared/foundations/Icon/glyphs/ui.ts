import { bayGlyph } from './sectors';
import { circle, rect, type IconGlyph } from './types';

/** Interface glyphs: navigation, actions and fact labels. */
export const uiGlyphs = {
  search: {
    tint: [circle(10.5, 10.5, 6.25)],
    line: [circle(10.5, 10.5, 6.25), 'M15.2 15.2 20 20'],
  },
  'arrow-right': { line: ['M4.5 12h15', 'M13.5 6l6 6-6 6'] },
  'arrow-left': { line: ['M19.5 12h-15', 'M10.5 6l-6 6 6 6'] },
  'chevron-down': { line: ['M6.5 9.5 12 15l5.5-5.5'] },
  'chevron-right': { line: ['M9.5 6.5 15 12l-5.5 5.5'] },
  close: { line: ['M6.5 6.5l11 11', 'M17.5 6.5l-11 11'] },
  menu: { line: ['M4 7h16', 'M4 12h16', 'M4 17h16'] },
  'external-link': {
    line: [
      'M13.5 4.5H19.5V10.5',
      'M19.5 4.5l-8.5 8.5',
      'M17.5 13.5v4.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V8A1.5 1.5 0 0 1 6 6.5h4.5',
    ],
  },
  home: {
    tint: ['M6 9.6 12 5l6 4.6V20H6Z'],
    line: ['M3.5 11 12 4.5l8.5 6.5', 'M6 9.6V20h12V9.6', 'M10 20v-5.5h4V20'],
  },
  catalog: {
    tint: [rect(4, 4, 7, 7, 1.5), rect(13, 13, 7, 7, 1.5)],
    line: [rect(4, 4, 7, 7, 1.5), rect(13, 4, 7, 7, 1.5), rect(4, 13, 7, 7, 1.5), rect(13, 13, 7, 7, 1.5)],
  },
  list: {
    line: ['M9 7h11', 'M9 12h11', 'M9 17h11'],
    solid: [circle(5, 7, 1.25), circle(5, 12, 1.25), circle(5, 17, 1.25)],
  },
  filter: {
    tint: ['M4 5h16l-6.2 7.4v5.8l-3.6 1.8v-7.6Z'],
    line: ['M4 5h16l-6.2 7.4v5.8l-3.6 1.8v-7.6Z'],
  },
  'map-pin': {
    tint: ['M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11Z'],
    line: ['M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11Z', circle(12, 10, 2.4)],
  },
  institution: {
    tint: ['M5 9.5 12 5l7 4.5Z', rect(6, 9.5, 12, 8.5)],
    line: ['M3.5 20h17', 'M5 9.5 12 5l7 4.5Z', 'M7 10v8', 'M10.3 10v8', 'M13.7 10v8', 'M17 10v8'],
  },
  people: {
    tint: [circle(9, 8.5, 3), 'M3.5 19.5a5.5 5.5 0 0 1 11 0Z'],
    line: [circle(9, 8.5, 3), 'M3.5 19.5a5.5 5.5 0 0 1 11 0', 'M15.2 6.2a2.6 2.6 0 1 1 0 5', 'M16.8 14.3a4.8 4.8 0 0 1 3.7 5.2'],
  },
  calendar: {
    tint: [rect(4, 5.5, 16, 4.5)],
    line: [rect(4, 5.5, 16, 14.5, 2), 'M4 10h16', 'M8.5 3.5v4', 'M15.5 3.5v4'],
    solid: [circle(8.5, 14, 1), circle(12, 14, 1), circle(15.5, 14, 1)],
  },
  document: {
    tint: ['M6.5 3.5h7.5l4.5 4.5v12.5h-12Z'],
    line: ['M6.5 3.5h7.5l4.5 4.5v12.5h-12Z', 'M14 3.5V8h4.5', 'M9.5 12.5h6', 'M9.5 16h6'],
  },
  tag: {
    tint: ['M4 4h7.2l8.5 8.5-7.2 7.2L4 11.2Z'],
    line: ['M4 4h7.2l8.5 8.5-7.2 7.2L4 11.2Z'],
    solid: [circle(8, 8, 1.3)],
  },
  target: {
    tint: [circle(12, 12, 8)],
    line: [circle(12, 12, 8), circle(12, 12, 4.2)],
    solid: [circle(12, 12, 1.3)],
  },
  clock: {
    tint: [circle(12, 12, 8)],
    line: [circle(12, 12, 8), 'M12 7.5V12l3 2'],
  },
  /** Guanabara Bay, no sector highlighted: the portal's mark. */
  bay: bayGlyph,
  /** Clear a selection (filters). */
  'close-small': { line: ['M8 8l8 8', 'M16 8l-8 8'] },
  check: { line: ['M5 12.5 9.5 17 19 7.5'] },
  /** Opções (the button since v0.9.17; the combined glyph of v0.9.18 was dropped in v0.9.19): sliders. */
  sliders: {
    line: ['M4 7h9', 'M17 7h3', 'M4 17h3', 'M11 17h9', circle(15, 7, 2), circle(9, 17, 2)],
  },
  /**
   * Translation (v0.9.18): two speech bubbles, a Latin "A" in front at the
   * lower left and a CJK "文" behind at the upper right — Opções' language part.
   */
  translate: {
    tint: [
      'M4.25 10.25h6.5a1.5 1.5 0 0 1 1.5 1.5v5.25a1.5 1.5 0 0 1-1.5 1.5H7.5L5 20.75V18.5h-.75a1.5 1.5 0 0 1-1.5-1.5v-5.25a1.5 1.5 0 0 1 1.5-1.5Z',
    ],
    line: [
      'M4.25 10.25h6.5a1.5 1.5 0 0 1 1.5 1.5v5.25a1.5 1.5 0 0 1-1.5 1.5H7.5L5 20.75V18.5h-.75a1.5 1.5 0 0 1-1.5-1.5v-5.25a1.5 1.5 0 0 1 1.5-1.5Z',
      'M5.6 16.6 7.5 12.1l1.9 4.5',
      'M6.25 15.1h2.5',
      'M14 2.5h6a1.5 1.5 0 0 1 1.5 1.5v5.5a1.5 1.5 0 0 1-1.5 1.5h-.5v2.5L16.75 11H14a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 14 2.5Z',
      'M17 4.25v.9',
      'M14.85 5.75h4.3',
      'M15.5 5.75c.5 1.85 1.6 3.05 3.35 3.65',
      'M18.5 5.75c-.5 1.85-1.6 3.05-3.35 3.65',
    ],
  },
  /** Zoom in (v0.9.18): a lens with a plus — Opções' view-size part. */
  'zoom-in': {
    tint: [circle(10.5, 10.5, 6.25)],
    line: [circle(10.5, 10.5, 6.25), 'M15.2 15.2 20 20', 'M10.5 7.75v5.5', 'M7.75 10.5h5.5'],
  },
  /** Text size ("Aa"): the view zoom control. */
  'text-size': {
    line: ['M2.75 19 8.1 5.5h1.3L14.75 19', 'M4.9 14h7.7', 'M14.25 19l3-7.75h.75L21.25 19', 'M15.4 16.25h4.7'],
  },
  /** Testimonials: a pair of quotation marks. */
  quote: {
    tint: [rect(4.5, 6.5, 5.5, 5.5, 1.25), rect(13.5, 6.5, 5.5, 5.5, 1.25)],
    line: ['M10 12V7.75A1.25 1.25 0 0 0 8.75 6.5h-3A1.25 1.25 0 0 0 4.5 7.75v3A1.25 1.25 0 0 0 5.75 12H10c0 3-1.5 5-4.5 5.75', 'M19 12V7.75A1.25 1.25 0 0 0 17.75 6.5h-3a1.25 1.25 0 0 0-1.25 1.25v3A1.25 1.25 0 0 0 14.75 12H19c0 3-1.5 5-4.5 5.75'],
  },
  /** Account: one person, head and shoulders. */
  user: {
    tint: [circle(12, 8.25, 3.75)],
    line: [circle(12, 8.25, 3.75), 'M4.75 20.25c0-4 3.25-6.75 7.25-6.75s7.25 2.75 7.25 6.75'],
  },
  /** Language menu: a globe with its meridians and parallels. */
  globe: {
    tint: [circle(12, 12, 8.5)],
    line: [
      circle(12, 12, 8.5),
      'M12 3.5c-2.6 2.4-3.9 5.2-3.9 8.5s1.3 6.1 3.9 8.5',
      'M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5s-1.3 6.1-3.9 8.5',
      'M3.5 12h17',
      'M5.2 7.75h13.6',
      'M5.2 16.25h13.6',
    ],
  },
  /** Mapa tab: a folded map in three panels. */
  map: {
    tint: ['M9 4.75l6 2v12.5l-6-2Z'],
    line: ['M3.5 6.75 9 4.75l6 2 5.5-2v12.5l-5.5 2-6-2-5.5 2Z', 'M9 4.75v12.5', 'M15 6.75v12.5'],
  },
  /** Destaques: a five-pointed star. */
  star: {
    tint: ['M12 3.75l2.55 5.17 5.7.83-4.12 4.02.97 5.68L12 16.77l-5.1 2.68.97-5.68-4.12-4.02 5.7-.83Z'],
    line: ['M12 3.75l2.55 5.17 5.7.83-4.12 4.02.97 5.68L12 16.77l-5.1 2.68.97-5.68-4.12-4.02 5.7-.83Z'],
  },
  info: {
    tint: [circle(12, 12, 8.5)],
    line: [circle(12, 12, 8.5), 'M12 11v5.5'],
    solid: [circle(12, 7.8, 1.1)],
  },
} satisfies Record<string, IconGlyph>;
