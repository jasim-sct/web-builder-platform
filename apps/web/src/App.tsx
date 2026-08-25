import React from 'react';

import { EditorCanvas } from './components/Canvas/EditorCanvas';
import { ComponentPanel } from './components/ComponentPanel/ComponentPanel';
import { EditorHeader } from './components/Header/EditorHeader';
import { PropertyPanel } from './components/PropertyPanel/PropertyPanel';
import { EditorProvider } from './state/editorContext';

export const AppContent: React.FC = () => {
  return (
    <div className="ws-editor-root">
      <EditorHeader />
      <div className="ws-editor-main-body">
        <ComponentPanel />
        <EditorCanvas />
        <PropertyPanel />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <EditorProvider>
      <AppContent />
    </EditorProvider>
  );
};

export default App;
