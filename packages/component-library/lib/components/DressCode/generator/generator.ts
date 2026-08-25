
import { DRESSCODE_COMPONENT_ID } from '../constants';
import { defaultDressCodeActions, defaultDressCodeProps } from '../defaultProps';
import type { PartialSectionInstance, SectionInstance } from '../../../types';
import type { DressCodeProps } from '../types';

export const generateDressCodeInstance = (
  overrides?: PartialSectionInstance<DressCodeProps>,
): SectionInstance<DressCodeProps> => ({
  id: overrides?.id || `dresscode-${Date.now()}`,
  componentId: DRESSCODE_COMPONENT_ID,
  props: { ...defaultDressCodeProps, ...overrides?.props },
  style: { ...overrides?.style },
  actions: { ...defaultDressCodeActions, ...overrides?.actions },
});
