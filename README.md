# Production-Ready Monorepo Workspace Foundation

An enterprise-grade, clean, framework-agnostic development monorepo workspace foundation designed for scalable **React**, **Next.js**, and **NestJS** applications.

---

## 1. Workspace Purpose

This repository provides the core architectural foundation, tooling, and developer experience standards needed to build modern full-stack web and backend applications. It enforces consistent code quality, deterministic caching, strict TypeScript type safety, and Git hygiene across all future applications and packages without imposing framework-specific logic at the root level.

---

## 2. Directory Conventions

The workspace follows a strict separation of concerns:

```text
workspace/
├── apps/               # Deployable frontend & backend applications (Next.js, React SPA, NestJS)
├── packages/           # Reusable shared libraries, UI packages, utility modules, schemas
├── tooling/            # Internal tooling and shared configuration presets (@repo/typescript-config, @repo/eslint-config)
├── docs/               # In-depth architectural guides and workflow documentation
├── scripts/            # Workspace automation and sanity check utilities
├── .github/            # CI/CD pipelines, Pull Request & Issue templates
├── .husky/             # Git hook definitions (pre-commit, commit-msg)
├── .vscode/            # Shared VS Code settings, recommended extensions, debug launch configs
├── package.json        # Workspace root package manifest and dev scripts
├── pnpm-workspace.yaml # pnpm workspace package glob definitions
├── turbo.json          # Turborepo task pipeline orchestration and cache configuration
├── tsconfig.base.json  # Reusable base strict TypeScript configuration
├── tsconfig.json       # Root solution TypeScript configuration
├── eslint.config.mjs   # Root ESLint 9 Flat Configuration
├── prettier.config.mjs # Shared Prettier formatting rules with import sorting
├── .prettierignore     # Prettier ignore patterns
├── .gitignore          # Comprehensive Git ignore rules
├── .gitattributes      # Cross-platform line ending normalization (LF)
├── .editorconfig       # Universal editor formatting standards
├── .nvmrc              # Node.js version pinning (24.19.0)
├── .npmrc              # Strict pnpm dependency and workspace settings
├── commitlint.config.mjs# Conventional Commits rule definitions
├── .lintstagedrc.json  # Staged file linting and formatting configuration
└── README.md           # Workspace master documentation
```

---

## 3. Package Manager (pnpm)

This workspace uses **pnpm** (version `9.15.9`) as its dedicated package manager for fast, disk-efficient, and strictly isolated dependency management.

- **Workspace Protocol**: Internal packages are linked using `workspace:*`.
- **Engine Enforcement**: Node `>=20.0.0` and pnpm `>=9.0.0` are enforced via `.npmrc` (`engine-strict=true`).
- **Peer Dependency Resolution**: Handled automatically via `auto-install-peers=true`.

---

## 4. Turborepo Orchestration

[Turborepo](https://turbo.build/) manages build pipelines and task execution with intelligent dependency graphing and remote/local caching.

### Standard Pipeline Tasks

| Task        | Description                             | Topological Dependency |             Cacheable             |
| :---------- | :-------------------------------------- | :--------------------: | :-------------------------------: |
| `build`     | Compiles applications and packages      |        `^build`        | Yes (`dist/**`, `.next/**`, etc.) |
| `dev`       | Starts local development servers        |           No           |          No (persistent)          |
| `lint`      | Runs ESLint across all projects         |        `^build`        |                Yes                |
| `typecheck` | Runs TypeScript checks (`tsc --noEmit`) |        `^build`        |                Yes                |
| `test`      | Runs test suites                        |        `^build`        |        Yes (`coverage/**`)        |
| `format`    | Checks code formatting                  |           No           |                Yes                |
| `clean`     | Deletes build artifacts and caches      |           No           |                No                 |

---

## 5. Naming Conventions

- **Applications**: Created inside `apps/<name>` using `kebab-case` (e.g. `apps/website-builder-platform`, `apps/api`).
- **Shared Packages**: Created inside `packages/<name>` using `kebab-case` and scoped with `@repo/` (e.g. `@repo/ui`, `@repo/utils`, `@repo/types`).
- **Tooling Presets**: Located in `tooling/<name>` scoped with `@repo/` (e.g. `@repo/eslint-config`, `@repo/typescript-config`).
- **Git Commits**: Must follow Conventional Commits (e.g. `feat(website-builder-platform): add login page`, `fix(api): handle token expiration`).

---

## 6. Dependency Conventions

1. **Workspace Packages**: Always specify internal package dependencies using the `workspace:*` specifier in `package.json`:
   ```json
   {
     "dependencies": {
       "@repo/ui": "workspace:*",
       "@repo/utils": "workspace:*"
     }
   }
   ```
2. **Framework Isolation**: Dependencies like `react`, `next`, or `@nestjs/core` belong only in their respective `apps/` or `packages/`, never in the workspace root `package.json`.
3. **Root DevDependencies**: The workspace root contains only orchestration and repo-wide developer tooling (`turbo`, `eslint`, `prettier`, `husky`, `typescript`, `lint-staged`).

---

## 7. Where Future Applications Should Be Created

All future applications must be placed in `apps/`. Examples:

- `apps/website-builder-platform`: Website Builder Platform application
- `apps/portal`: React (Vite) single-page application
- `apps/api`: NestJS backend microservice

_Refer to [docs/adding-applications.md](file:///home/sct/dnd/docs/adding-applications.md) for step-by-step setup templates._

---

## 8. Where Future Shared Packages Should Be Created

All reusable libraries and modules must be placed in `packages/`. Examples:

- `packages/ui`: Shared React UI components
- `packages/utils`: Framework-agnostic utility functions
- `packages/types`: Shared TypeScript interfaces and DTOs

_Refer to [docs/adding-packages.md](file:///home/sct/dnd/docs/adding-packages.md) for step-by-step package setup templates._

---

## 9. Development Commands

### Core Workspace Commands

```bash
# Install all workspace dependencies
pnpm install

# Run all applications in development mode
pnpm dev

# Build all packages and applications
pnpm build

# Run linting across the monorepo
pnpm lint

# Automatically fix linting issues
pnpm lint:fix

# Run TypeScript type checking across all projects
pnpm typecheck

# Run test suites across the monorepo
pnpm test

# Format all files using Prettier
pnpm format

# Check formatting without modifying files
pnpm format:check

# Run full sanity check (format check + lint + typecheck)
pnpm check

# Clean build artifacts, caches, and node_modules
pnpm clean
```

### Filtered Commands (Turborepo)

```bash
# Build only the web application and its dependencies
pnpm turbo build --filter=web...

# Run dev only for api
pnpm turbo dev --filter=api
```

---

## 10. Architectural Rules

1. **Zero App-to-App Coupling**: An application in `apps/` must never import directly from another application in `apps/`.
2. **Shared via Packages**: If two applications need shared logic, extract it into a package inside `packages/`.
3. **Strict Type Safety**: All TypeScript code must compile under `strict: true`, `noUncheckedIndexedAccess: true`, and `exactOptionalPropertyTypes: true`.
4. **Automated Quality Gates**: Commits and PRs must pass `lint-staged`, `commitlint`, ESLint, TypeScript typecheck, Prettier, and CI workflows.
5. **Detailed Documentation**: Detailed guides are available in [docs/](file:///home/sct/dnd/docs/):
   - [docs/architecture.md](file:///home/sct/dnd/docs/architecture.md): Monorepo principles and topology
   - [docs/conventions.md](file:///home/sct/dnd/docs/conventions.md): Commit, branch, import, and naming standards
   - [docs/adding-applications.md](file:///home/sct/dnd/docs/adding-applications.md): Recipes for Next.js, React, and NestJS apps
   - [docs/adding-packages.md](file:///home/sct/dnd/docs/adding-packages.md): Recipes for shared TypeScript and UI packages
   - [docs/turborepo-guide.md](file:///home/sct/dnd/docs/turborepo-guide.md): Deep-dive into task caching and pipelines
