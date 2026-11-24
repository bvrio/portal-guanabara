# Journey Constructor Agent

## Mission

Build a coherent product Journey across the Frontend and the Journey-facing side of the BFF while preserving the V9 architecture, implemented with Vue 3 and Nuxt 4.

## Inputs

- Journey requirements;
- design/Figma references;
- Journey Manifest;
- approved BFF contract or explicit mock contract proposal;
- existing Journey implementations;
- Presentation Lake and Storybook patterns;
- applicable Root, Frontend and BFF contracts.

## Outputs

Prefer independently reviewable changes:

```text
Frontend PR
+
BFF Journey/Application PR
```

When Backend work is required, coordinate through explicit contracts and keep the resulting changes independently reviewable.

## Workflow (manifest first)

```text
1. Journey Manifest   packages/journey-manifests/src/journeys/<journey>.manifest.ts
2. Route file         apps/<app>/src/app/<path>/index.vue
3. Page               apps/<app>/src/pages/<context>/<journey>/<page>/<Name>Page.vue
4. Hooks              apps/<app>/src/hooks/<context>/<journey>/use<Operation>.ts
5. Service            apps/<app>/src/services/<context>/<journey>/<Journey>Service.ts
6. Mock BFF operation apps/<app>/server/routes/mock-bff/...   (until the BFF exists)
7. Presentation       packages/presentation-lake/src/Journeys/<Journey>/  (or Shared)
8. pnpm architecture:validate && pnpm typecheck && pnpm test
```

## Frontend responsibilities

- Pages in the correct App/context group (`src/pages/<context>/<journey>/<page>/`);
- thin route files in `src/app/` (the Nuxt routing directory);
- Hooks (Vue composables named after the operation, e.g. `useGetUser`);
- Journey Service;
- Journey-specific presentation where justified;
- Shared Presentation promotion when justified by real cross-Journey reuse;
- i18n (`*.messages.ts` with vue-intl message descriptors);
- tests;
- tracking and observability integration.

## Rules

- Do not create a new App for a new Journey.
- Keep Pages, Hooks and Services in their global App responsibility directories.
- Group those directories by the App's User Type context where applicable.
- Do not put HTTP logic in Presentation Lake units.
- Do not let Presentation Lake depend on App code.
- Do not call Backend Domains directly from Frontend code.
- Do not make one Journey consume another Journey's private API contract.
- Use the Journey Manifest as the experience/access contract.
- Use Feature Management for experience availability.
- Do not use Feature Flags as authorization.
- Do not create a new Shared presentation implementation when an equivalent one exists.
- A genuinely new semantic presentation pattern starts under `packages/presentation-lake/src/Journeys/<Journey>`.
- Promote it to Shared only after real cross-Journey reuse exists.

## Authorization

The frontend requests Journey-scoped Feature Management.

Do not send self-declared Capabilities as the authority input.
The BFF derives User Type and Capabilities from authenticated context.

## Mock-first

When BFF/backend work is incomplete:

```text
Page → Hook → Service → Mock
```

Keep Hook and Service contracts stable so the same Page can later move to:

```text
Page → Hook → Service → BFF
```

## V0 seed

Current target Journeys:

```text
Authentication
Home
User
```

Current seed Pages:

```text
Authentication/Login
Authentication/Registration
Home/Home
User/Details
User/Management
```

Implemented in clients-webapp v0.2 (V0 seed complete):

```text
Authentication/Login            → /authentication/login
Authentication/Registration     → /authentication/registration
Authentication/ResetPassword    → /authentication/reset-password
Home/Home                       → /
User/Overview (hub)             → /user/overview
User/Details                    → /user/details
User/Management                 → /user/management
```
