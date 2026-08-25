
import { EVENTINTRODUCTION_COMPONENT_ID } from '../constants';
import { defaultEventIntroductionActions, defaultEventIntroductionProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { EventIntroductionProps } from '../types';

export const generateEventIntroductionInstance = (
  overrides?: PartialSectionInstance<EventIntroductionProps>,
): SectionInstance<EventIntroductionProps> => ({
  id: overrides?.id || `eventintroduction-${Date.now()}`,
  componentId: EVENTINTRODUCTION_COMPONENT_ID,
  props: { ...defaultEventIntroductionProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultEventIntroductionActions, ...overrides?.actions },
});
