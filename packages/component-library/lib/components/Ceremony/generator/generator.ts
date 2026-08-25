
import { CEREMONY_COMPONENT_ID } from '../constants';
import { defaultCeremonyActions, defaultCeremonyProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { CeremonyProps } from '../types';

export const generateCeremonyInstance = (
  overrides?: PartialSectionInstance<CeremonyProps>,
): SectionInstance<CeremonyProps> => ({
  id: overrides?.id || `ceremony-${Date.now()}`,
  componentId: CEREMONY_COMPONENT_ID,
  props: { ...defaultCeremonyProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultCeremonyActions, ...overrides?.actions },
});
