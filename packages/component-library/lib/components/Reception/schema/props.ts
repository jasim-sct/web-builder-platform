
import type { PropertySchema } from '../../../schema/types';
export const receptionPropsSchema: Record<string, PropertySchema> = {
  title: { key: 'title', type: 'text', label: 'Title' },
  time: { key: 'time', type: 'text', label: 'Time' },
  location: { key: 'location', type: 'text', label: 'Location' },
  address: { key: 'address', type: 'textarea', label: 'Address' },
  image: { key: 'image', type: 'image', label: 'Image' },
};
