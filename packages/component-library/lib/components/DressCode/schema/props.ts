
import type { PropertySchema } from '../../../schema/types';
export const dresscodePropsSchema: Record<string, PropertySchema> = {
  title: { key: 'title', type: 'text', label: 'Title' },
  text: { key: 'text', type: 'textarea', label: 'Text' },
};
