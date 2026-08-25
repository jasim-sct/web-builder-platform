
import { couplehostsActionsSchema } from './actions';
import { couplehostsPropsSchema } from './props';
import { couplehostsStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const couplehostsSchema: SectionSchema = {
  props: couplehostsPropsSchema,
  style: couplehostsStyleSchema,
  actions: couplehostsActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
