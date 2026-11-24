import { kindGlyphs } from './kinds';
import { mechanismGlyphs } from './mechanisms';
import { sectorGlyphs } from './sectors';
import { topicGlyphs } from './topics';
import { uiGlyphs } from './ui';

import type { IconGlyph } from './types';

export type { IconGlyph } from './types';

const allGlyphs = {
  ...uiGlyphs,
  ...kindGlyphs,
  ...sectorGlyphs,
  ...topicGlyphs,
  ...mechanismGlyphs,
};

export type IconName = keyof typeof allGlyphs;

/** Every glyph of the Portal Guanabara icon set, by name. */
export const iconGlyphs: Readonly<Record<IconName, IconGlyph>> = allGlyphs;
export type UiIconName = keyof typeof uiGlyphs;
export type KindIconName = keyof typeof kindGlyphs;
export type SectorIconName = keyof typeof sectorGlyphs;
export type TopicIconName = keyof typeof topicGlyphs;
export type MechanismIconName = keyof typeof mechanismGlyphs;

/** Names grouped for galleries and documentation. */
export const iconGroups = {
  ui: Object.keys(uiGlyphs) as UiIconName[],
  kind: Object.keys(kindGlyphs) as KindIconName[],
  sector: Object.keys(sectorGlyphs) as SectorIconName[],
  topic: Object.keys(topicGlyphs) as TopicIconName[],
  mechanism: Object.keys(mechanismGlyphs) as MechanismIconName[],
};
