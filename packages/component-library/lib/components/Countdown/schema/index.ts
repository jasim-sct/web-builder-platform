
import { countdownActionsSchema } from './actions';
import { countdownPropsSchema } from './props';
import { countdownStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const countdownSchema: SectionSchema = {
  props: countdownPropsSchema,
  style: countdownStyleSchema,
  actions: countdownActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
