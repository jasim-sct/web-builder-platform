
import type { PropertySchema } from '../../../schema/types';
export const eventintroductionPropsSchema: Record<string, PropertySchema> = {
  greeting: { key: 'greeting', type: 'text', label: 'Greeting' },
  message: { key: 'message', type: 'textarea', label: 'Message' },
  signature: { key: 'signature', type: 'text', label: 'Signature' },
};
