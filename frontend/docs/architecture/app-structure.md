# App Structure

Every Nuxt Web App follows:

```text
<app>/
├── nuxt.config.ts     srcDir: 'src', dir.pages: 'app'
├── server/            mock BFF (DEV only, until the real BFF exists)
└── src/
    ├── app.vue        root component (providers + <NuxtPage /> + DEV toolbar)
    ├── app/           routing layer — thin index.vue route files
    ├── pages/         Page implementations
    ├── hooks/         Hooks (Vue composables)
    ├── services/      Journey Service facades (BFF)
    ├── shared/
    │   ├── hooks/     feature-management · feature-flag · tracking · navigation · alerts
    │   ├── services/  feature-management
    │   └── dev/       DEV toolbar
    ├── providers/     IntlProvider · LinkProvider
    └── lib/           bff client · createOperation (never named use*)
```

`pages`, `hooks`, and `services` are responsibility-oriented global directories grouped by App context, then by Journey:

```text
src/pages/common/user/management/ManagementPage.vue
src/hooks/common/user/useChangePassword.ts
src/services/common/user/UserService.ts
```

## clients-webapp (bootstrapped)

```text
common/
interested/
holder/
```

## partners-webapp (planned)

```text
partner/
```

## backoffice-webapp (planned)

```text
common/
backoffice/
engineer/
```
