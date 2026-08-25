import { Header } from '../../lib/components/Header';
import { defaultHeaderProps, defaultHeaderStyle } from '../../lib/components/Header/defaultProps';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Header> = {
  title: 'Sections/Navigation/Header',
  component: Header,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    props: defaultHeaderProps,
    style: defaultHeaderStyle,
  },
};

export const WithoutCTA: Story = {
  args: {
    props: {
      ...defaultHeaderProps,
      showCta: false,
    },
  },
};
