
import React from 'react';
import { Section } from '../common/Section';
import { defaultEventIntroductionProps } from './defaultProps';
import type { EventIntroductionComponentProps } from './types';

export const EventIntroduction: React.FC<EventIntroductionComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultEventIntroductionProps, ...userProps };
  
  return (
    <Section style={userStyle} id={id} className={`sec-event-intro-wrapper ${className}`}>
      <div className="sec-event-intro__container">
        {props.greeting && <h2 className="sec-event-intro__greeting">{props.greeting}</h2>}
        {props.message && <p className="sec-event-intro__message">{props.message}</p>}
        {props.signature && <p className="sec-event-intro__signature">{props.signature}</p>}
      </div>
    </Section>
  );
};
export default EventIntroduction;
