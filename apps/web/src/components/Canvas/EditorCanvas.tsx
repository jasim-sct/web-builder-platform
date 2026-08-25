import React, { useRef } from 'react';

import { useEditor } from '../../state/editorContext';
import { calculateCanvasInsertionIndex, executeDrop, extractDropData } from './dndHelpers';
import { DropIndicator } from './DropIndicator';
import { EditorSectionWrapper } from './EditorSectionWrapper';
import { EmptyCanvasState } from './EmptyCanvasState';

export const EditorCanvas: React.FC = () => {
  const {
    state,
    selectSection,
    addSection,
    reorderSections,
    setActiveDropIndex,
    toggleComponentPanel,
  } = useEditor();
  const { sections } = state.page;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    if (sections.length === 0) {
      if (state.activeDropIndex !== 0) {
        setActiveDropIndex(0);
      }
      return;
    }

    if (containerRef.current) {
      const targetIndex = calculateCanvasInsertionIndex(e.clientY, containerRef.current);
      if (state.activeDropIndex !== targetIndex) {
        setActiveDropIndex(targetIndex);
      }
    }
  };

  const handleCanvasDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    // Only reset activeDropIndex if pointer has left the canvas area bounds
    if (
      clientX <= rect.left ||
      clientX >= rect.right ||
      clientY <= rect.top ||
      clientY >= rect.bottom
    ) {
      setActiveDropIndex(null);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    let targetIndex = 0;
    if (sections.length > 0 && containerRef.current) {
      targetIndex = calculateCanvasInsertionIndex(e.clientY, containerRef.current);
    }

    try {
      const payload = extractDropData(e.dataTransfer);
      executeDrop(payload, targetIndex, {
        addSection,
        reorderSections,
        setActiveDropIndex,
      });
    } catch (err) {
      console.error('Error handling drop on EditorCanvas:', err);
      setActiveDropIndex(null);
    }
  };

  return (
    <main
      className="ws-dnd-canvas-area"
      onClick={() => selectSection(null)}
      onDragOver={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
    >
      <div
        ref={containerRef}
        className="ws-canvas-container"
        onClick={(e) => {
          // Prevent deselection if clicking on canvas container background
          if (e.target === e.currentTarget) {
            selectSection(null);
          }
        }}
      >
        {sections.length === 0 ? (
          <EmptyCanvasState />
        ) : (
          <>
            {/* Top insertion zone */}
            <DropIndicator index={0} />

            {sections.map((section, index) => (
              <React.Fragment key={section.id}>
                <EditorSectionWrapper
                  section={section}
                  index={index}
                  totalSections={sections.length}
                />
                {/* Inter-section / Bottom insertion zone */}
                <DropIndicator index={index + 1} />
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {!state.isComponentPanelOpen && (
        <button
          type="button"
          className="ws-canvas-floating-trigger"
          onClick={(e) => {
            e.stopPropagation();
            toggleComponentPanel();
          }}
          title="Open Components Palette"
        >
          <div className="ws-trigger-icon-circle">
            <span className="ws-plus-sign">+</span>
          </div>
          <span>Components</span>
        </button>
      )}
    </main>
  );
};
