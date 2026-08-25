
import { accommodationActionsSchema } from './actions';
import { accommodationPropsSchema } from './props';
import { accommodationStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const accommodationSchema: SectionSchema = {
  props: accommodationPropsSchema,
  style: accommodationStyleSchema,
  actions: accommodationActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
