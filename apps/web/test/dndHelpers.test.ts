import { describe, expect, it, vi } from 'vitest';

import {
  calculateCanvasInsertionIndex,
  calculateSectionInsertionIndex,
  executeDrop,
  extractDropData,
} from '../src/components/Canvas/dndHelpers';

describe('dndHelpers', () => {
  describe('calculateSectionInsertionIndex', () => {
    it('should return sectionIndex when pointer is in the upper half (insert before)', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          bottom: 300,
          height: 200,
          left: 0,
          right: 800,
          width: 800,
          x: 0,
          y: 100,
          toJSON: () => {},
        }),
      } as HTMLElement;

      // Midpoint is 100 + 200/2 = 200
      // Pointer at 150 (upper half)
      const index = calculateSectionInsertionIndex(150, mockElement, 2);
      expect(index).toBe(2);
    });

    it('should return sectionIndex + 1 when pointer is in the lower half (insert after)', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          bottom: 300,
          height: 200,
          left: 0,
          right: 800,
          width: 800,
          x: 0,
          y: 100,
          toJSON: () => {},
        }),
      } as HTMLElement;

      // Midpoint is 200
      // Pointer at 250 (lower half)
      const index = calculateSectionInsertionIndex(250, mockElement, 2);
      expect(index).toBe(3);

      // Pointer exactly at 200 (midpoint)
      const exactMidIndex = calculateSectionInsertionIndex(200, mockElement, 2);
      expect(exactMidIndex).toBe(3);
    });
  });

  describe('calculateCanvasInsertionIndex', () => {
    it('should return 0 for an empty container', () => {
      const mockContainer = {
        querySelectorAll: () => [] as unknown as NodeListOf<HTMLElement>,
      } as HTMLElement;

      const index = calculateCanvasInsertionIndex(150, mockContainer);
      expect(index).toBe(0);
    });

    it('should calculate correct insertion index across multiple sections', () => {
      const mockSec0 = {
        getBoundingClientRect: () => ({
          top: 100,
          height: 100,
          bottom: 200,
          left: 0,
          right: 800,
          width: 800,
          x: 0,
          y: 100,
          toJSON: () => {},
        }),
      } as HTMLElement; // Midpoint = 150

      const mockSec1 = {
        getBoundingClientRect: () => ({
          top: 200,
          height: 100,
          bottom: 300,
          left: 0,
          right: 800,
          width: 800,
          x: 0,
          y: 200,
          toJSON: () => {},
        }),
      } as HTMLElement; // Midpoint = 250

      const mockSec2 = {
        getBoundingClientRect: () => ({
          top: 300,
          height: 100,
          bottom: 400,
          left: 0,
          right: 800,
          width: 800,
          x: 0,
          y: 300,
          toJSON: () => {},
        }),
      } as HTMLElement; // Midpoint = 350

      const mockContainer = {
        querySelectorAll: () =>
          [mockSec0, mockSec1, mockSec2] as unknown as NodeListOf<HTMLElement>,
      } as HTMLElement;

      // Above all sections
      expect(calculateCanvasInsertionIndex(50, mockContainer)).toBe(0);
      // Upper half of sec0 (midpoint 150)
      expect(calculateCanvasInsertionIndex(120, mockContainer)).toBe(0);
      // Lower half of sec0
      expect(calculateCanvasInsertionIndex(180, mockContainer)).toBe(1);
      // Upper half of sec1 (midpoint 250)
      expect(calculateCanvasInsertionIndex(220, mockContainer)).toBe(1);
      // Lower half of sec1
      expect(calculateCanvasInsertionIndex(280, mockContainer)).toBe(2);
      // Upper half of sec2 (midpoint 350)
      expect(calculateCanvasInsertionIndex(320, mockContainer)).toBe(2);
      // Lower half of sec2
      expect(calculateCanvasInsertionIndex(380, mockContainer)).toBe(3);
      // Below all sections
      expect(calculateCanvasInsertionIndex(500, mockContainer)).toBe(3);
    });
  });

  describe('extractDropData', () => {
    it('should return null when dataTransfer is null or empty', () => {
      expect(extractDropData(null)).toBeNull();

      const emptyDataTransfer = {
        getData: () => '',
      } as unknown as DataTransfer;
      expect(extractDropData(emptyDataTransfer)).toBeNull();
    });

    it('should extract reorder payload when section-source-index is present', () => {
      const dataTransfer = {
        getData: (format: string) => {
          if (format === 'section-source-index') return '1';
          if (format === 'section-id') return 'hero-123';
          return '';
        },
      } as unknown as DataTransfer;

      const result = extractDropData(dataTransfer);
      expect(result).toEqual({
        type: 'reorder',
        sourceIndex: 1,
        sectionId: 'hero-123',
      });
    });

    it('should extract new section payload from application/json', () => {
      const dataTransfer = {
        getData: (format: string) => {
          if (format === 'application/json') {
            return JSON.stringify({ componentId: 'pricing', displayName: 'Pricing' });
          }
          return '';
        },
      } as unknown as DataTransfer;

      const result = extractDropData(dataTransfer);
      expect(result).toEqual({
        type: 'new',
        componentId: 'pricing',
      });
    });

    it('should extract new section payload from plain text', () => {
      const dataTransfer = {
        getData: (format: string) => {
          if (format === 'text/plain') return 'features';
          return '';
        },
      } as unknown as DataTransfer;

      const result = extractDropData(dataTransfer);
      expect(result).toEqual({
        type: 'new',
        componentId: 'features',
      });
    });
  });

  describe('executeDrop', () => {
    it('should handle adding new components at targetIndex', () => {
      const addSection = vi.fn();
      const reorderSections = vi.fn();
      const setActiveDropIndex = vi.fn();

      executeDrop({ type: 'new', componentId: 'hero' }, 2, {
        addSection,
        reorderSections,
        setActiveDropIndex,
      });

      expect(setActiveDropIndex).toHaveBeenCalledWith(null);
      expect(addSection).toHaveBeenCalledWith('hero', 2);
      expect(reorderSections).not.toHaveBeenCalled();
    });

    it('should handle reordering upward correctly', () => {
      const addSection = vi.fn();
      const reorderSections = vi.fn();
      const setActiveDropIndex = vi.fn();

      // Drag section from index 2 to before index 0 (targetIndex = 0)
      executeDrop({ type: 'reorder', sourceIndex: 2 }, 0, {
        addSection,
        reorderSections,
        setActiveDropIndex,
      });

      expect(setActiveDropIndex).toHaveBeenCalledWith(null);
      expect(reorderSections).toHaveBeenCalledWith(2, 0);
    });

    it('should handle reordering downward correctly', () => {
      const addSection = vi.fn();
      const reorderSections = vi.fn();
      const setActiveDropIndex = vi.fn();

      // Drag section from index 0 to after index 2 (targetIndex = 3)
      executeDrop({ type: 'reorder', sourceIndex: 0 }, 3, {
        addSection,
        reorderSections,
        setActiveDropIndex,
      });

      expect(setActiveDropIndex).toHaveBeenCalledWith(null);
      // destIndex should be adjusted to targetIndex - 1 = 2
      expect(reorderSections).toHaveBeenCalledWith(0, 2);
    });

    it('should no-op when reordering immediately before or after itself', () => {
      const addSection = vi.fn();
      const reorderSections = vi.fn();
      const setActiveDropIndex = vi.fn();

      // Dragging item 1 to targetIndex 1 (before itself)
      executeDrop({ type: 'reorder', sourceIndex: 1 }, 1, {
        addSection,
        reorderSections,
        setActiveDropIndex,
      });
      expect(reorderSections).not.toHaveBeenCalled();

      // Dragging item 1 to targetIndex 2 (after itself)
      executeDrop({ type: 'reorder', sourceIndex: 1 }, 2, {
        addSection,
        reorderSections,
        setActiveDropIndex,
      });
      expect(reorderSections).not.toHaveBeenCalled();
    });
  });
});
