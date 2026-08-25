import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, GripHorizontal, Layers, Search, X } from 'lucide-react';

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

  const panelRef = useRef<HTMLDivElement>(null);
  const [isDraggingPalette, setIsDraggingPalette] = useState(false);
  const dragStartPosRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({
    startX: 0,
    startY: 0,
    initialX: 16,
    initialY: 16,
  });

  // Calculate effective position (default 16px from top-left)
  const posX = state.componentPanelPosition?.x ?? 16;
  const posY = state.componentPanelPosition?.y ?? 16;

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking the header area, not buttons/inputs
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) {
      return;
    }

    e.preventDefault();
    setIsDraggingPalette(true);

    const currentX = state.componentPanelPosition?.x ?? 16;
    const currentY = state.componentPanelPosition?.y ?? 16;

    dragStartPosRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentX,
      initialY: currentY,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingPalette) return;

      const deltaX = e.clientX - dragStartPosRef.current.startX;
      const deltaY = e.clientY - dragStartPosRef.current.startY;

      const rawX = dragStartPosRef.current.initialX + deltaX;
      const rawY = dragStartPosRef.current.initialY + deltaY;

      // Clamp within viewport
      const panelWidth = panelRef.current?.offsetWidth || 330;
      const panelHeight = panelRef.current?.offsetHeight || 400;

      const maxX = Math.max(10, window.innerWidth - panelWidth - 20);
      const maxY = Math.max(10, window.innerHeight - panelHeight - 60);

      const boundedX = Math.min(Math.max(10, rawX), maxX);
      const boundedY = Math.min(Math.max(10, rawY), maxY);

      setComponentPanelPosition({ x: boundedX, y: boundedY });
    },
    [isDraggingPalette, setComponentPanelPosition],
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingPalette) {
      setIsDraggingPalette(false);
    }
  }, [isDraggingPalette]);

  useEffect(() => {
    if (isDraggingPalette) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPalette, handleMouseMove, handleMouseUp]);

  if (!state.isComponentPanelOpen) return null;

  return (
    <aside
      ref={panelRef}
      className={`ws-floating-component-palette ${isDraggingPalette ? 'is-moving' : ''} ${
        state.isComponentPanelMinimized ? 'is-minimized' : ''
      }`}
      style={{
        transform: `translate3d(${posX}px, ${posY}px, 0)`,
      }}
      aria-label="Component Library Palette"
    >
      <div
        className="ws-palette-header"
        onMouseDown={handleHeaderMouseDown}
        title="Click and drag to reposition palette"
      >
        <div className="ws-palette-drag-grip">
          <GripHorizontal size={14} />
        </div>

        <div className="ws-palette-title-wrap">
          <div className="ws-palette-title">
            <Layers size={15} />
            <span>Components</span>
          </div>
          <span className="ws-palette-count-badge">9 Available</span>
        </div>

        <div className="ws-palette-header-actions">
          <button
            type="button"
            className="ws-btn-base ws-btn-ghost ws-btn-icon-only ws-palette-action-btn"
            onClick={toggleComponentPanelMinimize}
            title={state.isComponentPanelMinimized ? 'Expand Palette' : 'Minimize Palette'}
          >
            {state.isComponentPanelMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          <button
            type="button"
            className="ws-btn-base ws-btn-ghost ws-btn-icon-only ws-palette-action-btn"
            onClick={toggleComponentPanel}
            title="Close Components Palette"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!state.isComponentPanelMinimized && (
        <div className="ws-palette-body">
          <div className="ws-palette-search-container">
            <div className="ws-dnd-search-wrap">
              <Search size={14} className="ws-search-icon" />
              <input
                type="text"
                className="ws-dnd-search-input"
                placeholder="Search sections (hero, pricing...)"
                value={state.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {state.searchQuery && (
                <button
                  type="button"
                  className="ws-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <CompList />
        </div>
      )}
    </aside>
  );
};
