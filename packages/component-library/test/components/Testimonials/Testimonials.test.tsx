import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Testimonials } from '../../../lib/components/Testimonials';

describe('Testimonials Section Component', () => {
  it('renders customer testimonials with authors and roles', () => {
    render(<Testimonials />);

    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getByText('VP of Engineering at CloudScale')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
  });
});
