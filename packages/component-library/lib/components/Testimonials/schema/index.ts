import { testimonialsActionsSchema } from './actions';
import { testimonialsPropsSchema } from './props';
import { testimonialsStyleSchema } from './style';

import type { SectionSchema } from '../../../schema/types';

export const testimonialsSchema: SectionSchema = {
  props: testimonialsPropsSchema,
  style: testimonialsStyleSchema,
  actions: testimonialsActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
