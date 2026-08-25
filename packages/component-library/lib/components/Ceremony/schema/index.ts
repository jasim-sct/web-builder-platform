
import { ceremonyActionsSchema } from './actions';
import { ceremonyPropsSchema } from './props';
import { ceremonyStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const ceremonySchema: SectionSchema = {
  props: ceremonyPropsSchema,
  style: ceremonyStyleSchema,
  actions: ceremonyActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
