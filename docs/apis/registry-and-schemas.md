# Registry & Schemas — Dynamic API & Property Rendering

This document defines how the Section Registry and Schema system drive the Properties Panel, the universal schema-to-control mapping, and responsive layout inheritance.

---

## 1. Overview

The Properties Panel is a **universal, schema-driven form renderer**. It never contains hardcoded component-specific logic. Instead, it dynamically renders the appropriate UI control for every field defined in a section's schema.

> See [Component Library](../packages/component-library.md) for the full schema system.
> See [ADR-0001](../decisions/0001-schema-driven-properties-panel.md) for the architectural decision behind this approach.

---

## 2. Schema Types Mapping

### Property Types → UI Controls

| Schema Type  | PropertyType | UI Control                             | Output Data Type                 | Description                                     |
| :----------- | :----------- | :------------------------------------- | :------------------------------- | :---------------------------------------------- |
| `text`       | text         | Single-line text input                 | `string`                         | Short text fields (headlines, names, URLs)      |
| `textarea`   | textarea     | Multi-line text input                  | `string`                         | Long text (descriptions, body content)          |
| `number`     | number       | Numeric stepper / slider               | `number`                         | Numeric values (counts, sizes, ratings)         |
| `boolean`    | boolean      | Toggle switch                          | `boolean`                        | On/off toggles (show/hide, enable/disable)      |
| `select`     | select       | Dropdown / segmented button            | `string \| number`               | Fixed option sets (alignment, size presets)     |
| `color`      | color        | Color picker with palette              | `string` (HEX/RGBA)              | Color values (text, background, border)         |
| `image`      | image        | Media asset picker / URL input         | `string`                         | Image URLs for backgrounds, logos, etc.         |
| `icon`       | icon         | Icon selector (Lucide icons)           | `string`                         | Icon name strings                               |
| `link`       | link         | URL / internal page link selector      | `string`                         | Navigation links                                |
| `action`     | action       | Action configuration builder           | `ActionConfig`                   | Declarative action bindings                     |
| `spacing`    | spacing      | 4-way box-model input                  | `SectionStyle` spacing           | Padding and margin values                       |
| `typography` | typography   | Font family, size, weight, color group | `SectionStyle` typography        | Text styling properties                         |
| `border`     | border       | Width, style, color, radius group      | `SectionStyle` border            | Border styling properties                       |
| `shadow`     | shadow       | Elevation preset picker                | `string`                         | Box shadow presets (sm, md, lg, xl)             |
| `object`     | object       | Collapsible nested property group      | `Record<string, unknown>`        | Nested configuration objects                    |
| `array`      | array        | List manager (add/remove/reorder)      | `Array<Record<string, unknown>>` | Repeatable item lists (features, pricing tiers) |

### Style Properties (Direct Mapping)

| Style Property                 | Schema Type | CSS Output                               |
| :----------------------------- | :---------- | :--------------------------------------- |
| `alignment`                    | select      | `text-align` (via flex children)         |
| `contentWidth`                 | select      | Container max-width class                |
| `paddingTop/Bottom/Left/Right` | text        | `padding-*`                              |
| `marginTop/Bottom`             | text        | `margin-*`                               |
| `headingColor`                 | color       | `--sec-heading-color` CSS variable       |
| `bodyColor`                    | color       | `--sec-body-color` CSS variable, `color` |
| `accentColor`                  | color       | `--sec-accent-color` CSS variable        |
| `textAlign`                    | select      | `text-align`                             |
| `backgroundColor`              | color       | `background-color`                       |
| `backgroundImage`              | text        | `background-image: url(...)`             |
| `backgroundOverlay`            | text        | Overlay pseudo-element                   |
| `borderWidth`                  | text        | `border-width`                           |
| `borderColor`                  | color       | `border-color`                           |
| `borderRadius`                 | text        | `border-radius`                          |
| `boxShadow`                    | select      | `box-shadow` (preset or custom)          |
| `opacity`                      | number      | `opacity`                                |

---

## 3. Property Schema Structure

### PropertySchema

```typescript
interface PropertySchema<T = unknown> {
  key: string; // Unique property key (matches instance.props[key])
  label: string; // User-facing label
  type: PropertyType; // Schema type (text, color, array, etc.)
  category?: 'props' | 'style' | 'actions'; // Tab assignment
  defaultValue?: T; // Default value when section is created
  required?: boolean; // Whether the field is required
  description?: string; // Tooltip / help text
  placeholder?: string; // Placeholder text for inputs
  options?: PropertyOption[]; // For select type: available options
  validation?: PropertyValidation; // min, max, minLength, maxLength, pattern, required
  responsive?: boolean; // Whether this property supports per-breakpoint overrides
  visibility?: (props) => boolean; // Conditional visibility based on other props
  itemSchema?: Record<string, PropertySchema>; // For object/array: nested schema
}
```

### ActionPropertySchema

```typescript
interface ActionPropertySchema {
  key: string; // Action key (matches instance.actions[key])
  label: string; // User-facing label
  description?: string; // Help text
  supportedActions: ActionType[]; // Which action types are allowed
  defaultAction?: ActionType; // Default action type when created
}
```

---

## 4. Schema Builder Functions

The schema system provides builder functions for common property types:

| Builder                                                        | Parameters                | Returns       |
| :------------------------------------------------------------- | :------------------------ | :------------ |
| `textProp(key, label, defaultValue?, options?)`                | PropertySchema\<string\>  | text type     |
| `textareaProp(key, label, defaultValue?, options?)`            | PropertySchema\<string\>  | textarea type |
| `numberProp(key, label, defaultValue?, validation?, options?)` | PropertySchema\<number\>  | number type   |
| `booleanProp(key, label, defaultValue?, options?)`             | PropertySchema\<boolean\> | boolean type  |
| `selectProp(key, label, optionsList, defaultValue, options?)`  | PropertySchema            | select type   |
| `colorProp(key, label, defaultValue?, options?)`               | PropertySchema\<string\>  | color type    |
| `imageProp(key, label, defaultValue?, options?)`               | PropertySchema\<string\>  | image type    |
| `iconProp(key, label, defaultValue?, options?)`                | PropertySchema\<string\>  | icon type     |
| `objectProp(key, label, itemSchema, defaultValue?, options?)`  | PropertySchema            | object type   |
| `arrayProp(key, label, itemSchema, defaultValue?, options?)`   | PropertySchema            | array type    |

### Action Schema Builders

| Builder                                        | Parameters           | Returns                                                               |
| :--------------------------------------------- | :------------------- | :-------------------------------------------------------------------- |
| `buttonActionSchema(key, label, description?)` | ActionPropertySchema | navigate, externalUrl, openPopup, closePopup, scrollToSection, custom |
| `submitActionSchema(key, label, description?)` | ActionPropertySchema | submitApi, formAction, custom                                         |

---

## 5. Dynamic Form Controls Layout

The Properties Panel renders controls based on the schema:

```
PropertyPanel
├── Tab Bar: [Props] [Style] [Actions]
│
├── PropsTab
│   ├── Section: "Content"
│   │   ├── TextInputControl (headline)
│   │   ├── TextInputControl (subheading)
│   │   └── ImageControl (logo)
│   ├── Section: "Items"
│   │   └── ArrayListControl (features[])
│   │       └── Item: objectProp(...)
│   │           ├── TextInputControl (title)
│   │           ├── TextareaControl (description)
│   │           └── IconControl (icon)
│
├── StyleTab
│   ├── Section: "Layout"
│   │   └── LayoutAlignmentControl (alignment, contentWidth)
│   ├── Section: "Spacing"
│   │   └── WSDndSpacerControl (paddingTop/Bottom/Left/Right)
│   ├── Section: "Typography"
│   │   └── TypographyControl (headingColor, bodyColor, textAlign)
│   ├── Section: "Background"
│   │   └── BackgroundControl (backgroundColor, backgroundImage, overlay)
│   └── Section: "Border & Effects"
│       └── BorderShadowControl (borderWidth, borderRadius, boxShadow)
│
└── ActionsTab
    └── ActionConfigControl (ctaButton)
        ├── Type selector (navigate, externalUrl, etc.)
        ├── URL input / Page selector
        └── Open in new tab toggle
```

---

## 6. Responsive Layout Breakpoints

### Inheritance Chain

```
Desktop (base)
   ↓ fallback
Tablet (override or inherit Desktop)
   ↓ fallback
Mobile (override or inherit Tablet → Desktop)
```

### How Responsive Properties Work

1. Each property in the schema can be marked `responsive: true`
2. Responsive properties are rendered with breakpoint tabs (Desktop / Tablet / Mobile)
3. When a value is set for Desktop, it serves as the default for all breakpoints
4. When a value is explicitly set for Tablet, it overrides Desktop for that viewport
5. When a value is explicitly set for Mobile, it overrides both Tablet and Desktop
6. The UI shows a visual indicator when a property is inheriting (not explicitly set)

### Breakpoint Viewports

| Breakpoint | CSS Media Query             | Canvas Preview          |
| :--------- | :-------------------------- | :---------------------- |
| Desktop    | Default (no media query)    | Full width (max 1280px) |
| Tablet     | `@media (min-width: 768px)` | 768px fixed preview     |
| Mobile     | `@media (min-width: 375px)` | 375px fixed preview     |

### Style Resolution

The `resolveSectionStyles()` function in the Section Library:

1. Reads the `desktop` style (or falls back to empty)
2. Maps each property to its CSS equivalent
3. Sets CSS custom properties for child component inheritance:
   - `--sec-heading-color` → heading text color
   - `--sec-body-color` → body text color
   - `--sec-accent-color` → accent/highlight color
4. Returns a `React.CSSProperties` object for inline styling

---

## 7. Content Width Options

| Preset     | Max Width | Class                      |
| :--------- | :-------- | :------------------------- |
| Contained  | 1200px    | `sec-container--contained` |
| Narrow     | 800px     | `sec-container--narrow`    |
| Wide       | 1440px    | `sec-container--wide`      |
| Full Width | 100%      | `sec-container--full`      |

---

## 8. Integration with the Editor

### How the Editor Uses the Schema

1. **User selects a section** → `SELECT_SECTION` action dispatched
2. **Editor looks up the schema** → `getSectionSchema(componentId)` returns `SectionSchema`
3. **Properties Panel renders** → `PropsTab` reads `schema.props`, `StyleTab` reads `schema.style`, `ActionsTab` reads `schema.actions`
4. **Each property renders** → The matching control component is instantiated with the schema field and current value
5. **User edits a value** → `UPDATE_SECTION_PROPS`, `UPDATE_SECTION_STYLE`, or `UPDATE_SECTION_ACTIONS` dispatched
6. **Section re-renders** → The Section Library component receives the updated instance data

### The Editor Never

- Hardcodes which controls to show for a specific section
- Duplicates schema definitions or default values
- Contains component-specific property inspection logic
- Bypasses the schema system for any property rendering
