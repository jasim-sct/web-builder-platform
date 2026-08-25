
import React from 'react';
import { Section } from '../common/Section';
import { defaultEventPoliciesProps } from './defaultProps';
import type { EventPoliciesComponentProps } from './types';

export const EventPolicies: React.FC<EventPoliciesComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultEventPoliciesProps, ...userProps };
  const compKebab = "event-policies";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-generic-card">
        <h2 className="sec-generic-card__title">{props.title}</h2>
        <p className="sec-generic-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default EventPolicies;
