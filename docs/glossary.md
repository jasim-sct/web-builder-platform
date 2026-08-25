# Repository Glossary

This glossary defines technical, business, and internal terminology used across the website builder platform ecosystem. Use these terms consistently in code, comments, commits, and documentation.

---

## Business & Domain Terminology

### Section

A complete, professionally designed visual region of a page (e.g. Header, Hero, Features, Pricing). In the repository, it is the fundamental building block of a website page. Represented by React components in the component library and rendered dynamically on the editor canvas.

### Page Model

A serialized JSON data structure (`PageModel`) that represents a composed page. It contains page metadata (title, description, slug) and an ordered array of `SectionInstance` configurations.

### Section Instance

A specific instance of a section on a page (represented by a unique UUID). It contains the configuration overrides for that section: `props` (content), `style` (per-breakpoint design overrides), and `actions` (declarative click behaviors).

### Props (Properties)

The content and options configuration for a section instance (e.g., text headlines, icon names, list items, boolean flags to show/hide sub-elements).

### Style

The design configuration of a section instance (e.g., padding values, margin overrides, font alignments, border styles).

### Actions

Declarative bindings that map user interactions (like clicking a CTA button or card) to interactive behaviors (e.g. navigation, external URLs, popup toggles, scroll-to-section).

---

## Technical & Architecture Terminology

### Section Registry

A centralized registry store (`SectionRegistryStore`) inside `@repo/component-library`. It is the single source of truth that tracks registered section metadata, schemas, and default states, and provides the `render()` helper to dynamically instantiate section React components.

### Schema-Driven Properties

A visual composition pattern where the sidebar Properties Panel dynamically maps configuration inputs based on a component's property schemas (e.g., `textProp`, `selectProp`, `colorProp`, `arrayProp`) rather than hardcoding custom form controls for each component.

### Serializable State

A pure JavaScript state domain containing only data structures that can be safely serialized into JSON strings (no functions, class instances, DOM references, or React JSX nodes). It includes only Page Model data.

### Ephemeral State

Temporary UI states (e.g., active section selection, hover outlines, dragging coordinates, sidebar panel toggles) that are kept in a separate React Context state. They do not persist when a page is saved and do not participate in the undo/redo history stack.

### Time-Travel History

A centralized undo/redo state manager that maintains a stack of past and future Page Model states to let creators revert or re-apply change actions.

### Responsive Breakpoint Overrides

Inheritable property style overrides matching specific viewport ranges: Desktop (base), Tablet (optional override), and Mobile (optional override).

### Action Runner

A runtime helper in the application that parses declarative `ActionConfig` payloads and executes the associated behavior (e.g. invoking `history.pushState` or calling external API endpoints).

---

## Acronyms & Internal Terminology

### ADR

**Architecture Decision Record**. A short document describing a technical decision, its context, alternatives considered, selected approach, and trade-offs.

### RTL

**React Testing Library**. The library used for component and integration testing.

### SPA

**Single-Page Application**. The type of application format used by the visual web builder platform (`apps/website-builder-platform`).

### CSS Variables (Custom Properties)

Custom properties defined at the root theme level or dynamically computed inside components to map schema colors (e.g., `--sec-heading-color`, `--sec-accent-color`) to visual elements.
