
import type { PropertySchema } from '../../../schema/types';
export const eventdetailsPropsSchema: Record<string, PropertySchema> = {
  title: { key: 'title', type: 'text', label: 'Section Title' },
  date: { key: 'date', type: 'text', label: 'Date' },
  time: { key: 'time', type: 'text', label: 'Time' },
  venueName: { key: 'venueName', type: 'text', label: 'Venue Name' },
  address: { key: 'address', type: 'textarea', label: 'Address' },
};
