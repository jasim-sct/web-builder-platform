import { Hero } from '../../lib/components/Hero';
import { defaultHeroProps, defaultHeroStyle } from '../../lib/components/Hero/defaultProps';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Hero> = {
  title: 'Sections/Hero/Hero',
  component: Hero,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Split: Story = {
  args: {
    props: {
      ...defaultHeroProps,
      variant: 'split',
    },
    style: defaultHeroStyle,
  },
};

export const Centered: Story = {
  args: {
    props: {
      ...defaultHeroProps,
      variant: 'centered',
      title: 'Accelerate your digital evolution with speed and confidence',
    },
    style: {
      desktop: {
        ...defaultHeroStyle.desktop,
        alignment: 'center',
      },
    },
  },
};

export const BackgroundImage: Story = {
  args: {
    props: {
      ...defaultHeroProps,
      variant: 'background',
      title: 'Powering high-velocity digital experiences worldwide',
    },
    style: {
      desktop: {
        ...defaultHeroStyle.desktop,
        backgroundImage:
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
        backgroundColor: '#0f172a',
        paddingTop: '140px',
        paddingBottom: '140px',
      },
    },
  },
};
