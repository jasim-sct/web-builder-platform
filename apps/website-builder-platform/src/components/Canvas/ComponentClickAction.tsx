import React from 'react';
import { ArrowDown, ArrowUp, Copy, Sliders, Trash2 } from 'lucide-react';

import { useToast } from '../../design-system';
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
  const { addToast } = useToast();

  const handleDuplicate = () => {
    duplicateSection(sectionId);
    addToast({
      title: 'Section Duplicated',
      message: 'Created a duplicate of this section.',
      type: 'info',
    });
  };

  const handleRemove = () => {
    removeSection(sectionId);
    addToast({
      title: 'Section Deleted',
      message: 'Section removed from canvas.',
      type: 'warning',
    });
  };

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
        onClick={handleDuplicate}
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
        onClick={handleRemove}
        title="Delete Section"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
