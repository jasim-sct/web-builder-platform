import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '../src/App';

describe('EditorPanel Integration', () => {
  it('should render the editor layout with Header, floating ComponentPanel, and Canvas', () => {
    render(<App />);

    expect(screen.getByText('Website Builder Platform')).toBeInTheDocument();
    expect(screen.getByLabelText('Component Library Palette')).toBeInTheDocument();
    expect(screen.getByText('Your Page is Empty')).toBeInTheDocument();
    expect(screen.getByText('Select a Section')).toBeInTheDocument();
  });

  it('should toggle open/close the floating components palette via toolbar and close button', () => {
    render(<App />);

    // Initially open
    expect(screen.getByLabelText('Component Library Palette')).toBeInTheDocument();

    // Click close button on palette
    const closeBtn = screen.getByTitle('Close Components Palette');
    fireEvent.click(closeBtn);

    // Should be closed and floating trigger should appear on canvas
    expect(screen.queryByLabelText('Component Library Palette')).not.toBeInTheDocument();
    expect(screen.getByTitle('Open Components Palette')).toBeInTheDocument();

    // Click Toolbar "Toggle Components Palette" button to reopen
    const toggleBtn = screen.getByTitle('Toggle Components Palette');
    fireEvent.click(toggleBtn);

    expect(screen.getByLabelText('Component Library Palette')).toBeInTheDocument();
  });

  it('should toggle minimize state on the floating components palette', () => {
    render(<App />);

    const minimizeBtn = screen.getByTitle('Minimize Palette');
    fireEvent.click(minimizeBtn);

    // Search bar should be hidden when minimized
    expect(screen.queryByPlaceholderText(/Search sections/i)).not.toBeInTheDocument();

    const expandBtn = screen.getByTitle('Expand Palette');
    fireEvent.click(expandBtn);

    // Search bar should be back
    expect(screen.getByPlaceholderText(/Search sections/i)).toBeInTheDocument();
  });

  it('should add a section when clicking on quick add or component catalog item', () => {
    render(<App />);

    // Click first Add Hero Section button
    const addHeroBtns = screen.getAllByText('Add Hero');
    fireEvent.click(addHeroBtns[0]!);

    // Verify section is added and properties panel opens
    expect(screen.getByText('1 Section')).toBeInTheDocument();
    expect(screen.getAllByText('Hero Section').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTitle('Deselect Section')).toBeInTheDocument();
  });

  it('should filter components in the catalog via search input', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search sections/i);
    fireEvent.change(searchInput, { target: { value: 'pricing' } });

    expect(screen.getByText('Pricing Table')).toBeInTheDocument();
  });
});
