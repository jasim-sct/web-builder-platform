import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Features } from '../../../lib/components/Features';

describe('Features Section Component', () => {
  it('renders features grid with items and badges', () => {
    render(<Features />);

    expect(screen.getByText('Powerful Capabilities')).toBeInTheDocument();
    expect(screen.getByText('Ultra-Fast Performance')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Security')).toBeInTheDocument();
  });

  it('triggers featureClickAction when a feature card is clicked', () => {
    const handleAction = vi.fn();
    render(<Features onAction={handleAction} />);

    const card = screen.getByText('Ultra-Fast Performance');
    fireEvent.click(card);

    expect(handleAction).toHaveBeenCalledWith(
      'featureClickAction',
      expect.objectContaining({
        type: 'navigate',
        payload: expect.objectContaining({ title: 'Ultra-Fast Performance' }),
      }),
    );
  });
});
