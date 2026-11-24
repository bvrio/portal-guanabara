import type { AppName, Capability, UserType } from './catalog.ts';

/**
 * Journey Manifest schema — version 1.
 *
 * A Journey Manifest is the declarative experience/access contract of a
 * Journey (root AGENTS.md §6). It relates:
 *
 *   Journey → Pages → Features → Access requirements (+ ownership)
 *
 * The schema is owned by the architecture contracts. Feature work must not
 * extend it ad hoc — propose a schema change instead.
 */
export const JOURNEY_MANIFEST_SCHEMA_VERSION = 1;

/**
 * Declarative access requirement, resolved by the BFF (Feature Management)
 * against the authenticated context. The Frontend never evaluates it.
 *
 * - `authentication: 'public'`        → everyone, including anonymous visitors.
 * - `authentication: 'authenticated'` → signed-in users only, optionally
 *   narrowed by `userTypes` (any-of) and/or `capabilities` (any-of).
 */
export type AccessRequirement =
  | {
      readonly authentication: 'public';
      readonly userTypes?: never;
      readonly capabilities?: never;
    }
  | {
      readonly authentication: 'authenticated';
      readonly userTypes?: readonly UserType[];
      readonly capabilities?: readonly Capability[];
    };

/** A meaningful capability usage within the Journey. */
export interface FeatureManifest {
  /** `<journey-key>.<feature>` in kebab-case, e.g. `user.change-password`. */
  readonly key: string;
  readonly name: string;
  readonly description: string;
  /**
   * Additional requirement on top of the Journey access.
   * Omitted → anyone with Journey access gets the Feature.
   */
  readonly access?: AccessRequirement;
}

/** A concrete user-facing experience of the Journey inside one App. */
export interface PageManifest {
  /** kebab-case, unique within the Journey, e.g. `reset-password`. */
  readonly key: string;
  /** PascalCase; the implementation is `<Name>Page.vue`. */
  readonly name: string;
  readonly app: AppName;
  /** App context group (see APP_CONTEXTS), e.g. `common`. */
  readonly context: string;
  /**
   * Route path inside the App, e.g. `/user/overview`. Parameters are whole
   * `:camelCase` segments, e.g. `/catalog/:id` (route folder `catalog/[id]`).
   */
  readonly path: string;
  /** Features this Page renders (keys of this Journey's features). */
  readonly features: readonly string[];
}

export interface JourneyOwner {
  readonly team: string;
  readonly contact?: string;
}

export interface JourneyManifest {
  readonly schemaVersion: typeof JOURNEY_MANIFEST_SCHEMA_VERSION;
  /** PascalCase name, as in `presentation-lake/src/Journeys/<Journey>`. */
  readonly journey: string;
  /** kebab-case key used in URLs and Feature Management requests. */
  readonly key: string;
  readonly description: string;
  readonly owner: JourneyOwner;
  readonly access: AccessRequirement;
  readonly features: readonly FeatureManifest[];
  readonly pages: readonly PageManifest[];
}

/** Identity helper that keeps literal types (feature/page keys) for consumers. */
export function defineJourneyManifest<const M extends JourneyManifest>(manifest: M): M {
  return manifest;
}

export type FeatureKeyOf<M extends JourneyManifest> = M['features'][number]['key'];
export type PageKeyOf<M extends JourneyManifest> = M['pages'][number]['key'];
