import { FOOTER_COMPONENT_ID } from '../constants';
import { defaultFooterActions, defaultFooterProps } from '../defaultProps';

import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { FooterProps } from '../types';

export const generateFooterInstance = (
  overrides?: PartialSectionInstance<FooterProps>,
): SectionInstance<FooterProps> => ({
  id: overrides?.id || `footer-${Date.now()}`,
  componentId: FOOTER_COMPONENT_ID,
  props: {
    ...defaultFooterProps,
    ...overrides?.props,
  },
  style: {
    ...overrides?.style,
  },
  actions: {
    ...defaultFooterActions,
    ...overrides?.actions,
  },
});
