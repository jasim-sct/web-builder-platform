import React from 'react';
import { AlignCenter, AlignLeft, AlignRight, Columns, Rows } from 'lucide-react';

import type { SectionStyle } from '@repo/component-library';

interface LayoutAlignmentControlProps {
  style?: SectionStyle;
  onChange: (updatedStyle: Partial<SectionStyle>) => void;
}

export const LayoutAlignmentControl: React.FC<LayoutAlignmentControlProps> = ({
  style = {},
  onChange,
}) => {
  return (
    <div className="ws-form-group">
      <div className="ws-label-row">
        <label className="ws-form-label">Layout & Alignment</label>
      </div>

      {/* Content Width */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Content Width
          </span>
        </div>
        <select
          className="ws-select-input"
          value={style.contentWidth || 'contained'}
          onChange={(e) =>
            onChange({
              contentWidth: e.target.value as SectionStyle['contentWidth'],
            })
          }
        >
          <option value="contained">Contained (Default)</option>
          <option value="narrow">Narrow (Compact)</option>
          <option value="wide">Wide</option>
          <option value="full">Full Width</option>
        </select>
      </div>

      {/* Text Alignment */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Alignment
          </span>
        </div>
        <div className="ws-segmented-group">
          <button
            type="button"
            className={`ws-segmented-btn ${(style.alignment || 'left') === 'left' ? 'active' : ''}`}
            onClick={() => onChange({ alignment: 'left', textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft size={14} />
            Left
          </button>

          <button
            type="button"
            className={`ws-segmented-btn ${style.alignment === 'center' ? 'active' : ''}`}
            onClick={() => onChange({ alignment: 'center', textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter size={14} />
            Center
          </button>

          <button
            type="button"
            className={`ws-segmented-btn ${style.alignment === 'right' ? 'active' : ''}`}
            onClick={() => onChange({ alignment: 'right', textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight size={14} />
            Right
          </button>
        </div>
      </div>

      {/* Direction */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Direction
          </span>
        </div>
        <div className="ws-segmented-group">
          <button
            type="button"
            className={`ws-segmented-btn ${
              (style.direction || 'column') === 'column' ? 'active' : ''
            }`}
            onClick={() => onChange({ direction: 'column' })}
          >
            <Rows size={14} />
            Column
          </button>

          <button
            type="button"
            className={`ws-segmented-btn ${style.direction === 'row' ? 'active' : ''}`}
            onClick={() => onChange({ direction: 'row' })}
          >
            <Columns size={14} />
            Row
          </button>
        </div>
      </div>
    </div>
  );
};
