import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '../src/App';

describe('EditorPanel Integration', () => {
  it('should render the editor layout with Header, ComponentPanel, and Canvas', () => {
    render(<App />);

    expect(screen.getByText('Web Builder Studio')).toBeInTheDocument();
    expect(screen.getByText('Section Library')).toBeInTheDocument();
    expect(screen.getByText('Your Page is Empty')).toBeInTheDocument();
    expect(screen.getByText('Select a Section')).toBeInTheDocument();
  });

  it('should add a section when clicking on quick add or component catalog item', () => {
    render(<App />);

    // Click first Add Hero Section button
    const addHeroBtns = screen.getAllByText('Add Hero Section');
    fireEvent.click(addHeroBtns[0]!);

    // Verify section is added and properties panel opens
    expect(screen.getByText('1 Section')).toBeInTheDocument();
    expect(screen.getByText('Editing:')).toBeInTheDocument();
  });

  it('should filter components in the catalog via search input', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search sections/i);
    fireEvent.change(searchInput, { target: { value: 'pricing' } });

    expect(screen.getByText('Pricing Table')).toBeInTheDocument();
  });
});
