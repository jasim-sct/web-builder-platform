
import { venueinformationActionsSchema } from './actions';
import { venueinformationPropsSchema } from './props';
import { venueinformationStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const venueinformationSchema: SectionSchema = {
  props: venueinformationPropsSchema,
  style: venueinformationStyleSchema,
  actions: venueinformationActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
