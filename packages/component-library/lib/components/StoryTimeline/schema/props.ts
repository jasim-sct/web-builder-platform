
import type { PropertySchema } from '../../../schema/types';
export const storytimelinePropsSchema: Record<string, PropertySchema> = {
  title: { key: 'title', type: 'text', label: 'Title' },
  e1Year: { key: 'e1Year', type: 'text', label: 'Event 1 Year' },
  e1Title: { key: 'e1Title', type: 'text', label: 'Event 1 Title' },
  e1Desc: { key: 'e1Desc', type: 'textarea', label: 'Event 1 Desc' },
  e2Year: { key: 'e2Year', type: 'text', label: 'Event 2 Year' },
  e2Title: { key: 'e2Title', type: 'text', label: 'Event 2 Title' },
  e2Desc: { key: 'e2Desc', type: 'textarea', label: 'Event 2 Desc' },
  e3Year: { key: 'e3Year', type: 'text', label: 'Event 3 Year' },
  e3Title: { key: 'e3Title', type: 'text', label: 'Event 3 Title' },
  e3Desc: { key: 'e3Desc', type: 'textarea', label: 'Event 3 Desc' },
};
