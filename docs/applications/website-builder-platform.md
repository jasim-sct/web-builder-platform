# Website Builder Platform

This document provides an in-depth specification of the **Web Editor** — the visual drag-and-drop website builder application.

**Package name:** `website-builder-platform`
**Path:** `apps/website-builder-platform`
**Framework:** React 19 + Vite
**Port:** 5173 (dev)

---

## 1. Purpose

The Web Editor is a **composition and configuration engine** that allows non-technical users to build professional websites by selecting pre-built sections from the Section Library, arranging them on a canvas, and customizing their content, styles, and actions through a schema-driven properties panel.

> See [Architecture & Principles](../architecture.md) for the full system topology.

---

## 2. Entry Points

### Application Bootstrap

```
index.html → src/main.tsx → App.tsx → AppContent
```

### Component Hierarchy

```
<ToastProvider>
  <EditorProvider>
    <PlatformShell header={<EditorHeader />}>
      <ComponentPanel />       ← Section library browser (left/floating)
      <EditorCanvas />         ← Main editing canvas (center)
      <PropertyPanel />        ← Properties editor (right panel)
    </PlatformShell>
  </EditorProvider>
</ToastProvider>
```

---

## 3. Directory Layout

```
src/
├── main.tsx                           # Application entry point
├── App.tsx                            # Root component (EditorProvider + PlatformShell)
├── types/
│   └── editor.ts                      # EditorState, EditorAction, PageData, PropertyTab
├── state/
│   ├── editorContext.tsx              # React Context + useEditor hook
│   └── editorReducer.ts              # Pure reducer: all editor state transitions
├── components/
│   ├── Canvas/
│   │   ├── EditorCanvas.tsx           # Main canvas rendering section instances
│   │   ├── EditorSectionWrapper.tsx   # Editor overlay (selection, hover, drag handles)
│   │   ├── ComponentClickAction.tsx   # Action button handler on sections
│   │   ├── EmptyCanvasState.tsx       # Placeholder when no sections exist
│   │   ├── DropIndicator.tsx          # Visual drop zone indicator during drag
│   │   └── dndHelpers.ts             # Drag-and-drop helper functions
│   ├── ComponentPanel/
│   │   ├── ComponentPanel.tsx         # Section library browser panel
│   │   ├── CompList.tsx              # Filtered list of available sections
│   │   └── DraggableComponentCard.tsx # Draggable section card for adding to canvas
│   ├── PropertyPanel/
│   │   ├── PropertyPanel.tsx          # Tabbed properties editor shell
│   │   ├── tabs/
│   │   │   ├── PropsTab.tsx           # Content & configuration properties
│   │   │   ├── StyleTab.tsx           # Visual & layout properties
│   │   │   └── ActionsTab.tsx         # Declarative action configuration
│   │   └── controls/                  # Individual property type controls
│   │       ├── TextInputControl.tsx
│   │       ├── NumberInputControl.tsx
│   │       ├── SelectDropdownControl.tsx
│   │       ├── SwitchToggleControl.tsx
│   │       ├── ColorPickerControl.tsx
│   │       ├── BackgroundControl.tsx
│   │       ├── TypographyControl.tsx
│   │       ├── BorderShadowControl.tsx
│   │       ├── LayoutAlignmentControl.tsx
│   │       ├── WSDndSpacerControl.tsx
│   │       ├── ArrayListControl.tsx
│   │       └── ActionConfigControl.tsx
│   └── Header/
│       └── EditorHeader.tsx           # Top navigation bar
├── design-system/
│   ├── index.ts                       # Central barrel export
│   ├── tokens/                        # Design tokens (colors, spacing, typography, shadows, etc.)
│   ├── primitives/                    # Atomic UI components (Button, Input, Modal, etc.)
│   ├── patterns/                      # Composed UI patterns (ContextPill, LayoutAlignment, etc.)
│   ├── shell/                         # Application shell (PlatformShell, ExportCodeModal, etc.)
│   └── context/                       # React contexts (ToastContext)
└── styles/                            # Global styles
```

---

## 4. State Architecture

### Editor State (`EditorState`)

The editor uses `useReducer` with a centralized context. All state is managed through the `EditorProvider` and accessed via the `useEditor()` hook.

```typescript
interface EditorState {
  page: PageData; // Persistent: sections, metadata
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

### State Segregation

| Domain                    | Scope                                     | Undo/Redo |
| :------------------------ | :---------------------------------------- | :-------- |
| **Persistent Page State** | `page` (sections, props, styles, actions) | Yes       |
| **Ephemeral UI State**    | Selection, hover, drag, panels, search    | No        |

See [Serialization Rules](../business-rules/serialization-rules.md) for state transition rules.

### Available Actions

The reducer supports these action types:

| Action                    | Purpose                                                              |
| :------------------------ | :------------------------------------------------------------------- |
| `ADD_SECTION`             | Insert a new section instance (by componentId, optional targetIndex) |
| `REMOVE_SECTION`          | Delete a section instance                                            |
| `DUPLICATE_SECTION`       | Clone a section instance with a new ID                               |
| `MOVE_SECTION`            | Move a section up or down in the list                                |
| `REORDER_SECTIONS`        | Drag-and-drop reorder (sourceIndex → destinationIndex)               |
| `SELECT_SECTION`          | Set selected section (or deselect with null)                         |
| `HOVER_SECTION`           | Set hovered section (or clear with null)                             |
| `UPDATE_SECTION_PROPS`    | Merge new props into a section                                       |
| `UPDATE_SECTION_STYLE`    | Merge new styles into a section                                      |
| `UPDATE_SECTION_ACTIONS`  | Merge new actions into a section                                     |
| `SET_ACTIVE_PROPERTY_TAB` | Switch between Props/Style/Actions tabs                              |
| `SET_SEARCH_QUERY`        | Filter sections by search text                                       |
| `SET_SELECTED_CATEGORY`   | Filter sections by category                                          |
| `TOGGLE_COMPONENT_PANEL`  | Show/hide the component panel                                        |
| `TOGGLE_PROPERTY_PANEL`   | Show/hide the property panel                                         |
| `SET_PAGE_NAME`           | Update page name                                                     |
| `RESET_PAGE`              | Clear all sections                                                   |

### useEditor Hook

The `useEditor()` hook provides the full editor context including:

- `state` — Current editor state
- `dispatch` — Raw action dispatcher
- `selectedSection` — Current selected `SectionInstance` (derived)
- `selectedSectionItem` — Current selected `SectionRegistryItem` (derived)
- `selectedSectionSchema` — Current selected `SectionSchema` (derived)
- Convenience methods: `addSection()`, `removeSection()`, `duplicateSection()`, etc.

---

## 5. Component Panel

The Component Panel displays available sections from the Section Library, filtered by category and search query.

- Sections are displayed as draggable cards organized by category
- Categories: Navigation, Hero, Content, Media, Business, Conversion, Utility
- Users can drag sections onto the canvas or click to insert
- Panel is floating and can be repositioned, minimized, or toggled

---

## 6. Property Panel

The Property Panel renders a schema-driven interface for editing the selected section's configuration.

### Tabs

| Tab         | Purpose                                       | Schema Source    |
| :---------- | :-------------------------------------------- | :--------------- |
| **Props**   | Content & configuration (text, images, lists) | `schema.props`   |
| **Style**   | Visual layout (spacing, colors, borders)      | `schema.style`   |
| **Actions** | Button clicks, navigation, form submissions   | `schema.actions` |

### Controls

The panel dynamically renders controls based on the property schema type:

| Schema Type  | Control Component            |
| :----------- | :--------------------------- |
| `text`       | TextInputControl             |
| `textarea`   | TextInputControl (multiline) |
| `number`     | NumberInputControl           |
| `boolean`    | SwitchToggleControl          |
| `select`     | SelectDropdownControl        |
| `color`      | ColorPickerControl           |
| `image`      | TextInputControl (URL)       |
| `icon`       | SelectDropdownControl        |
| `spacing`    | WSDndSpacerControl           |
| `typography` | TypographyControl            |
| `border`     | BorderShadowControl          |
| `shadow`     | BorderShadowControl          |
| `background` | BackgroundControl            |
| `layout`     | LayoutAlignmentControl       |
| `array`      | ArrayListControl             |
| `action`     | ActionConfigControl          |

See [Registry & Schemas](../apis/registry-and-schemas.md) for full schema type definitions.

---

## 7. Canvas

The canvas renders section instances using the Section Library's `renderSectionInstance()` function.

### EditorSectionWrapper

Each section on the canvas is wrapped in `EditorSectionWrapper` which provides:

- Selection border and hover outline
- Floating section toolbar (Move, Duplicate, Delete)
- Drag handles and drop zones
- The actual section component renders inside, using the original Section Library component

### Drag and Drop

Sections can be reordered on the canvas via drag-and-drop:

1. User drags a section card (from the Component Panel or an existing canvas section)
2. `DropIndicator` appears at valid drop positions
3. On drop, `REORDER_SECTIONS` or `ADD_SECTION` action is dispatched

---

## 8. Design System

The editor has its own internal design system under `src/design-system/`:

| Directory     | Purpose                                                                                 |
| :------------ | :-------------------------------------------------------------------------------------- |
| `tokens/`     | Design tokens: colors, spacing, typography, shadows, radius, zIndex, transitions        |
| `primitives/` | Atomic components: Button, Input, Modal, Toggle, Typography, Tabs, etc.                 |
| `patterns/`   | Composed patterns: ContextPill, LayoutAlignment, SpacingBoxModel, ColorPicker           |
| `shell/`      | Application shell: PlatformShell, ExportCodeModal, ProjectSettingsModal, ToastContainer |
| `context/`    | React contexts: ToastContext                                                            |

---

## 9. Dependencies

### Runtime

| Package                   | Purpose                                               |
| :------------------------ | :---------------------------------------------------- |
| `@repo/component-library` | Section Library — sections, schemas, registry, styles |
| `react` / `react-dom`     | UI framework                                          |
| `clsx`                    | Conditional className utility                         |
| `lucide-react`            | Icon library                                          |

### Dev

| Package                     | Purpose                     |
| :-------------------------- | :-------------------------- |
| `@vitejs/plugin-react`      | Vite React plugin           |
| `vitest`                    | Test runner                 |
| `@testing-library/react`    | Component testing utilities |
| `@testing-library/jest-dom` | Custom jest matchers        |
| `jsdom`                     | DOM environment for tests   |
| `sass`                      | SCSS compilation            |

---

## 10. Scripts

| Command          | Purpose                                  |
| :--------------- | :--------------------------------------- |
| `pnpm dev`       | Start dev server on port 5173            |
| `pnpm build`     | TypeScript check + Vite production build |
| `pnpm preview`   | Preview production build                 |
| `pnpm lint`      | ESLint check                             |
| `pnpm typecheck` | TypeScript type check (`tsc --noEmit`)   |
| `pnpm test`      | Run Vitest test suite                    |

See [Workflow & Testing](../development/workflow-and-testing.md) for more details.
