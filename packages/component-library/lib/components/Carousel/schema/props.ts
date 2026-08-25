import {
  arrayProp,
  booleanProp,
  imageProp,
  numberProp,
  textareaProp,
  textProp,
} from '../../../schema/properties';

import type { PropertySchema } from '../../../schema/types';

export const carouselPropsSchema: Record<string, PropertySchema> = {
  badge: textProp('badge', 'Badge Text', 'Product Showcase'),
  title: textProp('title', 'Carousel Title', 'Experience unmatched digital craftsmanship', {
    required: true,
  }),
  description: textareaProp('description', 'Description', ''),
  autoplay: booleanProp('autoplay', 'Auto Play Slides', true),
  interval: numberProp('interval', 'Autoplay Interval (ms)', 5000),
  items: arrayProp(
    'items',
    'Slide Items',
    {
      title: textProp('title', 'Slide Title', 'Slide Title'),
      subtitle: textProp('subtitle', 'Slide Subtitle', 'Subtitle'),
      image: imageProp('image', 'Slide Image URL', ''),
      imageAlt: textProp('imageAlt', 'Image Alt', 'Slide image'),
      ctaText: textProp('ctaText', 'Button Label', 'Explore'),
      ctaUrl: textProp('ctaUrl', 'Button URL', '#'),
    },
    [],
  ),
};
