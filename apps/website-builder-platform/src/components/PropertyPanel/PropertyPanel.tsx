import React from 'react';
import {
  ArrowLeftRight,
  FileText,
  Layers,
  Maximize2,
  Minimize2,
  MousePointerClick,
  Sliders,
  X,
} from 'lucide-react';

import { useEditor } from '../../state/editorContext';
import { ActionsTab } from './tabs/ActionsTab';
import { PropsTab } from './tabs/PropsTab';
import { StyleTab } from './tabs/StyleTab';

export const PropertyPanel: React.FC = () => {
  const {
    state,
    selectedSection,
    selectedSectionItem,
    selectedSectionSchema,
    setActivePropertyTab,
    togglePropertyPanelPosition,
    togglePropsExpand,
    selectSection,
  } = useEditor();

  if (!state.isPropertyPanelOpen) return null;

  return (
    <aside
      className={`ws-dnd-property-panel ${state.isPropsExpanded ? 'is-expanded' : ''} ${
        state.propertyPanelPosition === 'left' ? 'position-left' : ''
      }`}
    >
      <div className="ws-property-header">
        <div className="ws-property-header-top">
          <div className="ws-property-title-group">
            <div className="ws-property-title">
              {selectedSection
                ? selectedSectionItem?.displayName || selectedSection.componentId
                : 'Page Inspector'}
            </div>
            <div className="ws-property-subtitle">
              {selectedSection
                ? `Category: ${selectedSectionItem?.category || 'Custom'}`
                : 'No section selected'}
            </div>
          </div>

          <div className="ws-header-actions">
            <button
              type="button"
              className="ws-btn-base ws-btn-ghost ws-btn-icon-only"
              onClick={togglePropsExpand}
              title={state.isPropsExpanded ? 'Collapse Width' : 'Expand Width'}
            >
              {state.isPropsExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            <button
              type="button"
              className="ws-btn-base ws-btn-ghost ws-btn-icon-only"
              onClick={togglePropertyPanelPosition}
              title={`Move panel to ${state.propertyPanelPosition === 'right' ? 'left' : 'right'}`}
            >
              <ArrowLeftRight size={14} />
            </button>

            {selectedSection && (
              <button
                type="button"
                className="ws-btn-base ws-btn-ghost ws-btn-icon-only"
                onClick={() => selectSection(null)}
                title="Close Inspector"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {selectedSection && (
          <div className="ws-property-tabs-nav">
            <button
              type="button"
              className={`ws-property-tab-btn ${
                state.activePropertyTab === 'props' ? 'active' : ''
              }`}
              onClick={() => setActivePropertyTab('props')}
            >
              <FileText size={13} />
              Props
            </button>

            <button
              type="button"
              className={`ws-property-tab-btn ${
                state.activePropertyTab === 'style' ? 'active' : ''
              }`}
              onClick={() => setActivePropertyTab('style')}
            >
              <Sliders size={13} />
              Style
            </button>

            <button
              type="button"
              className={`ws-property-tab-btn ${
                state.activePropertyTab === 'actions' ? 'active' : ''
              }`}
              onClick={() => setActivePropertyTab('actions')}
            >
              <MousePointerClick size={13} />
              Actions
            </button>
          </div>
        )}
      </div>

      <div className="ws-property-body-scroll">
        {!selectedSection ? (
          <div className="ws-property-empty">
            <div className="ws-empty-icon">
              <Layers size={24} />
            </div>
            <div className="ws-empty-title">Select a Section</div>
            <div className="ws-empty-desc">
              Click on any section inside the canvas to edit its Props, Styles, and Action triggers.
            </div>
          </div>
        ) : (
          <>
            {state.activePropertyTab === 'props' && (
              <PropsTab section={selectedSection} schema={selectedSectionSchema} />
            )}

            {state.activePropertyTab === 'style' && <StyleTab section={selectedSection} />}

            {state.activePropertyTab === 'actions' && (
              <ActionsTab section={selectedSection} schema={selectedSectionSchema} />
            )}
          </>
        )}
      </div>
    </aside>
  );
};
