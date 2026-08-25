# Component Library — `@repo/component-library`

This document details the internal structure, modules, and configuration of the Section Library package.

**Package name:** `@repo/component-library`
**Path:** `packages/component-library`
**Purpose:** React sections, schemas, registry, helpers, styles, and Storybook documentation

---

## 1. Overview

The Component Library is the **single source of truth** for all website sections. It provides:

- **React section components** (9 concrete sections)
- **Schema definitions** for props, styles, and actions
- **Section Registry** — a runtime store for registering, querying, and rendering sections
- **Style Resolvers** — helpers that convert responsive style objects to inline CSS
- **SCSS Design System** — shared styles loaded by both Storybook and the Web Editor
- **Storybook** — visual documentation and development environment for all sections

> See [Architecture & Principles](../architecture.md) for how this package fits into the monorepo.

---

## 2. Package Structure

```
packages/component-library/
├── lib/                                    # Source code (consumed directly in dev, built to dist/)
│   ├── main.ts                             # Public entry point (re-exports all modules)
│   ├── types.ts                            # Core types: SectionInstance, SectionStyle, ActionConfig, etc.
│   ├── components/                         # 9 concrete section components
│   │   ├── index.ts                        # Barrel exports + initializeSectionRegistry()
│   │   ├── Header/
│   │   ├── Hero/
│   │   ├── Features/
│   │   ├── Carousel/
│   │   ├── Pricing/
│   │   ├── Testimonials/
│   │   ├── FAQ/
│   │   ├── Contact/
│   │   └── Footer/
│   ├── schema/                             # Schema engine
│   │   ├── index.ts
│   │   ├── types.ts                        # PropertySchema, SectionSchema, ActionPropertySchema
│   │   ├── properties.ts                   # Builder functions: textProp, colorProp, arrayProp, etc.
│   │   ├── style.ts                        # Standard style schema (shared across sections)
│   │   └── actions.ts                      # Action schema builders: buttonActionSchema, submitActionSchema
│   ├── registry/                           # Section Registry system
│   │   ├── index.ts
│   │   ├── types.ts                        # SectionRegistryItem, SectionMetadata, RenderSectionOptions
│   │   └── registry.ts                     # SectionRegistryStore class + exported helpers
│   ├── helpers/
│   │   └── styleResolver.ts                # resolveSectionStyles() and getContentWidthClass()
│   └── assets/
│       └── scss/                           # SCSS design system files
├── src/
│   ├── stories/                            # Storybook stories (one per section)
│   └── test/                               # Test setup
├── test/                                   # Unit and component tests
│   ├── registry/
│   │   └── registry.test.ts
│   └── components/                         # Per-section test files
│       ├── Header/
│       ├── Hero/
│       ├── Features/
│       ├── Carousel/
│       ├── Pricing/
│       ├── Testimonials/
│       ├── FAQ/
│       ├── Contact/
│       └── Footer/
├── .storybook/                             # Storybook configuration
│   ├── main.ts
│   └── preview.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 3. Main Entry Point

`lib/main.ts` re-exports everything:

```typescript
// Core types & instance contracts
export * from './types';

// Section schema engine & property builders
export * from './schema';

// Section registry & runtime resolver
export * from './registry';

// Style resolver helpers
export * from './helpers/styleResolver';

// Concrete website sections & registration
export * from './components';
```

### Public API

| Export                                                                      | Description                                                                                     |
| :-------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| `SectionInstance`, `SectionStyle`, `ResponsiveSectionStyle`, `ActionConfig` | Core data types                                                                                 |
| `SectionSchema`, `PropertySchema`, `ActionPropertySchema`                   | Schema type definitions                                                                         |
| `textProp`, `colorProp`, `arrayProp`, etc.                                  | Schema builder functions                                                                        |
| `standardStyleSchema`                                                       | Shared style schema used by all sections                                                        |
| `sectionRegistry`                                                           | Singleton registry instance                                                                     |
| `getSection()`, `getSectionSchema()`, `getAllSections()`                    | Registry query helpers                                                                          |
| `renderSectionInstance()`                                                   | Render a section from its instance data                                                         |
| `resolveSectionStyles()`, `getContentWidthClass()`                          | Style resolver helpers                                                                          |
| All 9 section components                                                    | `Header`, `Hero`, `Features`, `Carousel`, `Pricing`, `Testimonials`, `FAQ`, `Contact`, `Footer` |

---

## 4. Section Registry

The registry is a singleton `SectionRegistryStore` class that manages all registered sections.

### Registration

Each section is registered in `lib/components/index.ts` via `initializeSectionRegistry()`, which is called automatically when the module loads.

```typescript
registerSection({
  id: HERO_COMPONENT_ID, // e.g. 'hero'
  componentId: HERO_COMPONENT_ID, // Matches instance.componentId
  name: HERO_COMPONENT_ID,
  displayName: HERO_DISPLAY_NAME, // e.g. 'Hero Section'
  category: HERO_CATEGORY, // e.g. 'Hero'
  description: HERO_DESCRIPTION,
  version: '1.0.0',
  tags: ['hero', 'landing', 'headline'],
  component: Hero, // React component
  schema: heroSchema, // SectionSchema
  defaultProps: defaultHeroProps,
  defaultStyle: defaultHeroStyle,
  defaultActions: defaultHeroActions,
  generator: generateHeroInstance, // Factory function
});
```

### Registry Methods

| Method                       | Returns                                     |
| :--------------------------- | :------------------------------------------ |
| `get(componentId)`           | `SectionRegistryItem` or `undefined`        |
| `getSchema(componentId)`     | `SectionSchema` or `undefined`              |
| `getAll()`                   | All registered items                        |
| `getByCategory(category)`    | Items filtered by category                  |
| `getMetadataList()`          | Lightweight metadata for all sections       |
| `render(instance, options?)` | `React.ReactElement` rendered from instance |

### Convenience Exports

```typescript
getSection(componentId)           // → SectionRegistryItem | undefined
getSectionSchema(componentId)    // → SectionSchema | undefined
getAllSections()                  // → SectionRegistryItem[]
getSectionsByCategory(category) // → SectionRegistryItem[]
renderSectionInstance(instance, options?) // → React.ReactElement | null
```

---

## 5. The 9 Section Components

Each section follows an identical module pattern:

| File                  | Purpose                                                   |
| :-------------------- | :-------------------------------------------------------- |
| `<Name>.tsx`          | React component implementation                            |
| `<Name>.schema.ts`    | `SectionSchema` definition (props, style, actions)        |
| `<Name>.defaults.ts`  | Default props, style, and actions                         |
| `<Name>.generator.ts` | `generateXxxInstance()` factory function                  |
| `constants.ts`        | `COMPONENT_ID`, `DISPLAY_NAME`, `CATEGORY`, `DESCRIPTION` |
| `index.ts`            | Barrel exports                                            |

### Section Inventory

| Section      | Component ID   | Category   | Description                                              |
| :----------- | :------------- | :--------- | :------------------------------------------------------- |
| Header       | `header`       | Navigation | Site header with logo, nav links, and CTA                |
| Hero         | `hero`         | Hero       | Landing page hero with headline, subheading, CTA buttons |
| Features     | `features`     | Content    | Feature cards grid showcasing services or benefits       |
| Carousel     | `carousel`     | Media      | Image/media carousel slider for showcasing content       |
| Pricing      | `pricing`      | Business   | Pricing tiers with features lists and CTA buttons        |
| Testimonials | `testimonials` | Conversion | Customer quotes and reviews with ratings                 |
| FAQ          | `faq`          | Utility    | Frequently asked questions accordion                     |
| Contact      | `contact`      | Conversion | Contact form with inquiry fields                         |
| Footer       | `footer`       | Navigation | Site footer with links, copyright, and newsletter        |

### Section Categories

Sections are organized into 7 categories (used for filtering in the Component Panel):

`Navigation` · `Hero` · `Content` · `Media` · `Business` · `Conversion` · `Utility`

---

## 6. Schema System

### Property Schema

Each section defines a `SectionSchema` with three categories:

```typescript
interface SectionSchema {
  props: Record<string, PropertySchema>; // Content & configuration
  style: Record<string, PropertySchema>; // Visual & layout
  actions: Record<string, ActionPropertySchema>; // Interactive behaviors
}
```

### Property Types

| Type         | Builder Function | Default Category |
| :----------- | :--------------- | :--------------- |
| `text`       | `textProp()`     | props            |
| `textarea`   | `textareaProp()` | props            |
| `number`     | `numberProp()`   | props            |
| `boolean`    | `booleanProp()`  | props            |
| `select`     | `selectProp()`   | props            |
| `color`      | `colorProp()`    | style            |
| `image`      | `imageProp()`    | props            |
| `icon`       | `iconProp()`     | props            |
| `spacing`    | (manual)         | style            |
| `typography` | (manual)         | style            |
| `border`     | (manual)         | style            |
| `shadow`     | (manual)         | style            |
| `action`     | (manual)         | actions          |
| `object`     | `objectProp()`   | props            |
| `array`      | `arrayProp()`    | props            |

See [Registry & Schemas](../apis/registry-and-schemas.md) for full schema type mappings.

### Standard Style Schema

`standardStyleSchema` is a shared schema object used by all sections for common style properties (alignment, spacing, typography, background, border, effects). Sections extend or override this as needed.

---

## 7. Style Resolver

`resolveSectionStyles()` converts a `ResponsiveSectionStyle` object into React inline `CSSProperties`.

- Maps style properties to CSS (padding, colors, borders, shadows, etc.)
- Sets CSS custom properties (`--sec-heading-color`, `--sec-body-color`, `--sec-accent-color`)
- `getContentWidthClass()` returns the appropriate container class (`sec-container--contained`, `sec-container--narrow`, etc.)

---

## 8. Storybook Configuration

### Framework

- `@storybook/react-vite` with Vite as the build tool
- Stories located in `src/stories/**/*.stories.@(js|jsx|ts|tsx)`
- Addons: `@storybook/addon-essentials`, `@storybook/addon-interactions`, `@storybook/addon-links`

### Vite Overrides

The `viteFinal` config in `.storybook/main.ts` removes the `vite:dts` plugin to avoid conflicts with Storybook's build process.

### Preview Config

- Full-screen layout (`layout: 'fullscreen'`)
- Loads `lib/assets/scss/main.scss` for section styles
- Auto-docs enabled via `autodocs: 'tag'`

### Stories

Each section has a corresponding story file in `src/stories/`:

| Story File                 | Section      |
| :------------------------- | :----------- |
| `Header.stories.tsx`       | Header       |
| `Hero.stories.tsx`         | Hero         |
| `Features.stories.tsx`     | Features     |
| `Carousel.stories.tsx`     | Carousel     |
| `Pricing.stories.tsx`      | Pricing      |
| `Testimonials.stories.tsx` | Testimonials |
| `FAQ.stories.tsx`          | FAQ          |
| `Contact.stories.tsx`      | Contact      |
| `Footer.stories.tsx`       | Footer       |

---

## 9. Build Process

The `build` script performs three steps:

1. **TypeScript compilation:** `tsc -b` — generates `.d.ts` declaration files
2. **Vite build:** bundles JavaScript/TypeScript into `dist/`
3. **SCSS compilation:** `sass lib/assets/scss/main.scss dist/main.css` — compiles styles

### Exports

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

## 10. Testing

### Test Runner

- **Vitest** with jsdom environment
- **React Testing Library** for component tests
- Coverage via `v8` provider (text, json, html reporters)

### Test Structure

```
test/
├── registry/
│   └── registry.test.ts          # Registry CRUD, render, category filtering
└── components/
    ├── Header/
    ├── Hero/
    ├── Features/
    ├── Carousel/
    ├── Pricing/
    ├── Testimonials/
    ├── FAQ/
    ├── Contact/
    └── Footer/                   # Per-section component and schema tests
```

### Commands

| Command           | Purpose                 |
| :---------------- | :---------------------- |
| `pnpm test`       | Run all tests once      |
| `pnpm test:watch` | Run tests in watch mode |

See [Workflow & Testing](../development/workflow-and-testing.md) for more details.
