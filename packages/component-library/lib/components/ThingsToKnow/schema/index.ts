
import { thingstoknowActionsSchema } from './actions';
import { thingstoknowPropsSchema } from './props';
import { thingstoknowStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const thingstoknowSchema: SectionSchema = {
  props: thingstoknowPropsSchema,
  style: thingstoknowStyleSchema,
  actions: thingstoknowActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
