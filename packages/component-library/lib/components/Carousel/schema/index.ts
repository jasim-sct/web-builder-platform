import { carouselActionsSchema } from './actions';
import { carouselPropsSchema } from './props';
import { carouselStyleSchema } from './style';

import type { SectionSchema } from '../../../schema/types';

export const carouselSchema: SectionSchema = {
  props: carouselPropsSchema,
  style: carouselStyleSchema,
  actions: carouselActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
