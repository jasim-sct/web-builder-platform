import { CAROUSEL_COMPONENT_ID } from '../constants';
import { defaultCarouselActions, defaultCarouselProps } from '../defaultProps';

import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { CarouselProps } from '../types';

export const generateCarouselInstance = (
  overrides?: PartialSectionInstance<CarouselProps>,
): SectionInstance<CarouselProps> => ({
  id: overrides?.id || `carousel-${Date.now()}`,
  componentId: CAROUSEL_COMPONENT_ID,
  props: {
    ...defaultCarouselProps,
    ...overrides?.props,
  },
  style: {
    ...overrides?.style,
  },
  actions: {
    ...defaultCarouselActions,
    ...overrides?.actions,
  },
});
