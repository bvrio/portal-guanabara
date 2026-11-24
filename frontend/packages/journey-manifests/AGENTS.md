# Journey Manifests Contract

## Purpose

`@portal-guanabara/journey-manifests` holds the **Journey Manifests**: the declarative experience/access contract of each Journey (root `AGENTS.md` §6).

```text
Journey
  ↓
Pages        (per App, context and route)
  ↓
Features
  ↓
Access requirements  (+ owner)
```

## Consumers

```text
DEV mock backend     → resolves access requirements (Feature Management of the demo Journeys)
Apps                 → derive routes and tracking context (never evaluate access)
CI                   → pnpm architecture:validate cross-checks manifests ↔ filesystem
Docs / Coding Agents → structured Journey context
```

## Rules

- The schema (`src/schema.ts`) is owned by the architecture. Feature work must not extend it ad hoc; propose a schema change (new `schemaVersion`) and update every consumer.
- One file per Journey: `src/journeys/<journey-key>.manifest.ts`, registered in `src/index.ts`.
- Feature keys are `<journey-key>.<kebab-case>`; Page keys are kebab-case; Page names are PascalCase and match `<Name>Page.vue`.
- Page paths are static kebab-case segments and whole `:camelCase` parameters (`/catalog/:id`); the route file is `src/app/catalog/[id]/index.vue`. Use `matchPagePath` / `buildPagePath` / `routeFolderOf` from `src/paths.ts` instead of string handling.
- Access requirements describe **who**, never **how**: User Types and Capabilities only. No Feature Flags here (they are temporary frontend controls), no UI details.
- To temporarily remove a Feature from a user group for operational reasons, change its access requirement — do not add a Feature Flag (root `AGENTS.md` §8).
- The Frontend must never evaluate access requirements itself; it consumes BFF decisions.
- Ownership describes responsibility, not dependencies.
- Relative imports keep explicit `.ts` extensions so plain Node (type stripping) can load the manifests in validation scripts.

## Verification

```bash
pnpm --filter @portal-guanabara/journey-manifests test
pnpm architecture:validate
```
