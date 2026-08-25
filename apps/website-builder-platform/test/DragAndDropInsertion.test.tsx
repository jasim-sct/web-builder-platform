import React from 'react';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../src/App';

function fireDragOver(element: Element, clientY: number) {
  const event = createEvent.dragOver(element);
  Object.defineProperty(event, 'clientY', { value: clientY, writable: true });
  Object.defineProperty(event, 'dataTransfer', {
    value: { dropEffect: 'none', getData: () => '' },
  });
  fireEvent(element, event);
}

function fireDrop(element: Element, clientY: number, data: Record<string, string>) {
  const event = createEvent.drop(element);
  Object.defineProperty(event, 'clientY', { value: clientY, writable: true });
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      getData: (format: string) => data[format] || '',
      setData: () => {},
      dropEffect: 'copy',
    },
  });
  fireEvent(element, event);
}

describe('Drag and Drop Insertion on Canvas', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList?.contains('ws-dnd-section-wrapper')) {
        const index = parseInt(this.getAttribute('data-section-index') || '0', 10);
        return {
          top: 100 + index * 200,
          bottom: 100 + (index + 1) * 200,
          height: 200,
          left: 0,
          right: 1000,
          width: 1000,
          x: 0,
          y: 100 + index * 200,
          toJSON: () => {},
        };
      }
      return {
        top: 0,
        bottom: 1000,
        height: 1000,
        left: 0,
        right: 1000,
        width: 1000,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
    });
  });

  it('should render empty canvas and accept drop on empty state', () => {
    render(<App />);

    const emptyCanvas = screen.getByText('Your Page is Empty').closest('.ws-empty-canvas-state')!;
    expect(emptyCanvas).toBeInTheDocument();

    // Drag over empty state
    fireDragOver(emptyCanvas, 200);
    expect(emptyCanvas).toHaveClass('is-drag-over');

    // Drop new section onto empty canvas
    fireDrop(emptyCanvas, 200, {
      'application/json': JSON.stringify({ componentId: 'header' }),
    });

    expect(screen.getByText('1 Section')).toBeInTheDocument();
  });

  it('should dynamically calculate insertion position before and after when dragging over section', () => {
    render(<App />);

    // Add initial section (Hero)
    const addHeroBtn = screen.getAllByText('Add Hero Section')[0]!;
    fireEvent.click(addHeroBtn);

    const sectionWrapper = document.querySelector('.ws-dnd-section-wrapper')!;
    expect(sectionWrapper).toBeInTheDocument();

    // Section 0 has top: 100, height: 200 -> midpoint = 200
    // 1. Drag over upper half (clientY = 140 < 200) -> should activate drop indicator at index 0 (before)
    fireDragOver(sectionWrapper, 140);

    const dropIndicatorsUpper = document.querySelectorAll('.ws-drop-indicator-zone');
    expect(dropIndicatorsUpper[0]).toHaveClass('is-active');
    expect(dropIndicatorsUpper[1]).not.toHaveClass('is-active');

    // 2. Drag over lower half (clientY = 260 > 200) -> should activate drop indicator at index 1 (after)
    fireDragOver(sectionWrapper, 260);

    const dropIndicatorsLower = document.querySelectorAll('.ws-drop-indicator-zone');
    expect(dropIndicatorsLower[0]).not.toHaveClass('is-active');
    expect(dropIndicatorsLower[1]).toHaveClass('is-active');
  });

  it('should insert component before or after when dropped based on pointer position', () => {
    render(<App />);

    // Add first section (Hero)
    const addHeroBtn = screen.getAllByText('Add Hero Section')[0]!;
    fireEvent.click(addHeroBtn);

    const heroWrapper = document.querySelector('.ws-dnd-section-wrapper')!;

    // Drop Header in upper half (clientY = 120 < midpoint 200) -> Insert before Hero (at index 0)
    fireDrop(heroWrapper, 120, {
      'application/json': JSON.stringify({ componentId: 'header' }),
    });

    expect(screen.getByText('2 Sections')).toBeInTheDocument();

    let sectionNodes = document.querySelectorAll('.ws-dnd-section-wrapper');
    expect(sectionNodes).toHaveLength(2);
    // Header is before Hero
    expect(sectionNodes[0]).toHaveTextContent('Header Navigation');
    expect(sectionNodes[1]).toHaveTextContent('Hero Section');

    // Now drop Pricing on lower half of Hero (Section 1: top: 300, height: 200 -> midpoint = 400)
    // clientY = 450 > midpoint 400 -> Insert after Hero (at index 2)
    fireDrop(sectionNodes[1]!, 450, {
      'text/plain': 'pricing',
    });

    expect(screen.getByText('3 Sections')).toBeInTheDocument();
    sectionNodes = document.querySelectorAll('.ws-dnd-section-wrapper');
    expect(sectionNodes[0]).toHaveTextContent('Header Navigation');
    expect(sectionNodes[1]).toHaveTextContent('Hero Section');
    expect(sectionNodes[2]).toHaveTextContent('Pricing Table');
  });

  it('should reorder existing sections correctly when dragging upward and downward', () => {
    render(<App />);

    // Add Header from empty state
    fireEvent.click(screen.getAllByText('Add Header')[0]!);
    // Add Hero from catalog on the left
    fireEvent.click(screen.getByRole('button', { name: /Hero Section/i }));
    // Add Pricing from catalog on the left
    fireEvent.click(screen.getByRole('button', { name: /Pricing Table/i }));

    expect(screen.getByText('3 Sections')).toBeInTheDocument();
    let sectionNodes = document.querySelectorAll('.ws-dnd-section-wrapper');
    expect(sectionNodes[0]).toHaveTextContent('Header Navigation');
    expect(sectionNodes[1]).toHaveTextContent('Hero Section');
    expect(sectionNodes[2]).toHaveTextContent('Pricing Table');

    // Drag Pricing Table (index 2) to upper half of Header Navigation (index 0, midpoint = 200, clientY = 120)
    fireDrop(sectionNodes[0]!, 120, {
      'section-source-index': '2',
      'section-id': 'pricing-id',
    });

    sectionNodes = document.querySelectorAll('.ws-dnd-section-wrapper');
    // Pricing moved to top
    expect(sectionNodes[0]).toHaveTextContent('Pricing Table');
    expect(sectionNodes[1]).toHaveTextContent('Header Navigation');
    expect(sectionNodes[2]).toHaveTextContent('Hero Section');

    // Now drag Pricing Table (index 0) to lower half of Hero Section (now index 2, midpoint = 500 + 100 = 600, clientY = 650)
    fireDrop(sectionNodes[2]!, 650, {
      'section-source-index': '0',
      'section-id': 'pricing-id',
    });

    sectionNodes = document.querySelectorAll('.ws-dnd-section-wrapper');
    // Pricing moved back to bottom
    expect(sectionNodes[0]).toHaveTextContent('Header Navigation');
    expect(sectionNodes[1]).toHaveTextContent('Hero Section');
    expect(sectionNodes[2]).toHaveTextContent('Pricing Table');
  });
});
