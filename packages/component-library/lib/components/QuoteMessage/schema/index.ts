
import { quotemessageActionsSchema } from './actions';
import { quotemessagePropsSchema } from './props';
import { quotemessageStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const quotemessageSchema: SectionSchema = {
  props: quotemessagePropsSchema,
  style: quotemessageStyleSchema,
  actions: quotemessageActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
