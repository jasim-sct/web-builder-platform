import { CONTACT_COMPONENT_ID } from '../constants';
import { defaultContactActions, defaultContactProps } from '../defaultProps';

import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { ContactProps } from '../types';

export const generateContactInstance = (
  overrides?: PartialSectionInstance<ContactProps>,
): SectionInstance<ContactProps> => ({
  id: overrides?.id || `contact-${Date.now()}`,
  componentId: CONTACT_COMPONENT_ID,
  props: {
    ...defaultContactProps,
    ...overrides?.props,
  },
  style: {
    ...overrides?.style,
  },
  actions: {
    ...defaultContactActions,
    ...overrides?.actions,
  },
});
