import { Footer } from '../../lib/components/Footer';
import { defaultFooterProps, defaultFooterStyle } from '../../lib/components/Footer/defaultProps';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Footer> = {
  title: 'Sections/Navigation/Footer',
  component: Footer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {
    props: defaultFooterProps,
    style: defaultFooterStyle,
  },
};
