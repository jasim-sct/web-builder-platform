
import React from 'react';
import { Section } from '../common/Section';
import { defaultReceptionProps } from './defaultProps';
import type { ReceptionComponentProps } from './types';

export const Reception: React.FC<ReceptionComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultReceptionProps, ...userProps };
  const compKebab = "reception";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-event-card">
        {props.image && <div className="sec-event-card__img-container"><img src={props.image} alt={props.title} className="sec-event-card__img" /></div>}
        <div className="sec-event-card__content">
          <h2 className="sec-event-card__title">{props.title}</h2>
          <div className="sec-event-card__details">
            <p><strong>{props.time}</strong></p>
            <p>{props.location}</p>
            <p className="sec-event-card__muted">{props.address}</p>
          </div>
        </div>
      </div>
    </Section>
  );
};
export default Reception;
