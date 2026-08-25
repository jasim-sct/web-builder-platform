
import React from 'react';
import { Section } from '../common/Section';
import { defaultCountdownProps } from './defaultProps';
import type { CountdownComponentProps } from './types';

export const Countdown: React.FC<CountdownComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultCountdownProps, ...userProps };
  const compKebab = "countdown";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-generic-card">
        <h2 className="sec-generic-card__title">{props.title}</h2>
        <p className="sec-generic-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default Countdown;
