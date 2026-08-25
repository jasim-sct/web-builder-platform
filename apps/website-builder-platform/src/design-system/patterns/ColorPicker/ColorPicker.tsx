import React from 'react';
import clsx from 'clsx';

import { TextInput } from '../../primitives/Input';

const DEFAULT_PRESETS = [
  '#000000',
  '#ffffff',
  '#3b82f6',
  '#2563eb',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#1e293b',
  '#0f172a',
];

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: string[] | undefined;
  className?: string | undefined;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  className,
}) => {
  const safeColor = value || '#3b82f6';
  const effectivePresets = presets ?? DEFAULT_PRESETS;

  return (
    <div className={clsx('ds-color-picker-container', className)}>
      <div className="ds-color-picker-row ws-color-picker-row">
        <div
          className="ds-color-swatch-btn ws-color-swatch"
          style={{ backgroundColor: safeColor }}
          title="Pick color"
        >
          <input
            type="color"
            value={safeColor.startsWith('#') && safeColor.length === 7 ? safeColor : '#3b82f6'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          />
        </div>

        <TextInput
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder="#ffffff"
          className="ds-color-hex-input ws-color-hex-input"
        />
      </div>

      {effectivePresets.length > 0 && (
        <div className="ds-color-palette-presets">
          {effectivePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              className="ds-preset-swatch"
              style={{ backgroundColor: preset }}
              onClick={() => onChange(preset)}
              title={preset}
            />
          ))}
        </div>
      )}
    </div>
  );
};
