
import { EVENTSCHEDULE_COMPONENT_ID } from '../constants';
import { defaultEventScheduleActions, defaultEventScheduleProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { EventScheduleProps } from '../types';

export const generateEventScheduleInstance = (
  overrides?: PartialSectionInstance<EventScheduleProps>,
): SectionInstance<EventScheduleProps> => ({
  id: overrides?.id || `eventschedule-${Date.now()}`,
  componentId: EVENTSCHEDULE_COMPONENT_ID,
  props: { ...defaultEventScheduleProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultEventScheduleActions, ...overrides?.actions },
});
