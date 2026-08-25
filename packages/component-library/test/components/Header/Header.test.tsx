import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header } from '../../../lib/components/Header';

describe('Header Section Component', () => {
  it('renders default logo and navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('triggers onAction callback when CTA button is clicked', () => {
    const handleAction = vi.fn();
    render(<Header onAction={handleAction} />);

    const ctaButton = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(ctaButton);

    expect(handleAction).toHaveBeenCalledWith('ctaAction', {
      type: 'navigate',
      url: '#get-started',
    });
  });

  it('toggles mobile menu drawer when hamburger button is clicked', () => {
    render(<Header />);
    const hamburger = screen.getByLabelText('Open Menu');
    expect(hamburger).toBeInTheDocument();

    fireEvent.click(hamburger);
    expect(screen.getByLabelText('Mobile Navigation')).toBeInTheDocument();
  });
});
