import React from 'react';

import { ColorPicker, FormField, TextInput } from '../../../design-system';

import type { SectionStyle } from '@repo/component-library';

interface BackgroundControlProps {
  style?: SectionStyle;
  onChange: (updatedStyle: Partial<SectionStyle>) => void;
}

export const BackgroundControl: React.FC<BackgroundControlProps> = ({ style = {}, onChange }) => {
  return (
    <div className="ds-background-control-group">
      <FormField label="Background Color">
        <ColorPicker
          value={style.backgroundColor || '#ffffff'}
          onChange={(val) => onChange({ backgroundColor: val })}
        />
      </FormField>

      <FormField label="Background Image URL">
        <TextInput
          value={style.backgroundImage || ''}
          placeholder="https://images.unsplash.com/..."
          onChange={(e) => onChange({ backgroundImage: e.target.value })}
        />
      </FormField>

      <FormField
        label={`Opacity (${typeof style.opacity === 'number' ? Math.round(style.opacity * 100) : 100}%)`}
      >
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={typeof style.opacity === 'number' ? style.opacity : 1}
          onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
          style={{ width: '100%', accentColor: '#3b82f6' }}
        />
      </FormField>
    </div>
  );
};
