
import React from 'react';
import { Section } from '../common/Section';
import { defaultDressCodeProps } from './defaultProps';
import type { DressCodeComponentProps } from './types';

export const DressCode: React.FC<DressCodeComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultDressCodeProps, ...userProps };
  const compKebab = "dress-code";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-generic-card">
        <h2 className="sec-generic-card__title">{props.title}</h2>
        <p className="sec-generic-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default DressCode;
