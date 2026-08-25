import { describe, expect, it } from 'vitest';

import { generateHeaderInstance } from '../../../../lib/components/Header';

describe('Header Instance Generator', () => {
  it('generates a valid serializable section instance with default values', () => {
    const instance = generateHeaderInstance();

    expect(instance.componentId).toBe('header');
    expect(instance.props.logoText).toBe('Acme Corp');
    expect(instance.props.links.length).toBeGreaterThan(0);
    expect(instance.actions?.ctaAction?.type).toBe('navigate');
  });

  it('accepts and merges custom overrides', () => {
    const instance = generateHeaderInstance({
      id: 'custom-header-1',
      props: {
        logoText: 'Custom Brand',
        showCta: false,
      },
    });

    expect(instance.id).toBe('custom-header-1');
    expect(instance.props.logoText).toBe('Custom Brand');
    expect(instance.props.showCta).toBe(false);
  });
});
