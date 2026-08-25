import React from 'react';
import clsx from 'clsx';
import { AlertCircle } from 'lucide-react';

import { Label } from '../Typography';

export interface FormFieldProps {
  label?: string | undefined;
  required?: boolean | undefined;
  description?: string | undefined;
  error?: string | undefined;
  headerAction?: React.ReactNode | undefined;
  children: React.ReactNode;
  className?: string | undefined;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  description,
  error,
  headerAction,
  children,
  className,
}) => {
  return (
    <div className={clsx('ds-form-field', 'ws-form-group', className)}>
      {(label || headerAction) && (
        <div className="ds-form-label-row ws-label-row">
          {label && <Label required={Boolean(required)}>{label}</Label>}
          {headerAction && <div className="ds-form-header-action">{headerAction}</div>}
        </div>
      )}

      {description && <p className="ds-form-desc ws-form-desc">{description}</p>}

      <div className="ds-form-control-wrapper">{children}</div>

      {error && (
        <div className="ds-form-error">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
