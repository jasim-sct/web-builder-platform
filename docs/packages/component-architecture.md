# Component Architecture & Builder Override Rules

This document outlines the core architecture principles, component boundaries, spacing rules, configuration schemas, design system integrations, and responsive rules for all components built in the **Component Library** (`@repo/component-library`) and consumed by the **Website Builder Platform**.

---

## 1. Core Architecture Principle

Every component must be independently usable, predictable, configurable, and reusable inside and outside the Builder Platform.

### Responsibilities Breakdown

#### The Component Owns:

- Internal layout
- Internal spacing
- Internal alignment
- Internal component structure
- Internal typography hierarchy
- Internal interaction behavior
- Internal responsive behavior
- Internal visual defaults
- Internal accessibility behavior

#### The Builder Platform Owns:

- Component placement
- Component-level configuration
- Page-level configuration
- Theme configuration
- Design-system configuration
- Builder-specific overrides
- Responsive configuration
- User-configurable visual properties

> **Primary Rule:** The component must never depend on the Builder Platform to function correctly.

---

## 2. Component Boundary

A component must have a clearly defined visual and functional boundary.

```text
Component
├── Root
├── Internal Layout
├── Content
├── Internal Spacing
├── Internal Typography
├── Internal Elements
└── Interaction
```

The component controls everything required to render itself correctly. The Builder controls how the component is configured and positioned within the page.

```text
Builder
    ↓
Component Configuration
    ↓
Component
    ↓
Rendered UI
```

The Builder must not directly manipulate the internal DOM structure of a component.

---

## 3. Internal Spacing Rule

All spacing required for the component to function correctly must be maintained inside the component.

### Examples of Internal Spacing:

- Padding between icon and label
- Gap between title and description
- Spacing between form fields
- Internal card padding
- Button content spacing
- Icon-to-text spacing
- Internal section spacing
- Content alignment spacing

These must be part of the component's implementation or component design tokens.

```text
Card
└── padding
    ├── Header
    │   └── gap
    ├── Content
    │   └── gap
    └── Footer
        └── gap
```

The component must not depend on the Builder to provide these internal spacing values.

---

## 4. Component Margin Rule

Margin represents external spacing and must be treated differently from internal spacing.

A component must not use hard-coded external margins that prevent Builder configuration.

### Bad Practice:

```scss
.component {
  margin: 24px; // Prevents Builder layout configuration
}
```

### Preferred Approach:

External spacing must be configurable by the Builder:

```text
Component
├── Internal spacing → Component
└── External spacing → Builder
```

The component may still use internal margins when required for its own internal layout, but those margins must not become an unavoidable external layout dependency.

---

## 5. Builder Override Principle

Any property intentionally exposed as configurable must be overrideable through Builder configuration.

The Builder must never require source-code changes to customize an exposed component property.

### Configurable Properties Include:

- Margin
- Padding (where externally configurable)
- Width / Height / Min-Width / Max-Width
- Alignment / Position
- Background / Border / Border Radius / Shadow
- Typography / Text Color / Icon Color
- Component Visibility / Opacity
- Responsive Behavior / Layout Direction
- Gap (where intentionally exposed)
- State-specific styles

The component must provide sensible defaults while allowing Builder configuration to override those defaults.

---

## 6. Color Override Rule

Component default colors must never make Builder-level customization impossible. Avoid hard-coded hex or RGB values that cannot be overridden.

### Bad:

```scss
color: #2563eb;
background: #ffffff;
```

### Preferred:

```scss
color: var(--component-text-color);
background: var(--component-background-color);
```

### Precedence:

```text
Component default
        ↓
Design System Token
        ↓
Builder configuration
        ↓
Rendered value
```

The final configured value must have a predictable precedence.

---

## 7. Style Precedence

A consistent style precedence system must be maintained across every component.

### Recommended Precedence Hierarchy:

```text
Component fallback
        ↓
Component design token
        ↓
Theme / Design System
        ↓
Builder configuration
        ↓
Responsive Builder configuration
        ↓
State-specific configuration
```

A higher-priority configuration may override a lower-priority value only when that property is explicitly exposed for configuration. Internal implementation details must not accidentally become Builder overrides.

---

## 8. Configuration Categories

Every configurable component property must belong to a clearly defined configuration category.

### 1. Props

Control component data and behavior (`title`, `description`, `image`, `items`, `variant`, `size`, `disabled`, `loading`).

### 2. Style

Control externally configurable visual properties (`margin`, `width`, `background`, `color`, `border`, `radius`, `shadow`, `typography`, `alignment`).

### 3. Actions

Control component interactions (`onClick`, `onSubmit`, `onChange`, `navigation`, `open modal`, `open URL`, `trigger action`).

The component API must keep these concerns strictly separated.

---

## 9. Design System Integration

Components must be built using the platform Design System (`packages/component-library/lib/assets/scss/`).

Do not introduce arbitrary visual values when an equivalent design token exists for:

- Colors
- Typography
- Spacing
- Radius
- Shadows
- Breakpoints
- Z-index
- Motion
- Sizing

### Example Tokens:

```text
--color-primary
--color-surface
--color-text
--spacing-sm
--spacing-md
--radius-md
--shadow-sm
```

The Builder configures tokens or component-level values without requiring component source code changes.

---

## 10. No Component-Specific Builder Hacks

The Builder must not contain component-specific CSS hacks such as:

```scss
.component-name {
  margin: ...;
}

.another-component {
  color: ...;
}
```

The Builder communicates configuration strictly through the component's defined configuration contract (`SectionSchema`).

```text
Component
├── Rendering
├── Configuration Schema
├── Default Configuration
├── Design Tokens
└── Behavior
```

This keeps the Builder generic and allows new components to be added without modifying Builder rendering logic.

---

## 11. Configuration Schema

Every Builder-compatible component must define a configuration contract (`SectionSchema`).

```text
Component Schema
├── Props
├── Style
│   ├── Layout
│   ├── Spacing
│   ├── Colors
│   ├── Typography
│   ├── Border
│   └── Effects
└── Actions
```

The Builder discovers configurable properties from this contract rather than maintaining a separate hard-coded list for every component.

---

## 12. Default Values

Every configurable property must have a safe default.

- `background` → Design System surface token
- `text color` → Design System text token
- `margin` → Builder default / none
- `border radius` → Design System radius token

Removing a Builder override must restore the component to its defined default behavior.

---

## 13. Responsive Configuration

Responsive values must be configurable without duplicating component implementations.

```text
Desktop:  margin: 24px
Tablet:   margin: 16px
Mobile:   margin: 8px
```

The component consumes the resolved responsive configuration (`SectionStyle`). The Builder owns responsive overrides; the component owns intrinsic responsive behavior.

---

## 14. Internal vs External Layout

Every component must explicitly distinguish between:

### Internal Layout (Owned by Component)

- Icon → Label
- Title → Description
- Input → Error
- Header → Content
- Content → Footer

### External Layout (Owned by Builder)

- Component A ↓ (margin/gap) Component B ↓ (margin/gap) Component C

---

## 15. Avoid Configuration Leakage

Do not expose every internal CSS property as Builder configuration. Expose only properties that represent meaningful component customization.

Do **not** expose internal implementation details such as:

- Internal wrapper margin
- Internal DOM padding
- Internal flex implementation
- Internal positioning
- Internal element selectors

The component API must remain stable even if its internal implementation changes.

---

## 16. Component Variants

Reusable visual differences should use controlled variants rather than arbitrary Builder CSS.

```text
variant:
  primary
  secondary
  outlined
  subtle
```

The Builder selects the supported variant; the component determines how that variant renders.

---

## 17. State Styling

Components must define their supported states consistently:

- `default`
- `hover`
- `focus`
- `active`
- `disabled`
- `loading`
- `selected`
- `error`
- `success`

State behavior belongs to the component. Builder configuration may customize state appearance only when those properties are intentionally exposed.

---

## 18. Accessibility

Accessibility must be implemented inside the component. The Builder must not be responsible for making a component accessible.

Components must handle:

- Semantic HTML
- Keyboard interaction & Focus behavior
- ARIA attributes & Screen-reader behavior
- Accessible labels & Error messaging
- Disabled state & Loading state
- Color contrast requirements

Builder configuration must not be allowed to break required accessibility behavior.

---

## 19. Component Independence

Every component must be independently renderable without assuming:

- A specific page
- A specific Builder instance
- A specific parent component
- A specific route
- A specific global CSS class or DOM structure outside itself

All dependencies must be explicit.

---

## 20. CSS Isolation

Component styles must be isolated and predictable. Avoid global selectors (`button {}`, `div {}`, `p {}`, `h1 {}`) inside component styles.

Prefer component-scoped selectors and BEM / SCSS module conventions.

---

## 21. No Global Style Dependency

A component must not require application-level CSS for its basic rendering. Required styles must live with the component or the shared Design System package (`packages/component-library`).

---

## 22. Builder Must Be Component-Agnostic

The Builder platform must understand component capabilities via metadata, not hard-coded component checks.

```text
Component Metadata
        ↓
Supported Props
Supported Styles
Supported Actions
        ↓
Builder Configuration UI
```

---

## 23. Configuration Resolution

The final component configuration must be resolved before rendering:

```text
Default Configuration
        +
Design System
        +
Builder Configuration
        +
Responsive Configuration
        +
State Configuration
        ↓
Resolved Component Configuration
        ↓
Component
```

---

## 24. Prevent Impossible Overrides

Builder configuration must not expose properties that the component cannot safely support.

Every exposed property must be:

- Configurable
- Predictable
- Responsive where applicable
- Persistable
- Renderable

---

## 25. Component Development Checklist

Every new Builder-compatible component must verify:

- [ ] Internal spacing is owned by the component.
- [ ] External spacing is configurable by the Builder where required.
- [ ] Component defaults are defined.
- [ ] Design System tokens are used.
- [ ] Configurable colors can be overridden.
- [ ] Configurable typography can be overridden.
- [ ] Configurable layout properties can be overridden.
- [ ] Margin configuration works without modifying component source.
- [ ] Responsive configuration is supported where applicable.
- [ ] Props, Style, and Actions are separated.
- [ ] Configuration schema is defined.
- [ ] Component does not depend on Builder-specific CSS.
- [ ] Component does not depend on global application CSS.
- [ ] Component styles are isolated.
- [ ] Internal implementation details are not unnecessarily exposed.
- [ ] Variants are explicitly defined.
- [ ] Component states are defined.
- [ ] Accessibility is handled internally.
- [ ] Component can render independently.
- [ ] Builder can configure the component without component-specific Builder hacks.
- [ ] Removing an override restores the component's default behavior.
- [ ] Component configuration can be persisted and restored reliably.

---

## 26. Architectural Model

```text
┌───────────────────────────────────────┐
│             BUILDER PLATFORM          │
│                                       │
│  Placement                            │
│  External spacing                     │
│  Configuration                        │
│  Responsive overrides                 │
│  Design System selection              │
│  Component Props / Style / Actions    │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│              COMPONENT                │
│                                       │
│  Rendering                            │
│  Internal layout                      │
│  Internal spacing                     │
│  Internal behavior                    │
│  Accessibility                        │
│  Component states                     │
│  Component defaults                   │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│             DESIGN SYSTEM             │
│                                       │
│  Colors                               │
│  Typography                           │
│  Spacing tokens                       │
│  Radius                              │
│  Shadows                             │
│  Breakpoints                         │
│  Motion                              │
└───────────────────────────────────────┘
```

> **Primary Rule:** Components own their internal implementation and required internal spacing. The Builder owns externally configurable presentation and placement. Every intentionally exposed property must be overrideable through the component configuration contract without modifying component source code or introducing Builder-specific CSS hacks.

---

## 27. Responsive-First Component Architecture

Every component must be designed as a **responsive component by default**. A component must be capable of rendering correctly across different viewport widths and device types without requiring separate component implementations.

```text
Available Width
      ↓
Component Responsive Logic
      ↓
Resolved Layout
      ↓
Rendered Component
```

### 27.1 Viewport-Independent Design

The same component must support Desktop, Laptop, Tablet, Mobile, narrow containers, wide containers, and side panels.

### 27.2 Container-Aware Responsiveness

Responsiveness should react to the **available container width** wherever technically appropriate, not strictly the browser window width.

### 27.3 No Fixed-Platform Layout

Components use Flexbox, CSS Grid, fluid sizing, relative units, and container queries. Fixed dimensions are only used when explicitly required by design.

### 27.4 Responsive Internal Layout

The component itself owns how its layout stacks or aligns across widths (e.g. side-by-side on desktop, stacked on mobile).

### 27.5 Responsive Breakpoints

Breakpoints must be sourced from the shared Design System (`packages/component-library/lib/assets/scss/`).

### 27.6 Responsive Configuration

The Builder provides responsive overrides (`mobile`, `tablet`, `desktop`) for exposed properties.

### 27.7 Responsive Configuration Precedence

```text
Component Default → Design System → Builder Base → Responsive Override → State → Resolved Value
```

### 27.8 Content Responsiveness

Components must handle variable text lengths, dynamic content, and optional elements without layout breaking.

### 27.9 Responsive Typography

Typography uses fluid sizing or responsive tokens to prevent overflow or horizontal scrolling.

### 27.10 Responsive Spacing

Internal padding and gaps adapt responsively inside the component implementation.

### 27.11 Responsive Media

Images, videos, and icons adapt to available space while preserving aspect ratios.

### 27.12 Responsive Accessibility

Touch targets, focus outlines, and font sizes must remain accessible across all sizes.

### 27.13 Builder Preview Requirement

The component renders identically in the Builder responsive preview as in production.

### 27.14 Responsive Component Rule

> **A component must remain visually correct, functionally usable, and accessible when its available width changes across supported viewport and container sizes.**
