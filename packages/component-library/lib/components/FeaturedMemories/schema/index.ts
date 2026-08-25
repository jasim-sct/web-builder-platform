
import { featuredmemoriesActionsSchema } from './actions';
import { featuredmemoriesPropsSchema } from './props';
import { featuredmemoriesStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const featuredmemoriesSchema: SectionSchema = {
  props: featuredmemoriesPropsSchema,
  style: featuredmemoriesStyleSchema,
  actions: featuredmemoriesActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
