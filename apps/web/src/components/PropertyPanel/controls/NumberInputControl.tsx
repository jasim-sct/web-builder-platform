import React from 'react';

import type { PropertySchema } from '@repo/component-library';

interface NumberInputControlProps {
  propKey: string;
  schema: PropertySchema;
  value: unknown;
  onChange: (key: string, value: number) => void;
}

export const NumberInputControl: React.FC<NumberInputControlProps> = ({
  propKey,
  schema,
  value,
  onChange,
}) => {
  const numValue =
    typeof value === 'number'
      ? value
      : typeof schema.defaultValue === 'number'
        ? schema.defaultValue
        : 0;

  return (
    <div className="ws-form-group">
      <div className="ws-label-row">
        <label className="ws-form-label">{schema.label || propKey}</label>
        {schema.required && <span className="ws-form-required">*</span>}
      </div>

      {schema.description && <p className="ws-form-desc">{schema.description}</p>}

      <input
        type="number"
        className="ws-number-input"
        value={numValue}
        min={schema.validation?.min}
        max={schema.validation?.max}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onChange(propKey, isNaN(val) ? 0 : val);
        }}
      />
    </div>
  );
};
