
import React from 'react';
import { Section } from '../common/Section';
import { defaultWeddingPartyTeamProps } from './defaultProps';
import type { WeddingPartyTeamComponentProps } from './types';

export const WeddingPartyTeam: React.FC<WeddingPartyTeamComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultWeddingPartyTeamProps, ...userProps };
  
  return (
    <Section style={userStyle} id={id} className={`sec-party-wrapper ${className}`}>
      <div className="sec-party__container">
        {props.title && <h2 className="sec-party__title">{props.title}</h2>}
        <div className="sec-party__grid">
          {[1,2,3].map(i => {
            const name = props[(`m${i}Name` as keyof typeof props)];
            const role = props[(`m${i}Role` as keyof typeof props)];
            if (!name) return null;
            return (
              <div key={i} className="sec-party__item">
                <h4 className="sec-party__name">{name}</h4>
                <p className="sec-party__role">{role}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};
export default WeddingPartyTeam;
