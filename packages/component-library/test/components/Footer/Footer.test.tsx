import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from '../../../lib/components/Footer';

describe('Footer Section Component', () => {
  it('renders footer brand, link groups, and copyright', () => {
    render(<Footer />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('© 2026 Acme Corp. All rights reserved.')).toBeInTheDocument();
  });
});
