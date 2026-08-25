
import React from 'react';
import { Section } from '../common/Section';
import { defaultRSVPProps } from './defaultProps';
import type { RSVPComponentProps } from './types';

export const RSVP: React.FC<RSVPComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultRSVPProps, ...userProps };
  return (
    <Section style={userStyle} id={id} className={`sec-rsvp-wrapper ${className}`}>
      <div className="sec-rsvp__card">
        <h2 className="sec-rsvp__title">{props.title}</h2>
        <p className="sec-rsvp__text">{props.text}</p>
        <button className="sec-btn sec-btn--primary">RSVP Online</button>
      </div>
    </Section>
  );
};
export default RSVP;
