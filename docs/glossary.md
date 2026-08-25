# Repository Glossary

> **Purpose:** Centralized terminology reference for the entire monorepo.
> **Status:** Active
> **Last Reviewed:** 2026-08-25
> **Usage:** Use these terms consistently in code, comments, commits, and documentation.

---

## Business & Domain Terminology

### Section

A complete, professionally designed visual region of a page (e.g., Header, Hero, Features, Pricing). The fundamental building block of a website page. Represented as React components in the Component Library and rendered dynamically on the Editor canvas.

### Page Model / PageData

A serialized JSON data structure representing a composed page. Contains page metadata (name, slug) and an ordered array of SectionInstance configurations. Must remain 100% JSON-serializable at all times.

### Section Instance

A specific instance of a section on a page, identified by a unique ID (e.g., `hero-1708862400-abc12`). Contains configuration overrides: `props` (content), `style` (per-breakpoint design), and `actions` (declarative behaviors).

### Props (Properties)

Content and options configuration for a section instance (e.g., text headlines, icon names, list items, boolean flags). Controlled by the section's `schema.props`.

### Style

Design configuration of a section instance (e.g., padding, colors, borders, shadows, typography). Controlled by the section's `schema.style`. Supports per-breakpoint overrides (Desktop, Tablet, Mobile).

### Actions

Declarative bindings mapping user interactions (clicking a CTA button) to behaviors (navigation, external URLs, popups, scroll). Controlled by the section's `schema.actions`. Must use `ActionConfig` objects — never inline functions.

### Section Category

The organizational grouping for sections: Navigation, Hero, Content, Media, Business, Conversion, Utility. Used for filtering in the Component Panel.

### Builder / Web Editor / Editor

The visual drag-and-drop application (`apps/website-builder-platform`) where users compose pages by selecting, arranging, and customizing sections. It is a composition and configuration engine — never a component implementation engine.

### Component Panel

The section library browser in the Editor where users find and select sections to add to their page. Displays sections as draggable cards organized by category.

### Properties Panel / Property Panel

The schema-driven interface in the Editor for editing the selected section's content (Props), design (Style), and interactions (Actions).

### Canvas

The main editing area in the Editor where sections are rendered and arranged. Sections are wrapped in `EditorSectionWrapper` for selection, hover, and drag interactions.

---

## Technical & Architecture Terminology

### Section Registry

A centralized singleton store (`SectionRegistryStore`) in `@repo/component-library`. The single source of truth for registered section metadata, schemas, defaults, and components. Provides `getSection()`, `getSectionSchema()`, `renderSectionInstance()`.

### Schema-Driven Properties

A pattern where the Properties Panel dynamically renders form controls based on a section's property schema (`SectionSchema`) rather than hardcoding component-specific forms.

### SectionSchema

The complete configuration contract for a section, defining `props`, `style`, and `actions` schemas. Determines what the Properties Panel renders.

### PropertySchema

Schema definition for a single configurable property. Includes `key`, `label`, `type`, `defaultValue`, `options`, `validation`, `responsive`, etc.

### PropertyType

The type of a schema property: `text`, `textarea`, `number`, `boolean`, `select`, `color`, `image`, `icon`, `link`, `action`, `spacing`, `typography`, `border`, `shadow`, `object`, `array`.

### Standard Style Schema

A shared schema object (`standardStyleSchema`) used by all sections for common style properties (alignment, spacing, typography, background, border, effects). Sections extend or override as needed.

### Serializable State / Persistent State

Pure JavaScript state containing only JSON-serializable data (no functions, DOM refs, JSX). Includes page metadata, section instances, props, styles, and actions. Participates in undo/redo history.

### Ephemeral State / UI State

Temporary UI states (selection, hover, drag coordinates, panel visibility, search queries) kept separate from page state. Does not persist and does not participate in undo/redo.

### Time-Travel History / Undo/Redo

A centralized undo/redo mechanism maintaining past and future Page Model states. Only persistent state mutations participate.

### Responsive Breakpoint Overrides

Per-viewport style overrides: Desktop (base), Tablet (768px), Mobile (375px). Inheritance chain: Desktop → Tablet (if set) → Mobile (if set).

### Action Runner

A runtime helper that parses declarative `ActionConfig` payloads and executes the associated behavior (navigation, scroll, popup, etc.). No arbitrary code execution.

### ActionConfig

Declarative action binding: `{ type: 'navigate', url: '/pricing', openInNewTab: false }`. Must never contain functions or event handlers.

### Section Generator

A factory function (`generateXxxInstance()`) that creates a `SectionInstance` with default values and a unique ID. Called when a user adds a section to the canvas.

### Style Resolver

A helper function (`resolveSectionStyles()`) that converts `ResponsiveSectionStyle` objects into React inline `CSSProperties`. Maps style properties to CSS and sets CSS custom properties.

### CSS Custom Properties

CSS variables used for dynamic theming: `--sec-heading-color`, `--sec-body-color`, `--sec-accent-color`. Set by the style resolver, consumed by section components.

### EditorSectionWrapper

The editor overlay component wrapping each section on the canvas. Provides selection borders, hover outlines, floating toolbar, drag handles, and drop zones. The actual section component renders inside.

### PlatformShell

The application shell component providing the overall Editor layout (header, panels, canvas area).

---

## Package & Tooling Terminology

### Monorepo

A single repository containing multiple packages and applications managed by pnpm workspaces and Turborepo.

### Workspace Protocol

pnpm's `workspace:*` dependency protocol for referencing local packages within the monorepo.

### Turborepo

The build orchestration tool managing task execution, caching, and dependency ordering across the monorepo.

### ^build

Turborepo's topological dependency notation meaning "build all workspace dependencies first."

### Section Library

The shared package (`packages/component-library`) containing all section components, schemas, registry, helpers, styles, and Storybook stories.

### Component Library

Synonymous with Section Library. Package name: `@repo/component-library`.

### Design System (SCSS)

The shared SCSS stylesheet system in `packages/component-library/lib/assets/scss/` providing CSS custom properties, typography, spacing, and container classes.

### Design System (Editor)

The editor-specific design system in `apps/website-builder-platform/src/design-system/` with tokens, primitives, patterns, and shell components.

---

## Acronyms

| Acronym | Full Form                    |
| :------ | :--------------------------- |
| ADR     | Architecture Decision Record |
| RTL     | React Testing Library        |
| SPA     | Single-Page Application      |
| SCSS    | Sassy CSS (CSS preprocessor) |
| HMR     | Hot Module Replacement       |
| DnD     | Drag and Drop                |
| CTA     | Call to Action               |
| JSX     | JavaScript XML               |
| CSS     | Cascading Style Sheets       |
| CI      | Continuous Integration       |
| CD      | Continuous Deployment        |
| PR      | Pull Request                 |
| DoD     | Definition of Done           |

---

## Important Statuses

| Status       | Meaning                                   |
| :----------- | :---------------------------------------- |
| Accepted     | ADR has been approved and is in effect    |
| Superseded   | ADR has been replaced by a newer decision |
| Deprecated   | Feature or API is no longer recommended   |
| Experimental | Feature is in development and may change  |

---

## Important Identifiers

| Identifier          | Format                                  | Example                     |
| :------------------ | :-------------------------------------- | :-------------------------- |
| Section Instance ID | `${componentId}-${timestamp}-${random}` | `hero-1708862400-abc12`     |
| Component ID        | `kebab-case`                            | `hero`, `header`, `pricing` |
| Page ID             | Descriptive string                      | `page-default-01`           |
| Package Name        | `@repo/kebab-case`                      | `@repo/component-library`   |

---

See also:

- [Architecture & Principles](architecture.md) — System topology
- [Component Architecture](packages/component-architecture.md) — Component boundary rules
- [Data Models](data/index.md) — Type definitions
- [Registry & Schemas](apis/registry-and-schemas.md) — Schema system
