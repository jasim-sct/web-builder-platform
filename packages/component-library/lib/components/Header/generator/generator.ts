import { HEADER_COMPONENT_ID } from '../constants';
import { defaultHeaderActions, defaultHeaderProps } from '../defaultProps';

import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { HeaderProps } from '../types';

export const generateHeaderInstance = (
  overrides?: PartialSectionInstance<HeaderProps>,
): SectionInstance<HeaderProps> => ({
  id: overrides?.id || `header-${Date.now()}`,
  componentId: HEADER_COMPONENT_ID,
  props: {
    ...defaultHeaderProps,
    ...overrides?.props,
  },
  style: {
    ...overrides?.style,
  },
  actions: {
    ...defaultHeaderActions,
    ...overrides?.actions,
  },
});
