
import { INVITATIONCOVER_COMPONENT_ID } from '../constants';
import { defaultInvitationCoverActions, defaultInvitationCoverProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { InvitationCoverProps } from '../types';

export const generateInvitationCoverInstance = (
  overrides?: PartialSectionInstance<InvitationCoverProps>,
): SectionInstance<InvitationCoverProps> => ({
  id: overrides?.id || `invitationcover-${Date.now()}`,
  componentId: INVITATIONCOVER_COMPONENT_ID,
  props: { ...defaultInvitationCoverProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultInvitationCoverActions, ...overrides?.actions },
});
