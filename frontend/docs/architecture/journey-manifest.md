# Journey Manifest — schema v1

A Journey Manifest is the declarative experience/access contract of a Journey (root `AGENTS.md` §6). It lives in `packages/journey-manifests/src/journeys/<journey-key>.manifest.ts`.

```text
Journey
  ↓
Pages        (App, context, route path, Features rendered)
  ↓
Features     (key, name, description, optional extra access)
  ↓
Access requirements   (+ owner)
```

## Shape

```ts
defineJourneyManifest({
  schemaVersion: 1,
  journey: 'User',                 // PascalCase (= presentation-lake/src/Journeys/User)
  key: 'user',                     // kebab-case (URLs, Feature Management requests)
  description: '…',
  owner: { team: 'portal-core' },
  access: { authentication: 'authenticated', userTypes: ['interested', 'holder'] },
  features: [
    { key: 'user.change-password', name: 'Change password', description: '…' },
    {
      key: 'user.premium-benefits', name: 'Premium benefits', description: '…',
      access: { authentication: 'authenticated', capabilities: ['holder-premium', 'holder-diamond'] },
    },
  ],
  pages: [
    { key: 'management', name: 'Management', app: 'clients-webapp', context: 'common',
      path: '/user/management', features: ['user.change-password'] },
  ],
});
```

## Paths

A Page path is a sequence of static kebab-case segments and `:camelCase` parameters, each a whole segment: `/catalog/:id`. In the App routing layer a parameter becomes a bracketed folder (`src/app/catalog/[id]/index.vue`). Helpers in the package: `matchPagePath`, `buildPagePath`, `routeFolderOf`, `pathPatternError`. Two patterns that differ only in parameter names are the same route and are rejected.

## Access requirements

| Field | Meaning |
|---|---|
| `authentication: 'public'` | Everyone, including anonymous visitors. No other fields allowed. |
| `authentication: 'authenticated'` | Signed-in users only. |
| `userTypes` | Any-of. Omitted → every User Type. |
| `capabilities` | Any-of. Omitted → no Capability required. |

Feature access = Journey access **and** the Feature's own requirement (if any). A Feature cannot be public inside an authenticated Journey.

## Decision returned by Feature Management

```json
{
  "journey": "user",
  "granted": true,
  "reason": null,
  "features": { "user.change-password": true, "user.premium-benefits": false }
}
```

`reason` is `"unauthenticated"` (send to Login) or `"forbidden"` (signed in, no access) when `granted` is false.

## Validation

- `validateManifests()` (package tests): naming, unique keys, Feature namespaces, App contexts, known User Types/Capabilities, path syntax, unique routes.
- `pnpm architecture:validate`: every manifest Page has a route file and a `<Name>Page.vue`; every route file is declared by a manifest.

## Changing the schema

The schema is owned by architecture. Propose a new `schemaVersion`, then update the package, the server-side resolver (today the DEV mock backend), the Apps and the validator together (`agents/platform-evolution.md`).
