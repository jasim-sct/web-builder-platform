import { describe, expect, it } from 'vitest';

import { generateFeaturesInstance } from '../../../../lib/components/Features';

describe('Features Instance Generator', () => {
  it('generates a valid serializable features instance', () => {
    const instance = generateFeaturesInstance();

    expect(instance.componentId).toBe('features');
    expect(instance.props.columns).toBe(3);
    expect(instance.props.items.length).toBeGreaterThan(0);
  });
});
