import React from 'react';
import {
  AlignHorizontalDistributeCenter,
  AlignHorizontalDistributeEnd,
  AlignHorizontalDistributeStart,
  AlignVerticalDistributeCenter,
  AlignVerticalDistributeEnd,
  AlignVerticalDistributeStart,
  ArrowDown,
  ArrowRight,
} from 'lucide-react';

import { SegmentedControl } from '../../primitives/Toggle';

export interface AlignmentValues {
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
}

export interface AlignmentFieldControlProps {
  values: AlignmentValues;
  onChange: (values: AlignmentValues) => void;
}

export const AlignmentFieldControl: React.FC<AlignmentFieldControlProps> = ({
  values,
  onChange,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label className="ds-form-desc" style={{ marginBottom: 4, display: 'block' }}>
          Direction
        </label>
        <SegmentedControl
          value={values.flexDirection || 'row'}
          onChange={(dir) => onChange({ ...values, flexDirection: dir })}
          items={[
            {
              value: 'row',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ArrowRight size={13} /> Row
                </span>
              ),
            },
            {
              value: 'column',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ArrowDown size={13} /> Column
                </span>
              ),
            },
          ]}
        />
      </div>

      <div>
        <label className="ds-form-desc" style={{ marginBottom: 4, display: 'block' }}>
          Justify Content
        </label>
        <SegmentedControl
          value={values.justifyContent || 'flex-start'}
          onChange={(val) => onChange({ ...values, justifyContent: val })}
          items={[
            { value: 'flex-start', label: <AlignHorizontalDistributeStart size={14} /> },
            { value: 'center', label: <AlignHorizontalDistributeCenter size={14} /> },
            { value: 'flex-end', label: <AlignHorizontalDistributeEnd size={14} /> },
          ]}
        />
      </div>

      <div>
        <label className="ds-form-desc" style={{ marginBottom: 4, display: 'block' }}>
          Align Items
        </label>
        <SegmentedControl
          value={values.alignItems || 'center'}
          onChange={(val) => onChange({ ...values, alignItems: val })}
          items={[
            { value: 'flex-start', label: <AlignVerticalDistributeStart size={14} /> },
            { value: 'center', label: <AlignVerticalDistributeCenter size={14} /> },
            { value: 'flex-end', label: <AlignVerticalDistributeEnd size={14} /> },
          ]}
        />
      </div>
    </div>
  );
};
