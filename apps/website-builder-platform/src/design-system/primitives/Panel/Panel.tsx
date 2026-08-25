import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, ChevronUp, GripHorizontal, X } from 'lucide-react';

export interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'aside' | 'div' | 'section';
  isExpanded?: boolean;
  position?: 'left' | 'right';
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  as: Component = 'aside',
  isExpanded = false,
  position = 'right',
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={clsx(
        'ds-property-panel',
        'ws-dnd-property-panel',
        isExpanded && 'is-expanded',
        position === 'left' && 'position-left',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ className, children, ...props }) => {
  return (
    <div className={clsx('ws-property-header', className)} {...props}>
      {children}
    </div>
  );
};

export interface PanelBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PanelBody: React.FC<PanelBodyProps> = ({ className, children, ...props }) => {
  return (
    <div className={clsx('ws-property-body-scroll', className)} {...props}>
      {children}
    </div>
  );
};

export interface FloatingWindowProps {
  isOpen: boolean;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
  title: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  position?: { x: number; y: number };
  onPositionChange?: (pos: { x: number; y: number }) => void;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  isOpen,
  isMinimized,
  onToggleMinimize,
  onClose,
  title,
  icon,
  badge,
  position = { x: 16, y: 16 },
  onPositionChange,
  headerContent,
  children,
  className,
  ariaLabel = 'Floating Window',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({
    startX: 0,
    startY: 0,
    initialX: position.x,
    initialY: position.y,
  });

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const rawX = dragStartRef.current.initialX + deltaX;
      const rawY = dragStartRef.current.initialY + deltaY;

      const panelWidth = panelRef.current?.offsetWidth || 330;
      const panelHeight = panelRef.current?.offsetHeight || 400;

      const maxX = Math.max(10, window.innerWidth - panelWidth - 20);
      const maxY = Math.max(10, window.innerHeight - panelHeight - 60);

      const boundedX = Math.min(Math.max(10, rawX), maxX);
      const boundedY = Math.min(Math.max(10, rawY), maxY);

      onPositionChange?.({ x: boundedX, y: boundedY });
    },
    [isDragging, onPositionChange],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <aside
      ref={panelRef}
      className={clsx(
        'ds-floating-window',
        'ws-floating-component-palette',
        isDragging && 'is-moving',
        isMinimized && 'is-minimized',
        className,
      )}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      aria-label={ariaLabel}
    >
      <div
        className="ds-floating-header ws-palette-header"
        onMouseDown={handleHeaderMouseDown}
        title="Click and drag to reposition palette"
      >
        <div className="ws-palette-drag-grip">
          <GripHorizontal size={14} />
        </div>

        <div className="ws-palette-title-wrap">
          <div className="ws-palette-title">
            {icon}
            <span>{title}</span>
          </div>
          {badge}
        </div>

        <div className="ws-palette-header-actions">
          {headerContent}
          <button
            type="button"
            className="ws-btn-base ws-btn-ghost ws-btn-icon-only ws-palette-action-btn"
            onClick={onToggleMinimize}
            title={isMinimized ? 'Expand Palette' : 'Minimize Palette'}
          >
            {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          <button
            type="button"
            className="ws-btn-base ws-btn-ghost ws-btn-icon-only ws-palette-action-btn"
            onClick={onClose}
            title="Close Components Palette"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && <div className="ds-floating-body ws-palette-body">{children}</div>}
    </aside>
  );
};
