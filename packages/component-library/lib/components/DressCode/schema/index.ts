
import { dresscodeActionsSchema } from './actions';
import { dresscodePropsSchema } from './props';
import { dresscodeStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const dresscodeSchema: SectionSchema = {
  props: dresscodePropsSchema,
  style: dresscodeStyleSchema,
  actions: dresscodeActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
