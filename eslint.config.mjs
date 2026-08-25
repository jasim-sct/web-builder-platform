import baseConfig from './tooling/eslint/base.js';

/**
 * Root ESLint configuration.
 * Extends the workspace base configuration.
 */
export default [
  ...baseConfig,
  {
    files: ['**/*.js', '**/*.mjs', '**/*.ts'],
  },
];
