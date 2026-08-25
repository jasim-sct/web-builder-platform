
import { RSVP_COMPONENT_ID } from '../constants';
import { defaultRSVPActions, defaultRSVPProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { RSVPProps } from '../types';

export const generateRSVPInstance = (
  overrides?: PartialSectionInstance<RSVPProps>,
): SectionInstance<RSVPProps> => ({
  id: overrides?.id || `rsvp-${Date.now()}`,
  componentId: RSVP_COMPONENT_ID,
  props: { ...defaultRSVPProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultRSVPActions, ...overrides?.actions },
});
