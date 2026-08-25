
import { familyspecialpeopleActionsSchema } from './actions';
import { familyspecialpeoplePropsSchema } from './props';
import { familyspecialpeopleStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const familyspecialpeopleSchema: SectionSchema = {
  props: familyspecialpeoplePropsSchema,
  style: familyspecialpeopleStyleSchema,
  actions: familyspecialpeopleActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
