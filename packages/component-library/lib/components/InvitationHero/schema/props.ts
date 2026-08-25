
import type { PropertySchema } from '../../../schema/types';
export const invitationheroPropsSchema: Record<string, PropertySchema> = {
  layout: { key: 'layout', type: 'select', label: 'Layout', defaultValue: 'split', options: [{label: 'Split', value: 'split'}, {label: 'Background', value: 'background'}] },
  title: { key: 'title', type: 'text', label: 'Title', defaultValue: 'Alex & Sam' },
  subtitle: { key: 'subtitle', type: 'text', label: 'Subtitle', defaultValue: 'Are Getting Married' },
  date: { key: 'date', type: 'text', label: 'Date', defaultValue: 'Saturday, October 14, 2028' },
  location: { key: 'location', type: 'text', label: 'Location', defaultValue: 'The Botanical Gardens' },
  image: { key: 'image', type: 'image', label: 'Image URL' },
  primaryButtonLabel: { key: 'primaryButtonLabel', type: 'text', label: 'Button Label' },
};
