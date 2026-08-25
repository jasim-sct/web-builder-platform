import React from 'react';

import { useEditor } from '../../state/editorContext';
import { executeDrop, extractDropData } from './dndHelpers';

interface DropIndicatorProps {
  index: number;
}

export const DropIndicator: React.FC<DropIndicatorProps> = ({ index }) => {
  const { state, addSection, reorderSections, setActiveDropIndex } = useEditor();
  const isActive = state.activeDropIndex === index;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (state.activeDropIndex !== index) {
      setActiveDropIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const payload = extractDropData(e.dataTransfer);
      executeDrop(payload, index, {
        addSection,
        reorderSections,
        setActiveDropIndex,
      });
    } catch (err) {
      console.error('Error handling drop on DropIndicator:', err);
      setActiveDropIndex(null);
    }
  };

  return (
    <div
      data-testid={`drop-indicator-${index}`}
      className={`ws-drop-indicator-zone ${isActive ? 'is-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="ws-drop-line" />
    </div>
  );
};
