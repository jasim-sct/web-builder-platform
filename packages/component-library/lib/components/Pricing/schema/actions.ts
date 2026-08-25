import { buttonActionSchema } from '../../../schema/actions';

import type { ActionPropertySchema } from '../../../schema/types';

export const pricingActionsSchema: Record<string, ActionPropertySchema> = {
  planSelectAction: buttonActionSchema('planSelectAction', 'Plan Selection Action'),
};
