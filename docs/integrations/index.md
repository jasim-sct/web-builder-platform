# Integrations — Cross-Application Dependencies

> **Scope:** All application-to-application, package-to-package, and service-to-service integrations in the monorepo.
> **Source of Truth:** `pnpm-workspace.yaml` and `package.json` dependency declarations

---

## 1. Integration Map

```
┌─────────────────────────────────────────────────────┐
│            website-builder-platform                  │
│            (apps/website-builder-platform)           │
│                                                     │
│  depends on:                                        │
│    @repo/component-library (workspace:*)            │
│    @repo/eslint-config (workspace:*)                │
│    @repo/prettier-config (workspace:*)              │
│    @repo/typescript-config (workspace:*)            │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ imports: types, registry, schema,
                       │          components, helpers
                       ▼
┌─────────────────────────────────────────────────────┐
│            component-library                         │
│            (packages/component-library)              │
│                                                     │
│  depends on:                                        │
│    @repo/eslint-config (workspace:*)                │
│    @repo/prettier-config (workspace:*)              │
│    @repo/typescript-config (workspace:*)            │
│                                                     │
│  peer deps:                                         │
│    react (>=18 || >=19)                             │
│    react-dom (>=18 || >=19)                         │
└─────────────────────────────────────────────────────┘
```

---

## 2. Editor → Component Library Integration

### Protocol

Direct module import via workspace protocol (`workspace:*`).

### Interface

The editor imports these from `@repo/component-library`:

| Import                                                          | Usage                                              |
| :-------------------------------------------------------------- | :------------------------------------------------- |
| `getSection()`                                                  | Look up section registry item by componentId       |
| `getSectionSchema()`                                            | Get schema for a section's properties              |
| `getAllSections()`                                              | List all registered sections (for Component Panel) |
| `getSectionsByCategory()`                                       | Filter sections by category                        |
| `renderSectionInstance()`                                       | Render a section from its instance data            |
| `resolveSectionStyles()`                                        | Convert responsive styles to CSS properties        |
| `getContentWidthClass()`                                        | Get container width class name                     |
| Types: `SectionInstance`, `SectionSchema`, `ActionConfig`, etc. | TypeScript contracts                               |

### Data Flow

```
Editor (consumer)
  │
  ├── Reads: SectionRegistry (all sections, schemas, defaults)
  ├── Creates: SectionInstance (new instances from generators)
  ├── Updates: SectionInstance (props, styles, actions via reducer)
  └── Renders: SectionComponent (via renderSectionInstance)
      │
      ▼
Component Library (provider)
  │
  ├── Exports: Registry API, Schema types, React components
  ├── Defines: SectionSchema, defaults, generators
  └── Provides: Style resolver, CSS custom properties
```

### Version Compatibility

- Uses `workspace:*` — always matches local version
- React peer dependency: `>=18 || >=19` — compatible with React 18 and 19
- No separate versioning; library and editor are deployed together

### Failure Behavior

- If `getSection()` returns `undefined`, the editor logs a warning and skips rendering
- If `renderSectionInstance()` fails, it returns `null` (graceful degradation)
- Schema-driven controls gracefully handle missing optional properties

---

## 3. Tooling → Package/App Integrations

### TypeScript Config

| Consumer                        | Extends                                    |
| :------------------------------ | :----------------------------------------- |
| `packages/component-library`    | `@repo/typescript-config` (library config) |
| `apps/website-builder-platform` | `@repo/typescript-config` (react config)   |

### ESLint Config

| Consumer                        | Extends                    |
| :------------------------------ | :------------------------- |
| Root `eslint.config.mjs`        | `@repo/eslint-config` base |
| `packages/component-library`    | `@repo/eslint-config`      |
| `apps/website-builder-platform` | `@repo/eslint-config`      |

### Prettier Config

| Consumer                   | Config                               |
| :------------------------- | :----------------------------------- |
| Root `prettier.config.mjs` | Imports from `@repo/prettier-config` |
| All packages/apps          | Inherit from root                    |

---

## 4. Build Pipeline Integrations

### Turborepo Dependency Graph

```
build (top-level)
  └── ^build (workspace dependencies built first)
        │
        ├── tooling/typescript → builds first (no deps)
        ├── tooling/eslint → builds first (no deps)
        ├── tooling/prettier → builds first (no deps)
        ├── packages/component-library → builds after tooling
        └── apps/website-builder-platform → builds after component-library
```

### Task Dependencies

| Task        | Depends On                  |
| :---------- | :-------------------------- |
| `build`     | `^build` (topological)      |
| `lint`      | `^build`                    |
| `typecheck` | `^build`                    |
| `test`      | `^build`                    |
| `dev`       | None (persistent, no cache) |
| `storybook` | `^build`                    |

---

## 5. Shared Dependencies

### Common Runtime Dependencies

| Package               | Used By                                            |
| :-------------------- | :------------------------------------------------- |
| `react` / `react-dom` | component-library (peer), website-builder-platform |
| `clsx`                | component-library, website-builder-platform        |
| `lucide-react`        | component-library, website-builder-platform        |

### Common Dev Dependencies

| Package                  | Used By                                     |
| :----------------------- | :------------------------------------------ |
| `typescript`             | All packages                                |
| `eslint`                 | All packages                                |
| `prettier`               | Root only                                   |
| `vitest`                 | component-library, website-builder-platform |
| `@testing-library/react` | component-library, website-builder-platform |
| `@vitejs/plugin-react`   | component-library, website-builder-platform |
| `vite`                   | component-library, website-builder-platform |
| `sass`                   | component-library, website-builder-platform |

---

## 6. Runtime Integration: Storybook ↔ Component Library

| Aspect         | Integration                                                     |
| :------------- | :-------------------------------------------------------------- |
| Framework      | `@storybook/react-vite`                                         |
| Stories source | `packages/component-library/src/stories/`                       |
| SCSS loading   | `lib/assets/scss/main.scss` imported in `.storybook/preview.ts` |
| Vite override  | `viteFinal` removes `vite:dts` plugin to avoid conflicts        |
| Build command  | `pnpm --filter @repo/component-library build-storybook`         |
| Output         | `storybook-static/` directory                                   |

---

## 7. Workspace Verification Integration

### Script: `scripts/verify-workspace.mjs`

Validates:

1. 16 required root files exist
2. 18 required directories exist
3. All 9 section components are implemented
4. No unauthorized apps exist in `apps/`

Run with: `node scripts/verify-workspace.mjs`

---

## 8. Future Integration Points

The architecture is designed to support future additions:

| Future Integration                   | Expected Pattern                                 |
| :----------------------------------- | :----------------------------------------------- |
| Additional apps (e.g., admin portal) | Import from shared packages via `workspace:*`    |
| Backend API (e.g., NestJS)           | Share types via `@repo/types` (not yet created)  |
| Database integration                 | New package in `packages/`                       |
| Authentication service               | New package in `packages/` or new app in `apps/` |

See [Adding Applications](../adding-applications.md) and [Adding Shared Packages](../adding-packages.md) for how to extend the monorepo.

---

See also:

- [Architecture & Principles](../architecture.md) — Monorepo topology
- [Component Library](../packages/component-library.md) — Library internals
- [Website Builder Platform](../applications/website-builder-platform.md) — Editor internals
- [Turborepo Guide](../turborepo-guide.md) — Build pipeline
