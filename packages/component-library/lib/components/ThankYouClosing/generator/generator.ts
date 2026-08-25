
import { THANKYOUCLOSING_COMPONENT_ID } from '../constants';
import { defaultThankYouClosingActions, defaultThankYouClosingProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { ThankYouClosingProps } from '../types';

export const generateThankYouClosingInstance = (
  overrides?: PartialSectionInstance<ThankYouClosingProps>,
): SectionInstance<ThankYouClosingProps> => ({
  id: overrides?.id || `thankyouclosing-${Date.now()}`,
  componentId: THANKYOUCLOSING_COMPONENT_ID,
  props: { ...defaultThankYouClosingProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultThankYouClosingActions, ...overrides?.actions },
});
