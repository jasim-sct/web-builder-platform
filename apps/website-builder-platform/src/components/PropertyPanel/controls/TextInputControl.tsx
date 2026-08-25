import React from 'react';

import { FormField, Textarea, TextInput } from '../../../design-system';

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
    <FormField
      label={schema.label || propKey}
      required={schema.required}
      description={schema.description}
    >
      {isTextarea || schema.type === 'textarea' ? (
        <Textarea
          value={strValue}
          placeholder={typeof schema.defaultValue === 'string' ? schema.defaultValue : ''}
          onChange={(e) => onChange(propKey, e.target.value)}
        />
      ) : (
        <TextInput
          value={strValue}
          placeholder={typeof schema.defaultValue === 'string' ? schema.defaultValue : ''}
          onChange={(e) => onChange(propKey, e.target.value)}
        />
      )}
    </FormField>
  );
};
