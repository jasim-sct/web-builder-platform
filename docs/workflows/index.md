# Workflows — End-to-End User & System Flows

> **Scope:** Major user-facing and system-level workflows in the website builder platform.
> **Source of Truth:** Implementation in `apps/website-builder-platform/src/state/editorReducer.ts` and `packages/component-library/lib/registry/registry.ts`

---

## 1. Section Addition Workflow

**Trigger:** User drags a section card from the Component Panel onto the canvas, or clicks to insert.

| Step | Actor  | Application       | Action                                                                    |
| :--- | :----- | :---------------- | :------------------------------------------------------------------------ |
| 1    | User   | Editor            | Selects section type from Component Panel                                 |
| 2    | Editor | Component Library | Calls `getSection(componentId)` to look up registry item                  |
| 3    | Editor | Component Library | Calls `sectionItem.generator({ id: instanceId })` to create instance      |
| 4    | Editor | State             | Dispatches `ADD_SECTION` action with componentId and optional targetIndex |
| 5    | Editor | State             | Reducer inserts instance at target index (or appends)                     |
| 6    | Editor | State             | Reducer auto-selects new section, opens Property Panel                    |
| 7    | Editor | Canvas            | Renders section via `renderSectionInstance()`                             |
| 8    | Editor | Property Panel    | Displays schema-driven controls for the new section                       |

**Failure path:** If `getSection()` returns undefined, reducer logs warning and returns unchanged state.

---

## 2. Section Configuration Workflow

**Trigger:** User selects a section on the canvas and edits properties in the Property Panel.

| Step | Actor  | Application       | Action                                                        |
| :--- | :----- | :---------------- | :------------------------------------------------------------ |
| 1    | User   | Canvas            | Clicks on a section to select it                              |
| 2    | Editor | State             | Dispatches `SELECT_SECTION` with sectionId                    |
| 3    | Editor | Component Library | Calls `getSectionSchema(componentId)` to get `SectionSchema`  |
| 4    | Editor | Property Panel    | Renders tabs: Props, Style, Actions based on schema           |
| 5    | User   | Property Panel    | Edits a property value (e.g., changes headline text)          |
| 6    | Editor | State             | Dispatches `UPDATE_SECTION_PROPS` (or `_STYLE` or `_ACTIONS`) |
| 7    | Editor | State             | Reducer merges new values into existing section data          |
| 8    | Editor | Canvas            | Section re-renders with updated props/styles                  |

**Data flow:**

```
User Input → Property Control → Dispatch Action → Reducer Merge → State Update → Re-render
```

---

## 3. Section Reordering Workflow (Drag & Drop)

**Trigger:** User drags a section on the canvas to a new position.

| Step | Actor  | Application | Action                                                              |
| :--- | :----- | :---------- | :------------------------------------------------------------------ |
| 1    | User   | Canvas      | Initiates drag on a section's drag handle                           |
| 2    | Editor | Canvas      | `DropIndicator` appears at valid drop positions                     |
| 3    | User   | Canvas      | Drops section at target position                                    |
| 4    | Editor | State       | Dispatches `REORDER_SECTIONS` with sourceIndex and destinationIndex |
| 5    | Editor | State       | Reducer splices array: removes from source, inserts at destination  |
| 6    | Editor | Canvas      | Re-renders sections in new order                                    |

**Alternative — Move via toolbar:**

- User clicks Move Up/Down in floating toolbar
- Dispatches `MOVE_SECTION` with direction `'up'` or `'down'`
- Reducer swaps adjacent indices

---

## 4. Section Duplication Workflow

**Trigger:** User clicks Duplicate in the floating section toolbar.

| Step | Actor  | Application | Action                                                                        |
| :--- | :----- | :---------- | :---------------------------------------------------------------------------- |
| 1    | User   | Canvas      | Clicks Duplicate button on section toolbar                                    |
| 2    | Editor | State       | Dispatches `DUPLICATE_SECTION` with sectionId                                 |
| 3    | Editor | State       | Reducer finds section, generates new ID                                       |
| 4    | Editor | State       | Deep clones `props`, `style`, `actions` via `JSON.parse(JSON.stringify(...))` |
| 5    | Editor | State       | Inserts clone immediately after original                                      |
| 6    | Editor | State       | Auto-selects the new clone                                                    |
| 7    | Editor | Canvas      | Renders both original and clone                                               |

---

## 5. Section Removal Workflow

**Trigger:** User clicks Delete in the floating section toolbar.

| Step | Actor  | Application | Action                                            |
| :--- | :----- | :---------- | :------------------------------------------------ |
| 1    | User   | Canvas      | Clicks Delete button on section toolbar           |
| 2    | Editor | State       | Dispatches `REMOVE_SECTION` with sectionId        |
| 3    | Editor | State       | Reducer filters out section from array            |
| 4    | Editor | State       | If removed section was selected, deselects (null) |
| 5    | Editor | Canvas      | Re-renders without removed section                |

---

## 6. Responsive Editing Workflow

**Trigger:** User switches between Desktop, Tablet, Mobile breakpoint tabs.

| Step | Actor  | Application    | Action                                                                           |
| :--- | :----- | :------------- | :------------------------------------------------------------------------------- |
| 1    | User   | Property Panel | Clicks breakpoint tab (Desktop / Tablet / Mobile)                                |
| 2    | Editor | State          | Breakpoint context updates (internal state)                                      |
| 3    | User   | Property Panel | Edits a responsive property (e.g., padding for Mobile)                           |
| 4    | Editor | State          | Dispatches `UPDATE_SECTION_STYLE` with mobile override                           |
| 5    | Editor | State          | Reducer merges responsive style: `{ mobile: { paddingTop: '12px' } }`            |
| 6    | Editor | Canvas         | Section re-renders at preview width (375px for mobile)                           |
| 7    | Editor | Style Resolver | `resolveSectionStyles()` applies desktop fallback for unset tablet/mobile values |

**Inheritance chain:**

```
Desktop value (base) → Tablet override (if set) → Mobile override (if set) → Final value
```

---

## 7. Storybook Development Workflow

**Trigger:** Developer runs Storybook for component development.

| Step | Actor     | Application | Action                                               |
| :--- | :-------- | :---------- | :--------------------------------------------------- |
| 1    | Developer | CLI         | Runs `pnpm storybook` (port 6006)                    |
| 2    | Turborepo | Build       | Builds component library first (`^build` dependency) |
| 3    | Storybook | Dev Server  | Loads stories from `src/stories/**/*.stories.tsx`    |
| 4    | Storybook | SCSS        | Loads `lib/assets/scss/main.scss` for section styles |
| 5    | Developer | Browser     | Views section in isolation with controls             |
| 6    | Developer | Browser     | Adjusts props via Storybook controls                 |
| 7    | Developer | Code        | Edits component/schema/defaults in `lib/`            |
| 8    | Storybook | HMR         | Hot-reloads with changes                             |

---

## 8. Build & CI Workflow

**Trigger:** Developer pushes code or opens a PR.

| Step | Actor          | System     | Action                                  |
| :--- | :------------- | :--------- | :-------------------------------------- |
| 1    | Developer      | Git        | Pushes to `main` or feature branch      |
| 2    | GitHub Actions | CI         | Triggers `.github/workflows/ci.yml`     |
| 3    | CI             | pnpm       | `pnpm install` — install dependencies   |
| 4    | CI             | Prettier   | `pnpm format:check` — verify formatting |
| 5    | CI             | ESLint     | `pnpm lint` — verify linting            |
| 6    | CI             | TypeScript | `pnpm typecheck` — verify types         |
| 7    | CI             | Vitest     | `pnpm test` — run all test suites       |
| 8    | CI             | Turborepo  | `pnpm build` — build all packages       |
| 9    | CI             | GitHub     | Reports pass/fail status on PR          |

---

## 9. Section Registration Workflow

**Trigger:** Developer adds a new section to the Component Library.

| Step | Actor     | Application | Action                                                         |
| :--- | :-------- | :---------- | :------------------------------------------------------------- |
| 1    | Developer | Library     | Creates directory `lib/components/<Name>/`                     |
| 2    | Developer | Library     | Implements component, schema, defaults, generator, constants   |
| 3    | Developer | Library     | Creates `index.ts` barrel exports                              |
| 4    | Developer | Library     | Registers in `lib/components/index.ts` via `registerSection()` |
| 5    | Developer | Library     | Creates Storybook stories in `src/stories/`                    |
| 6    | Developer | Library     | Creates tests in `test/components/<Name>/`                     |
| 7    | Developer | CLI         | Runs `pnpm --filter @repo/component-library test`              |
| 8    | Developer | CLI         | Runs `pnpm storybook` to verify visual rendering               |
| 9    | Developer | CLI         | Runs `pnpm check` for full validation                          |
| 10   | Editor    | Auto        | Section automatically appears in Component Panel               |

---

## 10. Page Reset Workflow

**Trigger:** User clicks Reset Page in the editor.

| Step | Actor  | Application | Action                                        |
| :--- | :----- | :---------- | :-------------------------------------------- |
| 1    | User   | Header      | Clicks Reset Page button                      |
| 2    | Editor | State       | Dispatches `RESET_PAGE` action                |
| 3    | Editor | State       | Reducer clears `page.sections` to empty array |
| 4    | Editor | State       | Reducer sets `selectedSectionId` to null      |
| 5    | Editor | Canvas      | Renders `EmptyCanvasState` placeholder        |

---

See also:

- [Serialization Rules](../business-rules/serialization-rules.md) — State transition rules
- [Website Builder Platform](../applications/website-builder-platform.md) — Editor architecture
- [Component Library](../packages/component-library.md) — Registry system
- [Registry & Schemas](../apis/registry-and-schemas.md) — Schema-driven rendering
