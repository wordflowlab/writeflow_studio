# Repository Guidelines

输出中文

## Project Structure & Module Organization
- `src/` React + TypeScript app (components, pages, hooks, lib, store).
- `src-tauri/` Tauri Rust backend (commands, models, services, `main.rs`).
- `docs/` Project documentation; `data/` sample assets; `dist/` build output.
- Entrypoints: `src/main.tsx`, `src/App.tsx`, desktop config in `src-tauri/tauri.conf.json`.

## Build, Test, and Development Commands
- `npm run dev` — Start Vite dev server (web UI only).
- `npm run tauri:dev` — Run desktop app with Tauri dev.
- `npm run build` — Type-check and build the web app.
- `npm run tauri:build` — Build production desktop binaries.
- `npm run preview` — Preview built web app.
- `npm run lint` — Lint with ESLint.
- `npm run format` — Format with Prettier.
- `npm run test` / `npm run test:ui` — Run Vitest (CLI/UI).

## Coding Style & Naming Conventions
- TypeScript, 2-space indent, semicolons optional per Prettier.
- React components/pages: `PascalCase.tsx` (e.g., `src/pages/ProjectsPage.tsx`).
- Hooks: `use-*.ts` (e.g., `src/hooks/use-toast.ts`).
- Utilities/store: lower-case files (e.g., `src/lib/utils.ts`, `src/store/app.ts`).
- Prefer function components and hooks; no class components.
- Keep presentational styles in Tailwind classes; avoid inline styles.

## Testing Guidelines
- Framework: Vitest. Place tests next to code as `*.test.ts(x)`.
- Test public behavior of components and stores; mock Tauri APIs when needed.
- Run tests locally with `npm run test`; keep fast and deterministic.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- PRs: clear description, linked issues, screenshots for UI changes.
- Before opening PR: `npm run lint`, `npm run build`, and tests are green.

## Security & Configuration Tips
- Do not commit secrets. Configure providers via env/OS keychain; avoid hardcoding.
- Review `src-tauri/tauri.conf.json` before release; check permissions/plugins.
- Large or generated data stays out of VCS; prefer `data/` for local samples.

## Agent-Specific Instructions
- Follow these rules for any changes within their directory scopes.
- Make minimal, targeted patches; avoid unrelated refactors.
- Use the provided npm/tauri scripts; don’t invoke toolchains directly unless necessary.
