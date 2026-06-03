# CLAUDE.md

Guidance for Claude Code when working in the `koin` repository.

## What this project is

**Koin** is a minimalist, high-performance **currency conversion** app, built as a
Bun-workspaces monorepo. Three workspaces:

- **`apps/app`** — the **mobile client**: a React Native / Expo app (Expo Router for
  file-based routing, `react-native-unistyles` for styling, `@tanstack/react-query`
  for server state, `react-native-mmkv` for local storage). This is what the end user
  installs; it lets them convert currencies and includes onboarding and a "travel"
  screen.
- **`apps/api`** — the **backend exchange-rate service**: a lightweight `Bun.serve()`
  HTTP server. A background scheduler (`src/updater.ts`) periodically fetches exchange
  rates into **Redis** (`src/redis.ts`), and the server exposes them via a single
  read endpoint, roughly `GET /rates/:base` (e.g. `/rates/USD`), returning the cached
  rates. Failures during a currency update are reported to **Discord** (`src/discord.ts`).
  The app consumes this API for its conversion data.
- **`packages/shared`** — TypeScript types, constants, and utilities shared by both.

For the full human-facing overview and tech stack, see the [README](./README.md).

## Running bun (IMPORTANT)

This project uses **bun** as its package manager and runtime, but bun is installed
and pinned via **mise** (see `.mise.toml`, currently `bun = "1.3.9"`). It is **not**
guaranteed to be on the bare `PATH`.

Whenever you run a `bun` command (or anything that shells out to bun, including the
`bun run …` scripts in `package.json`), invoke it through mise:

```bash
mise exec -- bun install
mise exec -- bun run check:all
mise exec -- bun test
mise exec -- bun run api:dev
```

Equivalently you can prefix with `mise x --`. Do not call bare `bun` — it may resolve
to the wrong version or not be found at all.

## Project overview & conventions

This repo already has a detailed agent guide. Follow it for project structure, build
commands, code style, testing, and the frontend/backend conventions:

@AGENTS.md

When that guide shows a command as `bun …`, run it as `mise exec -- bun …` per the
section above.
