# Data Models & Type Definitions

> **Scope:** All shared data types, domain models, state structures, and serialization contracts across the monorepo.
> **Source of Truth:** `packages/component-library/lib/types.ts` and `apps/website-builder-platform/src/types/editor.ts`

---

## 1. Overview

The monorepo defines data models at two levels:

1. **Shared types** in `@repo/component-library` — consumed by all applications
2. **Application-specific types** in `apps/website-builder-platform/src/types/` — editor-only state shapes

All data models must be **JSON-serializable** for persistence. See [Serialization Rules](../business-rules/serialization-rules.md) for constraints.

---

## 2. Core Domain Models

### Source: `packages/component-library/lib/types.ts`

#### PageData

The top-level data structure representing a composed website page.

```typescript
interface PageData {
  id: string; // Unique page identifier (e.g. 'page-default-01')
  name: string; // User-facing page name
  slug?: string; // URL slug (e.g. '/')
  sections: SectionInstance[]; // Ordered list of section instances
}
```

#### SectionInstance

A configured instance of a section on a page. This is the fundamental unit of page composition.

```typescript
interface SectionInstance<P = Record<string, unknown>> {
  id: string; // Unique instance ID (e.g. 'hero-1708862400-abc12')
  componentId: string; // Matches SectionRegistry componentId (e.g. 'hero')
  props: P; // Content values matching PropsSchema
  style?: ResponsiveSectionStyle; // Desktop / Tablet / Mobile style overrides
  actions?: Record<string, ActionConfig>; // Declarative action bindings
}
```

#### SectionStyle

All configurable visual properties for a single breakpoint.

```typescript
interface SectionStyle {
  // Layout
  alignment?: 'left' | 'center' | 'right';
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  gap?: string | number;
  contentWidth?: 'contained' | 'narrow' | 'wide' | 'full';

  // Size
  minHeight?: string | number;
  maxHeight?: string | number;
  width?: string | number;
  maxWidth?: string | number;

  // Spacing
  paddingTop?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
  marginTop?: string | number;
  marginBottom?: string | number;

  // Typography
  fontFamily?: string;
  headingColor?: string;
  bodyColor?: string;
  accentColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string | number;
  fontWeight?: string | number;
  lineHeight?: string | number;

  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  backgroundOverlay?: string;

  // Border
  borderWidth?: string | number;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderColor?: string;
  borderRadius?: string | number;

  // Effects
  boxShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
  opacity?: number;
}
```

#### ResponsiveSectionStyle

Breakpoint-aware style container.

```typescript
interface ResponsiveSectionStyle {
  desktop?: SectionStyle; // Base styles (default canvas)
  tablet?: SectionStyle; // Override for 768px viewport
  mobile?: SectionStyle; // Override for 375px viewport
}
```

#### ActionConfig

Declarative action binding for interactive behaviors.

```typescript
type ActionType =
  | 'navigate'
  | 'externalUrl'
  | 'openPopup'
  | 'closePopup'
  | 'scrollToSection'
  | 'submitApi'
  | 'formAction'
  | 'custom';

interface ActionConfig {
  type: ActionType;
  target?: string;
  url?: string;
  popupId?: string;
  sectionId?: string;
  payload?: Record<string, unknown>;
  openInNewTab?: boolean;
}
```

#### SectionCategory

```typescript
type SectionCategory =
  'Navigation' | 'Hero' | 'Content' | 'Media' | 'Business' | 'Conversion' | 'Utility';
```

---

## 3. Schema Types

### Source: `packages/component-library/lib/schema/types.ts`

#### PropertyType

All supported schema property types for the Properties Panel.

```typescript
type PropertyType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'image'
  | 'icon'
  | 'link'
  | 'action'
  | 'spacing'
  | 'typography'
  | 'border'
  | 'shadow'
  | 'object'
  | 'array';
```

#### PropertySchema

Schema definition for a single configurable property.

```typescript
interface PropertySchema<T = unknown> {
  key: string;
  label: string;
  type: PropertyType;
  category?: 'props' | 'style' | 'actions';
  defaultValue?: T;
  required?: boolean;
  description?: string;
  placeholder?: string;
  options?: PropertyOption[];
  validation?: PropertyValidation;
  responsive?: boolean;
  visibility?: (props: Record<string, unknown>) => boolean;
  itemSchema?: Record<string, PropertySchema>;
}
```

#### SectionSchema

Complete schema for a section, organizing properties into three categories.

```typescript
interface SectionSchema {
  props: Record<string, PropertySchema>;
  style: Record<string, PropertySchema>;
  actions: Record<string, ActionPropertySchema>;
}
```

#### ActionPropertySchema

Schema definition for an action binding.

```typescript
interface ActionPropertySchema {
  key: string;
  label: string;
  description?: string;
  supportedActions: ActionType[];
  defaultAction?: ActionType;
}
```

---

## 4. Registry Types

### Source: `packages/component-library/lib/registry/types.ts`

#### SectionRegistryItem

Complete registration entry for a section.

```typescript
interface SectionRegistryItem<P = Record<string, unknown>> {
  id: string;
  componentId: string;
  name: string;
  displayName: string;
  category: SectionCategory;
  description: string;
  version: string;
  tags: string[];
  component: React.ComponentType<BaseSectionProps<P>>;
  schema: SectionSchema;
  defaultProps: P;
  defaultStyle?: ResponsiveSectionStyle;
  defaultActions?: Record<string, ActionConfig>;
  generator: (overrides?: PartialSectionInstance<P>) => SectionInstance<P>;
}
```

#### SectionMetadata

Lightweight metadata for listing sections.

```typescript
interface SectionMetadata {
  id: string;
  name: string;
  displayName: string;
  category: SectionCategory;
  description: string;
  version: string;
  preview?: string;
  tags: string[];
}
```

#### RenderSectionOptions

Options passed when rendering a section instance.

```typescript
interface RenderSectionOptions {
  className?: string;
  onAction?: (actionName: string, actionConfig: ActionConfig) => void;
  isEditor?: boolean;
}
```

---

## 5. Editor State Types

### Source: `apps/website-builder-platform/src/types/editor.ts`

#### EditorState

Complete editor state shape (persistent + ephemeral).

```typescript
interface EditorState {
  page: PageData; // Persistent
  selectedSectionId: string | null; // Ephemeral
  hoveredSectionId: string | null; // Ephemeral
  activeDropIndex: number | null; // Ephemeral
  activePropertyTab: PropertyTab; // Ephemeral
  searchQuery: string; // Ephemeral
  selectedCategory: SectionCategory | 'All'; // Ephemeral
  isComponentPanelOpen: boolean; // Ephemeral
  isComponentPanelMinimized: boolean; // Ephemeral
  componentPanelPosition: { x: number; y: number } | null; // Ephemeral
  isPropertyPanelOpen: boolean; // Ephemeral
  propertyPanelPosition: 'right' | 'left'; // Ephemeral
  isPropsExpanded: boolean; // Ephemeral
}
```

#### EditorAction

Union type of all possible editor actions.

```typescript
type EditorAction =
  | { type: 'ADD_SECTION'; componentId: string; targetIndex?: number }
  | { type: 'REMOVE_SECTION'; sectionId: string }
  | { type: 'DUPLICATE_SECTION'; sectionId: string }
  | { type: 'MOVE_SECTION'; sectionId: string; direction: 'up' | 'down' }
  | { type: 'REORDER_SECTIONS'; sourceIndex: number; destinationIndex: number }
  | { type: 'SELECT_SECTION'; sectionId: string | null; tab?: PropertyTab }
  | { type: 'HOVER_SECTION'; sectionId: string | null }
  | { type: 'SET_ACTIVE_DROP_INDEX'; index: number | null }
  | { type: 'UPDATE_SECTION_PROPS'; sectionId: string; props: Record<string, unknown> }
  | { type: 'UPDATE_SECTION_STYLE'; sectionId: string; style: ResponsiveSectionStyle }
  | { type: 'UPDATE_SECTION_ACTIONS'; sectionId: string; actions: Record<string, ActionConfig> }
  | { type: 'SET_ACTIVE_PROPERTY_TAB'; tab: PropertyTab }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_SELECTED_CATEGORY'; category: SectionCategory | 'All' }
  | { type: 'TOGGLE_COMPONENT_PANEL' }
  | { type: 'SET_COMPONENT_PANEL_OPEN'; isOpen: boolean }
  | { type: 'TOGGLE_COMPONENT_PANEL_MINIMIZE' }
  | { type: 'SET_COMPONENT_PANEL_POSITION'; position: { x: number; y: number } | null }
  | { type: 'TOGGLE_PROPERTY_PANEL' }
  | { type: 'TOGGLE_PROPERTY_PANEL_POSITION' }
  | { type: 'TOGGLE_PROPS_EXPAND' }
  | { type: 'SET_PAGE_NAME'; name: string }
  | { type: 'RESET_PAGE' };
```

#### PropertyTab

```typescript
type PropertyTab = 'style' | 'props' | 'actions';
```

---

## 6. Design Token Types

### Source: `apps/website-builder-platform/src/design-system/tokens/`

| Token File       | Contents                                               |
| :--------------- | :----------------------------------------------------- |
| `colors.ts`      | Application color palette (primary, neutral, semantic) |
| `spacing.ts`     | Spacing scale (xs, sm, md, lg, xl, 2xl)                |
| `typography.ts`  | Font families, sizes, weights, line heights            |
| `shadows.ts`     | Box shadow presets (sm, md, lg, xl)                    |
| `radius.ts`      | Border radius scale                                    |
| `zIndex.ts`      | Z-index layers (dropdown, modal, toast, tooltip)       |
| `transitions.ts` | Animation durations and easing curves                  |

---

## 7. Relationships

```
PageData
  └── SectionInstance[]
        ├── componentId ─────→ SectionRegistryItem.componentId
        ├── props ───────────→ SectionSchema.props (shape)
        ├── style ───────────→ SectionSchema.style (shape)
        │     └── desktop/tablet/mobile → SectionStyle
        └── actions ─────────→ SectionSchema.actions (shape)
              └── ActionConfig
```

See also:

- [Serialization Rules](../business-rules/serialization-rules.md) — State transition rules and constraints
- [Component Library](../packages/component-library.md) — Schema system and property builders
- [Registry & Schemas](../apis/registry-and-schemas.md) — How schemas drive the Properties Panel
- [Glossary](../glossary.md) — Term definitions
