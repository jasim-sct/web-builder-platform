# AI Agent Guidelines

> **Purpose:** Authoritative constraints, boundaries, and workflows for AI agents working in this monorepo.
> **Status:** Active
> **Last Reviewed:** 2026-08-25
> **Source of Truth:** This document + source code inspection

---

## 1. Project Context

This is a **website builder platform** where users compose professional websites by selecting, stacking, and customizing pre-built sections through a visual drag-and-drop editor.

| Codebase            | Path                            | Purpose                                          |
| :------------------ | :------------------------------ | :----------------------------------------------- |
| **Section Library** | `packages/component-library`    | React sections, schemas, registry, styles, tests |
| **Web Editor**      | `apps/website-builder-platform` | Visual editor that consumes the Section Library  |
| **Tooling**         | `tooling/`                      | Shared ESLint, TypeScript, Prettier configs      |

> See [Architecture & Principles](../architecture.md) for the full monorepo topology.
> See [Component Architecture](../packages/component-architecture.md) for component boundary rules.

---

## 2. Entry Point for AI Agents

When entering this repository, follow this sequence:

1. Read this document (`docs/ai/AGENT_GUIDELINES.md`)
2. Read [Architecture & Principles](../architecture.md) for system topology
3. Read [Component Architecture](../packages/component-architecture.md) for component rules
4. Read [Data Models](../data/index.md) for type contracts
5. Read [Serialization Rules](../business-rules/serialization-rules.md) for data constraints
6. Inspect the actual source code before making any changes

---

## 3. Folder Boundaries

### Safe Modification Zones

You are permitted to modify files within these directories:

- `apps/website-builder-platform/src/` — Editor app source
- `packages/component-library/lib/` — Section Library source (components, schemas, registry, helpers)
- `packages/component-library/src/stories/` — Storybook stories
- `packages/component-library/test/` — Library tests
- `apps/website-builder-platform/test/` — Editor tests
- `docs/` — Documentation files

### Read-Only Zones (Never Modify Without Explicit Permission)

- `tooling/` — Shared configuration presets (ESLint, TypeScript, Prettier)
- `scripts/` — Workspace verification scripts
- `.github/` — CI/CD workflows
- `.husky/` — Git hooks
- Root config files (`package.json`, `turbo.json`, `tsconfig.base.json`, `eslint.config.mjs`, `prettier.config.mjs`)

---

## 4. Absolute Architectural Rules

### Rule 1: The Web Editor Consumes the Section Library

The Web Editor is a **composition and configuration engine**, never a component implementation engine.

**Strictly prohibited:**

- Creating editor-specific component duplicates (e.g., `EditorHero`, `EditorHeader`)
- Hardcoding section metadata, property definitions, or defaults in the editor
- Bypassing the `SectionRegistry` to render sections

**Always:**

- Use `getSection()`, `getSectionSchema()`, `renderSectionInstance()` from `@repo/component-library`
- Let the editor render the original Section Library component, wrapped only in `EditorSectionWrapper`

### Rule 2: Schema-Driven Properties

The Properties Panel must never contain component-specific property inspection logic.

**Strictly prohibited:**

```typescript
// FORBIDDEN: Hardcoded component switching
if (selectedSection.componentId === 'hero') {
  return <HeroPropertiesPanel />;
}
```

**Always:**

```typescript
// MANDATORY: Universal Schema Renderer
const schema = getSectionSchema(selectedSection.componentId);
return <SchemaPropertiesRenderer schema={schema} />;
```

### Rule 3: Serialization Boundaries

The PageModel must remain **100% JSON-serializable**. Never store in page state:

- React components or JSX elements
- Functions, closures, or event handlers
- DOM elements or React ref objects
- Ephemeral editor state (selection, hover, drag coordinates)

See [Serialization Rules](../business-rules/serialization-rules.md) for full details.

### Rule 4: State Segregation

Editor state is strictly partitioned:

| Persistent Page State                                    | Ephemeral UI State                                          |
| :------------------------------------------------------- | :---------------------------------------------------------- |
| Page metadata, section instances, props, styles, actions | Selection, hover, drag, active breakpoint, panel visibility |

Only persistent state participates in undo/redo history.

### Rule 5: No Unsafe Execution

- `eval()`, `new Function()`, inline script strings, and arbitrary JavaScript execution are **strictly forbidden**
- All user-provided URLs must be sanitized to prevent `javascript:` URI attacks and XSS

### Rule 6: Component Independence

Components must be independently usable without the Builder. See [Component Architecture](../packages/component-architecture.md) for full boundary rules.

### Rule 7: Design System Integration

Components must use shared design tokens from the SCSS design system. Do not introduce arbitrary values when tokens exist.

---

## 5. Code Conventions

### Naming

| Element                | Convention         |
| :--------------------- | :----------------- |
| App/package folders    | `kebab-case`       |
| Package names          | `@repo/kebab-case` |
| React components       | `PascalCase.tsx`   |
| Other TypeScript files | `kebab-case.ts`    |
| Exported constants     | `UPPER_SNAKE_CASE` |

### Import Ordering

Follow the enforced Prettier import sort order (see [Conventions](../conventions.md)):

1. React / Framework imports
2. Third-party packages
3. Workspace packages (`@repo/*`)
4. Internal relative imports
5. Type imports

### TypeScript

- Strict mode is enabled globally via `tsconfig.base.json`
- `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters` are all enabled
- Use `verbatimModuleSyntax` — always use `import type` for type-only imports

### Commits

- Conventional Commits format enforced by Commitlint + Husky
- Format: `<type>(<scope>): <description>`
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

---

## 6. Adding a New Section

When adding a new section to `@repo/component-library`:

1. Create a directory under `packages/component-library/lib/components/<SectionName>/`
2. Create these files:
   - `<SectionName>.tsx` — React component
   - `<SectionName>.schema.ts` — Props, style, and action schemas
   - `<SectionName>.defaults.ts` — Default props, style, and actions
   - `<SectionName>.generator.ts` — Instance generator function
   - `index.ts` — Barrel exports
   - `constants.ts` — Component ID, display name, category, description
3. Register the section in `packages/component-library/lib/components/index.ts` via `registerSection()`
4. Create Storybook stories in `packages/component-library/src/stories/`
5. Create tests in `packages/component-library/test/components/`

See [Component Library](../packages/component-library.md) for detailed specifications.

---

## 7. Source of Truth Locations

| Concept              | Authoritative Source                                      |
| :------------------- | :-------------------------------------------------------- |
| Section components   | `packages/component-library/lib/components/`              |
| Section schemas      | `packages/component-library/lib/schema/`                  |
| Section registry     | `packages/component-library/lib/registry/`                |
| Core types           | `packages/component-library/lib/types.ts`                 |
| Style resolver       | `packages/component-library/lib/helpers/styleResolver.ts` |
| Editor state         | `apps/website-builder-platform/src/state/`                |
| Editor types         | `apps/website-builder-platform/src/types/editor.ts`       |
| Design tokens (SCSS) | `packages/component-library/lib/assets/scss/`             |
| Design tokens (TS)   | `apps/website-builder-platform/src/design-system/tokens/` |
| Business rules       | `docs/business-rules/serialization-rules.md`              |
| Component rules      | `docs/packages/component-architecture.md`                 |
| Data models          | `docs/data/index.md`                                      |

---

## 8. Common Pitfalls

| Pitfall                                      | How to Avoid                                                         |
| :------------------------------------------- | :------------------------------------------------------------------- |
| Duplicating section components in the editor | Always use `getSection()` and `renderSectionInstance()`              |
| Hardcoding section metadata in the editor    | Query the registry dynamically                                       |
| Storing non-serializable data in page state  | Keep functions, DOM refs, and ephemeral state out of `PageModel`     |
| Modifying tooling configs                    | These are shared across all packages — read only                     |
| Creating replacement editor components       | The editor wraps, never replaces, section library components         |
| Ignoring responsive breakpoints              | Always consider Desktop/Tablet/Mobile when modifying styles          |
| Forgetting to register new sections          | A new section won't appear in the editor without `registerSection()` |
| Exposing internal CSS as Builder config      | Only expose meaningful customization properties                      |
| Hard-coding colors in components             | Use CSS custom properties / design tokens                            |
| Adding component-specific Builder CSS hacks  | Communicate through the schema contract only                         |

---

## 9. Validation Workflow

Before submitting any changes, run:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Formatting
pnpm format:check

# Tests
pnpm test

# Full verification
pnpm check
```

See [Workflow & Testing](../development/workflow-and-testing.md) for detailed commands.

---

## 10. Pre-Change Checklist

Before modifying any file, verify:

- [ ] Have I inspected the existing `SectionRegistry` and schema definitions?
- [ ] Does an existing utility or resolver already handle this requirement?
- [ ] Am I reusing the Section Library component instead of creating a custom duplicate?
- [ ] Is the data being added completely serializable in JSON?
- [ ] Does this edit stay within the designated package/app boundary?
- [ ] Will this change keep Storybook and existing section consumers operational?
- [ ] Am I following the import ordering standard?
- [ ] Am I using `import type` for type-only imports?
- [ ] Am I using design tokens instead of hardcoded values?
- [ ] Does the component remain independently usable?
- [ ] Are internal spacing rules maintained?
- [ ] Is the configuration schema properly defined?

---

## 11. Documentation Requirements

When making changes:

- Update relevant documentation if behavior changes
- Keep cross-references accurate
- Document new business rules in `docs/business-rules/`
- Add ADRs for significant architectural decisions in `docs/decisions/`
- Update the glossary if new terms are introduced

---

## 12. Forbidden Assumptions

Do not assume:

- A component's internal DOM structure
- That the Builder is always the consumer
- That styles are always applied via CSS classes
- That all properties are configurable
- That responsive behavior is optional
- That accessibility is handled elsewhere
- That the current implementation is the only valid approach

Always inspect the source code and documentation before making changes.
