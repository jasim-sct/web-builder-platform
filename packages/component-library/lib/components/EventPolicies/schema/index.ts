
import { eventpoliciesActionsSchema } from './actions';
import { eventpoliciesPropsSchema } from './props';
import { eventpoliciesStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const eventpoliciesSchema: SectionSchema = {
  props: eventpoliciesPropsSchema,
  style: eventpoliciesStyleSchema,
  actions: eventpoliciesActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
