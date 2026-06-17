# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo has a **nested structure**. The git root contains docs (`README.rst`,
`SPEC.rst`, `CHANGELOG.rst`), the Ansible `provision/` deployment, and a
placeholder `package-lock.json`. The **actual Vue application lives in the
`dtool-lookup-webapp/` subdirectory** — all `npm` commands must run from there.

```
dtool-lookup-webapp/           # git root (docs, provision/)
└── dtool-lookup-webapp/       # the Vue 3 SPA — cd here for all dev work
```

## Commands

All commands run from the inner `dtool-lookup-webapp/` directory:

```bash
npm install              # install deps + apply .env changes
npm run serve            # dev server (vue-cli-service)
npm run build            # production build -> dist/ (static SPA)
npm run lint             # eslint via vue-cli-service; CI runs `npm run lint src`
npm run type-check       # vue-tsc --noEmit (TS type checking)
npm run test             # vitest (watch mode)
npm run test:unit        # vitest run (one-shot; what CI runs)
npm run test:coverage    # vitest run --coverage
npx vitest run tests/unit/store.spec.ts          # run a single test file
npx vitest run -t "name of test"                 # run tests matching a name
```

CI (`.github/workflows/build-and-test.yml`) runs lint → build → test:unit on
Node 16 and 18.

## Configuration (`.env`)

The app is configured **at build time** via `VUE_APP_*` environment variables in
`dtool-lookup-webapp/.env` (not committed). `.env` changes only take effect after
re-running `npm install` / rebuilding. Key vars:

- `VUE_APP_DTOOL_LOOKUP_SERVER_URL` — dserver base URL (default `http://localhost:5000`)
- `VUE_APP_DTOOL_LOOKUP_SERVER_TOKEN_GENERATOR_URL` — OAuth2 token endpoint (default `${serverUrl}/auth/token`)
- `VUE_APP_DTOOL_LOOKUP_SERVER_AUTH_LOGOUT_URL` — logout endpoint (default `${serverUrl}/auth/logout`)
- `VUE_APP_AUTH_ENABLED` — set to `"false"` to run in **no-auth mode** (default: auth on). Exposed as `authEnabled` from `@/config`; see auth flow.
- Landing-page and user-menu customization vars (see `README.rst`)

All server endpoints are resolved in a single place — **`src/config.ts`** — so a
missing env var degrades consistently. Do not read `process.env.VUE_APP_*`
directly elsewhere; import from `@/config`.

## Architecture

A single-page Vue 3 (Composition API + `<script setup>`) app using **Vuetify 3**
for UI and **Pinia** for state. It is a pure client that talks to an external
**dserver** (`dtool-lookup-server`) REST API. `@` is aliased to `src/`.

### Backend client boundary

The app never calls the dserver REST API ad hoc. It depends on the external
**`dserver-client`** package (a local `file:../../dserver-client-js` dependency)
and wraps it in a single service:

- **`src/services/dserverApi.ts`** — exports the `dserverApi` singleton, a thin
  typed wrapper over `DServerClient`. All dataset/search/tag/annotation/user/
  base-URI/dependency-graph calls go through here. It also re-exports the
  client's types and error classes. Add new server interactions as methods here.

Exception: legacy **mongo queries** still go through `axios` directly to
`${lookup_url}/mongo/query` (see `searchDatasets` in `App.vue`).

### State (Pinia stores)

- **`src/store.ts`** (`useStore`, id `"main"`) — search/browse state: free-text &
  mongo query, facet filters (creator, base_uri, tags, uploaded_by), current
  dataset + its manifest/readme/annotations/tags, pagination, sort option, server
  versions, and `hasSignedUrlPlugin`.
- **`src/stores/auth.ts`** (`useAuthStore`) — JWT/session lifecycle. **Persisted
  to localStorage** (key `dtool-auth`). See auth flow below.
- **`src/stores/serverHealth.ts`** — polls dserver health (30s interval, 5s
  timeout); drives the "Server Unavailable" guard.
- **`src/stores/notifications.ts`** — snackbar notifications.

Pinia + `pinia-plugin-persistedstate` are registered in `src/main.ts`, which also
defines the Vuetify `dtoolTheme` (purple) and component defaults.

### Authentication flow

**No-auth mode**: when `authEnabled` is `false` (`VUE_APP_AUTH_ENABLED=false`),
`auth.ts` short-circuits — `initialize()` sets an empty token on `dserverApi` and
reports status `"authenticated"`, while `login`/`logout`/`checkAuth` become
no-ops. The app skips the SignIn guard entirely and relies on an open dserver.
Everything below applies only when auth is enabled.

OAuth2 via the dserver token generator; the JWT **never rides in a query param**
(avoids leaking into history/logs). `auth.initialize()` resolves a token in
priority order:

1. **URL fragment** (`#token=...`, default OAuth2 callback mode) — consumed, then
   the URL is cleaned via `history.replaceState`.
2. **Cookie-only mode** — `fetchSessionToken()` GETs the token endpoint
   `withCredentials` (used when `OAUTH2_DELIVER_TOKEN_IN_FRAGMENT=false`).
3. **Persisted token** from localStorage.

`login()` verifies the token by calling `getCurrentUser()`; a 401/403 means
authenticated-but-not-registered → status `"unauthorized"`. Admin status and
search/register permissions come from that response. A timer auto-logs-out at
token expiry; `logout()` also POSTs the logout endpoint to kill the server
session. Auth `status` (`idle`/`authenticated`/`unauthenticated`/`unauthorized`/
`error`) gates the top-level views in `App.vue`.

### App shell & views

**`App.vue`** (~900 lines) is the orchestrator. It renders one of four states in
priority order: initializing → server-unhealthy → sign-in → authenticated. The
authenticated view switches between `currentView` `"datasets"` (browser) and
`"users"` (admin-only `UserManagement`). It builds the `SearchQuery` from store
filters and owns `searchDatasets()`. Components in `src/components/` are
presentational (DatasetTable, DatasetReadme, DatasetManifest, TextSearch,
SignIn, UserMenu, etc.) and communicate up via events like `@start-search`.

Pagination relies on the server's `X-Pagination` header (flask-smorest); note the
recent fix normalizing this header for the mongo query branch.

## Deployment

Production build is a static SPA served by nginx, provisioned with Ansible. Build,
tarball `dist/`, and run the playbook per `provision/README.rst`.
