# Area — Monorepo (Web + Mobile)

This repository now contains two separate client targets:

- `web/` — Next.js desktop web client
- `mobile/` — Expo React Native mobile client (iOS & Android)

Quick start (macOS):

1) Install dependencies (recommended using npm workspaces from the repo root):

```bash
# Install all workspace packages from repo root
npm install
```

Alternatively install per-package (not recommended if you're using workspaces):

```bash
# Web
cd web
npm install

# Mobile
cd ../mobile
npm install
```

2) Run the web app:

```bash
cd web
npm run dev
```

Open http://localhost:3000

3) Run the mobile app (Expo):

```bash
cd mobile
npm run start
# then open on a device or emulator using the Expo Dev Tools
```

- The scaffolds are minimal starters. You may want to align dependency versions (especially `react`) between `web/`, `mobile/`, and the root package if you plan to share code.
- iOS builds require a macOS machine with Xcode installed.
- For a production-ready migration we should:
Notes:
- This repository is now configured as an npm workspace. Run `npm install` at the repo root to install all workspace packages and create symlinks between them.
- The `src/` directory is exposed as a workspace package named `@area/src` and is available to both `web` and `mobile` via workspace resolution.
- A new shared UI workspace package `packages/ui` is available as `@area/ui`. Platform-specific implementations live under `packages/ui/src/components/*` using `.web.tsx` and `.native.tsx` files. `web` and `mobile` are configured to consume `@area/ui`.
- The scaffolds are minimal starters. You may need to adapt UI code in `src/` for React Native (mobile) vs React (web) because view components are not directly compatible.
- iOS builds require a macOS machine with Xcode installed.
- For a production-ready migration we should:
- The scaffolds are minimal starters. You may want to align dependency versions (especially `react`) between `web/`, `mobile/`, and the root package if you plan to share code.
- iOS builds require a macOS machine with Xcode installed.
- For a production-ready migration we should:
  - Decide on a monorepo strategy (workspaces) or keep separate package installations.
  - Extract shared code into a `packages/` folder and configure aliasing/metro/webpack.
  - Add CI steps, coding conventions, and platform-specific configs.

If you want, I can:
- Convert this into a proper monorepo with `pnpm`/`yarn` workspaces and shared packages.
- Add a shared `ui/` package with cross-platform components and configure bundlers.
