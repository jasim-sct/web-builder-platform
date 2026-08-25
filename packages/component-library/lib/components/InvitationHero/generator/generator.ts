
import { INVITATIONHERO_COMPONENT_ID } from '../constants';
import { defaultInvitationHeroActions, defaultInvitationHeroProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { InvitationHeroProps } from '../types';

export const generateInvitationHeroInstance = (
  overrides?: PartialSectionInstance<InvitationHeroProps>,
): SectionInstance<InvitationHeroProps> => ({
  id: overrides?.id || `invitationhero-${Date.now()}`,
  componentId: INVITATIONHERO_COMPONENT_ID,
  props: { ...defaultInvitationHeroProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultInvitationHeroActions, ...overrides?.actions },
});
