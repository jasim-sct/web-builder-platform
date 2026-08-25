import React from 'react';

import type { PropertySchema } from '@repo/component-library';

interface TextInputControlProps {
  propKey: string;
  schema: PropertySchema;
  value: unknown;
  onChange: (key: string, value: string) => void;
  isTextarea?: boolean;
}

export const TextInputControl: React.FC<TextInputControlProps> = ({
  propKey,
  schema,
  value,
  onChange,
  isTextarea = false,
}) => {
  const strValue = typeof value === 'string' ? value : '';

  return (
    <div className="ws-form-group">
      <div className="ws-label-row">
        <label className="ws-form-label">{schema.label || propKey}</label>
        {schema.required && <span className="ws-form-required">*</span>}
      </div>

      {schema.description && <p className="ws-form-desc">{schema.description}</p>}

      {isTextarea || schema.type === 'textarea' ? (
        <textarea
          className="ws-textarea-input"
          value={strValue}
          placeholder={typeof schema.defaultValue === 'string' ? schema.defaultValue : ''}
          onChange={(e) => onChange(propKey, e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="ws-text-input"
          value={strValue}
          placeholder={typeof schema.defaultValue === 'string' ? schema.defaultValue : ''}
          onChange={(e) => onChange(propKey, e.target.value)}
        />
      )}
    </div>
  );
};
