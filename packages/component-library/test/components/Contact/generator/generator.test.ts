import { describe, expect, it } from 'vitest';

import { generateContactInstance } from '../../../../lib/components/Contact';

describe('Contact Instance Generator', () => {
  it('generates a valid serializable contact instance', () => {
    const instance = generateContactInstance();

    expect(instance.componentId).toBe('contact');
    expect(instance.props.submitButtonLabel).toBe('Send Message');
    expect(instance.actions?.submitAction?.type).toBe('submitApi');
  });
});
