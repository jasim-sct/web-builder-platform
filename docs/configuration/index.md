# Configuration & Environment

> **Scope:** All configuration files, environment variables, build settings, and runtime configuration across the monorepo.
> **Source of Truth:** Root `package.json`, `turbo.json`, `tsconfig.base.json`, and per-package config files

---

## 1. Environment Variables

> **Security:** No secrets, credentials, tokens, or private keys are exposed in this document.

### Current Status

The monorepo currently does not use runtime environment variables. The `.env*` files are referenced in `turbo.json` as global dependencies for cache invalidation, but no `.env` files are committed to the repository.

| Variable         | Purpose | Required | Source |
| :--------------- | :------ | :------- | :----- |
| (none currently) | —       | —        | —      |

### Future Environment Variables

When backend services or APIs are added, environment variables will be documented here following this format:

| Variable            | Purpose              | Type     | Required | Default | Source       |
| :------------------ | :------------------- | :------- | :------- | :------ | :----------- |
| (example) `API_URL` | Backend API base URL | `string` | Yes      | —       | `.env.local` |

---

## 2. Root Configuration Files

### package.json

| Field            | Value                | Purpose                            |
| :--------------- | :------------------- | :--------------------------------- |
| `name`           | `monorepo-workspace` | Root workspace name                |
| `packageManager` | `pnpm@9.15.9`        | Enforced package manager version   |
| `engines.node`   | `>=20.0.0`           | Minimum Node.js version            |
| `engines.pnpm`   | `>=9.0.0`            | Minimum pnpm version               |
| `private`        | `true`               | Prevents accidental publish to npm |

### turbo.json

| Setting              | Value                             | Purpose                     |
| :------------------- | :-------------------------------- | :-------------------------- |
| `globalDependencies` | `[".env*", "tsconfig.base.json"]` | Cache invalidation triggers |
| `ui`                 | `"tui"`                           | Terminal UI mode            |

#### Task Configuration

| Task        | `dependsOn`  | `cache` | `outputs`                                   |
| :---------- | :----------- | :------ | :------------------------------------------ |
| `build`     | `["^build"]` | Yes     | `.next/**`, `dist/**`, `build/**`, `out/**` |
| `dev`       | —            | No      | —                                           |
| `storybook` | —            | No      | —                                           |
| `lint`      | `["^build"]` | Yes     | —                                           |
| `typecheck` | `["^build"]` | Yes     | —                                           |
| `test`      | `["^build"]` | Yes     | `coverage/**`                               |
| `clean`     | —            | No      | —                                           |

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tooling/*'
```

### tsconfig.base.json

Shared TypeScript base configuration used by all packages:

| Option                       | Value      | Purpose                                        |
| :--------------------------- | :--------- | :--------------------------------------------- |
| `target`                     | `ES2022`   | JavaScript target                              |
| `module`                     | `NodeNext` | Module system                                  |
| `moduleResolution`           | `NodeNext` | Module resolution strategy                     |
| `strict`                     | `true`     | All strict checks enabled                      |
| `noUncheckedIndexedAccess`   | `true`     | Array/object indexing returns `T \| undefined` |
| `exactOptionalPropertyTypes` | `true`     | Optional props cannot be `undefined`           |
| `noUnusedLocals`             | `true`     | Error on unused variables                      |
| `noUnusedParameters`         | `true`     | Error on unused parameters                     |
| `verbatimModuleSyntax`       | `true`     | Enforces `import type` for type-only imports   |

### .npmrc

```
engine-strict=true
```

Enforces engine version requirements from `package.json`.

### .nvmrc / .node-version

```
20
```

Pins Node.js version for `nvm use`.

---

## 3. Per-Package Configuration

### Website Builder Platform (`apps/website-builder-platform`)

| Config File         | Purpose                                                       |
| :------------------ | :------------------------------------------------------------ |
| `tsconfig.json`     | Extends `@repo/typescript-config/react.json`, includes `src/` |
| `eslint.config.mjs` | Extends `@repo/eslint-config`                                 |
| `vite.config.ts`    | Vite + React plugin, path alias `@/` → `./src`                |
| `vitest.config.ts`  | jsdom environment, test files in `test/`                      |

### Component Library (`packages/component-library`)

| Config File             | Purpose                                                            |
| :---------------------- | :----------------------------------------------------------------- |
| `tsconfig.json`         | Extends `@repo/typescript-config/react.json`                       |
| `eslint.config.mjs`     | Extends `@repo/eslint-config`                                      |
| `vite.config.ts`        | Library mode build, path alias `@/` → `./lib`                      |
| `vitest.config.ts`      | jsdom environment, coverage via v8                                 |
| `.storybook/main.ts`    | Storybook config: react-vite framework, addons, viteFinal override |
| `.storybook/preview.ts` | Fullscreen layout, loads SCSS design system                        |

---

## 4. Tooling Configuration

### ESLint (`tooling/eslint/`)

| Preset File | Framework                 |
| :---------- | :------------------------ |
| `base.js`   | Base rules (all packages) |
| `react.js`  | React-specific rules      |
| `next.js`   | Next.js-specific rules    |
| `nest.js`   | NestJS-specific rules     |

### TypeScript (`tooling/typescript/`)

| Config File    | Target                 |
| :------------- | :--------------------- |
| `base.json`    | Base TypeScript config |
| `react.json`   | React applications     |
| `library.json` | Shared libraries       |
| `node.json`    | Node.js applications   |
| `next.js`      | Next.js applications   |

### Prettier (`tooling/prettier/`)

| File       | Purpose                       |
| :--------- | :---------------------------- |
| `index.js` | Shared Prettier configuration |

### Root Configs

| File                    | Purpose                                 |
| :---------------------- | :-------------------------------------- |
| `prettier.config.mjs`   | Imports from `@repo/prettier-config`    |
| `eslint.config.mjs`     | Imports from `@repo/eslint-config` base |
| `commitlint.config.mjs` | Conventional Commits enforcement        |
| `.lintstagedrc.json`    | Pre-commit lint-staged configuration    |

---

## 5. Build Configuration

### Component Library Build

The `build` script performs three sequential steps:

1. `tsc -b` — TypeScript compilation with declaration files
2. `vite build` — JavaScript/TypeScript bundling
3. `sass lib/assets/scss/main.scss dist/main.css` — SCSS compilation

### Editor Build

The `build` script performs two steps:

1. `tsc` — TypeScript type checking
2. `vite build` — Production build

### Exports Configuration

#### Component Library

```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js"
  },
  "./styles": "./dist/main.css",
  "./scss/*": "./lib/assets/scss/*"
}
```

---

## 6. Git Configuration

### .gitattributes

Normalizes line endings to LF across all platforms.

### .gitignore

Excludes: `node_modules/`, `dist/`, `build/`, `.turbo/`, `coverage/`, `storybook-static/`, `.env*`

### .editorconfig

Enforces consistent coding styles across editors (indent, charset, line ending).

---

## 7. CI/CD Configuration

### GitHub Actions (`.github/workflows/ci.yml`)

Pipeline stages:

1. Install dependencies
2. Format check
3. Lint
4. Typecheck
5. Test
6. Build

All stages must pass for PR merge.

---

## 8. VS Code Configuration

### `.vscode/`

Editor settings for workspace-specific VS Code configuration.

---

See also:

- [Turborepo Guide](../turborepo-guide.md) — Pipeline tasks and caching
- [Workflow & Testing](../development/workflow-and-testing.md) — Development commands
- [Architecture & Principles](../architecture.md) — Dependency management strategy
