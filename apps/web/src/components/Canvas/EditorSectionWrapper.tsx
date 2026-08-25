import React, { useMemo } from 'react';

import { getSection, renderSectionInstance } from '@repo/component-library';

import { useEditor } from '../../state/editorContext';
import { getComponentIcon } from '../ComponentPanel/DraggableComponentCard';
import { ComponentClickAction } from './ComponentClickAction';
import { calculateSectionInsertionIndex, executeDrop, extractDropData } from './dndHelpers';

import type { SectionInstance } from '@repo/component-library';

interface EditorSectionWrapperProps {
  section: SectionInstance;
  index: number;
  totalSections: number;
}

export const EditorSectionWrapper: React.FC<EditorSectionWrapperProps> = ({
  section,
  index,
  totalSections,
}) => {
  const { state, selectSection, hoverSection, addSection, reorderSections, setActiveDropIndex } =
    useEditor();

  const isSelected = state.selectedSectionId === section.id;

  const sectionMetadata = useMemo(() => {
    return getSection(section.componentId);
  }, [section.componentId]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('section-source-index', index.toString());
    e.dataTransfer.setData('section-id', section.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setActiveDropIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';

    const targetIndex = calculateSectionInsertionIndex(e.clientY, e.currentTarget, index);
    if (state.activeDropIndex !== targetIndex) {
      setActiveDropIndex(targetIndex);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const targetIndex = calculateSectionInsertionIndex(e.clientY, e.currentTarget, index);

    try {
      const payload = extractDropData(e.dataTransfer);
      executeDrop(payload, targetIndex, {
        addSection,
        reorderSections,
        setActiveDropIndex,
      });
    } catch (err) {
      console.error('Error handling drop on EditorSectionWrapper:', err);
      setActiveDropIndex(null);
    }
  };

  const renderedContent = useMemo(() => {
    return renderSectionInstance(section, {
      isEditor: true,
    });
  }, [section]);

  return (
    <div
      id={`section-node-${section.id}`}
      data-section-index={index}
      className={`ws-dnd-section-wrapper ${isSelected ? 'is-selected' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={(e) => {
        e.stopPropagation();
        selectSection(section.id);
      }}
      onMouseEnter={() => hoverSection(section.id)}
      onMouseLeave={() => hoverSection(null)}
    >
      {/* Section Hover / Selection Badge */}
      <div className="ws-section-hover-badge">
        {getComponentIcon(section.componentId, sectionMetadata?.category || '')}
        <span>{sectionMetadata?.displayName || section.componentId}</span>
      </div>

      {/* Floating Toolbar Controls */}
      <ComponentClickAction sectionId={section.id} index={index} totalSections={totalSections} />

      {/* Actual Section Component Rendered via Library */}
      <div className="ws-section-content">
        {renderedContent || (
          <div style={{ padding: '20px', color: '#ef4444' }}>
            Failed to render section: {section.componentId}
          </div>
        )}
      </div>
    </div>
  );
};
