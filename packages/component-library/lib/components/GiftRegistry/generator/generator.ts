
import { GIFTREGISTRY_COMPONENT_ID } from '../constants';
import { defaultGiftRegistryActions, defaultGiftRegistryProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { GiftRegistryProps } from '../types';

export const generateGiftRegistryInstance = (
  overrides?: PartialSectionInstance<GiftRegistryProps>,
): SectionInstance<GiftRegistryProps> => ({
  id: overrides?.id || `giftregistry-${Date.now()}`,
  componentId: GIFTREGISTRY_COMPONENT_ID,
  props: { ...defaultGiftRegistryProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultGiftRegistryActions, ...overrides?.actions },
});
