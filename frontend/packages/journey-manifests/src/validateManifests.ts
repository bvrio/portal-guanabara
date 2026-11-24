import { APP_CONTEXTS, CAPABILITIES, USER_TYPES } from './catalog.ts';
import { pathPatternError } from './paths.ts';
import {
  JOURNEY_MANIFEST_SCHEMA_VERSION,
  type AccessRequirement,
  type JourneyManifest,
} from './schema.ts';

const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;
const KEBAB_CASE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function validateAccess(where: string, access: AccessRequirement, errors: string[]) {
  if (access.authentication !== 'public' && access.authentication !== 'authenticated') {
    errors.push(`${where}: authentication must be "public" or "authenticated"`);
    return;
  }

  if (access.authentication === 'public') {
    const { userTypes, capabilities } = access as { userTypes?: unknown; capabilities?: unknown };
    if (userTypes || capabilities) {
      errors.push(`${where}: public access cannot declare userTypes or capabilities`);
    }
    return;
  }

  for (const userType of access.userTypes ?? []) {
    if (!(USER_TYPES as readonly string[]).includes(userType)) {
      errors.push(`${where}: unknown User Type "${userType}"`);
    }
  }
  for (const capability of access.capabilities ?? []) {
    if (!(CAPABILITIES as readonly string[]).includes(capability)) {
      errors.push(`${where}: unknown Capability "${capability}"`);
    }
  }
  if (access.userTypes && access.userTypes.length === 0) {
    errors.push(`${where}: userTypes must not be empty (omit it to allow every User Type)`);
  }
  if (access.capabilities && access.capabilities.length === 0) {
    errors.push(`${where}: capabilities must not be empty (omit it to require none)`);
  }
}

/**
 * Structural validation of a set of manifests. Returns human-readable errors
 * (empty array = valid). Filesystem checks (route files, Page implementations)
 * live in scripts/validate-architecture.mjs.
 */
export function validateManifests(manifests: readonly JourneyManifest[]): string[] {
  const errors: string[] = [];
  const journeyKeys = new Set<string>();
  const featureKeys = new Set<string>();
  const routes = new Set<string>();

  for (const manifest of manifests) {
    const at = `Journey "${manifest.key}"`;

    if (manifest.schemaVersion !== JOURNEY_MANIFEST_SCHEMA_VERSION) {
      errors.push(`${at}: unsupported schemaVersion ${String(manifest.schemaVersion)}`);
    }
    if (!PASCAL_CASE.test(manifest.journey)) errors.push(`${at}: journey must be PascalCase`);
    if (!KEBAB_CASE.test(manifest.key)) errors.push(`${at}: key must be kebab-case`);
    if (journeyKeys.has(manifest.key)) errors.push(`${at}: duplicated Journey key`);
    journeyKeys.add(manifest.key);
    if (!manifest.description.trim()) errors.push(`${at}: description is required`);
    if (!manifest.owner?.team?.trim()) errors.push(`${at}: owner.team is required`);

    validateAccess(`${at} access`, manifest.access, errors);

    const ownFeatures = new Set<string>();
    for (const feature of manifest.features) {
      const where = `${at} feature "${feature.key}"`;
      const [prefix, name] = feature.key.split('.');

      if (prefix !== manifest.key || !name || !KEBAB_CASE.test(name) || feature.key.split('.').length !== 2) {
        errors.push(`${where}: key must be "${manifest.key}.<kebab-case>"`);
      }
      if (featureKeys.has(feature.key)) errors.push(`${where}: duplicated Feature key`);
      featureKeys.add(feature.key);
      ownFeatures.add(feature.key);

      if (feature.access) {
        validateAccess(`${where} access`, feature.access, errors);
        if (manifest.access.authentication === 'authenticated' && feature.access.authentication === 'public') {
          errors.push(`${where}: cannot be public inside an authenticated Journey`);
        }
      }
    }

    const pageKeys = new Set<string>();
    for (const page of manifest.pages) {
      const where = `${at} page "${page.key}"`;

      if (!KEBAB_CASE.test(page.key)) errors.push(`${where}: key must be kebab-case`);
      if (pageKeys.has(page.key)) errors.push(`${where}: duplicated Page key`);
      pageKeys.add(page.key);
      if (!PASCAL_CASE.test(page.name)) errors.push(`${where}: name must be PascalCase`);

      const contexts = APP_CONTEXTS[page.app] as readonly string[] | undefined;
      if (!contexts) {
        errors.push(`${where}: unknown App "${page.app}"`);
      } else if (!contexts.includes(page.context)) {
        errors.push(`${where}: context "${page.context}" is not valid for ${page.app}`);
      }

      const pathError = pathPatternError(page.path);
      if (pathError) errors.push(`${where}: ${pathError}`);
      // Two patterns that differ only in parameter names are the same route.
      const route = `${page.app}:${page.path.replace(/:[A-Za-z0-9]+/g, ':param')}`;
      if (routes.has(route)) errors.push(`${where}: route ${route} is declared twice`);
      routes.add(route);

      for (const featureKey of page.features) {
        if (!ownFeatures.has(featureKey)) {
          errors.push(`${where}: references unknown Feature "${featureKey}"`);
        }
      }
    }

    if (manifest.pages.length === 0) errors.push(`${at}: at least one Page is required`);
  }

  return errors;
}
