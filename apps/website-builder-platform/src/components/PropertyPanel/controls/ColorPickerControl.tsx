import React from 'react';

import type { PropertySchema } from '@repo/component-library';

interface ColorPickerControlProps {
  propKey: string;
  schema: PropertySchema;
  value: unknown;
  onChange: (key: string, value: string) => void;
}

export const ColorPickerControl: React.FC<ColorPickerControlProps> = ({
  propKey,
  schema,
  value,
  onChange,
}) => {
  const colorValue =
    typeof value === 'string'
      ? value
      : typeof schema.defaultValue === 'string'
        ? schema.defaultValue
        : '#3b82f6';

  return (
    <div className="ws-form-group">
      <div className="ws-label-row">
        <label className="ws-form-label">{schema.label || propKey}</label>
        {schema.required && <span className="ws-form-required">*</span>}
      </div>

      {schema.description && <p className="ws-form-desc">{schema.description}</p>}

      <div className="ws-color-picker-row">
        <div className="ws-color-preview-box" style={{ backgroundColor: colorValue }}>
          <input
            type="color"
            value={colorValue}
            onChange={(e) => onChange(propKey, e.target.value)}
          />
        </div>
        <input
          type="text"
          className="ws-color-hex-input"
          value={colorValue}
          onChange={(e) => onChange(propKey, e.target.value)}
        />
      </div>
    </div>
  );
};
