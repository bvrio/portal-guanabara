import { institutionLogoFiles, municipalityFlagFiles } from './emblems';

export interface Emblems {
  /** URL of the municipality's official flag, when BVRio has supplied it. */
  municipalityFlag(slug: string): string | undefined;
  /** URL of the institution's official logo, when authorised and supplied. */
  institutionLogo(slug: string): string | undefined;
}

export function createEmblems(
  flags: Readonly<Record<string, string>> = municipalityFlagFiles,
  logos: Readonly<Record<string, string>> = institutionLogoFiles,
): Emblems {
  return {
    municipalityFlag: (slug) => (flags[slug] ? `/emblems/municipalities/${flags[slug]}` : undefined),
    institutionLogo: (slug) => (logos[slug] ? `/emblems/institutions/${logos[slug]}` : undefined),
  };
}

const emblems = createEmblems();

/** Official flags and logos for the Pages (see `emblems.ts`). */
export function useEmblems(): Emblems {
  return emblems;
}
