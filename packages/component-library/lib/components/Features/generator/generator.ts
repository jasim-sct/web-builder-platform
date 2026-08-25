import { FEATURES_COMPONENT_ID } from '../constants';
import { defaultFeaturesActions, defaultFeaturesProps } from '../defaultProps';

import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { FeaturesProps } from '../types';

export const generateFeaturesInstance = (
  overrides?: PartialSectionInstance<FeaturesProps>,
): SectionInstance<FeaturesProps> => ({
  id: overrides?.id || `features-${Date.now()}`,
  componentId: FEATURES_COMPONENT_ID,
  props: {
    ...defaultFeaturesProps,
    ...overrides?.props,
  },
  style: {
    ...overrides?.style,
  },
  actions: {
    ...defaultFeaturesActions,
    ...overrides?.actions,
  },
});
