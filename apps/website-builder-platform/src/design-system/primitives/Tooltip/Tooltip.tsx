import React from 'react';
import clsx from 'clsx';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  if (!content) return <>{children}</>;

  return (
    <div className={clsx('ds-tooltip-wrapper', className)}>
      {children}
      <div className="ds-tooltip-content" role="tooltip">
        {content}
      </div>
    </div>
  );
};
