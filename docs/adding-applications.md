# Guide: Adding Applications

> **Purpose:** How to scaffold new applications in the monorepo (Next.js, React SPA, NestJS).
> **Status:** Active
> **Last Reviewed:** 2026-08-25
> **Related:** [Architecture & Principles](architecture.md), [Conventions](conventions.md)

This guide outlines how to create future applications inside `apps/` without breaking workspace conventions.

---

## 1. Adding a Next.js Application

### Step 1: Create the Application Directory

```bash
mkdir -p apps/web
cd apps/web
```

### Step 2: Initialize `package.json`

```json
{
  "name": "web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.20.1",
    "typescript": "^5.7.3"
  }
}
```

### Step 3: Configure `tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/react.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step 4: Configure `eslint.config.mjs`

```javascript
import nextConfig from '@repo/eslint-config/next';

export default [...nextConfig];
```

---

## 2. Adding a React SPA (Vite)

### Step 1: Initialize Directory

```bash
mkdir -p apps/dashboard
cd apps/dashboard
```

### Step 2: Configure `package.json`

```json
{
  "name": "dashboard",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.20.1",
    "typescript": "^5.7.3",
    "vite": "^6.1.0"
  }
}
```

### Step 3: Configure `tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/react.json",
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

## 3. Adding a NestJS Application

### Step 1: Initialize Directory

```bash
mkdir -p apps/api
cd apps/api
```

### Step 2: Configure `package.json`

```json
{
  "name": "api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.0.0",
    "eslint": "^9.20.1",
    "typescript": "^5.7.3"
  }
}
```

### Step 3: Configure `tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Configure `eslint.config.mjs`

```javascript
import nestConfig from '@repo/eslint-config/nest';

export default [...nestConfig];
```
