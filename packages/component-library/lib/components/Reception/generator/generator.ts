
import { RECEPTION_COMPONENT_ID } from '../constants';
import { defaultReceptionActions, defaultReceptionProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { ReceptionProps } from '../types';

export const generateReceptionInstance = (
  overrides?: PartialSectionInstance<ReceptionProps>,
): SectionInstance<ReceptionProps> => ({
  id: overrides?.id || `reception-${Date.now()}`,
  componentId: RECEPTION_COMPONENT_ID,
  props: { ...defaultReceptionProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultReceptionActions, ...overrides?.actions },
});
