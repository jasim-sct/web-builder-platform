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
                : 'Inspector'}
            </div>
            {selectedSection && (
              <div className="ws-property-subtitle">
                {selectedSectionItem?.category || 'Custom'}
              </div>
            )}
          </div>

          <div className="ws-header-actions">
            <IconButton
              icon={state.isPropsExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              title={state.isPropsExpanded ? 'Collapse Width' : 'Expand Width'}
              onClick={togglePropsExpand}
              size="xs"
            />

            <IconButton
              icon={<ArrowLeftRight size={13} />}
              title={`Move panel to ${state.propertyPanelPosition === 'right' ? 'left' : 'right'}`}
              onClick={togglePropertyPanelPosition}
              size="xs"
            />

            {selectedSection && (
              <IconButton
                icon={<X size={13} />}
                title="Close Inspector"
                onClick={() => selectSection(null)}
                size="xs"
              />
            )}
          </div>
        </div>

        {selectedSection && (
          <Tabs
            activeTab={state.activePropertyTab}
            onChange={(tab) => setActivePropertyTab(tab as 'props' | 'style' | 'actions')}
            tabs={[
              { id: 'props', label: 'Props', icon: <FileText size={12} /> },
              { id: 'style', label: 'Style', icon: <Sliders size={12} /> },
              { id: 'actions', label: 'Actions', icon: <MousePointerClick size={12} /> },
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
