
import { invitationheroActionsSchema } from './actions';
import { invitationheroPropsSchema } from './props';
import { invitationheroStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const invitationheroSchema: SectionSchema = {
  props: invitationheroPropsSchema,
  style: invitationheroStyleSchema,
  actions: invitationheroActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
