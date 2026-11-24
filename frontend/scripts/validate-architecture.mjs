/**
 * Architecture validation for the Portal Guanabara frontend monorepo.
 *
 * 1. Skeleton: required contracts/folders exist; forbidden taxonomies do not.
 * 2. Journey Manifests: structurally valid and in sync with route files and
 *    Page implementations (loaded with Node's built-in TypeScript stripping).
 * 3. Boundaries: import rules from apps/AGENTS.md §5 are enforced by
 *    scanning source files (lightweight regex checks — no build needed).
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

// ---------------------------------------------------------------- skeleton
const required = [
  'AGENTS.md',
  'apps/AGENTS.md',
  'packages/presentation-lake/AGENTS.md',
  'agents/journey-constructor.md',
  'agents/platform-evolution.md',
  'apps/clients-webapp',
  'apps/clients-webapp/src/app',
  'apps/clients-webapp/src/pages',
  'apps/clients-webapp/src/hooks',
  'apps/clients-webapp/src/services',
  'apps/clients-webapp/src/shared',
  'apps/clients-webapp/src/providers',
  'apps/clients-webapp/src/lib',
  'packages/presentation-lake/src/Journeys',
  'packages/presentation-lake/src/Shared/foundations',
  'packages/presentation-lake/src/Shared/primitives',
  'packages/presentation-lake/src/Shared/components',
  'packages/presentation-lake/src/Shared/features',
  'packages/presentation-lake/src/Utils',
  'packages/journey-manifests/AGENTS.md',
  'packages/journey-manifests/src/schema.ts',
  'apps/clients-webapp/src/shared/services/feature-management',
  'apps/clients-webapp/src/shared/hooks/feature-management',
  'apps/clients-webapp/src/shared/hooks/feature-flag',
  'apps/clients-webapp/src/shared/hooks/tracking',
  'packages/catalog-domain/AGENTS.md',
  'packages/catalog-domain/src/contracts/index.ts',
  'packages/catalog-domain/data/catalog-snapshot.json',
];

// The other Apps of the template (partners-webapp, backoffice-webapp,
// clients-app, partners-app) are out of scope: BVRio decided on one public
// web app with no BFF (November 2026; Core v2.0 D-042). Bringing one back is a
// contracts change (root AGENTS.md §4), not a feature task.

const forbidden = [
  // One-App-per-User-Type is not allowed.
  'apps/engineer-webapp',
  'apps/interested-webapp',
  'apps/holder-webapp',
  // Feature Management is App-local shared infrastructure.
  'apps/clients-webapp/src/feature-management',
  // Nuxt auto-import/auto-register folders bypass explicit boundaries.
  'apps/clients-webapp/src/components',
  'apps/clients-webapp/src/composables',
  'apps/clients-webapp/src/utils',
  'packages/presentation-lake/src/Journeys/Shared',
];

for (const entry of required) {
  if (!fs.existsSync(path.join(root, entry))) errors.push(`Missing: ${entry}`);
}
for (const entry of forbidden) {
  if (fs.existsSync(path.join(root, entry))) errors.push(`Forbidden path present: ${entry}`);
}

for (const file of [
  'package.json',
  'turbo.json',
  'apps/clients-webapp/package.json',
  'packages/presentation-lake/package.json',
  'packages/journey-manifests/package.json',
  'packages/catalog-domain/package.json',
  'packages/catalog-domain/data/catalog-snapshot.json',
]) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  } catch (error) {
    errors.push(`Invalid JSON: ${file} (${error.message})`);
  }
}

// Nuxt routing directory must be src/app so src/pages stays the Page layer.
const nuxtConfig = path.join(root, 'apps/clients-webapp/nuxt.config.ts');
if (fs.existsSync(nuxtConfig)) {
  const source = fs.readFileSync(nuxtConfig, 'utf8');
  if (!/pages:\s*['"]app['"]/.test(source)) {
    errors.push('apps/clients-webapp/nuxt.config.ts must set dir.pages = "app"');
  }
}

// -------------------------------------------------------- journey manifests
const appRoots = { 'clients-webapp': path.join(root, 'apps/clients-webapp/src') };

try {
  const manifests = await import(path.join(root, 'packages/journey-manifests/src/index.ts'));

  for (const error of manifests.validateManifests(manifests.journeyManifests)) {
    errors.push(`Journey Manifest: ${error}`);
  }

  const declaredRoutes = new Map();

  for (const manifest of manifests.journeyManifests) {
    for (const page of manifest.pages) {
      const appSrcDir = appRoots[page.app];
      if (!appSrcDir) continue; // App not bootstrapped yet.

      const routeFile = path.join(appSrcDir, 'app', manifests.routeFolderOf(page.path), 'index.vue');
      declaredRoutes.set(path.relative(root, routeFile), `${manifest.key}/${page.key}`);
      if (!fs.existsSync(routeFile)) {
        errors.push(`Journey Manifest ${manifest.key}/${page.key}: missing route file ${path.relative(root, routeFile)}`);
      }

      const pageFile = `${page.name}Page.vue`;
      const candidates = [
        path.join(appSrcDir, 'pages', page.context, manifest.key, page.key, pageFile),
        path.join(appSrcDir, 'pages', page.context, manifest.key, pageFile),
      ];
      if (!candidates.some((candidate) => fs.existsSync(candidate))) {
        errors.push(
          `Journey Manifest ${manifest.key}/${page.key}: missing Page implementation ${path.relative(root, candidates[0])}`,
        );
      }
    }
  }

  // Every route file must be declared by a Journey Manifest.
  const routeDir = path.join(appRoots['clients-webapp'], 'app');
  const routeFiles = fs.existsSync(routeDir)
    ? fs.readdirSync(routeDir, { recursive: true }).filter((file) => String(file).endsWith('.vue'))
    : [];
  for (const file of routeFiles) {
    const relative = path.relative(root, path.join(routeDir, String(file)));
    if (!declaredRoutes.has(relative)) {
      errors.push(`Route file not declared in any Journey Manifest: ${relative}`);
    }
  }
} catch (error) {
  errors.push(`Could not load Journey Manifests (Node 22.18+ is required): ${error.message}`);
}

// -------------------------------------------------------------- boundaries
const SOURCE_EXT = new Set(['.ts', '.vue']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(full);
    return SOURCE_EXT.has(path.extname(entry.name)) ? [full] : [];
  });
}

function importsOf(file) {
  const source = fs.readFileSync(file, 'utf8');
  return [...source.matchAll(/(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

/** Value (non type-only) imports, e.g. to keep server code out of the browser bundle. */
function valueImportsOf(file) {
  const source = fs.readFileSync(file, 'utf8');
  return [...source.matchAll(/(import|export)\s+(type\s)?[^'"]*?from\s+['"]([^'"]+)['"]/g)]
    .filter((m) => !m[2])
    .map((m) => m[3]);
}

function rel(file) {
  return path.relative(root, file);
}

function check(files, rule, isViolation) {
  for (const file of files) {
    for (const specifier of importsOf(file)) {
      if (isViolation(specifier, file)) errors.push(`${rule}: ${rel(file)} imports "${specifier}"`);
    }
  }
}

const appSrc = path.join(root, 'apps/clients-webapp/src');
const appServer = path.join(root, 'apps/clients-webapp/server');
const lakeSrc = path.join(root, 'packages/presentation-lake/src');
const manifestsSrc = path.join(root, 'packages/journey-manifests/src');
const domainSrc = path.join(root, 'packages/catalog-domain/src');

const routeFiles = walk(path.join(appSrc, 'app'));
const pageFiles = walk(path.join(appSrc, 'pages'));
const hookFiles = walk(path.join(appSrc, 'hooks'));
const serviceFiles = walk(path.join(appSrc, 'services'));
const lakeFiles = walk(lakeSrc);
const appFiles = walk(appSrc);
const serverFiles = walk(appServer);
const manifestFiles = walk(manifestsSrc);
const domainFiles = walk(domainSrc);

check(routeFiles, 'Route files must stay thin and only delegate to Pages', (s) => !s.startsWith('~/pages/'));
check(pageFiles, 'Page → Service is forbidden (use a Hook)', (s) => s.includes('/services/'));
check(hookFiles, 'Hook → Hook is forbidden', (s, file) =>
  s.includes('/hooks/') || (/^\.\.?\//.test(s) && /\/use[A-Z]/.test(s) && !file.endsWith('index.ts')));
check(serviceFiles, 'Service → Presentation is forbidden', (s) => s.includes('presentation-lake'));
check(lakeFiles, 'Presentation Lake must not depend on App code, routing or Nuxt', (s) =>
  s.startsWith('~') || s.startsWith('#') || s.startsWith('@/') || /^(nuxt|vue-router|#app)/.test(s));
check(lakeFiles, 'Presentation Lake must not depend on authorization contracts', (s) =>
  s.includes('journey-manifests'));
check(appFiles, 'Frontend code must not import the (mock) BFF implementation', (s) =>
  s.includes('/server/') || s.startsWith('~~/server'));
check(serverFiles, 'Server routes must not import Frontend code or presentation', (s) =>
  s.startsWith('~') || s.startsWith('@/') || s.includes('/src/') ||
  /^(#app|#components|vue$|vue-router)/.test(s) || s.includes('presentation-lake'));
check(manifestFiles, 'Journey Manifests are declarative: no App, BFF or presentation imports', (s) =>
  !(s.startsWith('.') || s.startsWith('node:')));
// Tests may also use the JSON Schema validator that checks the API contract (openapi.json).
const DOMAIN_TEST_TOOLS = ['vitest', 'ajv/dist/2020.js', 'ajv-formats'];
check(domainFiles, 'The Catalog Domain is framework-free: no Vue, Nuxt, App or presentation imports', (s, file) =>
  !(
    s.startsWith('.') ||
    s.startsWith('node:') ||
    s.startsWith('read-excel-file') ||
    (file.endsWith('.tests.ts') && DOMAIN_TEST_TOOLS.includes(s))
  ));
check(lakeFiles, 'Presentation Lake must not depend on the Catalog Domain', (s) => s.includes('catalog-domain'));
check(appFiles, 'Frontend code reads the catalog through /api (import only catalog-domain/contracts)', (s) =>
  s.startsWith('@portal-guanabara/catalog-domain') && s !== '@portal-guanabara/catalog-domain/contracts');
for (const file of appFiles) {
  for (const specifier of valueImportsOf(file)) {
    if (specifier === '@portal-guanabara/catalog-domain/contracts') {
      errors.push(`Catalog contracts are types only (use "import type"): ${rel(file)}`);
    }
  }
}

// ------------------------------------------------------------------ report
for (const warning of warnings) console.warn(`• ${warning}`);

if (errors.length) {
  console.error('\nArchitecture validation failed:');
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exit(1);
}

console.log('Architecture validation passed.');
