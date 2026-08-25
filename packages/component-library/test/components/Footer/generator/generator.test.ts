import { describe, expect, it } from 'vitest';

import { generateFooterInstance } from '../../../../lib/components/Footer';

describe('Footer Instance Generator', () => {
  it('generates a valid serializable footer instance', () => {
    const instance = generateFooterInstance();

    expect(instance.componentId).toBe('footer');
    expect(instance.props.linkGroups.length).toBeGreaterThan(0);
    expect(instance.props.copyrightText).toBeDefined();
  });
});
