import React from 'react';

import { ColorPicker, FormField } from '../../../design-system';

import type { SectionStyle } from '@repo/component-library';

interface TypographyControlProps {
  style?: SectionStyle;
  onChange: (updatedStyle: Partial<SectionStyle>) => void;
}

export const TypographyControl: React.FC<TypographyControlProps> = ({ style = {}, onChange }) => {
  return (
    <div className="ds-typography-control-group">
      <FormField label="Heading Color">
        <ColorPicker
          value={style.headingColor || '#0f172a'}
          onChange={(val) => onChange({ headingColor: val })}
        />
      </FormField>

      <FormField label="Body Text Color">
        <ColorPicker
          value={style.bodyColor || '#64748b'}
          onChange={(val) => onChange({ bodyColor: val })}
        />
      </FormField>

      <FormField label="Accent Color">
        <ColorPicker
          value={style.accentColor || '#3b82f6'}
          onChange={(val) => onChange({ accentColor: val })}
        />
      </FormField>
    </div>
  );
};
