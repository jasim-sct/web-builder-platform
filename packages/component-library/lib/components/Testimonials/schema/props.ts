import {
  arrayProp,
  imageProp,
  numberProp,
  textareaProp,
  textProp,
} from '../../../schema/properties';

import type { PropertySchema } from '../../../schema/types';

export const testimonialsPropsSchema: Record<string, PropertySchema> = {
  badge: textProp('badge', 'Badge Text', 'Customer Stories'),
  title: textProp(
    'title',
    'Testimonials Title',
    'Loved by forward-thinking teams across the globe',
    { required: true },
  ),
  description: textareaProp('description', 'Description', ''),
  items: arrayProp(
    'items',
    'Customer Testimonials',
    {
      quote: textareaProp('quote', 'Quote', 'Customer feedback quote'),
      authorName: textProp('authorName', 'Author Name', 'John Doe'),
      authorRole: textProp('authorRole', 'Author Role', 'CEO at Company'),
      authorAvatar: imageProp('authorAvatar', 'Author Avatar URL', ''),
      rating: numberProp('rating', 'Star Rating (1-5)', 5),
    },
    [],
  ),
};
