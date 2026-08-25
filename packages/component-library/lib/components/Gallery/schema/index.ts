
import { galleryActionsSchema } from './actions';
import { galleryPropsSchema } from './props';
import { galleryStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const gallerySchema: SectionSchema = {
  props: galleryPropsSchema,
  style: galleryStyleSchema,
  actions: galleryActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
