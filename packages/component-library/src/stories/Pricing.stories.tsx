import { Pricing } from '../../lib/components/Pricing';
import {
  defaultPricingProps,
  defaultPricingStyle,
} from '../../lib/components/Pricing/defaultProps';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Pricing> = {
  title: 'Sections/Business/Pricing',
  component: Pricing,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Pricing>;

export const Default: Story = {
  args: {
    props: defaultPricingProps,
    style: defaultPricingStyle,
  },
};
