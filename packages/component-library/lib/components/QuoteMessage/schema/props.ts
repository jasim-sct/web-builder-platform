
import type { PropertySchema } from '../../../schema/types';
export const quotemessagePropsSchema: Record<string, PropertySchema> = {
  quote: { key: 'quote', type: 'textarea', label: 'Quote Text' },
  author: { key: 'author', type: 'text', label: 'Author / Source' },
};
