import { describe, expect, it } from 'vitest';

import { generateFAQInstance } from '../../../../lib/components/FAQ';

describe('FAQ Instance Generator', () => {
  it('generates a valid serializable FAQ instance', () => {
    const instance = generateFAQInstance();

    expect(instance.componentId).toBe('faq');
    expect(instance.props.items.length).toBeGreaterThan(0);
  });
});
