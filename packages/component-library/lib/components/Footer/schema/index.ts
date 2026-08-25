import { footerActionsSchema } from './actions';
import { footerPropsSchema } from './props';
import { footerStyleSchema } from './style';

import type { SectionSchema } from '../../../schema/types';

export const footerSchema: SectionSchema = {
  props: footerPropsSchema,
  style: footerStyleSchema,
  actions: footerActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
