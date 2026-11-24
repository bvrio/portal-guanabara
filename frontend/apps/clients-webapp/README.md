# clients-webapp

Client-facing Nuxt Web App for Common, Interested and Holder Journeys.

```bash
pnpm --filter clients-webapp dev   # http://127.0.0.1:3000
```

Folder map:

```text
src/
├── app.vue          root component (Next.js app/layout.tsx)
├── app/             routing layer — thin route files (Nuxt pages dir)
├── pages/           Page implementations grouped by context/journey
├── hooks/           Hooks (Vue composables) grouped by context/journey
├── services/        Journey Service facades (BFF or mock)
├── shared/          App-local shared infrastructure
├── providers/       IntlProvider, LinkProvider (NuxtLink adapter)
└── lib/             bff client, createOperation (not hooks)

server/              mock BFF (DEV) — see server/README.md
.env.example         BFF URL, mock switch, Feature Flags
```

See:
- repository root `AGENTS.md`;
- `apps/AGENTS.md`;
- `src/shared` for App-local shared infrastructure.
