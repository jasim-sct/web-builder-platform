import { describe, expect, it } from 'vitest';

import { generateCarouselInstance } from '../../../../lib/components/Carousel';

describe('Carousel Instance Generator', () => {
  it('generates a valid serializable carousel instance', () => {
    const instance = generateCarouselInstance();

    expect(instance.componentId).toBe('carousel');
    expect(instance.props.items.length).toBeGreaterThan(0);
    expect(instance.props.autoplay).toBe(true);
  });
});
