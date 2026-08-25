import React from 'react';

import type { SectionStyle } from '@repo/component-library';

interface WSDndSpacerControlProps {
  style?: SectionStyle;
  onChange: (updatedStyle: Partial<SectionStyle>) => void;
}

export const WSDndSpacerControl: React.FC<WSDndSpacerControlProps> = ({ style = {}, onChange }) => {
  const handleMarginChange = (field: 'marginTop' | 'marginBottom', value: string) => {
    onChange({ [field]: value });
  };

  const handlePaddingChange = (
    field: 'paddingTop' | 'paddingBottom' | 'paddingLeft' | 'paddingRight',
    value: string,
  ) => {
    onChange({ [field]: value });
  };

  return (
    <div className="ws-form-group">
      <div className="ws-label-row">
        <label className="ws-form-label">Box Model Spacing</label>
      </div>
      <p className="ws-form-desc">Configure margins and padding around this section.</p>

      <div className="ws-dnd-spacer-control">
        {/* Margin Box */}
        <div className="ws-spacer-margin-box">
          <span className="ws-spacer-label-margin">Margin</span>

          {/* Margin Top */}
          <div className="ws-spacer-input-wrap">
            <input
              type="text"
              placeholder="0"
              value={style.marginTop ?? ''}
              onChange={(e) => handleMarginChange('marginTop', e.target.value)}
              title="Margin Top"
            />
          </div>

          <div className="ws-spacer-row">
            <div style={{ width: '44px' }} />

            {/* Padding Box */}
            <div className="ws-spacer-padding-box">
              <span className="ws-spacer-label-padding">Padding</span>

              {/* Padding Top */}
              <div className="ws-spacer-input-wrap">
                <input
                  type="text"
                  placeholder="0"
                  value={style.paddingTop ?? ''}
                  onChange={(e) => handlePaddingChange('paddingTop', e.target.value)}
                  title="Padding Top"
                />
              </div>

              {/* Padding Left & Right */}
              <div className="ws-spacer-row">
                <div className="ws-spacer-input-wrap">
                  <input
                    type="text"
                    placeholder="0"
                    value={style.paddingLeft ?? ''}
                    onChange={(e) => handlePaddingChange('paddingLeft', e.target.value)}
                    title="Padding Left"
                  />
                </div>

                <div className="ws-spacer-center-content">Content</div>

                <div className="ws-spacer-input-wrap">
                  <input
                    type="text"
                    placeholder="0"
                    value={style.paddingRight ?? ''}
                    onChange={(e) => handlePaddingChange('paddingRight', e.target.value)}
                    title="Padding Right"
                  />
                </div>
              </div>

              {/* Padding Bottom */}
              <div className="ws-spacer-input-wrap">
                <input
                  type="text"
                  placeholder="0"
                  value={style.paddingBottom ?? ''}
                  onChange={(e) => handlePaddingChange('paddingBottom', e.target.value)}
                  title="Padding Bottom"
                />
              </div>
            </div>

            <div style={{ width: '44px' }} />
          </div>

          {/* Margin Bottom */}
          <div className="ws-spacer-input-wrap">
            <input
              type="text"
              placeholder="0"
              value={style.marginBottom ?? ''}
              onChange={(e) => handleMarginChange('marginBottom', e.target.value)}
              title="Margin Bottom"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
