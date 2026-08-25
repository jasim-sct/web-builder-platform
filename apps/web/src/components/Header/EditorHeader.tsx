import React from 'react';
import { Layers, Plus, RotateCcw, SlidersHorizontal, Sparkles, X } from 'lucide-react';

import { useEditor } from '../../state/editorContext';

export const EditorHeader: React.FC = () => {
  const {
    state,
    selectedSection,
    selectedSectionItem,
    selectSection,
    toggleComponentPanel,
    togglePropertyPanel,
    resetPage,
    addSection,
  } = useEditor();

  const handleReset = () => {
    if (state.page.sections.length === 0) return;
    if (window.confirm('Are you sure you want to clear all sections from the canvas?')) {
      resetPage();
    }
  };

  return (
    <header className="ws-editor-header">
      <div className="ws-header-left">
        <div className="ws-brand">
          <div className="ws-brand-icon">
            <Sparkles size={16} />
          </div>
          <span>Web Builder Studio</span>
        </div>

        <div className="ws-header-divider" />

        <div className="ws-page-info">
          <input
            type="text"
            className="ws-page-title-input"
            value={state.page.name}
            readOnly
            title="Page Name"
          />
          <span className="ws-section-count-badge">
            {state.page.sections.length} {state.page.sections.length === 1 ? 'Section' : 'Sections'}
          </span>
        </div>
      </div>

      <div className="ws-header-center">
        {selectedSection ? (
          <div className="ws-context-pill">
            <div className="ws-context-indicator" />
            <span>Editing:</span>
            <strong>{selectedSectionItem?.displayName || selectedSection.componentId}</strong>
            <button
              type="button"
              className="ws-btn-base ws-btn-ghost ws-btn-icon-only"
              onClick={() => selectSection(null)}
              title="Deselect Section"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="ws-context-pill">
            <Layers size={13} />
            <span>Page Overview (Select a section to edit)</span>
          </div>
        )}
      </div>

      <div className="ws-header-right">
        <button
          type="button"
          className={`ws-btn-base ws-btn-components-toggle ${
            state.isComponentPanelOpen ? 'ws-btn-primary' : 'ws-btn-secondary'
          }`}
          onClick={toggleComponentPanel}
          title="Toggle Components Palette"
        >
          <Plus size={14} />
          <span>Components</span>
        </button>

        {state.page.sections.length === 0 && (
          <button
            type="button"
            className="ws-btn-base ws-btn-secondary"
            onClick={() => addSection('hero')}
            title="Quick add Hero section"
          >
            <Sparkles size={13} />
            <span>Add Hero</span>
          </button>
        )}

        <div className="ws-header-divider" />

        <button
          type="button"
          className="ws-btn-base ws-btn-secondary ws-btn-icon-only"
          onClick={handleReset}
          title="Clear Canvas"
          disabled={state.page.sections.length === 0}
        >
          <RotateCcw size={14} />
        </button>

        <button
          type="button"
          className={`ws-btn-base ${
            state.isPropertyPanelOpen ? 'ws-btn-primary' : 'ws-btn-secondary'
          }`}
          onClick={togglePropertyPanel}
          title="Toggle Properties Panel"
        >
          <SlidersHorizontal size={14} />
          <span>Inspector</span>
        </button>
      </div>
    </header>
  );
};
