
import { FEATUREDMEMORIES_COMPONENT_ID } from '../constants';
import { defaultFeaturedMemoriesActions, defaultFeaturedMemoriesProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { FeaturedMemoriesProps } from '../types';

export const generateFeaturedMemoriesInstance = (
  overrides?: PartialSectionInstance<FeaturedMemoriesProps>,
): SectionInstance<FeaturedMemoriesProps> => ({
  id: overrides?.id || `featuredmemories-${Date.now()}`,
  componentId: FEATUREDMEMORIES_COMPONENT_ID,
  props: { ...defaultFeaturedMemoriesProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultFeaturedMemoriesActions, ...overrides?.actions },
});
