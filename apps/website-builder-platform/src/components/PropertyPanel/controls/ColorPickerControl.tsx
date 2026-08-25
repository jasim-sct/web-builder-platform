import React from 'react';

import { ColorPicker, FormField } from '../../../design-system';

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
    <FormField
      label={schema.label || propKey}
      required={schema.required}
      description={schema.description}
    >
      <ColorPicker value={colorValue} onChange={(val) => onChange(propKey, val)} />
    </FormField>
  );
};
