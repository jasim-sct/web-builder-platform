import { pricingActionsSchema } from './actions';
import { pricingPropsSchema } from './props';
import { pricingStyleSchema } from './style';

import type { SectionSchema } from '../../../schema/types';

export const pricingSchema: SectionSchema = {
  props: pricingPropsSchema,
  style: pricingStyleSchema,
  actions: pricingActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
