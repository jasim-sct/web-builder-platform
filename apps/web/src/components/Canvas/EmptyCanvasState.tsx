import React, { useState } from 'react';
import { Compass, CreditCard, LayoutGrid, Plus, Sparkles } from 'lucide-react';

import { useEditor } from '../../state/editorContext';
import { executeDrop, extractDropData } from './dndHelpers';

export const EmptyCanvasState: React.FC = () => {
  const { addSection, reorderSections, setActiveDropIndex } = useEditor();
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
    } catch (err) {
      console.error('Error dropping on EmptyCanvasState:', err);
      setActiveDropIndex(null);
    }
  };

  return (
    <div
      className={`ws-empty-canvas-state ${isDragOver ? 'is-drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="ws-empty-icon-bubble">
        <LayoutGrid size={32} />
      </div>

      <h2 className="ws-empty-title">Your Page is Empty</h2>
      <p className="ws-empty-desc">
        Drag sections from the left library panel and drop them here to start building your website
        layout.
      </p>

      <div className="ws-quick-add-grid">
        <button
          type="button"
          className="ws-btn-base ws-btn-secondary"
          onClick={() => addSection('header')}
        >
          <Compass size={14} />
          Add Header
        </button>

        <button
          type="button"
          className="ws-btn-base ws-btn-primary"
          onClick={() => addSection('hero')}
        >
          <Sparkles size={14} />
          Add Hero Section
        </button>

        <button
          type="button"
          className="ws-btn-base ws-btn-secondary"
          onClick={() => addSection('features')}
        >
          <Plus size={14} />
          Add Features
        </button>

        <button
          type="button"
          className="ws-btn-base ws-btn-secondary"
          onClick={() => addSection('pricing')}
        >
          <CreditCard size={14} />
          Add Pricing
        </button>
      </div>
    </div>
  );
};
