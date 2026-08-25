import { FAQ_COMPONENT_ID } from '../constants';
import { defaultFAQActions, defaultFAQProps, defaultFAQStyle } from '../defaultProps';

import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { FAQProps } from '../types';

export const generateFAQInstance = (
  overrides?: PartialSectionInstance<FAQProps>,
): SectionInstance<FAQProps> => ({
  id: overrides?.id || `faq-${Date.now()}`,
  componentId: FAQ_COMPONENT_ID,
  props: {
    ...defaultFAQProps,
    ...overrides?.props,
  },
  style: {
    ...defaultFAQStyle,
    ...overrides?.style,
  },
  actions: {
    ...defaultFAQActions,
    ...overrides?.actions,
  },
});
