import { headerActionsSchema } from './actions';
import { headerPropsSchema } from './props';
import { headerStyleSchema } from './style';

import type { SectionSchema } from '../../../schema/types';

export const headerSchema: SectionSchema = {
  props: headerPropsSchema,
  style: headerStyleSchema,
  actions: headerActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
