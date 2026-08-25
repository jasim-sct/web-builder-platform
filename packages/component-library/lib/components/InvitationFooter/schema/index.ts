
import { invitationfooterActionsSchema } from './actions';
import { invitationfooterPropsSchema } from './props';
import { invitationfooterStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const invitationfooterSchema: SectionSchema = {
  props: invitationfooterPropsSchema,
  style: invitationfooterStyleSchema,
  actions: invitationfooterActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
