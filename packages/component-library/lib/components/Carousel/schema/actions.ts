import { buttonActionSchema } from '../../../schema/actions';

import type { ActionPropertySchema } from '../../../schema/types';

export const carouselActionsSchema: Record<string, ActionPropertySchema> = {
  slideChangeAction: buttonActionSchema('slideChangeAction', 'Slide Change Notification Action'),
  slideCtaAction: buttonActionSchema('slideCtaAction', 'Slide CTA Click Action'),
};
