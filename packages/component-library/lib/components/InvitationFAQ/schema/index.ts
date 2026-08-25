
import { invitationfaqActionsSchema } from './actions';
import { invitationfaqPropsSchema } from './props';
import { invitationfaqStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const invitationfaqSchema: SectionSchema = {
  props: invitationfaqPropsSchema,
  style: invitationfaqStyleSchema,
  actions: invitationfaqActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
