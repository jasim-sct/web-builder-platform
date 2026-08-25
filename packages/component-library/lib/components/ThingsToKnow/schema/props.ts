
import type { PropertySchema } from '../../../schema/types';
export const thingstoknowPropsSchema: Record<string, PropertySchema> = {
  title: { key: 'title', type: 'text', label: 'Title' },
  text: { key: 'text', type: 'textarea', label: 'Text' },
};
