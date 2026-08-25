
import { VENUEINFORMATION_COMPONENT_ID } from '../constants';
import { defaultVenueInformationActions, defaultVenueInformationProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { VenueInformationProps } from '../types';

export const generateVenueInformationInstance = (
  overrides?: PartialSectionInstance<VenueInformationProps>,
): SectionInstance<VenueInformationProps> => ({
  id: overrides?.id || `venueinformation-${Date.now()}`,
  componentId: VENUEINFORMATION_COMPONENT_ID,
  props: { ...defaultVenueInformationProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultVenueInformationActions, ...overrides?.actions },
});
