
import { INVITATIONFAQ_COMPONENT_ID } from '../constants';
import { defaultInvitationFAQActions, defaultInvitationFAQProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { InvitationFAQProps } from '../types';

export const generateInvitationFAQInstance = (
  overrides?: PartialSectionInstance<InvitationFAQProps>,
): SectionInstance<InvitationFAQProps> => ({
  id: overrides?.id || `invitationfaq-${Date.now()}`,
  componentId: INVITATIONFAQ_COMPONENT_ID,
  props: { ...defaultInvitationFAQProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultInvitationFAQActions, ...overrides?.actions },
});
