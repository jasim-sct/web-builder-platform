
import { TRAVELINFORMATION_COMPONENT_ID } from '../constants';
import { defaultTravelInformationActions, defaultTravelInformationProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { TravelInformationProps } from '../types';

export const generateTravelInformationInstance = (
  overrides?: PartialSectionInstance<TravelInformationProps>,
): SectionInstance<TravelInformationProps> => ({
  id: overrides?.id || `travelinformation-${Date.now()}`,
  componentId: TRAVELINFORMATION_COMPONENT_ID,
  props: { ...defaultTravelInformationProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultTravelInformationActions, ...overrides?.actions },
});
