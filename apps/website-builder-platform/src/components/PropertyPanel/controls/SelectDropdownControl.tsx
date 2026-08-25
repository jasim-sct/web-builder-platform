import React from 'react';

import { FormField, Select } from '../../../design-system';

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

  const options = (schema.options || []).map((opt) => ({
    value: String(opt.value),
    label: opt.label,
  }));

  return (
    <FormField
      label={schema.label || propKey}
      required={schema.required}
      description={schema.description}
    >
      <Select
        options={options}
        value={selectValue}
        onChange={(e) => onChange(propKey, e.target.value)}
      />
    </FormField>
  );
};
