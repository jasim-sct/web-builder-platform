
import { ACCOMMODATION_COMPONENT_ID } from '../constants';
import { defaultAccommodationActions, defaultAccommodationProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { AccommodationProps } from '../types';

export const generateAccommodationInstance = (
  overrides?: PartialSectionInstance<AccommodationProps>,
): SectionInstance<AccommodationProps> => ({
  id: overrides?.id || `accommodation-${Date.now()}`,
  componentId: ACCOMMODATION_COMPONENT_ID,
  props: { ...defaultAccommodationProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultAccommodationActions, ...overrides?.actions },
});
