# ADR-0001: Schema-Driven Properties Panel

- **Status:** Accepted
- **Date:** 2026-08-25
- **Author:** Technical Lead / Antigravity

---

## Context & Problem Statement

The website builder platform allows creators to visually customize properties (Content/Props, Design/Style, and Interactive Actions) for any section component stack on the canvas.

We need an architecture that maps these customized values from the user interface down to component props, while avoiding:

1. Hardcoded section inspection forms in the editor application.
2. Code duplication where component props definitions are maintained in two separate packages.
3. High friction when developers add new components to the library.

## Options Considered

### Option 1: Component-Specific Inspector Panels

Under this model, the editor application would have dedicated form inspector components for each library component (e.g. `HeroInspector.tsx`, `HeaderInspector.tsx`, `PricingInspector.tsx` inside the editor).

- **Pros:**
  - Easy to implement custom layout variations or highly bespoke properties UI in the sidebar.
- **Cons:**
  - Strict leakage of component details into the editor.
  - Requires updating two packages (`@repo/component-library` and `apps/website-builder-platform`) every time a component's props structure is updated.
  - Violates the rule of isolation.

### Option 2: Dynamic Schema-Driven Form Builder (Selected)

Under this model, the component library exports both the React component and a declarative **property schema** (`SectionSchema`). The editor application consumes this schema and dynamically renders appropriate inputs (`text`, `select`, `color`, `array`, `spacing`, etc.) via a universal renderer.

- **Pros:**
  - Single source of truth: `@repo/component-library` owns both the component code and its schema definition.
  - Adding a new section or modifying an existing one requires zero changes in the editor codebase.
  - Guaranteed interface consistency across all components.
- **Cons:**
  - Requires building a robust schema control mapping layer in the editor.
  - Restricts bespoke non-standard UI inputs in the properties tab (everything must match a supported property schema type).

---

## Decision & Rationale

We selected **Option 2 (Dynamic Schema-Driven Form Builder)**.

By having the `@repo/component-library` define schemas for `props`, `style`, and `actions`, the Web Editor remains a pure configuration engine. It does not need to know the semantic details of the sections it renders; it simply renders form inputs that match the schema, and updates the serializable page model accordingly.

---

## Consequences & Trade-offs

### Positives

- **True monorepo isolation:** Code boundaries are strictly preserved.
- **Velocity:** New sections appear in the editor sidebar immediately upon registry registration.
- **Maintainability:** Fixes and enhancements to form controls (e.g. improving the color picker or spacing control) automatically apply to all sections.

### Negatives/Mitigations

- **Complexity:** Complex properties (like nested objects or list arrays) require sophisticated schema builders (e.g. `arrayProp()`, `objectProp()`).
  - _Mitigation:_ We supply standard builder helper functions (`textProp`, `selectProp`, `colorProp`) to simplify schema authoring.
- **Design limits:** Very specific visual inputs are harder to render.
  - _Mitigation:_ If a custom control is absolutely necessary, we can add a new schema type (like `shadow` or `spacing`) to the global `PropertyType` enum to support it universally.
