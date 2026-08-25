import React from 'react';
import clsx from 'clsx';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: React.ReactNode | undefined;
  suffixIcon?: React.ReactNode | undefined;
  isError?: boolean | undefined;
  inputSize?: ('sm' | 'md' | 'lg') | undefined;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      prefixIcon,
      suffixIcon,
      isError = false,
      inputSize = 'md',
      className,
      type = 'text',
      ...props
    },
    ref,
  ) => {
    if (!prefixIcon && !suffixIcon) {
      return (
        <input
          ref={ref}
          type={type}
          className={clsx(
            'ds-input',
            `ds-input--${inputSize}`,
            isError && 'ds-input--error',
            className,
          )}
          {...props}
        />
      );
    }

    return (
      <div className="ds-input-wrap">
        {prefixIcon && <span className="ds-input-prefix">{prefixIcon}</span>}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'ds-input',
            `ds-input--${inputSize}`,
            prefixIcon && 'ds-input--has-prefix',
            suffixIcon && 'ds-input--has-suffix',
            isError && 'ds-input--error',
            className,
          )}
          {...props}
        />
        {suffixIcon && <span className="ds-input-suffix">{suffixIcon}</span>}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean | undefined;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ isError = false, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx('ds-textarea', isError && 'ds-input--error', className)}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  value: number | string;
  onChange: (value: number) => void;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  className?: string | undefined;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  className,
  ...props
}) => {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const effectiveMin = min ?? -Infinity;
  const effectiveMax = max ?? Infinity;
  const effectiveStep = step ?? 1;

  const handleIncrement = () => {
    const next = Math.min(effectiveMax, numValue + effectiveStep);
    onChange(next);
  };

  const handleDecrement = () => {
    const next = Math.max(effectiveMin, numValue - effectiveStep);
    onChange(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      onChange(Math.min(effectiveMax, Math.max(effectiveMin, parsed)));
    }
  };

  return (
    <div className={clsx('ds-number-input-wrap', className)}>
      <input
        type="number"
        className="ds-number-input"
        value={numValue}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        {...props}
      />
      <div className="ds-number-steppers">
        <button type="button" onClick={handleIncrement} title="Increment">
          <ChevronUp size={12} />
        </button>
        <button type="button" onClick={handleDecrement} title="Decrement">
          <ChevronDown size={12} />
        </button>
      </div>
    </div>
  );
};

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: (() => void) | undefined;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onClear, className, ...props }, ref) => {
    return (
      <div className="ws-dnd-search-wrap">
        <Search size={14} className="ws-search-icon" />
        <input
          ref={ref}
          type="text"
          className={clsx('ds-input', 'ws-dnd-search-input', className)}
          value={value}
          {...props}
        />
        {Boolean(value) && onClear && (
          <button
            type="button"
            className="ws-search-clear-btn"
            onClick={onClear}
            title="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
