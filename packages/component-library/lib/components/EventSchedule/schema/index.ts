
import { eventscheduleActionsSchema } from './actions';
import { eventschedulePropsSchema } from './props';
import { eventscheduleStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const eventscheduleSchema: SectionSchema = {
  props: eventschedulePropsSchema,
  style: eventscheduleStyleSchema,
  actions: eventscheduleActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
