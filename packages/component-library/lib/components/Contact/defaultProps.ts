import type { ActionConfig } from '../../types';
import type { ContactProps } from './types';

export const defaultContactProps: ContactProps = {
  badge: 'Get in Touch',
  title: "Let's build something exceptional together",
  description:
    'Have questions or want to see a personalized demo? Send us a message and our engineering team will respond within 24 hours.',
  submitButtonLabel: 'Send Message',
  successMessage: 'Thank you! Your message has been received.',
  showPhoneField: true,
  contactInfo: {
    email: 'contact@acmecorp.io',
    phone: '+1 (800) 555-0199',
    address: '548 Market St, Suite 300, San Francisco, CA 94104',
    businessHours: 'Mon - Fri: 9:00 AM - 6:00 PM PST',
  },
};

export const defaultContactActions: Record<string, ActionConfig> = {
  submitAction: {
    type: 'submitApi',
    url: '/api/contact',
  },
};
