import { buttonActionSchema } from '../../../schema/actions';

import type { ActionPropertySchema } from '../../../schema/types';

export const faqActionsSchema: Record<string, ActionPropertySchema> = {
  faqToggleAction: buttonActionSchema('faqToggleAction', 'FAQ Accordion Toggle Action'),
};
