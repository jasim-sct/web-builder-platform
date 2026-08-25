# Design System

> **Scope:** All design tokens, primitives, patterns, and styling conventions used across the website builder platform.
> **Source of Truth:** `packages/component-library/lib/assets/scss/` (shared) and `apps/website-builder-platform/src/design-system/` (editor)

---

## 1. Overview

The project has two design system layers:

| Layer                         | Location                                           | Consumers                                |
| :---------------------------- | :------------------------------------------------- | :--------------------------------------- |
| **Shared SCSS Design System** | `packages/component-library/lib/assets/scss/`      | Component Library, Storybook, Web Editor |
| **Editor Design System**      | `apps/website-builder-platform/src/design-system/` | Web Editor only                          |

The shared SCSS design system provides foundational styles (colors, typography, spacing, grid) consumed by all section components. The editor design system provides UI primitives for the editor interface itself.

---

## 2. Shared SCSS Design System

### Location

```
packages/component-library/lib/assets/scss/
├── main.scss              # Entry point — imports all partials
├── _variables.scss        # CSS custom properties (colors, spacing, typography)
├── _base.scss             # Reset and base element styles
├── _grid.scss             # Container width classes
├── _sections.scss         # Section-specific base styles
└── _utilities.scss        # Utility classes
```

### CSS Custom Properties

#### Colors

```scss
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-surface: #ffffff;
  --color-background: #f8fafc;
  --color-text: #0f172a;
  --color-text-secondary: #475569;
  --color-border: #e2e8f0;
  --color-accent: #3b82f6;
}
```

#### Section-Specific Variables

```scss
:root {
  --sec-heading-color: #0f172a;
  --sec-body-color: #475569;
  --sec-accent-color: #3b82f6;
}
```

#### Spacing

```scss
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  --spacing-4xl: 80px;
}
```

#### Typography

```scss
:root {
  --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-family-heading: 'Inter', system-ui, -apple-system, sans-serif;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

#### Border Radius

```scss
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
}
```

#### Shadows

```scss
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

### Container Width Classes

| Class                       | Max Width |
| :-------------------------- | :-------- |
| `.sec-container--contained` | 1200px    |
| `.sec-container--narrow`    | 800px     |
| `.sec-container--wide`      | 1440px    |
| `.sec-container--full`      | 100%      |

---

## 3. Editor Design System

### Location

```
apps/website-builder-platform/src/design-system/
├── index.ts              # Central barrel export
├── tokens/               # Design tokens
│   ├── colors.ts         # Application color palette
│   ├── spacing.ts        # Spacing scale
│   ├── typography.ts     # Font families, sizes, weights
│   ├── shadows.ts        # Box shadow presets
│   ├── radius.ts         # Border radius scale
│   ├── zIndex.ts         # Z-index layers
│   └── transitions.ts    # Animation durations and easing
├── primitives/           # Atomic UI components
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   ├── Toggle/
│   ├── Typography/
│   ├── Tabs/
│   ├── Select/
│   ├── Tooltip/
│   ├── Dropdown/
│   ├── Card/
│   ├── Panel/
│   ├── FormField/
│   ├── Layout/
│   └── Feedback/
├── patterns/             # Composed UI patterns
│   ├── ContextPill/
│   ├── LayoutAlignment/
│   ├── SpacingBoxModel/
│   ├── TypographyControl/
│   └── ColorPicker/
├── shell/                # Application shell
│   ├── PlatformShell.tsx
│   ├── ExportCodeModal.tsx
│   ├── ProjectSettingsModal.tsx
│   └── ToastContainer.tsx
└── context/              # React contexts
    └── ToastContext.tsx
```

---

## 4. Token Usage Conventions

### In Section Components (SCSS)

```scss
.hero {
  color: var(--sec-heading-color);
  background-color: var(--color-surface);
  padding: var(--spacing-4xl) var(--spacing-lg);
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### In Editor Components (TypeScript)

```typescript
import { colors, spacing, typography } from '@/design-system/tokens';

const styles = {
  container: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  heading: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
};
```

---

## 5. Style Precedence

Components follow this precedence for all visual properties:

```
Component fallback (hardcoded default)
    ↓
Component design token (CSS variable)
    ↓
Theme / Design System (shared tokens)
    ↓
Builder configuration (user overrides via schema)
    ↓
Responsive Builder configuration (breakpoint-specific overrides)
    ↓
State-specific configuration (hover, focus, active, disabled)
```

Higher-priority values override lower-priority values only when that property is intentionally exposed for configuration.

---

## 6. CSS Isolation Rules

| Rule                | Description                                                 |
| :------------------ | :---------------------------------------------------------- |
| No global selectors | Never use `button {}`, `div {}`, `p {}` in component styles |
| Component-scoped    | Use BEM or SCSS module conventions                          |
| Token-based         | Consume design tokens instead of hardcoded values           |
| No style leakage    | A component must not modify another component's styles      |

---

## 7. Responsive Design Tokens

### Breakpoints

| Breakpoint | Width   | Usage                                             |
| :--------- | :------ | :------------------------------------------------ |
| Mobile     | 375px   | Small screens, phone portrait                     |
| Tablet     | 768px   | Medium screens, phone landscape / tablet portrait |
| Desktop    | 1280px+ | Large screens, desktop / tablet landscape         |

### Responsive Typography

Use fluid sizing or responsive tokens to prevent overflow:

```scss
.heading {
  font-size: var(--font-size-3xl);

  @media (max-width: 768px) {
    font-size: var(--font-size-2xl);
  }

  @media (max-width: 375px) {
    font-size: var(--font-size-xl);
  }
}
```

---

## 8. Accessibility Requirements

| Requirement         | Implementation                                    |
| :------------------ | :------------------------------------------------ |
| Color contrast      | Minimum 4.5:1 for normal text, 3:1 for large text |
| Focus indicators    | Visible focus outline on interactive elements     |
| Keyboard navigation | All interactive elements reachable via Tab        |
| ARIA labels         | Proper roles and labels for screen readers        |
| Touch targets       | Minimum 44x44px for interactive elements          |

---

## 9. Design System Source of Truth

| Aspect               | Source                                                      |
| :------------------- | :---------------------------------------------------------- |
| Shared CSS tokens    | `packages/component-library/lib/assets/scss/`               |
| Editor design tokens | `apps/website-builder-platform/src/design-system/tokens/`   |
| Section styles       | `packages/component-library/lib/assets/scss/_sections.scss` |
| Style resolver       | `packages/component-library/lib/helpers/styleResolver.ts`   |

---

See also:

- [Component Architecture](../packages/component-architecture.md) — How components consume the design system
- [Component Library](../packages/component-library.md) — SCSS structure and build process
- [Website Builder Platform](../applications/website-builder-platform.md) — Editor design system
- [Registry & Schemas](../apis/registry-and-schemas.md) — How style tokens map to CSS properties
