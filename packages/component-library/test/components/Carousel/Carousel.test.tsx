import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Carousel } from '../../../lib/components/Carousel';

describe('Carousel Section Component', () => {
  it('renders carousel with slides and controls', () => {
    render(<Carousel />);

    expect(screen.getByText('Modern Cloud Infrastructure')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next slide/i })).toBeInTheDocument();
  });

  it('cycles to next slide when next arrow is clicked', () => {
    const handleAction = vi.fn();
    render(<Carousel onAction={handleAction} />);

    const nextBtn = screen.getByRole('button', { name: /next slide/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Collaborative Real-Time Workspace')).toBeInTheDocument();
  });
});
