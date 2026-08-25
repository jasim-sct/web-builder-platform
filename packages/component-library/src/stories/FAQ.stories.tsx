import { FAQ } from '../../lib/components/FAQ';
import { defaultFAQProps, defaultFAQStyle } from '../../lib/components/FAQ/defaultProps';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FAQ> = {
  title: 'Sections/Utility/FAQ',
  component: FAQ,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FAQ>;

export const Default: Story = {
  args: {
    props: defaultFAQProps,
    style: defaultFAQStyle,
  },
};
