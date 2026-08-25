import { Contact } from '../../lib/components/Contact';
import {
  defaultContactProps,
  defaultContactStyle,
} from '../../lib/components/Contact/defaultProps';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Contact> = {
  title: 'Sections/Conversion/Contact',
  component: Contact,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Contact>;

export const Default: Story = {
  args: {
    props: defaultContactProps,
    style: defaultContactStyle,
  },
};
