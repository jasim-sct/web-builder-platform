
import { THINGSTOKNOW_COMPONENT_ID } from '../constants';
import { defaultThingsToKnowActions, defaultThingsToKnowProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { ThingsToKnowProps } from '../types';

export const generateThingsToKnowInstance = (
  overrides?: PartialSectionInstance<ThingsToKnowProps>,
): SectionInstance<ThingsToKnowProps> => ({
  id: overrides?.id || `thingstoknow-${Date.now()}`,
  componentId: THINGSTOKNOW_COMPONENT_ID,
  props: { ...defaultThingsToKnowProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultThingsToKnowActions, ...overrides?.actions },
});
