# Monorepo Documentation Hub

> **Purpose:** Primary entry point for all project documentation. Designed for both human developers and AI agents.
> **Last Reviewed:** 2026-08-25
> **Status:** Active

Welcome to the centralized documentation for the **monorepo-workspace** — a website builder platform built with a shared component library architecture.

---

## Quick Start

| If you need to…                      | Read this                                                            |
| :----------------------------------- | :------------------------------------------------------------------- |
| Understand the project at a glance   | [Architecture & Principles](architecture.md)                         |
| Know the rules before modifying code | [Workspace Conventions](conventions.md)                              |
| Understand the Web Editor app        | [Website Builder Platform](applications/website-builder-platform.md) |
| Understand the Section Library       | [Component Library](packages/component-library.md)                   |
| Learn how schemas drive the UI       | [Registry & Schemas](apis/registry-and-schemas.md)                   |
| Understand data contracts            | [Serialization Rules](business-rules/serialization-rules.md)         |
| Run dev, build, test, lint           | [Workflow & Testing](development/workflow-and-testing.md)            |
| Get guidance as an AI agent          | [Agent Guidelines](ai/AGENT_GUIDELINES.md)                           |
| Look up a term                       | [Glossary](glossary.md)                                              |

---

## What This Project Is

This monorepo is a **website builder platform** where users compose professional websites by selecting, stacking, and customizing pre-built sections through a visual drag-and-drop editor. The system is composed of:

| Application / Package        | Path                            | Purpose                                              |
| :--------------------------- | :------------------------------ | :--------------------------------------------------- |
| **Website Builder Platform** | `apps/website-builder-platform` | Visual drag-and-drop editor (React 19 + Vite)        |
| **Component Library**        | `packages/component-library`    | Shared section components, schemas, registry, styles |
| **ESLint Config**            | `tooling/eslint`                | Shared ESLint presets (base, react, next, nest)      |
| **TypeScript Config**        | `tooling/typescript`            | Shared TypeScript configurations                     |
| **Prettier Config**          | `tooling/prettier`              | Shared Prettier configuration                        |

---

## Technology Stack

| Layer              | Technology                                |
| :----------------- | :---------------------------------------- |
| Package Manager    | pnpm (workspace protocol)                 |
| Build Orchestrator | Turborepo                                 |
| UI Framework       | React 19                                  |
| Editor App         | Vite + TypeScript                         |
| Component Library  | SCSS + TypeScript                         |
| Component Docs     | Storybook 8                               |
| Testing            | Vitest + React Testing Library            |
| Linting            | ESLint 9 (flat config)                    |
| Formatting         | Prettier (with import sorting)            |
| Git Hooks          | Husky + Commitlint (Conventional Commits) |

---

## Directory Structure

```
monorepo-workspace/
├── apps/
│   └── website-builder-platform/    # Visual drag-and-drop website editor (React / Vite)
├── packages/
│   └── component-library/           # @repo/component-library — sections, schemas, registry, styles
├── tooling/
│   ├── eslint/                      # @repo/eslint-config — shared ESLint presets
│   ├── typescript/                  # @repo/typescript-config — shared TS configs
│   └── prettier/                    # @repo/prettier-config — shared Prettier config
├── docs/                            # This documentation system
├── scripts/                         # Workspace verification scripts
├── .github/                         # CI/CD workflows and PR templates
├── .husky/                          # Git hooks (commit lint, pre-commit)
└── .vscode/                         # Editor settings
```

---

## Documentation Map

### Architecture & Conventions

| Document                                                     | Description                                                                 |
| :----------------------------------------------------------- | :-------------------------------------------------------------------------- |
| [Architecture & Principles](architecture.md)                 | Monorepo topology, core principles, dependency management                   |
| [Workspace Conventions](conventions.md)                      | Naming, commits, branching, import ordering                                 |
| [Turborepo Guide](turborepo-guide.md)                        | Pipeline tasks, caching, filtering commands                                 |
| [Component Architecture](packages/component-architecture.md) | Component boundaries, spacing rules, override principles, responsive design |

### Application Specifications

| Document                                                             | Description                                                      |
| :------------------------------------------------------------------- | :--------------------------------------------------------------- |
| [Website Builder Platform](applications/website-builder-platform.md) | Editor architecture, state management, components, design system |

### Package Specifications

| Document                                           | Description                                                       |
| :------------------------------------------------- | :---------------------------------------------------------------- |
| [Component Library](packages/component-library.md) | Section Library internals, Storybook config, 9 section components |

### APIs & Schemas

| Document                                           | Description                                                       |
| :------------------------------------------------- | :---------------------------------------------------------------- |
| [Registry & Schemas](apis/registry-and-schemas.md) | Schema-driven property rendering, type mappings, responsive rules |

### Data & Models

| Document                     | Description                                                           |
| :--------------------------- | :-------------------------------------------------------------------- |
| [Data Models](data/index.md) | All shared types, domain models, state structures, schema definitions |

### Business Rules

| Document                                                     | Description                                                       |
| :----------------------------------------------------------- | :---------------------------------------------------------------- |
| [Serialization Rules](business-rules/serialization-rules.md) | PageModel contract, state transitions, undo/redo, action security |

### Workflows

| Document                                   | Description                                                                  |
| :----------------------------------------- | :--------------------------------------------------------------------------- |
| [End-to-End Workflows](workflows/index.md) | Section addition, configuration, reordering, duplication, responsive editing |

### Integrations

| Document                                                | Description                                                                |
| :------------------------------------------------------ | :------------------------------------------------------------------------- |
| [Cross-Application Integrations](integrations/index.md) | Editor ↔ Library integration, tooling, build pipeline, shared dependencies |

### Design System

| Document                                | Description                                                              |
| :-------------------------------------- | :----------------------------------------------------------------------- |
| [Design System](design-system/index.md) | Shared SCSS tokens, editor design tokens, CSS conventions, accessibility |

### Configuration

| Document                                              | Description                                                         |
| :---------------------------------------------------- | :------------------------------------------------------------------ |
| [Configuration & Environment](configuration/index.md) | All config files, environment variables, build settings, git config |

### Development & Operations

| Document                                                  | Description                                                       |
| :-------------------------------------------------------- | :---------------------------------------------------------------- |
| [Workflow & Testing](development/workflow-and-testing.md) | Dev commands, test suites, CI/CD, troubleshooting                 |
| [Testing Strategy](testing/index.md)                      | Test levels, conventions, mocking strategy, coverage expectations |

### Reference

| Document                                              | Description                                       |
| :---------------------------------------------------- | :------------------------------------------------ |
| [Glossary](glossary.md)                               | Technical, business, and internal terminology     |
| [Web Editor Architecture](web-editor-architecture.md) | System topology, absolute rules, 16-stage roadmap |

### Decisions

| Document                                                                                     | Description                                     |
| :------------------------------------------------------------------------------------------- | :---------------------------------------------- |
| [ADR-0001: Schema-Driven Properties Panel](decisions/0001-schema-driven-properties-panel.md) | Why properties are schema-driven, not hardcoded |

### Guides

| Document                                      | Description                                           |
| :-------------------------------------------- | :---------------------------------------------------- |
| [Adding Applications](adding-applications.md) | How to scaffold new apps (Next.js, React SPA, NestJS) |
| [Adding Shared Packages](adding-packages.md)  | How to create shared libraries and UI packages        |

### Troubleshooting

| Document                                    | Description                            |
| :------------------------------------------ | :------------------------------------- |
| [Troubleshooting](troubleshooting/index.md) | Common issues, causes, and resolutions |

### AI Agent Resources

| Document                                   | Description                                                       |
| :----------------------------------------- | :---------------------------------------------------------------- |
| [Agent Guidelines](ai/AGENT_GUIDELINES.md) | Boundaries, conventions, forbidden patterns, validation workflows |

---

## Where to Start

### For New Developers

1. Read [Architecture & Principles](architecture.md) for the big picture
2. Read [Workspace Conventions](conventions.md) for coding standards
3. Read [Workflow & Testing](development/workflow-and-testing.md) for dev setup
4. Read [Component Library](packages/component-library.md) to understand the section system
5. Read [Website Builder Platform](applications/website-builder-platform.md) for the editor

### For AI Agents

1. Read [Agent Guidelines](ai/AGENT_GUIDELINES.md) first — this is your authoritative constraint document
2. Read [Architecture & Principles](architecture.md) for system topology
3. Read [Component Architecture](packages/component-architecture.md) for component rules
4. Read [Data Models](data/index.md) for type contracts
5. Read [Serialization Rules](business-rules/serialization-rules.md) for data constraints

### For Adding New Sections

1. Read [Component Library](packages/component-library.md) — Section 5 (module pattern)
2. Read [Component Architecture](packages/component-architecture.md) — Development Checklist
3. Read [Registry & Schemas](apis/registry-and-schemas.md) — Schema system
4. Read [Adding Shared Packages](adding-packages.md) — Package creation guide

---

## Navigation Rules

1. **Start here** (`docs/README.md`) to find what you need.
2. **Follow cross-links** between documents — each doc links to related docs inline.
3. **Avoid circular references** — each document links outward but does not create infinite loops.
4. **Check the glossary** if you encounter an unfamiliar term.
5. **Consult Agent Guidelines** before making any code changes if you are an AI agent.
6. **Verify against source** — documentation must match the current implementation.

---

## Authoritative Sources

| Concept                | Authoritative Source                                          |
| :--------------------- | :------------------------------------------------------------ |
| API behavior           | Implementation, schemas, API contracts                        |
| Business rules         | `docs/business-rules/serialization-rules.md` + implementation |
| Design system          | `packages/component-library/lib/assets/scss/`                 |
| Component schemas      | `packages/component-library/lib/schema/`                      |
| Section registry       | `packages/component-library/lib/registry/`                    |
| Editor state           | `apps/website-builder-platform/src/state/`                    |
| Type definitions       | `packages/component-library/lib/types.ts`                     |
| Architecture decisions | `docs/decisions/`                                             |
| Environment config     | Root `package.json`, `turbo.json`, `tsconfig.base.json`       |
