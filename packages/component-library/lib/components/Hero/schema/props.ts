import {
  booleanProp,
  imageProp,
  selectProp,
  textareaProp,
  textProp,
} from '../../../schema/properties';

import type { PropertySchema } from '../../../schema/types';

export const heroPropsSchema: Record<string, PropertySchema> = {
  badge: textProp('badge', 'Badge Text', '✨ Next Generation Platform'),
  title: textProp('title', 'Hero Title', 'Build faster, scale smarter with our unified ecosystem', {
    required: true,
  }),
  description: textareaProp(
    'description',
    'Hero Description',
    'Empower your engineering and design teams to build production-grade web applications in record time.',
  ),
  primaryButtonLabel: textProp('primaryButtonLabel', 'Primary Button Text', 'Start Free Trial'),
  secondaryButtonLabel: textProp('secondaryButtonLabel', 'Secondary Button Text', 'Book a Demo'),
  showSecondaryButton: booleanProp('showSecondaryButton', 'Show Secondary Button', true),
  image: imageProp('image', 'Hero Image URL', ''),
  imageAlt: textProp('imageAlt', 'Image Alt Text', 'Hero Image'),
  variant: selectProp(
    'variant',
    'Hero Layout Variant',
    [
      { label: 'Split (Content Left, Media Right)', value: 'split' },
      { label: 'Centered (Stacked)', value: 'centered' },
      { label: 'Background (Hero on Image)', value: 'background' },
    ],
    'split',
  ),
};
