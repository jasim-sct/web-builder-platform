import { buttonActionSchema, submitActionSchema } from '../../../schema/actions';

import type { ActionPropertySchema } from '../../../schema/types';

export const footerActionsSchema: Record<string, ActionPropertySchema> = {
  newsletterSubmitAction: submitActionSchema('newsletterSubmitAction', 'Newsletter Submit Action'),
  footerLinkAction: buttonActionSchema('footerLinkAction', 'Footer Link Click Action'),
};
