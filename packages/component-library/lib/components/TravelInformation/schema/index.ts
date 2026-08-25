
import { travelinformationActionsSchema } from './actions';
import { travelinformationPropsSchema } from './props';
import { travelinformationStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const travelinformationSchema: SectionSchema = {
  props: travelinformationPropsSchema,
  style: travelinformationStyleSchema,
  actions: travelinformationActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
