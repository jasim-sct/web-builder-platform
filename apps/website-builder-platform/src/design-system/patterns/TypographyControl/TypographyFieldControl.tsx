import React from 'react';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from 'lucide-react';

import { TextInput } from '../../primitives/Input';
import { Select } from '../../primitives/Select';
import { SegmentedControl } from '../../primitives/Toggle';

export interface TypographyValues {
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: string;
  letterSpacing?: string;
}

export interface TypographyFieldControlProps {
  values: TypographyValues;
  onChange: (values: TypographyValues) => void;
}

const FONT_WEIGHT_OPTIONS = [
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'SemiBold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'ExtraBold (800)' },
];

export const TypographyFieldControl: React.FC<TypographyFieldControlProps> = ({
  values,
  onChange,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label className="ds-form-desc">Size</label>
          <TextInput
            value={values.fontSize || ''}
            onChange={(e) => onChange({ ...values, fontSize: e.target.value })}
            placeholder="16px"
            inputSize="sm"
          />
        </div>
        <div>
          <label className="ds-form-desc">Line Height</label>
          <TextInput
            value={values.lineHeight || ''}
            onChange={(e) => onChange({ ...values, lineHeight: e.target.value })}
            placeholder="1.5"
            inputSize="sm"
          />
        </div>
      </div>

      <div>
        <label className="ds-form-desc">Weight</label>
        <Select
          options={FONT_WEIGHT_OPTIONS}
          value={values.fontWeight || '400'}
          onChange={(e) => onChange({ ...values, fontWeight: e.target.value })}
        />
      </div>

      <div>
        <label className="ds-form-desc" style={{ marginBottom: 4, display: 'block' }}>
          Alignment
        </label>
        <SegmentedControl
          value={values.textAlign || 'left'}
          onChange={(align) => onChange({ ...values, textAlign: align })}
          items={[
            { value: 'left', label: <AlignLeft size={14} /> },
            { value: 'center', label: <AlignCenter size={14} /> },
            { value: 'right', label: <AlignRight size={14} /> },
            { value: 'justify', label: <AlignJustify size={14} /> },
          ]}
        />
      </div>
    </div>
  );
};
