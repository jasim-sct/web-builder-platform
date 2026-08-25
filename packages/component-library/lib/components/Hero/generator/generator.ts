import { HERO_COMPONENT_ID } from '../constants';
import { defaultHeroActions, defaultHeroProps } from '../defaultProps';

import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { HeroProps } from '../types';

export const generateHeroInstance = (
  overrides?: PartialSectionInstance<HeroProps>,
): SectionInstance<HeroProps> => ({
  id: overrides?.id || `hero-${Date.now()}`,
  componentId: HERO_COMPONENT_ID,
  props: {
    ...defaultHeroProps,
    ...overrides?.props,
  },
  style: {
    ...overrides?.style,
  },
  actions: {
    ...defaultHeroActions,
    ...overrides?.actions,
  },
});
