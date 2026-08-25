
import { EVENTPOLICIES_COMPONENT_ID } from '../constants';
import { defaultEventPoliciesActions, defaultEventPoliciesProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { EventPoliciesProps } from '../types';

export const generateEventPoliciesInstance = (
  overrides?: PartialSectionInstance<EventPoliciesProps>,
): SectionInstance<EventPoliciesProps> => ({
  id: overrides?.id || `eventpolicies-${Date.now()}`,
  componentId: EVENTPOLICIES_COMPONENT_ID,
  props: { ...defaultEventPoliciesProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultEventPoliciesActions, ...overrides?.actions },
});
