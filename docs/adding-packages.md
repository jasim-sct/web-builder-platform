# Guide: Adding Shared Packages

This guide describes how to create shared packages and libraries inside `packages/`.

---

## 1. Creating a Shared TypeScript Library (`packages/utils`)

### Step 1: Create the Package Directory

```bash
mkdir -p packages/utils/src
cd packages/utils
```

### Step 2: Configure `package.json`

```json
{
  "name": "@repo/utils",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "clean": "rimraf dist *.tsbuildinfo"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "eslint": "^9.20.1",
    "rimraf": "^6.0.1",
    "typescript": "^5.7.3"
  }
}
```

### Step 3: Configure `tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 2. Creating a Shared React UI Package (`packages/ui`)

### Step 1: Create Directory

```bash
mkdir -p packages/ui/src
cd packages/ui
```

### Step 2: Configure `package.json`

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./*": "./src/*.tsx"
  },
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
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
    "noEmit": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

## 3. Consuming Packages in Applications

In any application `package.json` (e.g. `apps/website-builder-platform/package.json`):

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/utils": "workspace:*"
  }
}
```

Then run:

```bash
pnpm install
```
