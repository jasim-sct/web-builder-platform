
import { contactquestionsActionsSchema } from './actions';
import { contactquestionsPropsSchema } from './props';
import { contactquestionsStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const contactquestionsSchema: SectionSchema = {
  props: contactquestionsPropsSchema,
  style: contactquestionsStyleSchema,
  actions: contactquestionsActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
