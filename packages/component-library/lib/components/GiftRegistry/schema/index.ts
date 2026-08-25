
import { giftregistryActionsSchema } from './actions';
import { giftregistryPropsSchema } from './props';
import { giftregistryStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const giftregistrySchema: SectionSchema = {
  props: giftregistryPropsSchema,
  style: giftregistryStyleSchema,
  actions: giftregistryActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
