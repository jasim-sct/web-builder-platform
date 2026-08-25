import React from 'react';

import { FormField, NumberInput } from '../../../design-system';

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
    <FormField
      label={schema.label || propKey}
      required={schema.required}
      description={schema.description}
    >
      <NumberInput
        value={numValue}
        min={schema.validation?.min}
        max={schema.validation?.max}
        onChange={(val) => onChange(propKey, val)}
      />
    </FormField>
  );
};
