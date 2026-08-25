
import { INVITATIONFOOTER_COMPONENT_ID } from '../constants';
import { defaultInvitationFooterActions, defaultInvitationFooterProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { InvitationFooterProps } from '../types';

export const generateInvitationFooterInstance = (
  overrides?: PartialSectionInstance<InvitationFooterProps>,
): SectionInstance<InvitationFooterProps> => ({
  id: overrides?.id || `invitationfooter-${Date.now()}`,
  componentId: INVITATIONFOOTER_COMPONENT_ID,
  props: { ...defaultInvitationFooterProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultInvitationFooterActions, ...overrides?.actions },
});
