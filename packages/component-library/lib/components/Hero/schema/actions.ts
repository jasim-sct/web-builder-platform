import { buttonActionSchema } from '../../../schema/actions';

import type { ActionPropertySchema } from '../../../schema/types';

export const heroActionsSchema: Record<string, ActionPropertySchema> = {
  primaryButtonAction: buttonActionSchema('primaryButtonAction', 'Primary Button Click Action'),
  secondaryButtonAction: buttonActionSchema(
    'secondaryButtonAction',
    'Secondary Button Click Action',
  ),
};
