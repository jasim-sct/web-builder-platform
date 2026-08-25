import { heroActionsSchema } from './actions';
import { heroPropsSchema } from './props';
import { heroStyleSchema } from './style';

import type { SectionSchema } from '../../../schema/types';

export const heroSchema: SectionSchema = {
  props: heroPropsSchema,
  style: heroStyleSchema,
  actions: heroActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
