
import React from 'react';
import { Section } from '../common/Section';
import { defaultStoryTimelineProps } from './defaultProps';
import type { StoryTimelineComponentProps } from './types';

export const StoryTimeline: React.FC<StoryTimelineComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultStoryTimelineProps, ...userProps };
  
  return (
    <Section style={userStyle} id={id} className={`sec-timeline-wrapper ${className}`}>
      <div className="sec-timeline__container">
        {props.title && <h2 className="sec-timeline__title">{props.title}</h2>}
        <div className="sec-timeline__list">
          {[1,2,3].map(i => {
            const year = props[(`e${i}Year` as keyof typeof props)];
            const t = props[(`e${i}Title` as keyof typeof props)];
            const desc = props[(`e${i}Desc` as keyof typeof props)];
            if (!year && !t) return null;
            return (
              <div key={i} className="sec-timeline__item">
                <div className="sec-timeline__year">{year}</div>
                <div className="sec-timeline__content">
                  <h4 className="sec-timeline__item-title">{t}</h4>
                  <p className="sec-timeline__item-desc">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};
export default StoryTimeline;
