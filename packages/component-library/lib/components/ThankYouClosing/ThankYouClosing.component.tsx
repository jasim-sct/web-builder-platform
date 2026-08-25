
import React from 'react';
import { Section } from '../common/Section';
import { defaultThankYouClosingProps } from './defaultProps';
import type { ThankYouClosingComponentProps } from './types';

export const ThankYouClosing: React.FC<ThankYouClosingComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultThankYouClosingProps, ...userProps };
  const compKebab = "thank-you-closing";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-generic-card">
        <h2 className="sec-generic-card__title">{props.title}</h2>
        <p className="sec-generic-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default ThankYouClosing;
