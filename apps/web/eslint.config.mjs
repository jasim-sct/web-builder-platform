import reactConfig from '@repo/eslint-config/react';

export default [
  ...reactConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
