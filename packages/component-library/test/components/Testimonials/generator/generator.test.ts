import { describe, expect, it } from 'vitest';

import { generateTestimonialsInstance } from '../../../../lib/components/Testimonials';

describe('Testimonials Instance Generator', () => {
  it('generates a valid serializable testimonials instance', () => {
    const instance = generateTestimonialsInstance();

    expect(instance.componentId).toBe('testimonials');
    expect(instance.props.items.length).toBe(3);
  });
});
