import React, { useState } from 'react';
import clsx from 'clsx';
import { Compass, CreditCard, LayoutGrid, Plus, Sparkles } from 'lucide-react';

import { Button, useToast } from '../../design-system';
import { useEditor } from '../../state/editorContext';
import { executeDrop, extractDropData } from './dndHelpers';

export const EmptyCanvasState: React.FC = () => {
  const { addSection, reorderSections, setActiveDropIndex } = useEditor();
  const { addToast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
    setActiveDropIndex(0);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setIsDragOver(false);
    setActiveDropIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const payload = extractDropData(e.dataTransfer);
      executeDrop(payload, 0, {
        addSection,
        reorderSections,
        setActiveDropIndex,
      });
      addToast({
        title: 'Section Added',
        message: 'Dropped new section onto canvas.',
        type: 'success',
      });
    } catch (err) {
      console.error('Error dropping on EmptyCanvasState:', err);
      setActiveDropIndex(null);
    }
  };

  const handleQuickAdd = (componentId: string, label: string) => {
    addSection(componentId);
    addToast({
      title: 'Section Added',
      message: `Added ${label} to canvas.`,
      type: 'success',
    });
  };

  return (
    <div
      className={clsx('ws-empty-canvas-state', isDragOver && 'is-drag-over')}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="ws-empty-icon-bubble">
        <LayoutGrid size={32} />
      </div>

      <h2 className="ws-empty-title">Your Page is Empty</h2>
      <p className="ws-empty-desc">
        Drag components from the tool palette or use quick actions below to start building your page
        layout.
      </p>

      <div className="ws-quick-add-grid">
        <Button
          variant="secondary"
          icon={<Compass size={14} />}
          onClick={() => handleQuickAdd('header', 'Header Section')}
        >
          Add Header
        </Button>

        <Button
          variant="primary"
          icon={<Sparkles size={14} />}
          onClick={() => handleQuickAdd('hero', 'Hero Section')}
        >
          Add Hero Section
        </Button>

        <Button
          variant="secondary"
          icon={<Plus size={14} />}
          onClick={() => handleQuickAdd('features', 'Features Section')}
        >
          Add Features
        </Button>

        <Button
          variant="secondary"
          icon={<CreditCard size={14} />}
          onClick={() => handleQuickAdd('pricing', 'Pricing Table')}
        >
          Add Pricing
        </Button>
      </div>
    </div>
  );
};
