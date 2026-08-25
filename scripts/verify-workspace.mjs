import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();

console.log('🔍 Validating workspace foundation constraints...\n');

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
];

for (const dir of requiredDirs) {
  const dirPath = path.join(rootDir, dir);
  assert(fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory(), `Directory '${dir}' exists`);
}

// 3. Confirm NO applications or business packages exist yet
function getSubdirectories(dirName) {
  const targetDir = path.join(rootDir, dirName);
  if (!fs.existsSync(targetDir)) return [];
  return fs
    .readdirSync(targetDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

const appsDirs = getSubdirectories('apps');
const packagesDirs = getSubdirectories('packages');

assert(
  appsDirs.length === 0,
  `apps/ contains NO scaffolded applications (Found: ${appsDirs.join(', ') || '0 apps'})`,
);

assert(
  packagesDirs.length === 0,
  `packages/ contains NO scaffolded packages (Found: ${packagesDirs.join(', ') || '0 packages'})`,
);

console.log('\n--- Result ---');
if (hasErrors) {
  console.error('Workspace verification failed.');
  process.exit(1);
} else {
  console.log('Workspace foundation verified successfully! 🎉\n');
  process.exit(0);
}
