import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Pricing } from '../../../lib/components/Pricing';

describe('Pricing Section Component', () => {
  it('renders all pricing tiers and features', () => {
    render(<Pricing />);

    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('toggles billing frequency between Monthly and Annual prices', () => {
    render(<Pricing />);

    // Default monthly price for starter is 29
    expect(screen.getByText('29')).toBeInTheDocument();

    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    // Annual price for starter becomes 24
    expect(screen.getByText('24')).toBeInTheDocument();
  });

  it('triggers planSelectAction when a plan CTA is clicked', () => {
    const handleAction = vi.fn();
    render(<Pricing onAction={handleAction} />);

    const proBtn = screen.getByRole('button', {
      name: /start pro trial/i,
    });
    fireEvent.click(proBtn);

    expect(handleAction).toHaveBeenCalledWith(
      'planSelectAction',
      expect.objectContaining({
        type: 'navigate',
        payload: expect.objectContaining({
          planId: 'pro',
          planName: 'Professional',
        }),
      }),
    );
  });
});
