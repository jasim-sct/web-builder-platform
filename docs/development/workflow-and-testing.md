# Development Workflow & Testing

This document covers development commands, test suites, CI/CD, and troubleshooting for the monorepo workspace.

---

## 1. Prerequisites

| Requirement     | Version                                                 |
| :-------------- | :------------------------------------------------------ |
| Node.js         | ≥ 20.0.0 (pinned via `.nvmrc` / `.node-version`)        |
| pnpm            | ≥ 9.0.0 (pinned via `packageManager` field)             |
| Package install | `pnpm install` (uses `engine-strict=true` via `.npmrc`) |

---

## 2. Development Commands

### Root-Level Commands

| Command                | Purpose                                              |
| :--------------------- | :--------------------------------------------------- |
| `pnpm dev`             | Start all dev servers concurrently (Turborepo)       |
| `pnpm build`           | Build all packages and apps (topological order)      |
| `pnpm lint`            | Run ESLint across all packages                       |
| `pnpm lint:fix`        | Run ESLint with auto-fix                             |
| `pnpm typecheck`       | Run TypeScript type checking across all packages     |
| `pnpm test`            | Run all test suites                                  |
| `pnpm format`          | Format all files with Prettier                       |
| `pnpm format:check`    | Check formatting without modifying files             |
| `pnpm check`           | Full verification: `format:check + lint + typecheck` |
| `pnpm clean`           | Clean build artifacts and node_modules               |
| `pnpm storybook`       | Start Storybook dev server (port 6006)               |
| `pnpm storybook:build` | Build static Storybook                               |

### Per-Package Commands

| Command                                           | Package                             |
| :------------------------------------------------ | :---------------------------------- |
| `pnpm --filter website-builder-platform dev`      | Start editor dev server (port 5173) |
| `pnpm --filter @repo/component-library storybook` | Start Storybook (port 6006)         |
| `pnpm --filter @repo/component-library test`      | Run library tests                   |

### Turborepo Filtering

```bash
# Build only the editor app and its dependencies
pnpm turbo build --filter=website-builder-platform...

# Run lint for all packages except the editor
pnpm turbo lint --filter=!website-builder-platform

# Dry run to inspect execution plan
pnpm turbo build --dry-run
```

---

## 3. Turborepo Task Graph

```
build ────────────── Depends on ^build (topological)
typecheck ────────── Depends on ^build
lint ─────────────── Depends on ^build
test ─────────────── Depends on ^build
dev ──────────────── Persistent, no cache
storybook ────────── Persistent, no cache
clean ────────────── No cache
```

- **`^build`** means "build all workspace dependencies first"
- **Persistent tasks** (`dev`, `storybook`) run in watch mode and are never cached
- **Cache outputs** are stored in `.turbo/` for fast incremental builds

---

## 4. Test Suites

### Vitest Configuration

Both the editor and component library use Vitest:

| Setting            | Value                                                    |
| :----------------- | :------------------------------------------------------- |
| Environment        | `jsdom`                                                  |
| Globals            | `true` (describe, it, expect available without imports)  |
| Test files         | `test/**/*.{test,spec}.{ts,tsx}`                         |
| Setup files        | `test/setup.ts` (editor) / `src/test/setup.ts` (library) |
| Coverage (library) | `v8` provider, reporters: text, json, html               |

### Editor Tests

Located in `apps/website-builder-platform/test/`:

| Test File                      | What It Tests                                                                                   |
| :----------------------------- | :---------------------------------------------------------------------------------------------- |
| `editorReducer.test.ts`        | All reducer actions: add, remove, duplicate, reorder, select, hover, update props/style/actions |
| `DragAndDropInsertion.test.ts` | Drag-and-drop section insertion flow                                                            |
| `EditorPanel.test.tsx`         | Panel component rendering and interactions                                                      |
| `dndHelpers.test.ts`           | Drag-and-drop helper functions                                                                  |
| `DesignSystem.test.tsx`        | Design system component rendering                                                               |

### Library Tests

Located in `packages/component-library/test/`:

| Test Directory              | What It Tests                                             |
| :-------------------------- | :-------------------------------------------------------- |
| `registry/registry.test.ts` | Registry CRUD, schema queries, render, category filtering |
| `components/Header/`        | Header component rendering and schema                     |
| `components/Hero/`          | Hero component rendering and schema                       |
| `components/Features/`      | Features component rendering and schema                   |
| `components/Carousel/`      | Carousel component rendering and schema                   |
| `components/Pricing/`       | Pricing component rendering and schema                    |
| `components/Testimonials/`  | Testimonials component rendering and schema               |
| `components/FAQ/`           | FAQ component rendering and schema                        |
| `components/Contact/`       | Contact component rendering and schema                    |
| `components/Footer/`        | Footer component rendering and schema                     |

### Running Tests

```bash
# All tests
pnpm test

# Watch mode (library)
pnpm --filter @repo/component-library test:watch

# Specific test file
pnpm --filter website-builder-platform vitest run test/editorReducer.test.ts
```

---

## 5. Linting & Formatting

### ESLint

- **Config:** `eslint.config.mjs` at root, extends `@repo/eslint-config`
- **Flat config format** (ESLint 9)
- **Presets available in `tooling/eslint/`:** base, react, next, nest

### Prettier

- **Config:** `prettier.config.mjs` at root, extends `@repo/prettier-config`
- **Import sorting:** `@ianvs/prettier-plugin-sort-imports`
- **Format check:** `pnpm format:check` — verify without modifying

### Git Hooks (Husky)

| Hook         | Action                                                  |
| :----------- | :------------------------------------------------------ |
| `pre-commit` | Runs `lint-staged` (ESLint + Prettier on staged files)  |
| `commit-msg` | Runs Commitlint (validates Conventional Commits format) |

---

## 6. CI/CD

### GitHub Actions

Located in `.github/workflows/ci.yml`:

The CI pipeline runs on every push and pull request:

1. **Install dependencies** — `pnpm install`
2. **Format check** — `pnpm format:check`
3. **Lint** — `pnpm lint`
4. **Typecheck** — `pnpm typecheck`
5. **Test** — `pnpm test`
6. **Build** — `pnpm build`

All steps must pass for a PR to be mergeable.

---

## 7. Workspace Verification

The `scripts/verify-workspace.mjs` script validates workspace integrity:

1. **Required root files** — Checks 16 essential config files exist
2. **Required directories** — Validates 18 directories exist
3. **Section components** — Confirms all 9 sections are implemented
4. **Scope boundary** — Verifies no unauthorized apps exist in `apps/`

Run with:

```bash
node scripts/verify-workspace.mjs
```

---

## 8. Common Troubleshooting

### Fast Refresh Compatibility

| Issue                                | Cause                                   | Solution                                       |
| :----------------------------------- | :-------------------------------------- | :--------------------------------------------- |
| Fast Refresh not working after edits | Named exports missing from barrel files | Ensure all component exports use named exports |
| Component disappears on save         | Default export used in barrel           | Switch to named exports                        |

### vite-dts Errors in Storybook

| Issue                                      | Cause                                    | Solution                                                                            |
| :----------------------------------------- | :--------------------------------------- | :---------------------------------------------------------------------------------- |
| Storybook build fails with vite-dts errors | vite-dts plugin conflicts with Storybook | The `.storybook/main.ts` config already removes the vite-dts plugin via `viteFinal` |

### Turborepo Caching

| Issue                                  | Cause                                       | Solution                                          |
| :------------------------------------- | :------------------------------------------ | :------------------------------------------------ |
| Stale builds after dependency changes  | Turborepo cache not invalidated             | Run `pnpm turbo clean` or delete `.turbo/`        |
| Build succeeds locally but fails in CI | Missing global dependencies in `turbo.json` | Add files to `globalDependencies` in `turbo.json` |

### TypeScript Errors

| Issue                                   | Cause                                             | Solution                                                |
| :-------------------------------------- | :------------------------------------------------ | :------------------------------------------------------ |
| `exactOptionalPropertyTypes` errors     | Optional properties set to `undefined` explicitly | Use conditional spreading or omit the property entirely |
| `noUnusedLocals` / `noUnusedParameters` | Dead code                                         | Remove unused imports and variables                     |
| `verbatimModuleSyntax` errors           | Missing `import type` for type-only imports       | Use `import type { X } from 'y'`                        |

### pnpm Issues

| Issue                        | Cause                      | Solution                                   |
| :--------------------------- | :------------------------- | :----------------------------------------- |
| `ERR_PNPM_NO_LOCKFILE`       | Lockfile missing           | Run `pnpm install` from root               |
| `ERR_PNPM_ENGINEUnsupported` | Node/pnpm version mismatch | Use `nvm use` to switch to correct version |

---

## 9. Recommended Workflow

1. **Pull latest** — `git pull origin main`
2. **Install deps** — `pnpm install`
3. **Start dev** — `pnpm dev` (or filter to specific package)
4. **Make changes** — Edit source files
5. **Run checks** — `pnpm check` (format + lint + typecheck)
6. **Run tests** — `pnpm test`
7. **Verify in browser** — Check dev server / Storybook
8. **Commit** — Follow Conventional Commits format
9. **Push** — CI runs automatically
