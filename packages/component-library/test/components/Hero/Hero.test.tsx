import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Hero } from '../../../lib/components/Hero';

describe('Hero Section Component', () => {
  it('renders title, badge, description, and action buttons', () => {
    render(
      <Hero
        props={{
          title: 'Custom Hero Title',
          description: 'Custom description text',
          badge: 'New Feature',
        }}
      />,
    );

    expect(screen.getByText('Custom Hero Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
    expect(screen.getByText('New Feature')).toBeInTheDocument();
  });

  it('triggers primary and secondary actions', () => {
    const handleAction = vi.fn();
    render(<Hero onAction={handleAction} />);

    const primaryBtn = screen.getByRole('button', {
      name: /start free trial/i,
    });
    fireEvent.click(primaryBtn);

    expect(handleAction).toHaveBeenCalledWith('primaryButtonAction', {
      type: 'navigate',
      url: '#get-started',
    });
  });
});
