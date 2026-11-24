# Setting up Portal Guanabara on a Mac

A step-by-step guide from a fresh MacBook to the running app. Every step has a **check** so you know it worked before moving on.

Estimated time: 20–30 minutes (mostly downloads).

| # | Step | Why |
|---|---|---|
| 1 | Xcode Command Line Tools | git + compilers for native packages |
| 2 | Homebrew | installs everything else |
| 3 | fnm + Node.js 26 LTS | JavaScript runtime, pinned per project |
| 4 | pnpm 12 | package manager / workspaces |
| 5 | VS Code + Vue extension | editor with Vue/TypeScript support |
| 6 | Get the project | unzip + git init |
| 7 | Install dependencies | `pnpm install` |
| 8 | Verify | architecture, types, tests |
| 9 | Run | `pnpm dev:clients` |
| 10 | Storybook / build | optional |
| 11 | Nginx Product Identity | optional |

> All commands go into **Terminal** (⌘ + Space → “Terminal”). Lines starting with `#` are comments — don't paste them.

---

## 1. Xcode Command Line Tools

```bash
xcode-select --install
```

A dialog opens → **Install**. If it says *already installed*, you're fine.

**Check**

```bash
git --version        # git version 2.x
```

---

## 2. Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

At the end Homebrew prints **“Next steps”**. On Apple Silicon (M1–M4) run:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

(On an Intel Mac, Homebrew lives in `/usr/local` and is already on your PATH.)

**Check**

```bash
brew --version       # Homebrew 4.x or newer
brew doctor          # "Your system is ready to brew."
```

---

## 3. Node.js 26 LTS via fnm

We use **fnm** (Fast Node Manager) so each project can pin its own Node version. The repository contains a `.node-version` file with `26`.

```bash
brew install fnm
echo 'eval "$(fnm env --use-on-cd --version-file-strategy=recursive --shell zsh)"' >> ~/.zshrc
source ~/.zshrc

fnm install 26
fnm default 26
```

**Check**

```bash
node -v              # v26.x.x
npm -v
```

> Nuxt 4.6 supports Node `^22.22.3 || ^24.15.0 || >=26`. Node 26 is the current Active LTS (since 28 Oct 2026). If your company standardizes on Node 24, `fnm install 24` also works — just edit `.node-version`.

---

## 4. pnpm 12

Node 25+ no longer bundles Corepack, so install pnpm globally with npm:

```bash
npm install -g pnpm@12
```

**Check**

```bash
pnpm -v              # 12.x
```

The project pins `"packageManager": "pnpm@12.21.0"` in `package.json`; pnpm switches to that exact version automatically when you run it inside the repository.

> With fnm, global npm packages belong to a Node version. If you later install another Node version and `pnpm` disappears, rerun `npm install -g pnpm@12`.

---

## 5. Editor: VS Code + Vue extension

```bash
brew install --cask visual-studio-code
```

Open VS Code → Extensions (⇧⌘X) → install **“Vue (Official)”** (`Vue.volar`). The repository also recommends it in `.vscode/extensions.json`, so VS Code will suggest it when you open the folder.

Optional: in VS Code press ⇧⌘P → *Shell Command: Install 'code' command in PATH* so you can open folders with `code .`.

---

## 6. Get the project

Clone the repository (since v0.9.34 the web app lives in its `frontend/` folder, beside `backend/`):

```bash
mkdir -p ~/Projects
cd ~/Projects
git clone https://github.com/bvrio/portal-guanabara.git
cd portal-guanabara/frontend
```

Every command from here on runs inside `frontend/`.

**Check**

```bash
ls                   # AGENTS.md  README.md  apps  packages  docs  ...
node -v              # still v26.x (fnm reads .node-version on cd)
```

---

## 7. Install dependencies

```bash
pnpm install
```

This installs every workspace package, runs `nuxt prepare` for `clients-webapp` (generates `.nuxt/` types) and respects the committed `pnpm-lock.yaml`, so you get exactly the versions that were tested.

**Check** — the output ends with `Done in …` and no `ERR_PNPM_*` errors.

---

## 8. Verify the repository

```bash
pnpm verify          # architecture:validate + i18n:check + typecheck + test
```

or one by one:

```bash
pnpm architecture:validate
pnpm i18n:check
pnpm typecheck
pnpm test
```

**Check**

- `architecture:validate` prints **Architecture validation passed.** (the other Apps are out of scope and no longer listed as pending).
- `i18n:check` prints **✓ 480 messages valid and apps/clients-webapp/locales/pt-BR.json up to date.** and **✓ translations complete (en 480, es 480, fr 480).**
- `typecheck` finishes without errors.
- `test` reports **12 passed** (journey-manifests), **76 passed** (catalog-domain, including the API contract test), **200 passed** (presentation-lake) and **82 passed** (clients-webapp: 49 `unit` + 33 `nuxt`).

---

## 9. Run the app

```bash
pnpm dev:clients
```

Wait for `Ready … → http://127.0.0.1:3000/`, then open the routes:

| Route | Page |
|---|---|
| http://127.0.0.1:3000/ | Início — the catalogue panorama, drawer previews, guided tour |
| http://127.0.0.1:3000/catalog | Catálogo (tab) — every entry, search and filters |
| http://127.0.0.1:3000/institutions | Instituições — every institution; a click opens its entries |
| http://127.0.0.1:3000/map | Mapa — the municipalities around the bay; a click opens their entries |
| http://127.0.0.1:3000/about | Sobre nós — the FAPERJ project, the team and the scholarships |
| http://127.0.0.1:3000/catalog/1 | Catalog entry (workbook ID 1) |
| http://127.0.0.1:3000/authentication/login | Login |
| http://127.0.0.1:3000/authentication/registration | Registration |
| http://127.0.0.1:3000/authentication/reset-password | Reset password |
| http://127.0.0.1:3000/user/overview | User overview (hub) |
| http://127.0.0.1:3000/user/details | User details |
| http://127.0.0.1:3000/user/management | User management |

**Catalog walkthrough** — no login needed:

1. Open `/`: *estuda* in purple and *atua* in orange in the title; *Explorar o catálogo* in four cards (Iniciativas orange, Estudos purple, Instituições grey, Municípios green), bay sectors, keywords, mechanisms, **Estudos por academia** and highlights. Click a bar (e.g. *UFF* under Estudos por academia → 8 studies) → a side drawer opens with those entries; use **+ Filtro** to stack another filter (e.g. *Palavra-chave → Manguezal*); **Abrir no Catálogo** opens the list with every filter. The header's mark and *Portal Guanabara* fade in as the hero's large ones scroll under the bar. Mechanisms have their own icons; **Destaques** shows three small cards per kind. Click the orange **Começar o tour** for the guided tour: 7 short steps (6 on a phone) — the five tabs, **Opções**, Iniciativas × Estudos, the numbers, sectors, themes and the Catálogo tab.
2. Click the **Catálogo** tab (right after Início): change the type to *Estudos*, pick a *Situação*, a *Período* or an *Instituição* (type to search) → the URL and the results update; scroll — the filter panel stays at the top with the count, the sort and the pages; each active filter is a chip you can remove; **Limpar filtros** resets them.
3. Open **Instituições**: the same panel as the Catálogo — pick *Todos*, *Iniciativas* or *Estudos* beside the search, filter by *Papel* or *Tipo* (each becomes a chip you can remove), sort by name; click *UFF* → its entries open in the drawer.
   Open **Mapa** (or click *Municípios com atuação* on Início): municipalities are green (darker = more entries), orange badges count initiatives, purple circles studies (bigger = more); hover a municipality or a dashed sector zone — the box in the top-left corner is outlined in its colour and shows its initiatives and studies (point at a badge or circle to light its line); *Baía inteira* is the dashed pill over the sea; click *Niterói* or *Interior*, on the map → its entries open in the drawer; click a place's orange badge (or purple circle) to open only its initiatives (or studies). *Baía inteira* is in the *Setores da baía* list only.
   Open **Opções** (top right): pick a language by its flag (English, Español, Français) or a size (100% default, 110%, 120%) — both choices are remembered. Narrow the window: first the name and the words *Opções* and *Entrar* go, then the phone bar takes over. Keywords and sectors change language too; entry texts stay in Portuguese.
   Open **Sobre nós**: the project and its partners, **Quem faz o portal** — the two FAPERJ fellows and the Instituto BVRio team (photos still marked *Em construção*) — and the two FAPERJ scholarships.
   Make the window narrow (or open it on a phone) → the bar keeps the mark, **Entrar** (or your initials) and **☰**: Início, Catálogo, Instituições, Mapa, Sobre nós and **Idioma**, which opens to the four languages.
4. Open an entry (e.g. `/catalog/36`) → the header card: kind, ID, name, objective, *Publicado em 2019* and a place for a photo; then the reported results, **Onde | O quê**, **Ver detalhes do mapeamento** (closed) and **Fontes**; on the side the municipalities and, to their right, the sectors over the mini map (municipalities in green), and who takes part — click an institution to see its other entries in the drawer. In `nuxt dev` coordinators and authors are shown; untick `catalogPersonNames` in the DEV toolbar → names disappear and a note says they are hidden (the API stops sending them).
5. Open `/catalog/999` → *Entrada não encontrada* with HTTP 404.

**Persona walkthrough** (demo Journeys) — every account uses the password `teste1234`:

1. Open `/user/management` while logged out → you are sent to Login (and brought back after signing in).
2. Sign in as `titular@teste.com` → the header's **Entrar** becomes an avatar with the initials; Management shows *Dados pessoais*, *Senha* and *Preferências de comunicação*.
3. Back on *Minha conta*, click **Sair**; sign in as `interessado@teste.com` → no preferences section (holder-only Feature).
4. Sign in as `premium@teste.com` → *Minha conta* shows the **Benefícios Premium** card (holder-premium Capability).
5. Use the **DEV** toolbar (bottom-left) to switch persona instantly, or untick `homeGuidedTour` to turn the Home tour off.

The Catalog Services call the App's own API (`/api/catalog/*`); the demo Journeys call the local mock backend (`/mock-bff/*`). The browser console shows `[tracking] …` events. The mock backend keeps data in memory, so restarting the dev server resets it.

Edit `packages/presentation-lake/src/Shared/components/Button/Button.module.scss` while the server runs — the page updates instantly (HMR).

Stop the server with **Ctrl + C**.

---

## 10. Storybook and production build (optional)

```bash
pnpm storybook                         # http://localhost:6006
```

```bash
pnpm build                             # typechecks the packages, then nuxt build
pnpm --filter clients-webapp start     # serves .output on http://127.0.0.1:3000
```

In a build `catalogPersonNames` is off; to see names there, start it with `NUXT_PUBLIC_FEATURE_FLAGS_CATALOG_PERSON_NAMES=true`.

---

## 10b. Import the mapping workbook (when it changes)

Export the workbook as `.xlsx`, then:

```bash
pnpm catalog:import --file ~/Downloads/mapeamento.xlsx --dry-run   # validate, print the report
pnpm catalog:import --file ~/Downloads/mapeamento.xlsx             # write the snapshot and report
```

**Check** — `✓ Imported: 41 entries (24 initiatives, 17 studies) · 0 errors · N warnings`. Review `packages/catalog-domain/data/import-report.md` and commit it with `catalog-snapshot.json`. A rejected import (any error) leaves the snapshot unchanged and lists the rows to fix in the workbook.

After editing copy in any `*.messages.ts`, run `pnpm i18n:extract` and commit `apps/clients-webapp/locales/pt-BR.json`. New or changed messages also need their English, Spanish and French text in `apps/clients-webapp/locales/en.json`, `es.json` and `fr.json` (same id, same `{arguments}`): `i18n:extract` and `i18n:check` list what is missing.

---

## 11. Product Identity hostname via Nginx (optional)

To browse `http://portalguanabara.dev.com.br` instead of `127.0.0.1:3000`, follow [`dev/nginx/README.md`](../../dev/nginx/README.md). Not required for daily work.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `zsh: command not found: brew` | Rerun the two `brew shellenv` lines from step 2, then open a new Terminal. |
| `node -v` shows the wrong version | `fnm use` inside the repo; make sure the `fnm env` line is in `~/.zshrc`. |
| `pnpm: command not found` | `npm install -g pnpm@12` (see the fnm note in step 4). |
| `ERR_PNPM_IGNORED_BUILDS` | A new dependency needs a build script. Run `pnpm approve-builds`, or add it under `allowBuilds` in `pnpm-workspace.yaml`. |
| `Port 3000 is already in use` | `lsof -i :3000` to find the process, then `kill <PID>`. |
| `403 Blocked request. This host is not allowed.` | Add the hostname to `vite.server.allowedHosts` in `apps/clients-webapp/nuxt.config.ts`. |
| Red squiggles on `#imports` / `.vue` imports in VS Code | Run `pnpm --filter clients-webapp postinstall` (regenerates `.nuxt/`), then ⇧⌘P → *Vue: Restart Vue and TS servers*. |
| `vue-tsc` crashes after upgrading TypeScript | Keep TypeScript on **6.0.x**. TypeScript 7 (native) is not yet supported by `vue-tsc`. |
| Anything else after pulling changes | `pnpm install` again; as a last resort delete `node_modules` folders and `.nuxt/` and reinstall. |

---

## Versions this guide was written for (Nov 2026)

```text
Node.js            26 LTS (also supported: 22.22+, 24.15+)
pnpm               12.21.0
Turborepo          2.11.13
Nuxt               4.6.4
Vue                3.5.46
vue-router         5.5.1
TypeScript         6.0.3   (pinned)
vue-tsc            3.3.14
Vite               8.3.8
Vitest             5.1.1
Storybook          10.6.8
vue-intl           8.1.7
Sass               1.108.2
```
