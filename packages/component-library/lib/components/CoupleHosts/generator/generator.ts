
import { COUPLEHOSTS_COMPONENT_ID } from '../constants';
import { defaultCoupleHostsActions, defaultCoupleHostsProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { CoupleHostsProps } from '../types';

export const generateCoupleHostsInstance = (
  overrides?: PartialSectionInstance<CoupleHostsProps>,
): SectionInstance<CoupleHostsProps> => ({
  id: overrides?.id || `couplehosts-${Date.now()}`,
  componentId: COUPLEHOSTS_COMPONENT_ID,
  props: { ...defaultCoupleHostsProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultCoupleHostsActions, ...overrides?.actions },
});
