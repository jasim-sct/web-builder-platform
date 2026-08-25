
import { ourstoryActionsSchema } from './actions';
import { ourstoryPropsSchema } from './props';
import { ourstoryStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const ourstorySchema: SectionSchema = {
  props: ourstoryPropsSchema,
  style: ourstoryStyleSchema,
  actions: ourstoryActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
