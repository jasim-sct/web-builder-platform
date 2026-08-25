# Monorepo Documentation Hub

Welcome to the central documentation for the **monorepo-workspace**. This hub provides a navigable map to all architecture, conventions, specifications, and operational guides — designed for both human developers and AI agents.

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

## Project Overview

This monorepo is a **website builder platform** built with a shared component library architecture. Users compose professional websites by selecting, stacking, and customizing pre-built sections through a visual drag-and-drop editor.

### Technology Stack

| Layer              | Technology                     |
| :----------------- | :----------------------------- |
| Package Manager    | pnpm (workspace protocol)      |
| Build Orchestrator | Turborepo                      |
| UI Framework       | React 19                       |
| Editor App         | Vite + TypeScript              |
| Component Library  | SCSS + TypeScript              |
| Component Docs     | Storybook 8                    |
| Testing            | Vitest + React Testing Library |
| Linting            | ESLint 9 (flat config)         |
| Formatting         | Prettier                       |
| Git Hooks          | Husky + Commitlint             |

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

- [Architecture & Principles](architecture.md) — Monorepo topology, core principles, dependency management
- [Workspace Conventions](conventions.md) — Naming, commits, branching, import ordering
- [Turborepo Guide](turborepo-guide.md) — Pipeline tasks, caching, filtering commands

### Guides

- [Adding Applications](adding-applications.md) — How to scaffold new apps (Next.js, React SPA, NestJS)
- [Adding Shared Packages](adding-packages.md) — How to create shared libraries and UI packages

### Application Specifications

- [Website Builder Platform](applications/website-builder-platform.md) — In-depth editor architecture, state management, component layout

### Package Specifications

- [Component Library](packages/component-library.md) — Section Library internals, Storybook config, section components

### APIs & Schemas

- [Registry & Schemas](apis/registry-and-schemas.md) — Schema-driven property rendering, type mappings, responsive rules

### Business Rules

- [Serialization Rules](business-rules/serialization-rules.md) — PageModel contract, state transitions, undo/redo, action security

### Development & Operations

- [Workflow & Testing](development/workflow-and-testing.md) — Dev commands, test suites, troubleshooting

### Reference

- [Glossary](glossary.md) — Technical and business vocabulary
- [Web Editor Architecture](web-editor-architecture.md) — System topology, absolute rules, 16-stage roadmap

### Decisions

- [ADR-0001: Schema-Driven Properties Panel](decisions/0001-schema-driven-properties-panel.md) — Why properties are schema-driven, not hardcoded

### AI Agent Resources

- [Agent Guidelines](ai/AGENT_GUIDELINES.md) — Boundaries, conventions, forbidden patterns, validation workflows

---

## Navigation Rules

1. **Start here** (`docs/README.md`) to find what you need.
2. **Follow cross-links** between documents — each doc links to related docs inline.
3. **Avoid circular references** — each document links outward but does not create infinite loops.
4. **Check the glossary** if you encounter an unfamiliar term.
5. **Consult Agent Guidelines** before making any code changes if you are an AI agent.
