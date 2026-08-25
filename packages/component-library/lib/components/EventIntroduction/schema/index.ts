
import { eventintroductionActionsSchema } from './actions';
import { eventintroductionPropsSchema } from './props';
import { eventintroductionStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const eventintroductionSchema: SectionSchema = {
  props: eventintroductionPropsSchema,
  style: eventintroductionStyleSchema,
  actions: eventintroductionActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
