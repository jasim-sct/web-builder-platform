import React from 'react';

import { FormField, Switch } from '../../../design-system';

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
    <FormField
      label={schema.label || propKey}
      required={schema.required}
      description={schema.description}
    >
      <Switch
        checked={boolValue}
        onChange={(checked) => onChange(propKey, checked)}
        label={boolValue ? 'Enabled' : 'Disabled'}
      />
    </FormField>
  );
};
