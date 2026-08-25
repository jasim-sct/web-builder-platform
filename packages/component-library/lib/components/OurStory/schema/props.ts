
import type { PropertySchema } from '../../../schema/types';
export const ourstoryPropsSchema: Record<string, PropertySchema> = {
  title: { key: 'title', type: 'text', label: 'Title' },
  storyText: { key: 'storyText', type: 'textarea', label: 'Story Text' },
  image: { key: 'image', type: 'image', label: 'Featured Image' },
};
