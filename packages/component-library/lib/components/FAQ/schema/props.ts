import { arrayProp, booleanProp, textareaProp, textProp } from '../../../schema/properties';

import type { PropertySchema } from '../../../schema/types';

export const faqPropsSchema: Record<string, PropertySchema> = {
  badge: textProp('badge', 'Badge Text', 'Common Questions'),
  title: textProp('title', 'FAQ Title', 'Frequently Asked Questions', { required: true }),
  description: textareaProp('description', 'Description', ''),
  showCategoryFilter: booleanProp('showCategoryFilter', 'Show Category Tabs', true),
  items: arrayProp(
    'items',
    'FAQ Questions',
    {
      question: textProp('question', 'Question', 'How does this work?'),
      answer: textareaProp('answer', 'Answer', 'Detailed answer content.'),
      category: textProp('category', 'Category', 'General'),
    },
    [],
  ),
};
