import { buttonActionSchema } from '../../../schema/actions';

import type { ActionPropertySchema } from '../../../schema/types';

export const featuresActionsSchema: Record<string, ActionPropertySchema> = {
  featureClickAction: buttonActionSchema('featureClickAction', 'Feature Item Click Action'),
};
