import { Testimonials } from '../../lib/components/Testimonials';
import {
  defaultTestimonialsProps,
} from '../../lib/components/Testimonials/defaultProps';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Testimonials> = {
  title: 'Sections/Business/Testimonials',
  component: Testimonials,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Testimonials>;

export const Default: Story = {
  args: {
    props: defaultTestimonialsProps,
    
  },
};
