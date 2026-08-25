
import { venueshowcaseActionsSchema } from './actions';
import { venueshowcasePropsSchema } from './props';
import { venueshowcaseStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const venueshowcaseSchema: SectionSchema = {
  props: venueshowcasePropsSchema,
  style: venueshowcaseStyleSchema,
  actions: venueshowcaseActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
