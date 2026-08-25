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

import { EmptyState, IconButton, Panel, PanelBody, PanelHeader, Tabs } from '../../design-system';
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
    <Panel
      isExpanded={state.isPropsExpanded}
      position={state.propertyPanelPosition}
      className="ws-dnd-property-panel"
    >
      <PanelHeader className="ws-property-header">
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
            <IconButton
              icon={state.isPropsExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              title={state.isPropsExpanded ? 'Collapse Width' : 'Expand Width'}
              onClick={togglePropsExpand}
              size="sm"
            />

            <IconButton
              icon={<ArrowLeftRight size={14} />}
              title={`Move panel to ${state.propertyPanelPosition === 'right' ? 'left' : 'right'}`}
              onClick={togglePropertyPanelPosition}
              size="sm"
            />

            {selectedSection && (
              <IconButton
                icon={<X size={14} />}
                title="Close Inspector"
                onClick={() => selectSection(null)}
                size="sm"
              />
            )}
          </div>
        </div>

        {selectedSection && (
          <Tabs
            activeTab={state.activePropertyTab}
            onChange={(tab) => setActivePropertyTab(tab as 'props' | 'style' | 'actions')}
            tabs={[
              { id: 'props', label: 'Props', icon: <FileText size={13} /> },
              { id: 'style', label: 'Style', icon: <Sliders size={13} /> },
              { id: 'actions', label: 'Actions', icon: <MousePointerClick size={13} /> },
            ]}
          />
        )}
      </PanelHeader>

      <PanelBody className="ws-property-body-scroll">
        {!selectedSection ? (
          <EmptyState
            icon={<Layers size={24} />}
            title="Select a Section"
            description="Click on any section inside the canvas to edit its Props, Styles, and Action triggers."
          />
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
      </PanelBody>
    </Panel>
  );
};
