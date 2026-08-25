import { buttonActionSchema } from '../../../schema/actions';

import type { ActionPropertySchema } from '../../../schema/types';

export const headerActionsSchema: Record<string, ActionPropertySchema> = {
  ctaAction: buttonActionSchema('ctaAction', 'CTA Click Action'),
};
