
import { receptionActionsSchema } from './actions';
import { receptionPropsSchema } from './props';
import { receptionStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const receptionSchema: SectionSchema = {
  props: receptionPropsSchema,
  style: receptionStyleSchema,
  actions: receptionActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
