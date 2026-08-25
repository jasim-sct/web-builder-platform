
import type { PropertySchema } from '../../../schema/types';
export const featuredmemoriesPropsSchema: Record<string, PropertySchema> = {
  title: { key: 'title', type: 'text', label: 'Title' },
  image1: { key: 'image1', type: 'image', label: 'Image 1' },
  image2: { key: 'image2', type: 'image', label: 'Image 2' },
  image3: { key: 'image3', type: 'image', label: 'Image 3' },
};
