import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Compass,
  CreditCard,
  Grid,
  GripVertical,
  HelpCircle,
  LayoutTemplate,
  Mail,
  MessageSquareQuote,
  PanelBottom,
  Sliders,
  Sparkles,
} from 'lucide-react';

import { useToast } from '../../design-system';
import { useEditor } from '../../state/editorContext';

import type { SectionRegistryItem } from '@repo/component-library';

interface DraggableComponentCardProps {
  item: SectionRegistryItem;
}

export const getComponentIcon = (componentId: string, category: string) => {
  switch (componentId) {
    case 'header':
      return <Compass size={18} />;
    case 'footer':
      return <PanelBottom size={18} />;
    case 'hero':
      return <Sparkles size={18} />;
    case 'features':
      return <Grid size={18} />;
    case 'pricing':
      return <CreditCard size={18} />;
    case 'testimonials':
      return <MessageSquareQuote size={18} />;
    case 'faq':
      return <HelpCircle size={18} />;
    case 'contact':
      return <Mail size={18} />;
    case 'carousel':
      return <Sliders size={18} />;
    default:
      return category === 'Navigation' ? <Compass size={18} /> : <LayoutTemplate size={18} />;
  }
};

export const DraggableComponentCard: React.FC<DraggableComponentCardProps> = ({ item }) => {
  const { addSection, setActiveDropIndex } = useEditor();
  const { addToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    setIsDragging(true);
    const dragPayload = {
      componentId: item.componentId,
      displayName: item.displayName,
      category: item.category,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragPayload));
    e.dataTransfer.setData('text/plain', item.componentId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setActiveDropIndex(null);
  };

  const handleClick = () => {
    addSection(item.componentId);
    addToast({
      title: 'Section Added',
      message: `Added "${item.displayName}" to page canvas.`,
      type: 'success',
    });
  };

  return (
    <button
      type="button"
      className={clsx('ws-dnd-d-c-item', isDragging && 'is-dragging')}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      title={`Click to add or drag ${item.displayName} to canvas`}
    >
      <div className="ws-card-icon-wrap">{getComponentIcon(item.componentId, item.category)}</div>

      <div className="ws-card-content">
        <div className="ws-card-title">{item.displayName}</div>
        <div className="ws-card-desc">{item.description}</div>
      </div>

      <div className="ws-card-drag-handle" title="Drag to Canvas">
        <GripVertical size={14} />
      </div>
    </button>
  );
};
