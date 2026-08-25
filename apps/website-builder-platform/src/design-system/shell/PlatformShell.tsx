import React from 'react';
import clsx from 'clsx';

import { ToastContainer } from './ToastContainer';

export interface PlatformShellProps {
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PlatformShell: React.FC<PlatformShellProps> = ({ header, children, className }) => {
  return (
    <div className={clsx('ds-platform-shell', 'ws-editor-root', className)}>
      {header}
      <div className="ds-platform-body ws-editor-main-body">{children}</div>
      <ToastContainer />
    </div>
  );
};
