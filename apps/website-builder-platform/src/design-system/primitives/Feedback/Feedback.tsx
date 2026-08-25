import React from 'react';
import clsx from 'clsx';
import { AlertTriangle, CheckCircle, Info, Loader2, XCircle } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actions,
  className,
}) => {
  return (
    <div className={clsx('ds-empty-state', 'ws-property-empty', className)}>
      {icon && <div className="ds-empty-icon ws-empty-icon">{icon}</div>}
      <div className="ds-empty-title ws-empty-title">{title}</div>
      {description && <div className="ds-empty-desc ws-empty-desc">{description}</div>}
      {actions && <div className="ds-empty-actions">{actions}</div>}
    </div>
  );
};

export interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'danger' | 'info';
  label?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor:
            status === 'success'
              ? '#10b981'
              : status === 'warning'
                ? '#f59e0b'
                : status === 'danger'
                  ? '#ef4444'
                  : '#06b6d4',
          boxShadow: `0 0 6px ${
            status === 'success'
              ? '#10b981'
              : status === 'warning'
                ? '#f59e0b'
                : status === 'danger'
                  ? '#ef4444'
                  : '#06b6d4'
          }`,
        }}
      />
      {label && <span className="ds-text ds-text--xs ds-text--secondary">{label}</span>}
    </div>
  );
};

export interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 20, className }) => {
  return (
    <Loader2
      size={size}
      className={clsx('ds-loading-spinner', className)}
      style={{ animation: 'spin 1s linear infinite' }}
    />
  );
};

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'danger';
}

export const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      case 'danger':
        return <XCircle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div
      className={clsx('ds-toast', `ds-toast--${toast.type || 'info'}`)}
      onClick={() => onDismiss(toast.id)}
    >
      <div className="ds-toast-icon">{getIcon()}</div>
      <div className="ds-toast-content">
        <div className="ds-toast-title">{toast.title}</div>
        {toast.message && <div className="ds-toast-message">{toast.message}</div>}
      </div>
    </div>
  );
};
