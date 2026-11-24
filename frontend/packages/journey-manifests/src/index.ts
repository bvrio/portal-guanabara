import { aboutManifest } from './journeys/about.manifest.ts';
import { authenticationManifest } from './journeys/authentication.manifest.ts';
import { catalogManifest } from './journeys/catalog.manifest.ts';
import { homeManifest } from './journeys/home.manifest.ts';
import { institutionsManifest } from './journeys/institutions.manifest.ts';
import { mapManifest } from './journeys/map.manifest.ts';
import { userManifest } from './journeys/user.manifest.ts';
import type { JourneyManifest } from './schema.ts';

export * from './catalog.ts';
export * from './schema.ts';
export * from './paths.ts';
export { validateManifests } from './validateManifests.ts';

export {
  aboutManifest,
  authenticationManifest,
  catalogManifest,
  homeManifest,
  institutionsManifest,
  mapManifest,
  userManifest,
};

/** Every Journey Manifest of the platform. */
export const journeyManifests = [
  aboutManifest,
  authenticationManifest,
  catalogManifest,
  homeManifest,
  institutionsManifest,
  mapManifest,
  userManifest,
] as const;

export type JourneyKey = (typeof journeyManifests)[number]['key'];
export type FeatureKey = (typeof journeyManifests)[number]['features'][number]['key'];

/** Feature keys of one Journey, e.g. `JourneyFeatureKey<'user'>`. */
export type JourneyFeatureKey<K extends JourneyKey> = Extract<
  (typeof journeyManifests)[number],
  { key: K }
>['features'][number]['key'];

export function getJourneyManifest(key: string): JourneyManifest | undefined {
  return journeyManifests.find((manifest) => manifest.key === key);
}
