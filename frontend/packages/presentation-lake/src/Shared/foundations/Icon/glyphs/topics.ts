import { circle, drop, rect, wave, type IconGlyph } from './types';

/*
 * Topic glyphs for the catalogue's keyword vocabulary.
 * Sediment variants share one motif — a dotted seabed band along the bottom —
 * under a compact version of their environment.
 */
const sedimentBand = {
  tint: [rect(3, 17, 18, 4, 1)],
  line: ['M3 17h18'],
  solid: [circle(6, 19.3, 0.85), circle(10, 19.6, 0.85), circle(14, 19.3, 0.85), circle(18, 19.6, 0.85)],
};

const withSediment = (glyph: IconGlyph): IconGlyph => ({
  tint: [...(glyph.tint ?? []), ...sedimentBand.tint],
  line: [...glyph.line, ...sedimentBand.line],
  solid: [...(glyph.solid ?? []), ...sedimentBand.solid],
});

// River: winding away into the distance — wide in front, narrow at the horizon.
const riverBanks = ['M10.6 3c-1.2 2.2 1.6 3.6-.4 6S3.8 13.6 3.5 21', 'M13 3c-.6 2.3 2.6 3.6 1.2 6.2S10.8 15.6 13.5 21'];
const riverFill = 'M10.6 3c-1.2 2.2 1.6 3.6-.4 6S3.8 13.6 3.5 21h10c-2.7-5.4 2.1-9.2.7-11.8S12.4 5.3 13 3Z';
const riverSmallBanks = ['M10.8 3c-.9 1.6 1.2 2.6-.3 4.4S5.6 10.6 5.4 14.5', 'M12.8 3c-.4 1.7 1.9 2.6.9 4.5s-2.6 4.4-.9 7'];
const riverSmallFill = 'M10.8 3c-.9 1.6 1.2 2.6-.3 4.4S5.6 10.6 5.4 14.5h7.4c-1.7-2.6-.1-5.1.9-7S12.4 4.7 12.8 3Z';

// Mangrove: rounded canopy, a short trunk and arching prop roots.
const canopy = 'M7.2 10.5a3.2 3.2 0 0 1 .3-6.3 4.6 4.6 0 0 1 9 .6 2.9 2.9 0 0 1 .3 5.7Z';
const mangrove = {
  tint: [canopy],
  line: [canopy, 'M12 10.5v3', 'M12 13c-2.2 0-4 1.8-4.6 5', 'M12 13c2.2 0 4 1.8 4.6 5', 'M12 13.5V18', wave(19.5, 3, 21, 0.7)],
};
const mangroveSmall = {
  tint: ['M8.2 8.8a2.5 2.5 0 0 1 .2-4.9 3.6 3.6 0 0 1 7 .4 2.3 2.3 0 0 1 .3 4.5Z'],
  line: [
    'M8.2 8.8a2.5 2.5 0 0 1 .2-4.9 3.6 3.6 0 0 1 7 .4 2.3 2.3 0 0 1 .3 4.5Z',
    'M12 8.8v2.2',
    'M12 10.8c-1.8 0-3.2 1.4-3.6 3.7',
    'M12 10.8c1.8 0 3.2 1.4 3.6 3.7',
  ],
};

// Estuary: a channel that opens into the sea.
const estuaryFill = 'M10.4 3h3.2v3.5c0 3.4 3 5.8 7.4 7V20H3v-6.5c4.4-1.2 7.4-3.6 7.4-7Z';
const estuary = {
  tint: [estuaryFill],
  line: ['M10.4 3v3.5c0 3.4-3 5.8-7.4 7', 'M13.6 3v3.5c0 3.4 3 5.8 7.4 7', wave(17.2), wave(20.5, 6, 18)],
};
const estuarySmall = {
  tint: ['M10.6 3h2.8v2.4c0 2.6 2.6 4.5 6.6 5.6v3.5H4V11c4-1.1 6.6-3 6.6-5.6Z'],
  line: ['M10.6 3v2.4c0 2.6-2.6 4.5-6.6 5.6', 'M13.4 3v2.4c0 2.6 2.6 4.5 6.6 5.6', wave(13.6, 4.5, 19.5, 0.7)],
};

// Open sea: stacked waves.
const seaSmall = { line: [wave(6), wave(10, 3, 21), wave(14, 5.25, 18.75)] };

export const topicGlyphs = {
  // ── Tipo de resíduo ────────────────────────────────────────────────────
  /** Macrolixo — a discarded bottle. */
  'topic-macro-litter': {
    tint: ['M10 5.5h4v1.3c1.7.9 2.6 2.4 2.6 4.3v8a1.9 1.9 0 0 1-1.9 1.9H9.3a1.9 1.9 0 0 1-1.9-1.9v-8c0-1.9.9-3.4 2.6-4.3Z'],
    line: [
      'M10 5.5h4v1.3c1.7.9 2.6 2.4 2.6 4.3v8a1.9 1.9 0 0 1-1.9 1.9H9.3a1.9 1.9 0 0 1-1.9-1.9v-8c0-1.9.9-3.4 2.6-4.3Z',
      rect(9.75, 2.75, 4.5, 2.75, 0.8),
      'M7.4 12.5h9.2',
      'M7.4 16.5h9.2',
    ],
  },
  /** Microplástico — particles suspended under the surface. */
  'topic-microplastic': {
    line: [wave(5.5)],
    solid: [
      circle(6.5, 11, 1.4),
      circle(12.5, 9.8, 0.9),
      circle(17, 12.5, 1.6),
      circle(9.5, 16, 1.1),
      circle(14.2, 17.4, 1.3),
      circle(19.2, 18.6, 0.8),
      circle(5, 18.8, 0.9),
      'M10.6 12.6l1.9.4-.5 1.8-1.8-.6Z',
    ],
  },
  /** Contaminantes — a leaking drum. */
  'topic-contaminants': {
    tint: [rect(4.5, 4, 10.5, 16, 1.6)],
    line: [rect(4.5, 4, 10.5, 16, 1.6), 'M4.5 9h10.5', 'M4.5 15h10.5', 'M15 6.5h1.6c.9 0 1.4.5 1.4 1.4v2.6'],
    solid: [drop(18, 12.2, 5.6)],
  },
  /** Lixo náutico — a lost fishing net (ghost net) under its float line. */
  'topic-nautical-litter': {
    tint: ['M5 7.5c0 6.2 2.9 11.3 7 12.5 4.1-1.2 7-6.3 7-12.5Z'],
    line: ['M3 7.5h18', 'M5 7.5c0 6.2 2.9 11.3 7 12.5 4.1-1.2 7-6.3 7-12.5', 'M8 7.5l7.6 9.6', 'M16 7.5l-7.6 9.6', 'M5.6 12.5h12.8'],
    solid: [circle(7.5, 5.6, 1.6), circle(16.5, 5.6, 1.6)],
  },

  // ── Ambiente ───────────────────────────────────────────────────────────
  /** Rio. */
  'topic-river': { tint: [riverFill], line: riverBanks },
  /** Sedimento de rio. */
  'topic-river-sediment': withSediment({ tint: [riverSmallFill], line: riverSmallBanks }),
  /** Manguezal — the prop roots are the mangrove's signature. */
  'topic-mangrove': mangrove,
  /** Sedimento de manguezal. */
  'topic-mangrove-sediment': withSediment(mangroveSmall),
  /** Estuário — where the river meets the sea. */
  'topic-estuary': estuary,
  /** Sedimento estuarino. */
  'topic-estuarine-sediment': withSediment(estuarySmall),
  /** Litoral — shoreline: sun, sea and a sandy slope. */
  'topic-coast': {
    tint: ['M3 20.5c3.2-3.4 8.6-5.2 18-5.2v5.2Z'],
    line: [circle(17, 6.5, 2.5), wave(11.2), 'M3 20.5c3.2-3.4 8.6-5.2 18-5.2'],
  },
  /** Plataforma continental — a shallow shelf, then the drop. */
  'topic-continental-shelf': {
    tint: ['M3 10h7.5l2.5 4h2l3.5 5.5H21V21H3Z'],
    line: [wave(5.5), 'M3 10h7.5l2.5 4h2l3.5 5.5H21'],
  },
  /** Sedimento marinho. */
  'topic-marine-sediment': withSediment(seaSmall),

  // ── Biota ──────────────────────────────────────────────────────────────
  /** Fauna — a fish. */
  'topic-fauna': {
    tint: ['M7 12c2.1-3.3 5-5 8-5 2.7 0 4.9 1.8 6 5-1.1 3.2-3.3 5-6 5-3 0-5.9-1.7-8-5Z'],
    line: [
      'M7 12c2.1-3.3 5-5 8-5 2.7 0 4.9 1.8 6 5-1.1 3.2-3.3 5-6 5-3 0-5.9-1.7-8-5Z',
      'M7 12 3 8.3v7.4Z',
      'M12 8.8c.9 2.1.9 4.3 0 6.4',
    ],
    solid: [circle(17.3, 11, 1)],
  },
  /** Flora — a leaf. */
  'topic-flora': {
    tint: ['M4.5 19.5c0-8.5 5.5-15 15-15 0 9.5-6.5 15-15 15Z'],
    line: ['M4.5 19.5c0-8.5 5.5-15 15-15 0 9.5-6.5 15-15 15Z', 'M4.5 19.5 14 10', 'M9.2 14.8H6.4', 'M9.2 14.8V12'],
  },

  // ── Processos físicos ──────────────────────────────────────────────────
  /** Hidrodinâmica — currents. */
  'topic-hydrodynamics': {
    line: [
      'M3 9c2.5-2.6 5-2.6 7.5 0s5 2.6 7.5 0l2-2',
      'M17 6.4l3 .6-.6 3',
      'M3 16c2.5-2.6 5-2.6 7.5 0s5 2.6 7.5 0l2-2',
      'M17 13.4l3 .6-.6 3',
    ],
  },

  // ── Dimensão socioambiental ────────────────────────────────────────────
  /** Pesca artesanal — a small boat, a line and a hook. */
  'topic-artisanal-fishing': {
    tint: ['M3 12.5h12.5l-2 4h-8.5Z'],
    line: ['M3 12.5h12.5l-2 4h-8.5Z', 'M11 12.5 19.5 4', 'M19.5 4v13.2', 'M19.5 17.2c0 1.5-1.8 1.8-2.3.6', wave(20, 3, 15.75, 0.7)],
  },
  /** Cadeia da reciclagem — two arrows chasing each other. */
  'topic-recycling-chain': {
    tint: [circle(12, 12, 4)],
    line: ['M18.8 12a6.8 6.8 0 0 1-11.6 4.8', 'M5.2 12a6.8 6.8 0 0 1 11.6-4.8', 'M16.8 3.9v3.3h-3.3', 'M7.2 20.1v-3.3h3.3'],
  },
  /** Saneamento — a pipe returning clean water. */
  'topic-sanitation': {
    tint: ['M3 5h8.5a5 5 0 0 1 5 5v3h-4.2v-3a.8.8 0 0 0-.8-.8H3Z'],
    line: ['M3 5h8.5a5 5 0 0 1 5 5v3h-4.2v-3a.8.8 0 0 0-.8-.8H3', 'M11.5 13h6'],
    solid: [drop(14.4, 15.2, 5.8)],
  },
  /** Restauração ecológica — a sprout. */
  'topic-ecological-restoration': {
    tint: ['M12 12.5c0-3.3-2.6-5.8-6.3-5.8 0 3.6 2.6 5.8 6.3 5.8Z', 'M12 14.2c0-3.8 2.8-6.6 7-6.6 0 4.1-2.9 6.6-7 6.6Z'],
    line: [
      'M12 20v-8',
      'M12 12.5c0-3.3-2.6-5.8-6.3-5.8 0 3.6 2.6 5.8 6.3 5.8Z',
      'M12 14.2c0-3.8 2.8-6.6 7-6.6 0 4.1-2.9 6.6-7 6.6Z',
      'M5 20h14',
    ],
  },
} satisfies Record<string, IconGlyph>;
