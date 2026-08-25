
import { INTERACTIVEMAP_COMPONENT_ID } from '../constants';
import { defaultInteractiveMapActions, defaultInteractiveMapProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { InteractiveMapProps } from '../types';

export const generateInteractiveMapInstance = (
  overrides?: PartialSectionInstance<InteractiveMapProps>,
): SectionInstance<InteractiveMapProps> => ({
  id: overrides?.id || `interactivemap-${Date.now()}`,
  componentId: INTERACTIVEMAP_COMPONENT_ID,
  props: { ...defaultInteractiveMapProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultInteractiveMapActions, ...overrides?.actions },
});
