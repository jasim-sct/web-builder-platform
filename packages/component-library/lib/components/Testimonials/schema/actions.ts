import { buttonActionSchema } from '../../../schema/actions';

import type { ActionPropertySchema } from '../../../schema/types';

export const testimonialsActionsSchema: Record<string, ActionPropertySchema> = {
  testimonialClickAction: buttonActionSchema(
    'testimonialClickAction',
    'Testimonial Card Click Action',
  ),
};
