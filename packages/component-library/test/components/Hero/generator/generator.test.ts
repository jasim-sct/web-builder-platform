import { describe, expect, it } from 'vitest';

import { generateHeroInstance } from '../../../../lib/components/Hero';

describe('Hero Instance Generator', () => {
  it('generates a valid serializable hero instance', () => {
    const instance = generateHeroInstance();

    expect(instance.componentId).toBe('hero');
    expect(instance.props.title).toBeDefined();
    expect(instance.props.variant).toBe('split');
    expect(instance.actions?.primaryButtonAction).toBeDefined();
  });
});
