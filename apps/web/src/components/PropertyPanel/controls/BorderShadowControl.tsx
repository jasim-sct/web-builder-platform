import React from 'react';

import type { SectionStyle } from '@repo/component-library';

interface BorderShadowControlProps {
  style?: SectionStyle;
  onChange: (updatedStyle: Partial<SectionStyle>) => void;
}

export const BorderShadowControl: React.FC<BorderShadowControlProps> = ({
  style = {},
  onChange,
}) => {
  return (
    <div className="ws-form-group">
      <div className="ws-label-row">
        <label className="ws-form-label">Border & Shadow</label>
      </div>

      {/* Border Radius */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Border Radius
          </span>
        </div>
        <input
          type="text"
          className="ws-text-input"
          value={style.borderRadius ?? ''}
          placeholder="0px or 12px"
          onChange={(e) => onChange({ borderRadius: e.target.value })}
        />
      </div>

      {/* Border Width & Color */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Border Width & Color
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="ws-text-input"
            style={{ width: '80px' }}
            value={style.borderWidth ?? ''}
            placeholder="1px"
            onChange={(e) => onChange({ borderWidth: e.target.value })}
          />
          <input
            type="text"
            className="ws-color-hex-input"
            value={style.borderColor || ''}
            placeholder="#e2e8f0"
            onChange={(e) => onChange({ borderColor: e.target.value })}
          />
        </div>
      </div>

      {/* Box Shadow */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Box Shadow
          </span>
        </div>
        <select
          className="ws-select-input"
          value={style.boxShadow || 'none'}
          onChange={(e) => onChange({ boxShadow: e.target.value })}
        >
          <option value="none">None</option>
          <option value="sm">Small (Subtle)</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
          <option value="xl">Extra Large</option>
          <option value="2xl">Deep Floating</option>
        </select>
      </div>
    </div>
  );
};
