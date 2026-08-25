# Web Editor Architecture, Development Workflow & Standards

> **Purpose:** System topology, absolute architectural rules, data contracts, and implementation standards for the Web Editor.
> **Status:** Active
> **Last Reviewed:** 2026-08-25
> **Related:** [Architecture & Principles](architecture.md), [Component Architecture](packages/component-architecture.md)

This document defines the architectural rules, system boundaries, data contracts, and implementation standards for the **Web Editor**. All contributors and agents must adhere strictly to these principles before and during development.

---

## 1. System Topology & Layer Separation

The web platform is composed of three distinct, non-overlapping architectural layers:

```
                    SECTION LIBRARY (@repo/component-library)
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                         ▼                         ▼
                     STORYBOOK                 WEB EDITOR
                         │                         │
                  Develop / Test              Build Website
                  Document                    Drag & Drop
                  Visual Validation           Configure
                  A11y Checks                      │
                                                   ▼
                                                WEBSITE
```

### Layer Responsibilities

| Layer                                                             | Responsibility & Ownership                                                                                                                                                                         | Must NOT Own                                                                                           |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Section Library** (`@repo/component-library`)                   | React Sections, Props schemas, Style schemas, Action schemas, Default props/style/actions, Section Registry, Instance Generators, Style Resolvers, SCSS design system, Unit tests                  | Editor UI controls, drag-and-drop state, canvas selection, persistence logic, multi-section page trees |
| **Storybook**                                                     | Isolated component development, visual regression testing, documentation, interaction tests, accessibility validation                                                                              | Website page building, section persistence, page layout composition                                    |
| **Web Editor** (`apps/website-builder-platform` or `apps/editor`) | Section selection, page tree composition, drag-and-drop canvas, layer management, section selection, properties panel, responsive breakpoint editing, undo/redo history, serialization/persistence | Component-specific UI implementations, custom props/style definitions, ad-hoc style resolvers          |

---

## 2. Absolute Architectural Rules

### Rule 1: The Web Editor Consumes the Section Library

The Web Editor is a **composition and configuration engine**, **NEVER** a component implementation engine.

> [!CAUTION]
> **Strictly Prohibited:** Never create replacement components in the editor such as `EditorHero`, `EditorHeader`, `EditorCard`, `EditorPricing`, `EditorCarousel`.

The Web Editor must render the **original Section Library component** directly, wrapped in an editor overlay wrapper (`EditorSectionWrapper`) only when editing controls (selection border, hover ring, drag handle, toolbar, drop zones) are active.

```
┌─────────────────────────────────────────────────────────┐
│ EditorSectionWrapper (Editor UI Only)                   │
│   ├── Selection Border & Hover Outline                  │
│   ├── Floating Section Toolbar (Move, Duplicate, Delete)│
│   ├── Drag Handles & Drop Zones                         │
│   └── ┌───────────────────────────────────────────────┐ │
│       │ Actual Section Component (Section Library)    │ │
│       │   (e.g., Hero, Pricing, Features, Header)     │ │
│       └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Rule 2: Single Source of Truth

The Section Library is the **sole source of truth** for:

- Component code and JSX structure
- Props, Style, and Action schemas
- Default values (`defaultProps`, `defaultStyle`, `defaultActions`)
- Component metadata (`id`, `displayName`, `category`, `description`, `preview`, `tags`)
- SCSS styles and theme variables

The Web Editor must **never duplicate or hardcode** section metadata, property definitions, or defaults. If information is needed, query it dynamically via the `SectionRegistry`:

```typescript
import { getAllSections, getSection, getSectionSchema } from '@repo/component-library';
```

### Rule 3: Schema-Driven Properties

The Web Editor must **never** contain component-specific property inspection logic:

```typescript
// ❌ FORBIDDEN: Hardcoded component switching
if (selectedSection.componentId === 'hero') {
  return <HeroPropertiesPanel />;
}

// ✅ MANDATORY: Universal Schema Renderer
const schema = getSectionSchema(selectedSection.componentId);
return <SchemaPropertiesRenderer schema={schema} values={selectedSection} onChange={updateSection} />;
```

---

## 3. Configuration Hierarchy

All section configuration in the Web Editor is structured under **exactly three top-level categories**:

```
Selected Section Instance
│
├── 1. PROPS (Content & Configuration)
│   ├── Text content (Headlines, Subheadings, Badges)
│   ├── Media items (Images, Icons, Videos)
│   ├── Form fields & items (Features list, Pricing tiers, FAQ items)
│   └── Component specific options (Layout variant, Badges, Ratings)
│
├── 2. STYLE (Visuals & Layout)
│   ├── Layout (Alignment, Direction, Gap, Content Width)
│   ├── Spacing (Padding Top/Bottom/Left/Right, Margin Top/Bottom)
│   ├── Typography (Font Family, Heading Color, Body Color, Font Size, Alignment)
│   ├── Background (Color, Image, Position, Size, Repeat, Overlay)
│   ├── Border (Width, Style, Color, Radius)
│   └── Effects (Box Shadow, Opacity)
│
└── 3. ACTIONS (Declarative Interactive Behaviors)
    ├── Primary CTA Action
    ├── Secondary CTA Action
    ├── Navigation Link Actions
    └── Card / Item Click Actions
```

---

## 4. User-Friendly Non-Technical UX Principles

The Web Editor is designed for non-technical creators. Internal software engineering terminology must never be exposed in the primary interface.

| Internal Concept  | Prohibited in Primary UI                      | User-Friendly Terminology           |
| :---------------- | :-------------------------------------------- | :---------------------------------- |
| Section Component | `React.FC`, `Component`, `DOM Node`           | **Section**                         |
| Props Schema      | `Props`, `JSON Schema`, `State`               | **Content** / **Details**           |
| Responsive Styles | `CSS Variables`, `Flexbox`, `SCSS`            | **Layout**, **Spacing**, **Design** |
| Breakpoints       | `@media (min-width: 1024px)`                  | **Desktop**, **Tablet**, **Mobile** |
| Actions           | `onClick handler`, `EventEmitter`, `Callback` | **Button Action**, **Link Target**  |

---

## 5. Section-First Editing

The fundamental unit of website construction is a **complete, professionally designed Section**.

Users compose pages by selecting and stacking sections from the library:

1. Select section from categorized panel (`Navigation`, `Hero`, `Content`, `Media`, `Business`, `Conversion`, `Utility`).
2. Add section to canvas (via drag-and-drop or click-to-insert).
3. Customize content, styles, and actions in the properties panel.
4. Arrange, reorder, duplicate, or delete sections.

Low-level primitives (`<div>`, `Box`, `Row`, `Col`, `FlexContainer`) must **not** be presented as primary building blocks.

---

## 6. Page Data Model & Serialization Contract

A website page is stored as a purely serializable JSON data structure.

### Page Model Schema

```typescript
export interface PageModel {
  id: string;
  name: string;
  slug: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  sections: SectionInstance[];
}

export interface SectionInstance<P = Record<string, unknown>> {
  id: string; // Unique instance UUID (e.g. 'sec-hero-1708862400')
  componentId: string; // Matches SectionRegistry componentId (e.g. 'hero')
  props: P; // Content values matching PropsSchema
  style?: ResponsiveSectionStyle; // Desktop / Tablet / Mobile style overrides
  actions?: Record<string, ActionConfig>; // Declarative action bindings
}
```

### Strict Serialization Boundaries

> [!IMPORTANT]
> The Page Model must remain **100% JSON-serializable**.
> **NEVER store in Page State:**
>
> - React components or JSX elements
> - Functions, closures, or event handlers (`onClick`, `onChange`)
> - DOM elements or React ref objects
> - Ephemeral editor state (selection, hover, drag coordinates)

---

## 7. State Architecture: Strict Segregation

Editor state is strictly partitioned into two disjoint domains:

```
                          APPLICATION STATE
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
                 ▼                                 ▼
       PERSISTENT PAGE STATE               EDITOR UI STATE
    (Serializable, Undo/Redoable)         (Ephemeral, Local)
                 │                                 │
         ├── Page Metadata                 ├── Selected Section ID
         ├── Section Instances             ├── Hovered Section ID
         ├── Instance Props                ├── Drag & Drop Active State
         ├── Instance Styles               ├── Active Breakpoint (Desktop/Tablet/Mobile)
         └── Instance Actions              ├── Active Sidebar Tab / Open Panels
                                           └── Preview Mode Toggle
```

### Undo / Redo History Scope

Only **Persistent Page State** mutations participate in the undo/redo history stack:

- Adding / deleting a section
- Reordering sections
- Duplicating a section
- Modifying props, styles, or actions

Ephemeral UI state changes (e.g., selecting a section, changing viewport tabs, opening accordions) are **excluded** from history.

---

## 8. Universal Schema Renderer & Supported Types

The Properties Panel utilizes a generic property control renderer driven directly by the Section Library schemas.

### Supported Property Types

The renderer dynamically instantiates the appropriate UI control for every schema field:

| Property Type | Rendered Control                        | Output Data Type                 |
| :------------ | :-------------------------------------- | :------------------------------- |
| `text`        | Single-line text input                  | `string`                         |
| `textarea`    | Multi-line text input / rich text       | `string`                         |
| `number`      | Numeric stepper / slider                | `number`                         |
| `boolean`     | Toggle switch / checkbox                | `boolean`                        |
| `select`      | Dropdown picker / segmented button      | `string \| number`               |
| `color`       | Color picker with palette presets       | `string` (HEX/RGBA)              |
| `image`       | Media asset picker & URL input          | `string`                         |
| `icon`        | Icon selector (Lucide icons)            | `string`                         |
| `link`        | URL / internal page link selector       | `string`                         |
| `action`      | Action configuration builder            | `ActionConfig`                   |
| `spacing`     | 4-way box-model margin/padding input    | `SectionStyle` spacing           |
| `typography`  | Font family, size, weight, color group  | `SectionStyle` typography        |
| `border`      | Width, style, color, radius group       | `SectionStyle` border            |
| `shadow`      | Elevation preset picker                 | `string`                         |
| `object`      | Collapsible nested property group       | `Record<string, unknown>`        |
| `array`       | List manager (add/remove/reorder items) | `Array<Record<string, unknown>>` |

---

## 9. Declarative Actions & Security Model

Actions represent interactive behaviors (e.g., CTA buttons, link clicks, form submissions) in a fully declarative format:

```typescript
export interface ActionConfig {
  type:
    | 'navigate'
    | 'externalUrl'
    | 'openPopup'
    | 'closePopup'
    | 'scrollToSection'
    | 'submitApi'
    | 'formAction'
    | 'custom';
  target?: string;
  url?: string;
  popupId?: string;
  sectionId?: string;
  payload?: Record<string, unknown>;
  openInNewTab?: boolean;
}
```

### Security Guarantees

- **No Unsafe Execution**: `eval()`, `new Function()`, inline script strings, and arbitrary JavaScript execution are **strictly forbidden**.
- **Sanitized Outputs**: All user-provided URLs and inputs are sanitized to prevent `javascript:` URI attacks and XSS.
- **Controlled Runtime Dispatch**: Actions are dispatched by an explicit Action Runner at runtime.

---

## 10. Responsive Editing Engine

The editor supports three core breakpoints matching the Section Library's `ResponsiveSectionStyle`:

1. **Desktop** (Default canvas width: 100%, preview max-width: `1280px`+)
2. **Tablet** (Canvas preview width: `768px`)
3. **Mobile** (Canvas preview width: `375px`)

### Inheritance & Override Rules

- Desktop values serve as base styles.
- Tablet overrides apply when specified; otherwise fall back to Desktop.
- Mobile overrides apply when specified; otherwise fall back to Tablet/Desktop.
- The UI clearly indicates when a property is inheriting vs. explicitly overridden for the active breakpoint.

---

## 11. Multi-Level Testing & Quality Strategy

The Web Editor is validated across four automated and visual testing tiers:

```
┌────────────────────────────────────────────────────────┐
│ 1. Unit Tests (Vitest)                                │
│    State reducers, instance creation, history manager  │
├────────────────────────────────────────────────────────┤
│ 2. Component Tests (React Testing Library)             │
│    Section panel, schema controls, toolbar, properties │
├────────────────────────────────────────────────────────┤
│ 3. Integration Tests                                  │
│    Canvas drop -> instance add -> schema edit -> live  │
├────────────────────────────────────────────────────────┤
│ 4. Visual & E2E Validation (Storybook + Playwright)    │
│    Full user builder workflow, responsive preview      │
└────────────────────────────────────────────────────────┘
```

---

## 12. Step-by-Step Development Workflow

Every editor feature implementation must follow this strict 10-step sequence:

```
1. UNDERSTAND
   Clarify user goal and identify affected subsystems
         │
2. INSPECT EXISTING ARCHITECTURE
   Check Section Library, registry, schemas, SCSS, and types
         │
3. DEFINE DATA MODEL
   Ensure serializable state and clear TypeScript contracts
         │
4. DEFINE COMPONENT BOUNDARIES
   Separate Editor UI wrapper from Section Library component
         │
5. IMPLEMENT SMALLEST ATOMIC CHANGE
   Write focused, clean code without sprawling edits
         │
6. WRITE TESTS
   Unit and component tests covering happy paths & edge cases
         │
7. TYPECHECK (`pnpm typecheck`)
   Zero TypeScript errors under strict mode
         │
8. LINT (`pnpm lint`)
   Zero ESLint errors / warnings
         │
9. BUILD (`pnpm build`)
   Turborepo build passes with caching verification
         │
10. ARCHITECTURAL REVIEW & VERIFICATION
    Validate against the Definition of Done
```

---

## 13. Pre-Change Inspection Checklist

Before modifying any file, verify:

- [ ] Have I inspected the existing `SectionRegistry` and schema definitions?
- [ ] Does an existing utility or resolver already handle this requirement?
- [ ] Am I reusing the Section Library component instead of creating a custom duplicate?
- [ ] Is the data being added completely serializable in JSON?
- [ ] Does this edit stay within the designated package/app boundary?
- [ ] Will this change keep Storybook and existing section consumers 100% operational?

---

## 14. 16-Stage Implementation Roadmap

The Web Editor must be developed incrementally in strict accordance with this sequence:

```
 1. Editor Architecture & App Setup (Vite / Next.js app scaffolding under apps/website-builder-platform)
 2. Page & Section Data Model (TypeScript contracts & State Management)
 3. Section Registry Integration (Connecting @repo/component-library)
 4. Editor Canvas (Section list rendering & frame layout)
 5. Section Library Panel (Categorized sidebar, search, section cards)
 6. Section Lifecycle (Add, Delete, Reorder, Duplicate)
 7. Canvas Selection System (Hover, selection outlines, contextual toolbar)
 8. Properties Panel Shell (Tabbed interface: Props, Style, Actions)
 9. Props Configuration Renderer (Dynamic schema-driven form controls)
10. Style Configuration Renderer (Box model, typography, backgrounds, layout)
11. Actions Configuration Renderer (Declarative action builder)
12. Responsive Breakpoint Editing (Desktop / Tablet / Mobile preview & overrides)
13. Centralized Undo / Redo History (Time-travel state manager)
14. Live Preview Mode (Chrome-less actual website rendering)
15. Serialization & Persistence (Save/Load JSON, LocalStorage / API sync)
16. Comprehensive Validation, A11y, & End-to-End Tests
```

---

## 15. Definition of Done (DoD)

A Web Editor milestone or feature is complete **only** when all of the following criteria are satisfied:

- [x] **Section Library Consumer**: Exclusively consumes `@repo/component-library`; zero duplicated section components.
- [x] **Schema-Driven**: Properties and configuration controls are dynamically rendered from component schemas.
- [x] **Registry-Integrated**: Sections and default values are dynamically populated from `SectionRegistry`.
- [x] **Serializable State**: Page tree is 100% JSON-serializable; no functions, React nodes, or DOM references in page state.
- [x] **Separated UI State**: Ephemeral editor states (selection, hover, active tabs) are strictly segregated from persistent page state.
- [x] **Type Safety**: TypeScript compiles with zero errors under strict mode (`pnpm typecheck`).
- [x] **Lint Clean**: ESLint passes with zero errors/warnings (`pnpm lint`).
- [x] **Test Coverage**: Unit and integration tests pass (`pnpm test`).
- [x] **Build Success**: Turborepo build passes without regressions (`pnpm build`).
- [x] **Storybook Intact**: Section library Storybook continues to run and document all components (`pnpm storybook`).
- [x] **Responsive**: Visual layouts and styling behave consistently across Desktop, Tablet, and Mobile.
- [x] **Accessible**: Keyboard navigation, focus management, and ARIA labels are implemented.
