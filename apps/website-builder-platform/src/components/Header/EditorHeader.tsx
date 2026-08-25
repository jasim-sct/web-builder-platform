import React, { useState } from 'react';
import { Code, Layers, Plus, RotateCcw, Settings, SlidersHorizontal, Sparkles } from 'lucide-react';

import {
  Badge,
  Button,
  ConfirmDialog,
  ContextPill,
  Divider,
  ExportCodeModal,
  IconButton,
  ProjectSettingsModal,
  useToast,
} from '../../design-system';
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
    setPageName,
  } = useEditor();

  const { addToast } = useToast();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleReset = () => {
    if (state.page.sections.length === 0) return;
    setIsResetConfirmOpen(true);
  };

  const confirmReset = () => {
    resetPage();
    setIsResetConfirmOpen(false);
    addToast({
      title: 'Canvas Cleared',
      message: 'All sections have been removed from the canvas.',
      type: 'info',
    });
  };

  const handleQuickAddHero = () => {
    addSection('hero');
    addToast({
      title: 'Section Added',
      message: 'Added Hero Section to canvas.',
      type: 'success',
    });
  };

  return (
    <>
      <header className="ds-header ws-editor-header">
        <div className="ws-header-left">
          <div className="ws-brand">
            <div className="ws-brand-icon">
              <Sparkles size={14} />
            </div>
            <span>Builder</span>
          </div>

          <Divider vertical />

          <Button
            variant={state.isComponentPanelOpen ? 'primary' : 'secondary'}
            size="sm"
            icon={<Plus size={13} />}
            onClick={toggleComponentPanel}
            title="Toggle Components Palette"
          >
            Add Component
          </Button>

          {state.page.sections.length === 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Sparkles size={12} />}
              onClick={handleQuickAddHero}
              title="Quick add Hero section"
            >
              Add Hero
            </Button>
          )}
        </div>

        <div className="ws-header-center">
          <div className="ws-page-info">
            <input
              type="text"
              className="ds-input ds-input--sm ws-page-title-input"
              value={state.page.name}
              readOnly
              title="Page Name (Click settings to edit)"
              onClick={() => setIsSettingsOpen(true)}
              style={{ cursor: 'pointer' }}
            />
            <Badge variant="default" className="ws-section-count-badge">
              {state.page.sections.length} Sections
            </Badge>

            <IconButton
              icon={<Settings size={13} />}
              title="Page Settings"
              size="xs"
              variant="ghost"
              onClick={() => setIsSettingsOpen(true)}
            />
          </div>

          <Divider vertical />

          {selectedSection ? (
            <ContextPill
              label="Editing:"
              name={selectedSectionItem?.displayName || selectedSection.componentId}
              onDeselect={() => selectSection(null)}
            />
          ) : (
            <ContextPill icon={<Layers size={12} />} label="No selection" />
          )}
        </div>

        <div className="ws-header-right">
          <Button
            variant="ghost"
            size="sm"
            icon={<Code size={13} />}
            onClick={() => setIsExportOpen(true)}
            title="Export page JSON schema or code"
          >
            Export
          </Button>

          <IconButton
            icon={<RotateCcw size={13} />}
            title="Clear Canvas"
            variant="ghost"
            size="sm"
            disabled={state.page.sections.length === 0}
            onClick={handleReset}
          />

          <Divider vertical />

          <Button
            variant={state.isPropertyPanelOpen ? 'primary' : 'secondary'}
            size="sm"
            icon={<SlidersHorizontal size={13} />}
            onClick={togglePropertyPanel}
            title="Toggle Properties Panel"
          >
            Inspector
          </Button>
        </div>
      </header>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={confirmReset}
        title="Clear Canvas"
        message="Are you sure you want to clear all sections from the canvas? This action cannot be undone."
        confirmLabel="Clear All"
        variant="danger"
      />

      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        pageName={state.page.name}
        onSave={(newName) => {
          setPageName(newName);
          addToast({
            title: 'Settings Saved',
            message: `Page name updated to "${newName}".`,
            type: 'success',
          });
        }}
      />

      <ExportCodeModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        pageData={state.page}
      />
    </>
  );
};
