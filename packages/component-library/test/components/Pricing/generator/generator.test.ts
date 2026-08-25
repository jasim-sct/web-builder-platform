import { describe, expect, it } from 'vitest';

import { generatePricingInstance } from '../../../../lib/components/Pricing';

describe('Pricing Instance Generator', () => {
  it('generates a valid serializable pricing instance', () => {
    const instance = generatePricingInstance();

    expect(instance.componentId).toBe('pricing');
    expect(instance.props.plans.length).toBe(3);
    expect(instance.props.showBillingToggle).toBe(true);
  });
});
