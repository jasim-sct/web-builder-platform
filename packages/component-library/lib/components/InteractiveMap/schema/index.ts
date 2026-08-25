
import { interactivemapActionsSchema } from './actions';
import { interactivemapPropsSchema } from './props';
import { interactivemapStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const interactivemapSchema: SectionSchema = {
  props: interactivemapPropsSchema,
  style: interactivemapStyleSchema,
  actions: interactivemapActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
