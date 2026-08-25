import React from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}) => {
  return (
    <label
      className={clsx('ds-switch-wrap', disabled && 'is-disabled', className)}
      onClick={(e) => {
        if (disabled) return;
        e.preventDefault();
        onChange(!checked);
      }}
    >
      <div
        className={clsx('ds-switch', 'ws-switch-track', checked && 'is-checked active')}
        role="switch"
        aria-checked={checked}
      >
        <div className="ds-switch-thumb ws-switch-thumb" />
      </div>
      {label && <span className="ds-text ds-text--sm ds-text--secondary">{label}</span>}
    </label>
  );
};

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}) => {
  return (
    <label
      className={clsx('ds-checkbox-wrap', disabled && 'is-disabled', className)}
      onClick={(e) => {
        if (disabled) return;
        e.preventDefault();
        onChange(!checked);
      }}
    >
      <div
        className={clsx('ds-checkbox', checked && 'is-checked')}
        role="checkbox"
        aria-checked={checked}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </div>
      {label && <span className="ds-text ds-text--sm ds-text--secondary">{label}</span>}
    </label>
  );
};

export interface SegmentedItem<T extends string | number = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
}

export interface SegmentedControlProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  items: SegmentedItem<T>[];
  className?: string;
}

export function SegmentedControl<T extends string | number = string>({
  value,
  onChange,
  items,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={clsx('ds-segmented-control', 'ws-category-filter-bar', className)}>
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={String(item.value)}
            type="button"
            className={clsx(
              'ds-segmented-item',
              'ws-category-chip',
              isActive && 'is-active active',
            )}
            onClick={() => onChange(item.value)}
          >
            {item.icon && <span className="ds-segmented-icon">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === 'number' && <span className="ws-chip-count">{item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
