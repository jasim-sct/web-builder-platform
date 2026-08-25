import React from 'react';

import { EditorCanvas } from './components/Canvas/EditorCanvas';
import { ComponentPanel } from './components/ComponentPanel/ComponentPanel';
import { EditorHeader } from './components/Header/EditorHeader';
import { PropertyPanel } from './components/PropertyPanel/PropertyPanel';
import { PlatformShell, ToastProvider } from './design-system';
import { EditorProvider } from './state/editorContext';

export const AppContent: React.FC = () => {
  return (
    <PlatformShell header={<EditorHeader />}>
      <ComponentPanel />
      <EditorCanvas />
      <PropertyPanel />
    </PlatformShell>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <EditorProvider>
        <AppContent />
      </EditorProvider>
    </ToastProvider>
  );
};

export default App;
