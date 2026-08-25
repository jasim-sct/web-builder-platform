import baseConfig from './base.js';

/**
 * ESLint Flat Configuration preset for React applications.
 * Can be imported and combined with plugins like eslint-plugin-react-hooks in future React apps.
 */
export const reactConfig = [
  ...baseConfig,
  {
    files: ['**/*.tsx', '**/*.jsx'],
    rules: {
      // React specific core rules can be extended here
    },
  },
];

export default reactConfig;
