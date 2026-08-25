import React from 'react';
import { Layers, Search } from 'lucide-react';

import { useEditor } from '../../state/editorContext';
import { CompList } from './CompList';

export const ComponentPanel: React.FC = () => {
  const { state, setSearchQuery } = useEditor();

  return (
    <aside className="ws-dnd-component-panel">
      <div className="ws-panel-header">
        <div className="ws-panel-title-row">
          <div className="ws-panel-title">
            <Layers size={16} />
            <span>Section Library</span>
          </div>
          <span className="ws-panel-count">9 Available</span>
        </div>

        <div className="ws-dnd-search-wrap">
          <Search size={15} className="ws-search-icon" />
          <input
            type="text"
            className="ws-dnd-search-input"
            placeholder="Search sections (hero, features...)"
            value={state.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <CompList />
    </aside>
  );
};
