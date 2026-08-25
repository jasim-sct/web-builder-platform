
import { OURSTORY_COMPONENT_ID } from '../constants';
import { defaultOurStoryActions, defaultOurStoryProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { OurStoryProps } from '../types';

export const generateOurStoryInstance = (
  overrides?: PartialSectionInstance<OurStoryProps>,
): SectionInstance<OurStoryProps> => ({
  id: overrides?.id || `ourstory-${Date.now()}`,
  componentId: OURSTORY_COMPONENT_ID,
  props: { ...defaultOurStoryProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultOurStoryActions, ...overrides?.actions },
});
