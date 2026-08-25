
import React from 'react';
import { Section } from '../common/Section';
import { defaultEventScheduleProps } from './defaultProps';
import type { EventScheduleComponentProps } from './types';

export const EventSchedule: React.FC<EventScheduleComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultEventScheduleProps, ...userProps };
  
  return (
    <Section style={userStyle} id={id} className={`sec-schedule-wrapper ${className}`}>
      <div className="sec-schedule__container">
        {props.title && <h2 className="sec-schedule__title">{props.title}</h2>}
        <div className="sec-schedule__list">
          {[1,2,3].map(i => {
            const time = props[(`e${i}Time` as keyof typeof props)];
            const t = props[(`e${i}Title` as keyof typeof props)];
            const desc = props[(`e${i}Desc` as keyof typeof props)];
            if (!time && !t) return null;
            return (
              <div key={i} className="sec-schedule__item">
                <div className="sec-schedule__time">{time}</div>
                <div className="sec-schedule__details">
                  <h4 className="sec-schedule__event-title">{t}</h4>
                  {desc && <p className="sec-schedule__event-desc">{desc}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};
export default EventSchedule;
