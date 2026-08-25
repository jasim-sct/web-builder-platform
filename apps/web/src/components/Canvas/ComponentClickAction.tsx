import React from 'react';
import { ArrowDown, ArrowUp, Copy, Sliders, Trash2 } from 'lucide-react';

import { useEditor } from '../../state/editorContext';

interface ComponentClickActionProps {
  sectionId: string;
  index: number;
  totalSections: number;
}

export const ComponentClickAction: React.FC<ComponentClickActionProps> = ({
  sectionId,
  index,
  totalSections,
}) => {
  const { moveSection, duplicateSection, removeSection, selectSection } = useEditor();

  return (
    <div
      className="ws-section-floating-toolbar"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="ws-toolbar-btn"
        onClick={() => moveSection(sectionId, 'up')}
        disabled={index === 0}
        title="Move Section Up"
      >
        <ArrowUp size={14} />
      </button>

      <button
        type="button"
        className="ws-toolbar-btn"
        onClick={() => moveSection(sectionId, 'down')}
        disabled={index === totalSections - 1}
        title="Move Section Down"
      >
        <ArrowDown size={14} />
      </button>

      <div className="ws-toolbar-divider" />

      <button
        type="button"
        className="ws-toolbar-btn"
        onClick={() => duplicateSection(sectionId)}
        title="Duplicate Section"
      >
        <Copy size={14} />
      </button>

      <button
        type="button"
        className="ws-toolbar-btn"
        onClick={() => selectSection(sectionId, 'props')}
        title="Edit Properties"
      >
        <Sliders size={14} />
      </button>

      <div className="ws-toolbar-divider" />

      <button
        type="button"
        className="ws-toolbar-btn btn-delete"
        onClick={() => removeSection(sectionId)}
        title="Delete Section"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
