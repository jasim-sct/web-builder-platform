import React from 'react';

import type { SectionStyle } from '@repo/component-library';

interface BackgroundControlProps {
  style?: SectionStyle;
  onChange: (updatedStyle: Partial<SectionStyle>) => void;
}

export const BackgroundControl: React.FC<BackgroundControlProps> = ({ style = {}, onChange }) => {
  return (
    <div className="ws-form-group">
      <div className="ws-label-row">
        <label className="ws-form-label">Background & Effects</label>
      </div>

      {/* Background Color */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Background Color
          </span>
        </div>
        <div className="ws-color-picker-row">
          <div
            className="ws-color-preview-box"
            style={{
              backgroundColor: style.backgroundColor || '#ffffff',
            }}
          >
            <input
              type="color"
              value={style.backgroundColor || '#ffffff'}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
            />
          </div>
          <input
            type="text"
            className="ws-color-hex-input"
            value={style.backgroundColor || ''}
            placeholder="#ffffff"
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
          />
        </div>
      </div>

      {/* Background Image URL */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Background Image URL
          </span>
        </div>
        <input
          type="text"
          className="ws-text-input"
          value={style.backgroundImage || ''}
          placeholder="https://images.unsplash.com/..."
          onChange={(e) => onChange({ backgroundImage: e.target.value })}
        />
      </div>

      {/* Opacity */}
      <div className="ws-form-group" style={{ marginTop: '6px' }}>
        <div className="ws-label-row">
          <span className="ws-form-label" style={{ fontSize: '11px' }}>
            Opacity ({typeof style.opacity === 'number' ? style.opacity : 1})
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={typeof style.opacity === 'number' ? style.opacity : 1}
          onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
        />
      </div>
    </div>
  );
};
