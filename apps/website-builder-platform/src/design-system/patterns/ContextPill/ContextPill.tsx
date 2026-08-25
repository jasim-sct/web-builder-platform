import React from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

export interface ContextPillProps {
  label: string;
  name?: string | undefined;
  icon?: React.ReactNode | undefined;
  onDeselect?: (() => void) | undefined;
  className?: string | undefined;
}

export const ContextPill: React.FC<ContextPillProps> = ({
  label,
  name,
  icon,
  onDeselect,
  className,
}) => {
  return (
    <div className={clsx('ds-context-pill', 'ws-context-pill', className)}>
      {icon ? icon : <div className="ws-context-indicator" />}
      <span>{label}</span>
      {name && <strong>{name}</strong>}
      {onDeselect && (
        <button
          type="button"
          className="ws-btn-base ws-btn-ghost ws-btn-icon-only"
          onClick={onDeselect}
          title="Deselect Section"
          style={{ width: 18, height: 18 }}
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
};
