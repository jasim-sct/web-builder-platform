
import React from 'react';
import { Section } from '../common/Section';
import { defaultEventDetailsProps } from './defaultProps';
import type { EventDetailsComponentProps } from './types';

export const EventDetails: React.FC<EventDetailsComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultEventDetailsProps, ...userProps };
  
  return (
    <Section style={userStyle} id={id} className={`sec-event-details-wrapper ${className}`}>
      <div className="sec-event-details__container">
        {props.title && <h2 className="sec-event-details__title">{props.title}</h2>}
        <div className="sec-event-details__grid">
          <div className="sec-event-details__item">
            <h3 className="sec-event-details__label">When</h3>
            <p className="sec-event-details__value">{props.date}</p>
            <p className="sec-event-details__value">{props.time}</p>
          </div>
          <div className="sec-event-details__item">
            <h3 className="sec-event-details__label">Where</h3>
            <p className="sec-event-details__value">{props.venueName}</p>
            <p className="sec-event-details__value sec-event-details__value--muted">{props.address}</p>
          </div>
        </div>
      </div>
    </Section>
  );
};
export default EventDetails;
