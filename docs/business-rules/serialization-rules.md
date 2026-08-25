# Serialization Rules & Business Contracts

This document defines the authoritative data contracts, serialization boundaries, state transition rules, and security model for the website builder platform.

---

## 1. Page Model Schema

A website page is stored as a purely serializable JSON data structure.

### PageData

```typescript
interface PageData {
  id: string; // Unique page identifier
  name: string; // User-facing page name
  slug?: string; // URL slug (e.g. '/')
  sections: SectionInstance[]; // Ordered list of section instances
}
```

### SectionInstance

```typescript
interface SectionInstance<P = Record<string, unknown>> {
  id: string; // Unique instance ID (e.g. 'hero-1708862400-abc12')
  componentId: string; // Matches SectionRegistry componentId (e.g. 'hero')
  props: P; // Content values matching PropsSchema
  style?: ResponsiveSectionStyle; // Desktop / Tablet / Mobile style overrides
  actions?: Record<string, ActionConfig>; // Declarative action bindings
}
```

### Instance ID Format

Instance IDs are generated as: `${componentId}-${Date.now()}-${randomChars}`

Example: `hero-1708862400-abc12`

---

## 2. Strict Serialization Boundaries

> **The PageData must remain 100% JSON-serializable at all times.**

### NEVER Store in Page State

| Forbidden Type                      | Why                                           |
| :---------------------------------- | :-------------------------------------------- |
| React components or JSX elements    | Not serializable; causes hydration errors     |
| Functions, closures, event handlers | Not serializable; breaks state persistence    |
| DOM elements or React ref objects   | Not serializable; causes memory leaks         |
| Class instances                     | Not JSON-serializable without custom revivers |

### NEVER Store in SectionInstance

| Forbidden Type              | Why                                             |
| :-------------------------- | :---------------------------------------------- |
| `React.ReactNode` children  | Sections are rendered from registry, not stored |
| `onClick` handlers in props | Actions are declarative `ActionConfig` objects  |
| Mutable references          | Breaks immutability guarantees of reducer       |

---

## 3. State Transition Rules

### Adding a Section

1. Look up the section in the registry via `getSection(componentId)`
2. If not found, log a warning and return current state unchanged
3. Generate a unique instance ID: `${componentId}-${Date.now()}-${randomChars}`
4. Call the section's `generator()` with the new ID to create the instance
5. Insert at the specified `targetIndex` (or append to end)
6. Auto-select the newly added section
7. Open the property panel if closed

### Duplicating a Section

1. Find the target section by ID
2. Generate a new unique ID with the same componentId prefix
3. Deep clone `props`, `style`, and `actions` via `JSON.parse(JSON.stringify(...))`
4. Insert the clone immediately after the original
5. Auto-select the new clone

### Removing a Section

1. Filter out the section by ID
2. If the removed section was selected, deselect (set `selectedSectionId` to `null`)

### Reordering Sections

1. Validate source and destination indices are within bounds
2. If `sourceIndex === destinationIndex`, return current state
3. Remove item from `sourceIndex` and insert at `destinationIndex`
4. Clear `activeDropIndex`

### Updating Section Properties

- Props, styles, and actions are **merged** (shallow spread), not replaced
- This allows partial updates without losing existing values

---

## 4. Undo/Redo History Scope

### Participates in History (Persistent State)

| Mutation            | Action Type              |
| :------------------ | :----------------------- |
| Add a section       | `ADD_SECTION`            |
| Remove a section    | `REMOVE_SECTION`         |
| Duplicate a section | `DUPLICATE_SECTION`      |
| Move a section      | `MOVE_SECTION`           |
| Reorder sections    | `REORDER_SECTIONS`       |
| Modify props        | `UPDATE_SECTION_PROPS`   |
| Modify styles       | `UPDATE_SECTION_STYLE`   |
| Modify actions      | `UPDATE_SECTION_ACTIONS` |
| Rename page         | `SET_PAGE_NAME`          |

### Excluded from History (Ephemeral State)

| Mutation                 | Action Type                    |
| :----------------------- | :----------------------------- |
| Select a section         | `SELECT_SECTION`               |
| Hover a section          | `HOVER_SECTION`                |
| Set drop index           | `SET_ACTIVE_DROP_INDEX`        |
| Change property tab      | `SET_ACTIVE_PROPERTY_TAB`      |
| Search query             | `SET_SEARCH_QUERY`             |
| Category filter          | `SET_SELECTED_CATEGORY`        |
| Panel visibility toggles | `TOGGLE_*_PANEL`               |
| Panel position           | `SET_COMPONENT_PANEL_POSITION` |

---

## 5. Responsive Style Model

### ResponsiveSectionStyle

```typescript
interface ResponsiveSectionStyle {
  desktop?: SectionStyle; // Base styles (default canvas)
  tablet?: SectionStyle; // Override for 768px viewport
  mobile?: SectionStyle; // Override for 375px viewport
}
```

### Inheritance Rules

1. **Desktop** values serve as the base/fallback
2. **Tablet** overrides apply when specified; otherwise fall back to Desktop
3. **Mobile** overrides apply when specified; otherwise fall back to Tablet/Desktop
4. The editor UI clearly indicates when a property is inheriting vs. explicitly overridden

### Breakpoints

| Breakpoint | Viewport Width            | Canvas Preview      |
| :--------- | :------------------------ | :------------------ |
| Desktop    | 100% (max-width: 1280px+) | Full width          |
| Tablet     | 768px                     | Fixed 768px preview |
| Mobile     | 375px                     | Fixed 375px preview |

---

## 6. Action Configuration

### ActionConfig

```typescript
type ActionType =
  | 'navigate' // Internal page navigation
  | 'externalUrl' // External URL (opens in same or new tab)
  | 'openPopup' // Open a popup/modal by ID
  | 'closePopup' // Close a popup/modal
  | 'scrollToSection' // Smooth scroll to a section on the page
  | 'submitApi' // API submission handler
  | 'formAction' // Form submission action
  | 'custom'; // Custom action (handled by runtime)

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

### Supported Actions per Context

| Action Schema        | Supported Types                                                       |
| :------------------- | :-------------------------------------------------------------------- |
| `buttonActionSchema` | navigate, externalUrl, openPopup, closePopup, scrollToSection, custom |
| `submitActionSchema` | submitApi, formAction, custom                                         |

---

## 7. Security Model

### No Unsafe Execution

- `eval()` is **strictly forbidden**
- `new Function()` is **strictly forbidden**
- Inline script strings in HTML/JSX are **strictly forbidden**
- Arbitrary JavaScript execution via user input is **strictly forbidden**

### Input Sanitization

- All user-provided URLs are sanitized to prevent `javascript:` URI attacks
- XSS prevention via React's automatic escaping + explicit sanitization
- Action payloads are validated before dispatch

### Controlled Runtime Dispatch

Actions are dispatched by an explicit **Action Runner** at runtime:

1. Action config is read from the section instance
2. Action type is matched to a handler
3. Handler executes the predefined behavior (navigation, scroll, popup, etc.)
4. No arbitrary code execution from user-provided data

---

## 8. Serialization Example

### Valid PageModel

```json
{
  "id": "page-default-01",
  "name": "Home Landing Page",
  "slug": "/",
  "sections": [
    {
      "id": "header-1708862400-abc12",
      "componentId": "header",
      "props": {
        "logo": "https://example.com/logo.png",
        "brandName": "Acme Corp",
        "navLinks": [
          { "label": "Home", "href": "/" },
          { "label": "Features", "href": "#features" }
        ]
      },
      "style": {
        "desktop": {
          "backgroundColor": "#ffffff",
          "paddingTop": "16px",
          "paddingBottom": "16px"
        },
        "mobile": {
          "paddingTop": "12px",
          "paddingBottom": "12px"
        }
      },
      "actions": {
        "ctaButton": {
          "type": "navigate",
          "target": "/pricing"
        }
      }
    }
  ]
}
```

### Invalid (Non-Serializable) Example

```json
{
  "id": "hero-1708862400-abc12",
  "componentId": "hero",
  "props": {
    "headline": "Welcome",
    "onClick": "function() { alert('hi') }"
  }
}
```

**Rejected** — `onClick` is a function reference, not a string. Actions must use the declarative `ActionConfig` format.
