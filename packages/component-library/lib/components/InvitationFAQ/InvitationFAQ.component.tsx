
import React from 'react';
import { Section } from '../common/Section';
import { defaultInvitationFAQProps } from './defaultProps';
import type { InvitationFAQComponentProps } from './types';

export const InvitationFAQ: React.FC<InvitationFAQComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultInvitationFAQProps, ...userProps };
  const compKebab = "invitation-faq";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-generic-card">
        <h2 className="sec-generic-card__title">{props.title}</h2>
        <p className="sec-generic-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default InvitationFAQ;
