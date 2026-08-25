import {
  arrayProp,
  iconProp,
  selectProp,
  textareaProp,
  textProp,
} from '../../../schema/properties';

import type { PropertySchema } from '../../../schema/types';

export const featuresPropsSchema: Record<string, PropertySchema> = {
  badge: textProp('badge', 'Badge Text', 'Powerful Capabilities'),
  title: textProp('title', 'Features Title', 'Everything you need to deliver high-impact results', {
    required: true,
  }),
  description: textareaProp(
    'description',
    'Description',
    'Explore our comprehensive suite of modular features.',
  ),
  columns: selectProp<number>(
    'columns',
    'Grid Columns',
    [
      { label: '2 Columns', value: 2 },
      { label: '3 Columns', value: 3 },
      { label: '4 Columns', value: 4 },
    ],
    3,
  ),
  items: arrayProp(
    'items',
    'Feature Cards',
    {
      title: textProp('title', 'Card Title', 'Feature Title'),
      description: textareaProp(
        'description',
        'Card Description',
        'Feature details and benefit description.',
      ),
      icon: iconProp('icon', 'Icon Name', 'Zap'),
      linkText: textProp('linkText', 'Link Label', 'Learn more'),
      linkUrl: textProp('linkUrl', 'Target URL', '#'),
    },
    [],
  ),
};
