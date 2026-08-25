import { Features } from '../../lib/components/Features';
import {
  defaultFeaturesProps,
  defaultFeaturesStyle,
} from '../../lib/components/Features/defaultProps';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Features> = {
  title: 'Sections/Content/Features',
  component: Features,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Features>;

export const ThreeColumns: Story = {
  args: {
    props: {
      ...defaultFeaturesProps,
      columns: 3,
    },
    style: defaultFeaturesStyle,
  },
};

export const TwoColumns: Story = {
  args: {
    props: {
      ...defaultFeaturesProps,
      columns: 2,
      items: defaultFeaturesProps.items.slice(0, 4),
    },
    style: defaultFeaturesStyle,
  },
};
