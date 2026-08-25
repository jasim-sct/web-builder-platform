import { booleanProp, objectProp, textareaProp, textProp } from '../../../schema/properties';

import type { PropertySchema } from '../../../schema/types';

export const contactPropsSchema: Record<string, PropertySchema> = {
  badge: textProp('badge', 'Badge Text', 'Get in Touch'),
  title: textProp('title', 'Contact Title', "Let's build something exceptional together", {
    required: true,
  }),
  description: textareaProp('description', 'Description', ''),
  submitButtonLabel: textProp('submitButtonLabel', 'Submit Button Label', 'Send Message'),
  successMessage: textProp(
    'successMessage',
    'Success Notification',
    'Thank you! Your message has been received.',
  ),
  showPhoneField: booleanProp('showPhoneField', 'Include Phone Number Field', true),
  contactInfo: objectProp(
    'contactInfo',
    'Contact Sidebar Info',
    {
      email: textProp('email', 'Email Address', 'contact@acmecorp.io'),
      phone: textProp('phone', 'Phone Number', '+1 (800) 555-0199'),
      address: textProp('address', 'Physical Address', 'San Francisco, CA 94104'),
      businessHours: textProp('businessHours', 'Business Hours', 'Mon-Fri 9am-6pm'),
    },
    {},
  ),
};
