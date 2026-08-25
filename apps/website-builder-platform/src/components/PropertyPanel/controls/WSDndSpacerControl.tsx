import React from 'react';

import { FormField } from '../../../design-system';

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
    <FormField
      label="Box Model Spacing"
      description="Configure margins and padding around this section."
    >
      <div className="ws-dnd-spacer-control ds-box-model-spacer">
        {/* Margin Box */}
        <div className="ws-spacer-margin-box ds-box-model-margin">
          <span className="ws-spacer-label-margin ds-box-model-label--margin">Margin</span>

          {/* Margin Top */}
          <div className="ws-spacer-input-wrap ds-box-model-input-wrap">
            <input
              type="text"
              placeholder="0"
              value={style.marginTop ?? ''}
              onChange={(e) => handleMarginChange('marginTop', e.target.value)}
              title="Margin Top"
              aria-label="Margin Top"
              className="ws-spacer-input ds-box-model-input"
            />
          </div>

          <div className="ws-spacer-row ds-box-model-row">
            <div style={{ width: '48px' }} />

            {/* Padding Box */}
            <div className="ws-spacer-padding-box ds-box-model-padding">
              <span className="ws-spacer-label-padding ds-box-model-label--padding">Padding</span>

              {/* Padding Top */}
              <div className="ws-spacer-input-wrap ds-box-model-input-wrap">
                <input
                  type="text"
                  placeholder="0"
                  value={style.paddingTop ?? ''}
                  onChange={(e) => handlePaddingChange('paddingTop', e.target.value)}
                  title="Padding Top"
                  aria-label="Padding Top"
                  className="ws-spacer-input ds-box-model-input"
                />
              </div>

              {/* Padding Left & Right */}
              <div className="ws-spacer-row ds-box-model-row">
                <div className="ws-spacer-input-wrap ds-box-model-input-wrap">
                  <input
                    type="text"
                    placeholder="0"
                    value={style.paddingLeft ?? ''}
                    onChange={(e) => handlePaddingChange('paddingLeft', e.target.value)}
                    title="Padding Left"
                    aria-label="Padding Left"
                    className="ws-spacer-input ds-box-model-input"
                  />
                </div>

                <div className="ws-spacer-center-content ds-box-model-content">Content</div>

                <div className="ws-spacer-input-wrap ds-box-model-input-wrap">
                  <input
                    type="text"
                    placeholder="0"
                    value={style.paddingRight ?? ''}
                    onChange={(e) => handlePaddingChange('paddingRight', e.target.value)}
                    title="Padding Right"
                    aria-label="Padding Right"
                    className="ws-spacer-input ds-box-model-input"
                  />
                </div>
              </div>

              {/* Padding Bottom */}
              <div className="ws-spacer-input-wrap ds-box-model-input-wrap">
                <input
                  type="text"
                  placeholder="0"
                  value={style.paddingBottom ?? ''}
                  onChange={(e) => handlePaddingChange('paddingBottom', e.target.value)}
                  title="Padding Bottom"
                  aria-label="Padding Bottom"
                  className="ws-spacer-input ds-box-model-input"
                />
              </div>
            </div>

            <div style={{ width: '48px' }} />
          </div>

          {/* Margin Bottom */}
          <div className="ws-spacer-input-wrap ds-box-model-input-wrap">
            <input
              type="text"
              placeholder="0"
              value={style.marginBottom ?? ''}
              onChange={(e) => handleMarginChange('marginBottom', e.target.value)}
              title="Margin Bottom"
              aria-label="Margin Bottom"
              className="ws-spacer-input ds-box-model-input"
            />
          </div>
        </div>
      </div>
    </FormField>
  );
};
