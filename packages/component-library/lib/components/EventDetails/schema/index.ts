
import { eventdetailsActionsSchema } from './actions';
import { eventdetailsPropsSchema } from './props';
import { eventdetailsStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const eventdetailsSchema: SectionSchema = {
  props: eventdetailsPropsSchema,
  style: eventdetailsStyleSchema,
  actions: eventdetailsActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
