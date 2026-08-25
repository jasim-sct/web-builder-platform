
import { invitationcoverActionsSchema } from './actions';
import { invitationcoverPropsSchema } from './props';
import { invitationcoverStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const invitationcoverSchema: SectionSchema = {
  props: invitationcoverPropsSchema,
  style: invitationcoverStyleSchema,
  actions: invitationcoverActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
