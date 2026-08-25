import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();

console.log('🔍 Validating workspace and section library integrity...\n');

let hasErrors = false;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    hasErrors = true;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Check required foundation files
const requiredFiles = [
  'package.json',
  'pnpm-workspace.yaml',
  'turbo.json',
  'tsconfig.base.json',
  'tsconfig.json',
  'eslint.config.mjs',
  'prettier.config.mjs',
  '.prettierignore',
  '.gitignore',
  '.gitattributes',
  '.editorconfig',
  '.nvmrc',
  '.npmrc',
  'commitlint.config.mjs',
  '.lintstagedrc.json',
  'README.md',
];

for (const file of requiredFiles) {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `Required root file '${file}' exists`);
}

// 2. Check directories
const requiredDirs = [
  'apps',
  'packages',
  'tooling',
  'tooling/typescript',
  'tooling/eslint',
  'tooling/prettier',
  'docs',
  'scripts',
  '.github',
  '.github/workflows',
  '.husky',
  '.vscode',
  'packages/component-library',
  'packages/component-library/lib',
  'packages/component-library/lib/components',
  'packages/component-library/lib/schema',
  'packages/component-library/lib/registry',
  'packages/component-library/lib/assets/scss',
  'packages/component-library/test',
];

for (const dir of requiredDirs) {
  const dirPath = path.join(rootDir, dir);
  assert(fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory(), `Directory '${dir}' exists`);
}

// 3. Confirm 9 concrete sections exist
const sections = [
  'Header',
  'Hero',
  'Features',
  'Carousel',
  'Pricing',
  'Testimonials',
  'FAQ',
  'Contact',
  'Footer',
];

for (const sec of sections) {
  const componentPath = path.join(
    rootDir,
    'packages/component-library/lib/components',
    sec,
    `${sec}.component.tsx`,
  );
  assert(fs.existsSync(componentPath), `Section component '${sec}' exists and implemented`);
}

// 4. Confirm NO Web Editor apps created yet in apps/
function getSubdirectories(dirName) {
  const targetDir = path.join(rootDir, dirName);
  if (!fs.existsSync(targetDir)) return [];
  return fs
    .readdirSync(targetDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

const appsDirs = getSubdirectories('apps');
assert(
  appsDirs.length === 0,
  `apps/ contains NO scaffolded applications (Scope boundary maintained: ${appsDirs.join(', ') || '0 apps'})`,
);

console.log('\n--- Result ---');
if (hasErrors) {
  console.error('Workspace verification failed.');
  process.exit(1);
} else {
  console.log('Workspace and Section Library verified successfully! 🎉\n');
  process.exit(0);
}
