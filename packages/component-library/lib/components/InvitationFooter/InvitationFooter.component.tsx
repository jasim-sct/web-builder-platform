
import React from 'react';
import { Section } from '../common/Section';
import { defaultInvitationFooterProps } from './defaultProps';
import type { InvitationFooterComponentProps } from './types';

export const InvitationFooter: React.FC<InvitationFooterComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultInvitationFooterProps, ...userProps };
  const compKebab = "invitation-footer";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-generic-card">
        <h2 className="sec-generic-card__title">{props.title}</h2>
        <p className="sec-generic-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default InvitationFooter;
