import type { IconName } from '../../../Shared/foundations';

/**
 * Mechanism code → glyph (v0.9.18: all ten mechanisms of the vocabulary). A
 * code missing here — a mechanism added to the workbook later — falls back to
 * its monogram slot until a glyph is drawn.
 */
export const catalogMechanismIcons: Readonly<Partial<Record<string, IconName>>> = {
  transacional: 'mechanism-transactional',
  voluntaria: 'mechanism-volunteer',
  limpeza: 'mechanism-cleanup',
  contencao: 'mechanism-containment',
  educativa: 'mechanism-education',
  monitoramento: 'mechanism-monitoring',
  'reciclagem-e-destinacao': 'mechanism-recycling',
  'desenvolvimento-tecnologico': 'mechanism-technology',
  fiscalizacao: 'mechanism-enforcement',
  'incidencia-politica': 'mechanism-advocacy',
};
