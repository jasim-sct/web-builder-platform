
import type { PropertySchema } from '../../../schema/types';
export const invitationcoverPropsSchema: Record<string, PropertySchema> = {
  eventTitle: { key: 'eventTitle', type: 'text', label: 'Event Title' },
  names: { key: 'names', type: 'text', label: 'Names' },
  message: { key: 'message', type: 'textarea', label: 'Message' },
};
