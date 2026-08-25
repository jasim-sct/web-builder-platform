import { faqActionsSchema } from './actions';
import { faqPropsSchema } from './props';
import { faqStyleSchema } from './style';

import type { SectionSchema } from '../../../schema/types';

export const faqSchema: SectionSchema = {
  props: faqPropsSchema,
  style: faqStyleSchema,
  actions: faqActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
