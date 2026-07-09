# AGENTS.md

Angular 21 single-page application. Single package (not a monorepo). Didactic/educational project — most features are stubs.

## Essential commands

```bash
npm start          # dev server → http://localhost:4200  (ng serve)
npm run build      # production build → dist/            (default config is production)
npm test           # unit tests with Vitest              (ng test)
npx prettier --write .  # format — no npm script defined for this
```

`ng build` without flags builds **production** (minified, hashed, budget-checked). Use `--configuration development` for a dev build.

No standalone typecheck script — TypeScript errors surface through `ng build`.

## Package manager

Locked to **npm** via `"packageManager": "npm@10.8.2"` in `package.json`. Do not use yarn or pnpm.

## Toolchain quirks

- **Test runner is Vitest**, not Karma/Jest. Builder: `@angular/build:unit-test`.
- Vitest globals (`describe`, `it`, `expect`) are available in spec files without imports — `tsconfig.spec.json` injects `"vitest/globals"` into `types`.
- **No ESLint configured.** `@angular-eslint` has not been added; there is no lint command.
- `ng e2e` has no framework installed — it will prompt or fail. Playwright/Cypress must be added separately.
- Prettier is configured (`.prettierrc`) but has no npm script. Run `npx prettier --write .` manually.
- SCSS is the default component style language (`angular.json` schematics default).
- Angular cache lives in `/.angular/cache` (gitignored). Delete it if builds behave unexpectedly.

## Architecture

- **Standalone components** — no NgModules. All components use `imports: []` directly.
- **Signals** in use (`signal()` from `@angular/core`) since Angular 16+ API.
- **New template block syntax** (`@for`, `@if`, etc.) is the expected style — not `*ngFor`/`*ngIf`.
- Entry point: `src/main.ts` → `src/app/app.config.ts` (providers) → `src/app/app.ts` (root component).
- `src/app/app.routes.ts` is intentionally empty — routing is wired (`provideRouter`) but no routes are defined yet.
- `src/app/app.html` still contains the Angular CLI scaffold placeholder — replace when adding real features.

## OpenCode / AI tooling

- `opencode.json` configures AI models against a **local Ollama instance** at `http://localhost:11434/v1`. Ollama must be running for AI features to work.
- VSCode has an Angular CLI MCP server configured: `npx -y @angular/cli mcp`.

## No CI, no pre-commit hooks

No `.github/workflows/`, no Husky, no lint-staged, no Makefile.
