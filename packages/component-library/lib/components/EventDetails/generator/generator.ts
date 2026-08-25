
import { EVENTDETAILS_COMPONENT_ID } from '../constants';
import { defaultEventDetailsActions, defaultEventDetailsProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { EventDetailsProps } from '../types';

export const generateEventDetailsInstance = (
  overrides?: PartialSectionInstance<EventDetailsProps>,
): SectionInstance<EventDetailsProps> => ({
  id: overrides?.id || `eventdetails-${Date.now()}`,
  componentId: EVENTDETAILS_COMPONENT_ID,
  props: { ...defaultEventDetailsProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultEventDetailsActions, ...overrides?.actions },
});
