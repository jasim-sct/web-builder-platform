# Troubleshooting

> **Scope:** Common development issues, their causes, and resolutions across the monorepo.
> **Source of Truth:** Actual project issues and their solutions

---

## 1. TypeScript Errors

### `exactOptionalPropertyTypes` Errors

| Symptom                                          | Cause                                              | Resolution                                                     |
| :----------------------------------------------- | :------------------------------------------------- | :------------------------------------------------------------- |
| `Type 'undefined' is not assignable to type 'X'` | Optional property explicitly set to `undefined`    | Use conditional spreading: `{ ...(value && { prop: value }) }` |
| `Cannot assign to optional property`             | Attempting to set optional property to `undefined` | Omit the property entirely instead of setting to `undefined`   |

### `verbatimModuleSyntax` Errors

| Symptom                                   | Cause                                                     | Resolution                                                |
| :---------------------------------------- | :-------------------------------------------------------- | :-------------------------------------------------------- |
| `Module '"x"' has no exported member 'Y'` | Using `import { Type }` instead of `import type { Type }` | Use `import type { Type } from 'y'` for type-only imports |
| `Syntax error: import type`               | Using `import type` where value import is needed          | Use regular `import` for values (components, functions)   |

### `noUnusedLocals` / `noUnusedParameters`

| Symptom                                       | Cause                     | Resolution                    |
| :-------------------------------------------- | :------------------------ | :---------------------------- |
| `'X' is declared but its value is never read` | Unused variable or import | Remove the unused declaration |
| `'X' is specified but never used`             | Unused function parameter | Prefix with `_` or remove     |

### `noUncheckedIndexedAccess`

| Symptom                                               | Cause                                          | Resolution                                                 |
| :---------------------------------------------------- | :--------------------------------------------- | :--------------------------------------------------------- |
| `Type 'T' is not assignable to type 'T \| undefined'` | Array/object indexing returns `T \| undefined` | Add null check: `const value = arr[i]; if (value) { ... }` |

---

## 2. Build Errors

### vite-dts Conflicts in Storybook

| Symptom                                    | Cause                                              | Resolution                                                              |
| :----------------------------------------- | :------------------------------------------------- | :---------------------------------------------------------------------- |
| Storybook build fails with vite-dts errors | `vite-plugin-dts` conflicts with Storybook's build | Already resolved: `.storybook/main.ts` removes vite-dts via `viteFinal` |

### SCSS Compilation Errors

| Symptom                                      | Cause                      | Resolution                                        |
| :------------------------------------------- | :------------------------- | :------------------------------------------------ |
| `SassError: Can't find stylesheet to import` | SCSS import path incorrect | Verify path relative to SCSS entry point          |
| `SassError: Undefined variable`              | Design token not imported  | Import the SCSS partial that defines the variable |

### Turborepo Build Failures

| Symptom                                | Cause                                      | Resolution                                        |
| :------------------------------------- | :----------------------------------------- | :------------------------------------------------ |
| Build succeeds locally but fails in CI | Stale cache or missing global dependencies | Add files to `globalDependencies` in `turbo.json` |
| `^build` dependency fails              | Upstream package has build errors          | Fix the dependency package first                  |
| Stale builds after dependency changes  | Turborepo cache not invalidated            | Run `pnpm turbo clean` or delete `.turbo/`        |

---

## 3. Runtime Errors

### Fast Refresh Not Working

| Symptom                            | Cause                                      | Resolution                         |
| :--------------------------------- | :----------------------------------------- | :--------------------------------- |
| Component doesn't hot-reload       | Default export used in barrel file         | Use named exports in `index.ts`    |
| Fast Refresh triggered full reload | Component has side effects at module level | Move side effects into `useEffect` |
| Component disappears on save       | Export structure incompatible with HMR     | Ensure consistent named exports    |

### React Rendering Issues

| Symptom                                           | Cause                               | Resolution                                           |
| :------------------------------------------------ | :---------------------------------- | :--------------------------------------------------- |
| `Each child in a list should have a unique "key"` | Missing or duplicate `key` prop     | Ensure unique keys for all list items                |
| `Cannot read properties of null`                  | Component rendered outside Provider | Wrap with required Provider (e.g., `EditorProvider`) |
| Infinite re-render loop                           | State update in render body         | Move to `useEffect` or callback                      |

---

## 4. Package Manager Issues

### pnpm Errors

| Symptom                      | Cause                              | Resolution                                    |
| :--------------------------- | :--------------------------------- | :-------------------------------------------- |
| `ERR_PNPM_NO_LOCKFILE`       | Lockfile missing                   | Run `pnpm install` from root                  |
| `ERR_PNPM_ENGINEUnsupported` | Node/pnpm version mismatch         | Run `nvm use` to switch to correct version    |
| `ERR_PNPMWorkspaceNotReady`  | Workspace not properly initialized | Run `pnpm install` from root                  |
| Peer dependency warnings     | Version mismatch between packages  | Update dependencies or adjust peer dep ranges |

### Workspace Protocol Issues

| Symptom                          | Cause                                         | Resolution                             |
| :------------------------------- | :-------------------------------------------- | :------------------------------------- |
| `Cannot find module '@repo/...'` | Package not linked or built                   | Run `pnpm install` then `pnpm build`   |
| Circular dependency detected     | Package A depends on Package B and vice versa | Refactor to remove circular dependency |

---

## 5. Linting & Formatting Issues

### ESLint Errors

| Symptom                                    | Cause                         | Resolution                               |
| :----------------------------------------- | :---------------------------- | :--------------------------------------- |
| `Unexpected any`                           | Using `any` type              | Replace with specific type or `unknown`  |
| `Import does not contain a default export` | Wrong import style for module | Check module's export structure          |
| `Prefer default export` vs `Named export`  | Conflicting lint rules        | Follow project convention: named exports |

### Prettier Formatting

| Symptom                          | Cause                        | Resolution                             |
| :------------------------------- | :--------------------------- | :------------------------------------- |
| `Checking formatting... X files` | Files not formatted          | Run `pnpm format` to auto-fix          |
| Import order violations          | Imports not sorted correctly | Run `pnpm format` (auto-sorts imports) |

---

## 6. Testing Issues

### Vitest Issues

| Symptom                                   | Cause                        | Resolution                                          |
| :---------------------------------------- | :--------------------------- | :-------------------------------------------------- |
| `ReferenceError: describe is not defined` | Globals not enabled          | Ensure `globals: true` in vitest config             |
| `Unable to find element`                  | RTL query didn't match       | Check element text/role/label, use `screen.debug()` |
| Test timeout                              | Async operation not resolved | Add `await` or increase timeout                     |
| `vi.fn()` not tracking calls              | Mock not properly set up     | Ensure mock is created before the call              |

### jsdom Limitations

| Symptom                               | Cause                                 | Resolution                            |
| :------------------------------------ | :------------------------------------ | :------------------------------------ |
| CSS layout not working                | jsdom doesn't compute layout          | Test class names, not computed styles |
| `getBoundingClientRect` returns zeros | jsdom doesn't implement layout        | Mock if needed, or test differently   |
| `window.matchMedia` not available     | jsdom doesn't implement media queries | Mock in test setup                    |

---

## 7. Storybook Issues

| Symptom                          | Cause                           | Resolution                                |
| :------------------------------- | :------------------------------ | :---------------------------------------- |
| Story doesn't render             | Component not properly imported | Check story imports                       |
| SCSS styles missing in Storybook | SCSS not loaded in preview      | Verify `preview.ts` imports SCSS file     |
| Controls not appearing           | Props not defined in story args | Add `argTypes` and `args` to story        |
| Storybook build fails            | Plugin conflict                 | Check `viteFinal` in `.storybook/main.ts` |

---

## 8. Component-Specific Issues

### Section Not Appearing in Editor

| Symptom                              | Cause                      | Resolution                                            |
| :----------------------------------- | :------------------------- | :---------------------------------------------------- |
| Section missing from Component Panel | Not registered in registry | Add `registerSection()` call in `components/index.ts` |
| Section renders but looks wrong      | Schema/defaults mismatch   | Verify `defaultProps`, `defaultStyle`, `generator`    |
| Section crashes on render            | Missing required props     | Check schema defaults cover all required fields       |

### Properties Panel Not Showing Controls

| Symptom              | Cause                                      | Resolution                                     |
| :------------------- | :----------------------------------------- | :--------------------------------------------- |
| Tab is empty         | Schema has no properties for that category | Add properties to the section's schema         |
| Wrong control type   | Property type mismatch                     | Verify `type` field in `PropertySchema`        |
| Control not updating | Dispatcher not connected                   | Verify `onChange` handler calls correct action |

---

## 9. Git & CI Issues

| Symptom                       | Cause                            | Resolution                               |
| :---------------------------- | :------------------------------- | :--------------------------------------- |
| Commit rejected by Commitlint | Non-conventional commit format   | Use `<type>(<scope>): <description>`     |
| Pre-commit hook fails         | Lint-staged found errors         | Fix lint/format errors before committing |
| CI fails on format check      | Local formatting differs from CI | Run `pnpm format` before pushing         |
| Line ending warnings          | Windows CRLF vs Unix LF          | `.gitattributes` normalizes to LF        |

---

## 10. Performance Issues

| Symptom                     | Cause                         | Resolution                                   |
| :-------------------------- | :---------------------------- | :------------------------------------------- |
| Slow dev server startup     | Large number of packages      | Use `--filter` to start only needed packages |
| Turborepo cache not working | Incorrect input/output config | Verify `turbo.json` task configuration       |
| Slow type checking          | Large dependency tree         | Run `pnpm typecheck --filter=<package>`      |
| High memory usage           | Build artifacts accumulating  | Run `pnpm clean`                             |

---

See also:

- [Workflow & Testing](../development/workflow-and-testing.md) — Development commands
- [Configuration](../configuration/index.md) — Configuration details
- [Component Library](../packages/component-library.md) — Library-specific issues
- [Website Builder Platform](../applications/website-builder-platform.md) — Editor-specific issues
