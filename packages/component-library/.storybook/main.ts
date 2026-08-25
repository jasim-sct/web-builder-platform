import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    config.plugins = config.plugins?.filter((plugin) => {
      if (!plugin) return true;
      if (Array.isArray(plugin)) return true;
      return (plugin as { name?: string }).name !== 'vite:dts';
    });
    return config;
  },
};

export default config;
