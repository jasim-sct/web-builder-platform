import { TESTIMONIALS_COMPONENT_ID } from '../constants';
import { defaultTestimonialsActions, defaultTestimonialsProps } from '../defaultProps';

import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { TestimonialsProps } from '../types';

export const generateTestimonialsInstance = (
  overrides?: PartialSectionInstance<TestimonialsProps>,
): SectionInstance<TestimonialsProps> => ({
  id: overrides?.id || `testimonials-${Date.now()}`,
  componentId: TESTIMONIALS_COMPONENT_ID,
  props: {
    ...defaultTestimonialsProps,
    ...overrides?.props,
  },
  style: {
    ...overrides?.style,
  },
  actions: {
    ...defaultTestimonialsActions,
    ...overrides?.actions,
  },
});
