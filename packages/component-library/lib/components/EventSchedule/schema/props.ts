
import type { PropertySchema } from '../../../schema/types';
export const eventschedulePropsSchema: Record<string, PropertySchema> = {
  title: { key: 'title', type: 'text', label: 'Title' },
  e1Time: { key: 'e1Time', type: 'text', label: 'Event 1 Time' },
  e1Title: { key: 'e1Title', type: 'text', label: 'Event 1 Title' },
  e1Desc: { key: 'e1Desc', type: 'text', label: 'Event 1 Desc' },
  e2Time: { key: 'e2Time', type: 'text', label: 'Event 2 Time' },
  e2Title: { key: 'e2Title', type: 'text', label: 'Event 2 Title' },
  e2Desc: { key: 'e2Desc', type: 'text', label: 'Event 2 Desc' },
  e3Time: { key: 'e3Time', type: 'text', label: 'Event 3 Time' },
  e3Title: { key: 'e3Title', type: 'text', label: 'Event 3 Title' },
  e3Desc: { key: 'e3Desc', type: 'text', label: 'Event 3 Desc' },
};
