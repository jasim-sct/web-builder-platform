import React from 'react';
import clsx from 'clsx';

import { TextInput } from '../../primitives/Input';

export interface BoxModelValues {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface BoxModelControlProps {
  label?: string;
  values?: BoxModelValues;
  onChange?: (values: BoxModelValues) => void;
  margin?: BoxModelValues;
  padding?: BoxModelValues;
  onMarginChange?: (field: keyof BoxModelValues, value: string) => void;
  onPaddingChange?: (field: keyof BoxModelValues, value: string) => void;
  variant?: 'visual' | 'grid';
  className?: string;
}

export const BoxModelControl: React.FC<BoxModelControlProps> = ({
  values,
  onChange,
  margin = { top: '', right: '', bottom: '', left: '' },
  padding = { top: '', right: '', bottom: '', left: '' },
  onMarginChange,
  onPaddingChange,
  variant = 'visual',
  className,
}) => {
  const handleSideChange = (side: keyof BoxModelValues, val: string) => {
    if (onChange && values) {
      onChange({
        ...values,
        [side]: val,
      });
    }
  };

  if (variant === 'grid' && values) {
    return (
      <div className={clsx('ds-box-model-control', className)}>
        <div className="ds-box-model-grid">
          <div className="ds-box-model-input-group">
            <span>Top</span>
            <TextInput
              value={values.top || ''}
              onChange={(e) => handleSideChange('top', e.target.value)}
              placeholder="0px"
              inputSize="sm"
            />
          </div>
          <div className="ds-box-model-input-group">
            <span>Right</span>
            <TextInput
              value={values.right || ''}
              onChange={(e) => handleSideChange('right', e.target.value)}
              placeholder="0px"
              inputSize="sm"
            />
          </div>
          <div className="ds-box-model-input-group">
            <span>Bottom</span>
            <TextInput
              value={values.bottom || ''}
              onChange={(e) => handleSideChange('bottom', e.target.value)}
              placeholder="0px"
              inputSize="sm"
            />
          </div>
          <div className="ds-box-model-input-group">
            <span>Left</span>
            <TextInput
              value={values.left || ''}
              onChange={(e) => handleSideChange('left', e.target.value)}
              placeholder="0px"
              inputSize="sm"
            />
          </div>
        </div>
      </div>
    );
  }

  // Visual nested diagram mode (Margin > Padding > Content)
  return (
    <div className={clsx('ds-box-model-spacer ws-dnd-spacer-control', className)}>
      <div className="ds-box-model-margin ws-spacer-margin-box">
        <span className="ds-box-model-label--margin ws-spacer-label-margin">Margin</span>

        <div className="ds-box-model-input-wrap ws-spacer-input-wrap">
          <input
            type="text"
            placeholder="0"
            value={margin.top || ''}
            onChange={(e) => onMarginChange?.('top', e.target.value)}
            title="Margin Top"
            aria-label="Margin Top"
            className="ds-box-model-input ws-spacer-input"
          />
        </div>

        <div className="ds-box-model-row ws-spacer-row">
          <div className="ds-box-model-input-wrap ws-spacer-input-wrap">
            <input
              type="text"
              placeholder="0"
              value={margin.left || ''}
              onChange={(e) => onMarginChange?.('left', e.target.value)}
              title="Margin Left"
              aria-label="Margin Left"
              className="ds-box-model-input ws-spacer-input"
            />
          </div>

          <div className="ds-box-model-padding ws-spacer-padding-box">
            <span className="ds-box-model-label--padding ws-spacer-label-padding">Padding</span>

            <div className="ds-box-model-input-wrap ws-spacer-input-wrap">
              <input
                type="text"
                placeholder="0"
                value={padding.top || ''}
                onChange={(e) => onPaddingChange?.('top', e.target.value)}
                title="Padding Top"
                aria-label="Padding Top"
                className="ds-box-model-input ws-spacer-input"
              />
            </div>

            <div className="ds-box-model-row ws-spacer-row">
              <div className="ds-box-model-input-wrap ws-spacer-input-wrap">
                <input
                  type="text"
                  placeholder="0"
                  value={padding.left || ''}
                  onChange={(e) => onPaddingChange?.('left', e.target.value)}
                  title="Padding Left"
                  aria-label="Padding Left"
                  className="ds-box-model-input ws-spacer-input"
                />
              </div>

              <div className="ds-box-model-content ws-spacer-center-content">Content</div>

              <div className="ds-box-model-input-wrap ws-spacer-input-wrap">
                <input
                  type="text"
                  placeholder="0"
                  value={padding.right || ''}
                  onChange={(e) => onPaddingChange?.('right', e.target.value)}
                  title="Padding Right"
                  aria-label="Padding Right"
                  className="ds-box-model-input ws-spacer-input"
                />
              </div>
            </div>

            <div className="ds-box-model-input-wrap ws-spacer-input-wrap">
              <input
                type="text"
                placeholder="0"
                value={padding.bottom || ''}
                onChange={(e) => onPaddingChange?.('bottom', e.target.value)}
                title="Padding Bottom"
                aria-label="Padding Bottom"
                className="ds-box-model-input ws-spacer-input"
              />
            </div>
          </div>

          <div className="ds-box-model-input-wrap ws-spacer-input-wrap">
            <input
              type="text"
              placeholder="0"
              value={margin.right || ''}
              onChange={(e) => onMarginChange?.('right', e.target.value)}
              title="Margin Right"
              aria-label="Margin Right"
              className="ds-box-model-input ws-spacer-input"
            />
          </div>
        </div>

        <div className="ds-box-model-input-wrap ws-spacer-input-wrap">
          <input
            type="text"
            placeholder="0"
            value={margin.bottom || ''}
            onChange={(e) => onMarginChange?.('bottom', e.target.value)}
            title="Margin Bottom"
            aria-label="Margin Bottom"
            className="ds-box-model-input ws-spacer-input"
          />
        </div>
      </div>
    </div>
  );
};
