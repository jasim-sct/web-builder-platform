import React from 'react';
import { AlignCenter, AlignLeft, AlignRight, Columns, Rows } from 'lucide-react';

import { FormField, SegmentedControl, Select } from '../../../design-system';

import type { SectionStyle } from '@repo/component-library';

interface LayoutAlignmentControlProps {
  style?: SectionStyle;
  onChange: (updatedStyle: Partial<SectionStyle>) => void;
}

const CONTENT_WIDTH_OPTIONS = [
  { value: 'contained', label: 'Contained (Default)' },
  { value: 'narrow', label: 'Narrow (Compact)' },
  { value: 'wide', label: 'Wide' },
  { value: 'full', label: 'Full Width' },
];

export const LayoutAlignmentControl: React.FC<LayoutAlignmentControlProps> = ({
  style = {},
  onChange,
}) => {
  return (
    <div className="ds-layout-control-group">
      <FormField label="Content Width">
        <Select
          options={CONTENT_WIDTH_OPTIONS}
          value={style.contentWidth || 'contained'}
          onChange={(e) =>
            onChange({
              contentWidth: e.target.value as SectionStyle['contentWidth'],
            })
          }
        />
      </FormField>

      <FormField label="Alignment">
        <SegmentedControl
          value={style.alignment || 'left'}
          onChange={(align) => onChange({ alignment: align, textAlign: align })}
          items={[
            {
              value: 'left',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlignLeft size={13} /> Left
                </span>
              ),
            },
            {
              value: 'center',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlignCenter size={13} /> Center
                </span>
              ),
            },
            {
              value: 'right',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlignRight size={13} /> Right
                </span>
              ),
            },
          ]}
        />
      </FormField>

      <FormField label="Direction">
        <SegmentedControl
          value={style.direction || 'column'}
          onChange={(dir) => onChange({ direction: dir })}
          items={[
            {
              value: 'column',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Rows size={13} /> Column
                </span>
              ),
            },
            {
              value: 'row',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Columns size={13} /> Row
                </span>
              ),
            },
          ]}
        />
      </FormField>
    </div>
  );
};
