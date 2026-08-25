import React from 'react';

import type { SectionStyle } from '@repo/component-library';

interface TypographyControlProps {
  style?: SectionStyle;
  onChange: (updatedStyle: Partial<SectionStyle>) => void;
}

export const TypographyControl: React.FC<TypographyControlProps> = ({ style = {}, onChange }) => {
  return (
    <div className="ws-form-group">
      <div className="ws-label-row">
        <label className="ws-form-label">Typography & Colors</label>
      </div>

      {/* Heading Color */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Heading Color
          </span>
        </div>
        <div className="ws-color-picker-row">
          <div
            className="ws-color-preview-box"
            style={{
              backgroundColor: style.headingColor || '#0f172a',
            }}
          >
            <input
              type="color"
              value={style.headingColor || '#0f172a'}
              onChange={(e) => onChange({ headingColor: e.target.value })}
            />
          </div>
          <input
            type="text"
            className="ws-color-hex-input"
            value={style.headingColor || ''}
            placeholder="#0f172a"
            onChange={(e) => onChange({ headingColor: e.target.value })}
          />
        </div>
      </div>

      {/* Body Color */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Body Text Color
          </span>
        </div>
        <div className="ws-color-picker-row">
          <div
            className="ws-color-preview-box"
            style={{
              backgroundColor: style.bodyColor || '#64748b',
            }}
          >
            <input
              type="color"
              value={style.bodyColor || '#64748b'}
              onChange={(e) => onChange({ bodyColor: e.target.value })}
            />
          </div>
          <input
            type="text"
            className="ws-color-hex-input"
            value={style.bodyColor || ''}
            placeholder="#64748b"
            onChange={(e) => onChange({ bodyColor: e.target.value })}
          />
        </div>
      </div>

      {/* Accent Color */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Accent Color
          </span>
        </div>
        <div className="ws-color-picker-row">
          <div
            className="ws-color-preview-box"
            style={{
              backgroundColor: style.accentColor || '#3b82f6',
            }}
          >
            <input
              type="color"
              value={style.accentColor || '#3b82f6'}
              onChange={(e) => onChange({ accentColor: e.target.value })}
            />
          </div>
          <input
            type="text"
            className="ws-color-hex-input"
            value={style.accentColor || ''}
            placeholder="#3b82f6"
            onChange={(e) => onChange({ accentColor: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
