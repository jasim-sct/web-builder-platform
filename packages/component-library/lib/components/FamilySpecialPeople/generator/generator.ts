
import { FAMILYSPECIALPEOPLE_COMPONENT_ID } from '../constants';
import { defaultFamilySpecialPeopleActions, defaultFamilySpecialPeopleProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { FamilySpecialPeopleProps } from '../types';

export const generateFamilySpecialPeopleInstance = (
  overrides?: PartialSectionInstance<FamilySpecialPeopleProps>,
): SectionInstance<FamilySpecialPeopleProps> => ({
  id: overrides?.id || `familyspecialpeople-${Date.now()}`,
  componentId: FAMILYSPECIALPEOPLE_COMPONENT_ID,
  props: { ...defaultFamilySpecialPeopleProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultFamilySpecialPeopleActions, ...overrides?.actions },
});
