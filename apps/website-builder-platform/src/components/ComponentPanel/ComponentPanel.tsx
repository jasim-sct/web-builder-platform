import React from 'react';
import { Layers } from 'lucide-react';

import { Badge, FloatingWindow, SearchInput } from '../../design-system';
import { useEditor } from '../../state/editorContext';
import { CompList } from './CompList';

export const ComponentPanel: React.FC = () => {
  const {
    state,
    setSearchQuery,
    toggleComponentPanel,
    toggleComponentPanelMinimize,
    setComponentPanelPosition,
  } = useEditor();

  if (!state.isComponentPanelOpen) return null;

  return (
    <FloatingWindow
      isOpen={state.isComponentPanelOpen}
      isMinimized={state.isComponentPanelMinimized}
      onToggleMinimize={toggleComponentPanelMinimize}
      onClose={toggleComponentPanel}
      position={state.componentPanelPosition ?? { x: 16, y: 16 }}
      onPositionChange={setComponentPanelPosition}
      icon={<Layers size={15} />}
      title="Components"
      badge={
        <Badge variant="default" className="ws-palette-count-badge">
          9 Available
        </Badge>
      }
      ariaLabel="Component Library Palette"
    >
      <div className="ws-palette-search-container">
        <SearchInput
          placeholder="Search sections (hero, pricing...)"
          value={state.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />
      </div>

      <CompList />
    </FloatingWindow>
  );
};
