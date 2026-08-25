# Testing Strategy

> **Scope:** All testing approaches, configurations, conventions, and coverage expectations across the monorepo.
> **Source of Truth:** `vitest.config.ts` files and test directories in each package/app

---

## 1. Overview

The monorepo uses a consistent testing stack across all packages:

| Tool                          | Purpose                                              |
| :---------------------------- | :--------------------------------------------------- |
| **Vitest**                    | Test runner (replaces Jest for Vite-native projects) |
| **React Testing Library**     | Component rendering and interaction testing          |
| **@testing-library/jest-dom** | Custom DOM matchers                                  |
| **jsdom**                     | Browser environment simulation                       |
| **v8**                        | Code coverage provider                               |

---

## 2. Test Configuration

### Shared Settings

| Setting           | Value                                                       |
| :---------------- | :---------------------------------------------------------- |
| Environment       | `jsdom`                                                     |
| Globals           | `true` (describe, it, expect, vi available without imports) |
| Test file pattern | `test/**/*.{test,spec}.{ts,tsx}`                            |

### Website Builder Platform

| Setting     | Value                                            |
| :---------- | :----------------------------------------------- |
| Config file | `apps/website-builder-platform/vitest.config.ts` |
| Setup file  | `test/setup.ts`                                  |
| Path alias  | `@/` → `./src`                                   |

### Component Library

| Setting          | Value                                         |
| :--------------- | :-------------------------------------------- |
| Config file      | `packages/component-library/vitest.config.ts` |
| Setup file       | `src/test/setup.ts`                           |
| Path alias       | `@/` → `./lib`                                |
| Coverage         | v8 provider, reporters: text, json, html      |
| Coverage include | `lib/**/*.ts`, `lib/**/*.tsx`                 |

---

## 3. Test Organization

### Editor Tests

Located in `apps/website-builder-platform/test/`:

| File                           | Type        | What It Tests                                                                                   |
| :----------------------------- | :---------- | :---------------------------------------------------------------------------------------------- |
| `editorReducer.test.ts`        | Unit        | All reducer actions: add, remove, duplicate, reorder, select, hover, update props/style/actions |
| `dndHelpers.test.ts`           | Unit        | Drag-and-drop helper functions                                                                  |
| `DragAndDropInsertion.test.ts` | Integration | End-to-end drag-and-drop section insertion flow                                                 |
| `EditorPanel.test.tsx`         | Component   | Panel component rendering and user interactions                                                 |
| `DesignSystem.test.tsx`        | Component   | Design system component rendering                                                               |

### Library Tests

Located in `packages/component-library/test/`:

| Directory                   | Type      | What It Tests                                             |
| :-------------------------- | :-------- | :-------------------------------------------------------- |
| `registry/registry.test.ts` | Unit      | Registry CRUD, schema queries, render, category filtering |
| `components/Header/`        | Component | Header section rendering, props, schema                   |
| `components/Hero/`          | Component | Hero section rendering, props, schema                     |
| `components/Features/`      | Component | Features section rendering, props, schema                 |
| `components/Carousel/`      | Component | Carousel section rendering, props, schema                 |
| `components/Pricing/`       | Component | Pricing section rendering, props, schema                  |
| `components/Testimonials/`  | Component | Testimonials section rendering, props, schema             |
| `components/FAQ/`           | Component | FAQ section rendering, props, schema                      |
| `components/Contact/`       | Component | Contact section rendering, props, schema                  |
| `components/Footer/`        | Component | Footer section rendering, props, schema                   |

---

## 4. Testing Levels

### Level 1: Unit Tests

**What to test:**

- Reducer action handlers (pure functions)
- Schema builder functions
- Style resolver functions
- Helper/utility functions
- Registry CRUD operations

**Convention:** Test files named `*.test.ts` (no JSX required).

### Level 2: Component Tests

**What to test:**

- Component renders without errors
- Props are applied correctly
- User interactions (click, type, select) trigger expected behavior
- Schema-driven controls render for each property type
- Responsive styles are applied

**Convention:** Test files named `*.test.tsx` (JSX required).

### Level 3: Integration Tests

**What to test:**

- End-to-end user flows (add section → configure → verify)
- Drag-and-drop workflows
- State management across multiple actions
- Panel interactions (open, close, switch tabs)

**Convention:** Test files named `*.test.tsx`.

### Level 4: Visual Tests (Storybook)

**What to test:**

- Component visual rendering
- Responsive layouts at different viewport sizes
- Interactive states (hover, focus, disabled)
- Accessibility (keyboard navigation, ARIA)

**Convention:** Story files in `src/stories/*.stories.tsx`.

---

## 5. Test Conventions

### File Naming

- Test files: `<name>.test.ts` or `<name>.test.tsx`
- Test directories: `test/` at package root
- Setup files: `test/setup.ts` or `src/test/setup.ts`

### Import Convention

```typescript
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import '@testing-library/jest-dom';
```

### Assertion Convention

Use Vitest's built-in matchers plus jest-dom extensions:

```typescript
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('Hello');
expect(element).toBeDisabled();
expect(spy).toHaveBeenCalledWith('arg');
```

### Mocking

Use `vi.fn()` and `vi.mock()` for mocking:

```typescript
const mockFn = vi.fn();
vi.mock('./module', () => ({ default: vi.fn() }));
```

---

## 6. Running Tests

### Commands

```bash
# Run all tests across all packages
pnpm test

# Run tests for a specific package
pnpm --filter @repo/component-library test
pnpm --filter website-builder-platform test

# Run tests in watch mode
pnpm --filter @repo/component-library test:watch

# Run a specific test file
pnpm --filter website-builder-platform vitest run test/editorReducer.test.ts

# Run tests with coverage
pnpm --filter @repo/component-library test -- --coverage
```

### CI Integration

Tests run automatically in CI (`.github/workflows/ci.yml`) as part of the pipeline:

1. Install → Format check → Lint → Typecheck → **Test** → Build

---

## 7. Coverage Expectations

| Area               | Target                                         |
| :----------------- | :--------------------------------------------- |
| Registry logic     | High coverage (critical path)                  |
| Reducer actions    | High coverage (all action types)               |
| Schema builders    | Medium coverage                                |
| Style resolvers    | Medium coverage                                |
| Section components | Medium coverage (rendering + key interactions) |
| Utility functions  | High coverage                                  |

Coverage reports are generated in `coverage/` directory (text, json, html formats).

---

## 8. Mocking Strategy

### What to Mock

| Scenario              | Mock Approach               |
| :-------------------- | :-------------------------- |
| External dependencies | `vi.mock()`                 |
| Timer functions       | `vi.useFakeTimers()`        |
| Random values         | `vi.spyOn(Math, 'random')`  |
| Console output        | `vi.spyOn(console, 'warn')` |
| Module imports        | `vi.mock('./path')`         |

### What NOT to Mock

| Scenario                 | Reason                                 |
| :----------------------- | :------------------------------------- |
| React components         | Test real rendering behavior           |
| Internal state (reducer) | Test real state transitions            |
| Schema definitions       | Test real schema behavior              |
| CSS styles               | Test via class names and inline styles |

---

## 9. Storybook as Visual Tests

Stories serve as visual regression tests and interactive documentation:

### Story Conventions

- One story file per section component
- Stories demonstrate default state, variants, and edge cases
- Interaction tests via `@storybook/addon-interactions`

### Running Storybook

```bash
# Development
pnpm storybook

# Build static site
pnpm storybook:build

# Preview build
pnpm storybook:preview
```

---

## 10. Known Testing Limitations

| Limitation                            | Mitigation                                              |
| :------------------------------------ | :------------------------------------------------------ |
| jsdom doesn't support CSS layout      | Test class names and inline styles, not computed layout |
| No real browser testing in unit tests | Use Storybook for visual verification                   |
| Drag-and-drop testing is complex      | Use integration tests with mocked DnD events            |
| SCSS styles not tested in unit tests  | Test via class names applied by components              |

---

See also:

- [Workflow & Testing](../development/workflow-and-testing.md) — Development commands
- [Component Library](../packages/component-library.md) — Library test structure
- [Website Builder Platform](../applications/website-builder-platform.md) — Editor test structure
- [Configuration](../configuration/index.md) — Vitest configuration details
