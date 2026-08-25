import type { ActionPropertySchema } from './types';

export const buttonActionSchema = (
  key: string,
  label: string,
  description?: string,
): ActionPropertySchema => ({
  key,
  label,
  description: description || 'Configures the action performed when clicked',
  supportedActions: [
    'navigate',
    'externalUrl',
    'openPopup',
    'closePopup',
    'scrollToSection',
    'custom',
  ],
  defaultAction: 'navigate',
});

export const submitActionSchema = (
  key: string,
  label: string,
  description?: string,
): ActionPropertySchema => ({
  key,
  label,
  description: description || 'Configures the form submission handler',
  supportedActions: ['submitApi', 'formAction', 'custom'],
  defaultAction: 'submitApi',
});
