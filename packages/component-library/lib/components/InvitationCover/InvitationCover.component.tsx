
import React from 'react';
import { Section } from '../common/Section';
import { defaultInvitationCoverProps } from './defaultProps';
import type { InvitationCoverComponentProps } from './types';

export const InvitationCover: React.FC<InvitationCoverComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultInvitationCoverProps, ...userProps };
  
  return (
    <Section style={userStyle} id={id} className={`sec-invitation-cover-wrapper ${className}`}>
      <div className="sec-invitation-cover__container">
        {props.eventTitle && <p className="sec-invitation-cover__kicker">{props.eventTitle}</p>}
        <h1 className="sec-invitation-cover__names">{props.names}</h1>
        {props.message && <p className="sec-invitation-cover__message">{props.message}</p>}
      </div>
    </Section>
  );
};
export default InvitationCover;
