import React from 'react';

import type { PropertySchema } from '@repo/component-library';

interface SwitchToggleControlProps {
  propKey: string;
  schema: PropertySchema;
  value: unknown;
  onChange: (key: string, value: boolean) => void;
}

export const SwitchToggleControl: React.FC<SwitchToggleControlProps> = ({
  propKey,
  schema,
  value,
  onChange,
}) => {
  const boolValue =
    typeof value === 'boolean'
      ? value
      : typeof schema.defaultValue === 'boolean'
        ? schema.defaultValue
        : false;

  return (
    <div className="ws-form-group">
      <div className="ws-toggle-row">
        <span className="ws-toggle-label">{schema.label || propKey}</span>

        <label className="ws-dnd-property-toggle">
          <input
            type="checkbox"
            checked={boolValue}
            onChange={(e) => onChange(propKey, e.target.checked)}
          />
          <span className="ws-toggle-slider" />
        </label>
      </div>

      {schema.description && <p className="ws-form-desc">{schema.description}</p>}
    </div>
  );
};
