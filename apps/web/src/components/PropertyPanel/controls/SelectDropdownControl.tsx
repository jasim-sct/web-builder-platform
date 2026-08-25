import React from 'react';

import type { PropertySchema } from '@repo/component-library';

interface SelectDropdownControlProps {
  propKey: string;
  schema: PropertySchema;
  value: unknown;
  onChange: (key: string, value: string) => void;
}

export const SelectDropdownControl: React.FC<SelectDropdownControlProps> = ({
  propKey,
  schema,
  value,
  onChange,
}) => {
  const selectValue =
    typeof value === 'string'
      ? value
      : typeof schema.defaultValue === 'string'
        ? schema.defaultValue
        : '';

  return (
    <div className="ws-form-group">
      <div className="ws-label-row">
        <label className="ws-form-label">{schema.label || propKey}</label>
        {schema.required && <span className="ws-form-required">*</span>}
      </div>

      {schema.description && <p className="ws-form-desc">{schema.description}</p>}

      <select
        className="ws-select-input"
        value={selectValue}
        onChange={(e) => onChange(propKey, e.target.value)}
      >
        {schema.options?.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
