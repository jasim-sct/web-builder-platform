
import { QUOTEMESSAGE_COMPONENT_ID } from '../constants';
import { defaultQuoteMessageActions, defaultQuoteMessageProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { QuoteMessageProps } from '../types';

export const generateQuoteMessageInstance = (
  overrides?: PartialSectionInstance<QuoteMessageProps>,
): SectionInstance<QuoteMessageProps> => ({
  id: overrides?.id || `quotemessage-${Date.now()}`,
  componentId: QUOTEMESSAGE_COMPONENT_ID,
  props: { ...defaultQuoteMessageProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultQuoteMessageActions, ...overrides?.actions },
});
