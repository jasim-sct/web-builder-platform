import { submitActionSchema } from '../../../schema/actions';

import type { ActionPropertySchema } from '../../../schema/types';

export const contactActionsSchema: Record<string, ActionPropertySchema> = {
  submitAction: submitActionSchema('submitAction', 'Contact Form Submit Action'),
};
