
import { WEDDINGPARTYTEAM_COMPONENT_ID } from '../constants';
import { defaultWeddingPartyTeamActions, defaultWeddingPartyTeamProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { WeddingPartyTeamProps } from '../types';

export const generateWeddingPartyTeamInstance = (
  overrides?: PartialSectionInstance<WeddingPartyTeamProps>,
): SectionInstance<WeddingPartyTeamProps> => ({
  id: overrides?.id || `weddingpartyteam-${Date.now()}`,
  componentId: WEDDINGPARTYTEAM_COMPONENT_ID,
  props: { ...defaultWeddingPartyTeamProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultWeddingPartyTeamActions, ...overrides?.actions },
});
