
import { thankyouclosingActionsSchema } from './actions';
import { thankyouclosingPropsSchema } from './props';
import { thankyouclosingStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const thankyouclosingSchema: SectionSchema = {
  props: thankyouclosingPropsSchema,
  style: thankyouclosingStyleSchema,
  actions: thankyouclosingActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
