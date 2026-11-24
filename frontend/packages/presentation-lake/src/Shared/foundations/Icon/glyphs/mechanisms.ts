import { circle, rect, wave } from './types';

/*
 * Mechanism glyphs (v0.9.18) for the catalogue's "Mecanismo de atuação"
 * vocabulary — how an initiative acts. Drawn on the 24 grid like the keyword
 * set; shown in the initiatives' orange slot (`CatalogMechanismIcon`).
 */
export const mechanismGlyphs = {
  /** Transacional: value changes hands — a coin with its "$" inside two chasing arrows. */
  'mechanism-transactional': {
    tint: [circle(12, 12, 4.75)],
    line: [
      circle(12, 12, 4.75),
      'M13.6 10.35c-.3-.55-.9-.85-1.6-.85-.95 0-1.6.5-1.6 1.15 0 1.55 3.3.9 3.3 2.55 0 .7-.7 1.2-1.7 1.2-.8 0-1.4-.35-1.7-.9',
      'M12 8.6v.9',
      'M12 14.55v.9',
      'M3.9 9.5A8.4 8.4 0 0 1 18.4 6.1',
      'M18.9 2.9v3.6h-3.6',
      'M20.1 14.5A8.4 8.4 0 0 1 5.6 17.9',
      'M5.1 21.1v-3.6h3.6',
    ],
  },
  /** Voluntária: given freely — a heart held in an open hand. */
  'mechanism-volunteer': {
    tint: ['M12 13.25s-4.5-2.7-4.5-5.95a2.45 2.45 0 0 1 4.5-1.35 2.45 2.45 0 0 1 4.5 1.35c0 3.25-4.5 5.95-4.5 5.95Z'],
    line: [
      'M12 13.25s-4.5-2.7-4.5-5.95a2.45 2.45 0 0 1 4.5-1.35 2.45 2.45 0 0 1 4.5 1.35c0 3.25-4.5 5.95-4.5 5.95Z',
      'M3.25 16h3.5l3 1.75h4a1.25 1.25 0 0 0 0-2.5h-3',
      'M3.25 20.5h10.5l6.25-3.75a1.3 1.3 0 0 0-1.4-2.2l-3.85 2.2',
    ],
  },
  /** Limpeza: litter swept up — a broom, with a spark of clean. */
  'mechanism-cleanup': {
    tint: ['M9.75 10.25 13.75 14.25 9.5 20.5C7.4 20 4 16.6 3.5 14.5Z'],
    line: [
      'M9.75 10.25 13.75 14.25 9.5 20.5C7.4 20 4 16.6 3.5 14.5Z',
      'M11.75 12.25 19.75 4.25',
      'M7.75 15.25 5.6 17.4',
      'M10 16.75 7.6 19.4',
      'M18.5 13.5v3',
      'M17 15h3',
    ],
  },
  /** Contenção: a floating barrier across the water — a boom of floats between two posts. */
  'mechanism-containment': {
    tint: [circle(7.5, 12, 1.75), circle(12, 12, 1.75), circle(16.5, 12, 1.75)],
    line: [
      'M3.5 6.5v11',
      'M20.5 6.5v11',
      'M3.5 12h2.25',
      'M9.25 12h1',
      'M13.75 12h1',
      'M18.25 12h2.25',
      circle(7.5, 12, 1.75),
      circle(12, 12, 1.75),
      circle(16.5, 12, 1.75),
      wave(19, 3, 21, 0.8),
    ],
  },
  /** Educativa: learning — an open book. */
  'mechanism-education': {
    tint: [
      'M12 6.75C10 5.25 7 5 3.5 5.5v12.25c3.5-.5 6.5-.25 8.5 1.25Z',
      'M12 6.75c2-1.5 5-1.75 8.5-1.25v12.25c-3.5-.5-6.5-.25-8.5 1.25Z',
    ],
    line: [
      'M12 6.75C10 5.25 7 5 3.5 5.5v12.25c3.5-.5 6.5-.25 8.5 1.25 2-1.5 5-1.75 8.5-1.25V5.5c-3.5-.5-6.5-.25-8.5 1.25Z',
      'M12 6.75V19',
    ],
  },
  /** Monitoramento: measured over time — a rising line on two axes. */
  'mechanism-monitoring': {
    tint: ['M4.5 19.5V15l3.5-3.75 3.5 2.75L19.5 6.5v13Z'],
    line: ['M4.5 3.5v16h16', 'M4.5 15 8 11.25l3.5 2.75 8-7.5'],
    solid: [circle(8, 11.25, 1.1), circle(11.5, 14, 1.1), circle(19.5, 6.5, 1.1)],
  },
  /** Reciclagem e destinação: back into use — three arrows chasing round a triangle. */
  'mechanism-recycling': {
    tint: ['M12 10.25 9.25 15.5h5.5Z'],
    line: [
      'M5.7 15.6 10 8.1',
      'M7.75 8.4 10 8.1l.85 2.1',
      'M14 8.1l4.3 7.5',
      'M16 15.35l2.3.25.85-2.1',
      'M16.25 18.75h-8.5',
      'M9.6 16.85 7.75 18.75l1.85 1.9',
    ],
  },
  /** Desenvolvimento tecnológico: new tools — a chip with its pins. */
  'mechanism-technology': {
    tint: [rect(7, 7, 10, 10, 2)],
    line: [
      rect(7, 7, 10, 10, 2),
      rect(10, 10, 4, 4, 0.75),
      'M10 3.5V7',
      'M14 3.5V7',
      'M10 17v3.5',
      'M14 17v3.5',
      'M3.5 10H7',
      'M3.5 14H7',
      'M17 10h3.5',
      'M17 14h3.5',
    ],
  },
  /** Fiscalização: enforcement — a shield with a check. */
  'mechanism-enforcement': {
    tint: ['M12 3.5 19 6v5.5c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6Z'],
    line: ['M12 3.5 19 6v5.5c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6Z', 'M8.75 12l2.25 2.25 4.25-4.5'],
  },
  /** Incidência política: advocacy — a megaphone speaking out. */
  'mechanism-advocacy': {
    tint: ['M4 10.25v3.5a1 1 0 0 0 1 1h2.25l7.75 4.5V4.75L7.25 9.25H5a1 1 0 0 0-1 1Z'],
    line: [
      'M4 10.25v3.5a1 1 0 0 0 1 1h2.25l7.75 4.5V4.75L7.25 9.25H5a1 1 0 0 0-1 1Z',
      'M7.25 9.25v5.5',
      'M7.5 14.75l1.25 4.75h2.25',
      'M18.25 9.25a3.75 3.75 0 0 1 0 5.5',
      'M20.25 7.25a6.5 6.5 0 0 1 0 9.5',
    ],
  },
} as const;
