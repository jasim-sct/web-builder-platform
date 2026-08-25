
import { storytimelineActionsSchema } from './actions';
import { storytimelinePropsSchema } from './props';
import { storytimelineStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const storytimelineSchema: SectionSchema = {
  props: storytimelinePropsSchema,
  style: storytimelineStyleSchema,
  actions: storytimelineActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
