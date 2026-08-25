import { Carousel } from '../../lib/components/Carousel';
import {
  defaultCarouselProps,
  defaultCarouselStyle,
} from '../../lib/components/Carousel/defaultProps';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Carousel> = {
  title: 'Sections/Media/Carousel',
  component: Carousel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  args: {
    props: defaultCarouselProps,
    style: defaultCarouselStyle,
  },
};
