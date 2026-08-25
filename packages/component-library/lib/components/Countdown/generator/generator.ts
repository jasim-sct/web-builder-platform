
import { COUNTDOWN_COMPONENT_ID } from '../constants';
import { defaultCountdownActions, defaultCountdownProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { CountdownProps } from '../types';

export const generateCountdownInstance = (
  overrides?: PartialSectionInstance<CountdownProps>,
): SectionInstance<CountdownProps> => ({
  id: overrides?.id || `countdown-${Date.now()}`,
  componentId: COUNTDOWN_COMPONENT_ID,
  props: { ...defaultCountdownProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultCountdownActions, ...overrides?.actions },
});
