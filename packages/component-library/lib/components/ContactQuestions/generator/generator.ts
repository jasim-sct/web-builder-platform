
import { CONTACTQUESTIONS_COMPONENT_ID } from '../constants';
import { defaultContactQuestionsActions, defaultContactQuestionsProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { ContactQuestionsProps } from '../types';

export const generateContactQuestionsInstance = (
  overrides?: PartialSectionInstance<ContactQuestionsProps>,
): SectionInstance<ContactQuestionsProps> => ({
  id: overrides?.id || `contactquestions-${Date.now()}`,
  componentId: CONTACTQUESTIONS_COMPONENT_ID,
  props: { ...defaultContactQuestionsProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultContactQuestionsActions, ...overrides?.actions },
});
