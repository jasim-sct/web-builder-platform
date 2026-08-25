
import React from 'react';
import { Section } from '../common/Section';
import { defaultOurStoryProps } from './defaultProps';
import type { OurStoryComponentProps } from './types';

export const OurStory: React.FC<OurStoryComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultOurStoryProps, ...userProps };
  
  return (
    <Section style={userStyle} id={id} className={`sec-our-story-wrapper ${className}`}>
      <div className="sec-our-story__grid">
        <div className="sec-our-story__content">
          <h2 className="sec-our-story__title">{props.title}</h2>
          <p className="sec-our-story__text">{props.storyText}</p>
        </div>
        <div className="sec-our-story__media">
          {props.image && <img src={props.image} alt="Our Story" className="sec-our-story__img" />}
        </div>
      </div>
    </Section>
  );
};
export default OurStory;
