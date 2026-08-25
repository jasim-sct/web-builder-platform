import { contactActionsSchema } from './actions';
import { contactPropsSchema } from './props';
import { contactStyleSchema } from './style';

import type { SectionSchema } from '../../../schema/types';

export const contactSchema: SectionSchema = {
  props: contactPropsSchema,
  style: contactStyleSchema,
  actions: contactActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
