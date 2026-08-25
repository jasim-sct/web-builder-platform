
import { rsvpActionsSchema } from './actions';
import { rsvpPropsSchema } from './props';
import { rsvpStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const rsvpSchema: SectionSchema = {
  props: rsvpPropsSchema,
  style: rsvpStyleSchema,
  actions: rsvpActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
