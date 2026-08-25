import reactConfig from './react.js';

/**
 * ESLint Flat Configuration preset for Next.js applications.
 */
export const nextConfig = [
  ...reactConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Next.js specific overrides can be extended here
    },
  },
];

export default nextConfig;
