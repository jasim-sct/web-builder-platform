# Workspace Conventions & Standards

This document specifies the naming, Git, coding, and structural conventions enforced across this workspace.

---

## 1. Naming Conventions

### Applications (`apps/`)

- Folder names: `kebab-case` (e.g. `web`, `admin-portal`, `api-gateway`).
- Package names: `kebab-case` or scoped `@repo/app-name` (e.g. `web` or `@repo/web`).

### Packages (`packages/`)

- Folder names: `kebab-case` (e.g. `ui`, `logger`, `database`, `auth`).
- Package names: Scoped with `@repo/` (e.g. `@repo/ui`, `@repo/logger`, `@repo/utils`).

### Tooling Packages (`tooling/`)

- Folder names: `kebab-case` (e.g. `eslint`, `typescript`, `prettier`).
- Package names: Scoped with `@repo/` (e.g. `@repo/eslint-config`, `@repo/typescript-config`).

### Files & Directories

- TypeScript / JavaScript files: `kebab-case.ts` / `kebab-case.tsx` (or `PascalCase.tsx` for React components if desired by app).
- Modules and configs: `kebab-case.config.mjs` or standard config names.

---

## 2. Commit Message Conventions (Conventional Commits)

Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Husky + Commitlint will validate every commit.

### Format

```text
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Examples

```bash
git commit -m "feat(web): add user authentication flow"
git commit -m "fix(api): handle null payload gracefully in auth controller"
git commit -m "docs: add instructions for adding NestJS services"
```

---

## 3. Branching & Git Workflow

- Default branch: `main`
- Feature branches: `feat/<feature-name>` or `fix/<bug-name>`
- PRs: Must pass all CI checks (`pnpm format:check`, `pnpm turbo lint typecheck test build`) before merge.
- Line endings: Normalized automatically to `LF` via `.gitattributes`.

---

## 4. Import Ordering Standard

Imports are organized in structured groups separated by empty lines (enforced by Prettier + `@ianvs/prettier-plugin-sort-imports`):

```typescript
// 1. React / Next / Framework imports
import React, { useState } from 'react';
import Link from 'next/link';
// 2. Third-party packages
import { z } from 'zod';

// 3. Workspace packages (@repo/*)
import { Button } from '@repo/ui/button';
import { formatDate } from '@repo/utils';

// 4. Internal relative imports
import { localHelper } from '../utils/helper';
import { ChildComponent } from './child-component';

// 5. Types
import type { UserProfile } from '@repo/types';
import type { ComponentProps } from './types';
```
