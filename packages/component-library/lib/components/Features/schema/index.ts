import { featuresActionsSchema } from './actions';
import { featuresPropsSchema } from './props';
import { featuresStyleSchema } from './style';

import type { SectionSchema } from '../../../schema/types';

export const featuresSchema: SectionSchema = {
  props: featuresPropsSchema,
  style: featuresStyleSchema,
  actions: featuresActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
