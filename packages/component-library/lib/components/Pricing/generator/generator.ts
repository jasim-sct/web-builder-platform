import { PRICING_COMPONENT_ID } from '../constants';
import { defaultPricingActions, defaultPricingProps, defaultPricingStyle } from '../defaultProps';

import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { PricingProps } from '../types';

export const generatePricingInstance = (
  overrides?: PartialSectionInstance<PricingProps>,
): SectionInstance<PricingProps> => ({
  id: overrides?.id || `pricing-${Date.now()}`,
  componentId: PRICING_COMPONENT_ID,
  props: {
    ...defaultPricingProps,
    ...overrides?.props,
  },
  style: {
    ...defaultPricingStyle,
    ...overrides?.style,
  },
  actions: {
    ...defaultPricingActions,
    ...overrides?.actions,
  },
});
