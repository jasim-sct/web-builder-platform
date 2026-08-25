
import { VENUESHOWCASE_COMPONENT_ID } from '../constants';
import { defaultVenueShowcaseActions, defaultVenueShowcaseProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { VenueShowcaseProps } from '../types';

export const generateVenueShowcaseInstance = (
  overrides?: PartialSectionInstance<VenueShowcaseProps>,
): SectionInstance<VenueShowcaseProps> => ({
  id: overrides?.id || `venueshowcase-${Date.now()}`,
  componentId: VENUESHOWCASE_COMPONENT_ID,
  props: { ...defaultVenueShowcaseProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultVenueShowcaseActions, ...overrides?.actions },
});
