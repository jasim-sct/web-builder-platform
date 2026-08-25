import React from 'react';

import { ColorPicker, FormField, Select, TextInput } from '../../../design-system';

import type { SectionStyle } from '@repo/component-library';

interface BorderShadowControlProps {
  style?: SectionStyle;
  onChange: (updatedStyle: Partial<SectionStyle>) => void;
}

const SHADOW_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small (Subtle)' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
  { value: '2xl', label: 'Deep Floating' },
];

export const BorderShadowControl: React.FC<BorderShadowControlProps> = ({
  style = {},
  onChange,
}) => {
  return (
    <div className="ds-border-shadow-group">
      <FormField label="Border Radius">
        <TextInput
          value={style.borderRadius ?? ''}
          placeholder="0px, 8px, 16px..."
          onChange={(e) => onChange({ borderRadius: e.target.value })}
        />
      </FormField>

      <FormField label="Border Width">
        <TextInput
          value={style.borderWidth ?? ''}
          placeholder="1px, 2px..."
          onChange={(e) => onChange({ borderWidth: e.target.value })}
        />
      </FormField>

      <FormField label="Border Color">
        <ColorPicker
          value={style.borderColor || '#e2e8f0'}
          onChange={(val) => onChange({ borderColor: val })}
        />
      </FormField>

      <FormField label="Box Shadow Elevation">
        <Select
          options={SHADOW_OPTIONS}
          value={style.boxShadow || 'none'}
          onChange={(e) => onChange({ boxShadow: e.target.value })}
        />
      </FormField>
    </div>
  );
};
