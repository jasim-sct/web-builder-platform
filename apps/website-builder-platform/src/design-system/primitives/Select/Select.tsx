import React from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  isError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, isError = false, className, ...props }, ref) => {
    return (
      <div className="ds-select-wrap">
        <select
          ref={ref}
          className={clsx('ds-select', 'ws-select-input', isError && 'ds-input--error', className)}
          {...props}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="ds-select-chevron" />
      </div>
    );
  },
);

Select.displayName = 'Select';
