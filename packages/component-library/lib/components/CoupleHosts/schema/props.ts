
import type { PropertySchema } from '../../../schema/types';
export const couplehostsPropsSchema: Record<string, PropertySchema> = {
  title: { key: 'title', type: 'text', label: 'Section Title' },
  host1Name: { key: 'host1Name', type: 'text', label: 'Host 1 Name' },
  host1Bio: { key: 'host1Bio', type: 'textarea', label: 'Host 1 Bio' },
  host1Image: { key: 'host1Image', type: 'image', label: 'Host 1 Image' },
  host2Name: { key: 'host2Name', type: 'text', label: 'Host 2 Name' },
  host2Bio: { key: 'host2Bio', type: 'textarea', label: 'Host 2 Bio' },
  host2Image: { key: 'host2Image', type: 'image', label: 'Host 2 Image' },
};
