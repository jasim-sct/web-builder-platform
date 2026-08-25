
import React from 'react';
import { Section } from '../common/Section';
import { defaultFeaturedMemoriesProps } from './defaultProps';
import type { FeaturedMemoriesComponentProps } from './types';

export const FeaturedMemories: React.FC<FeaturedMemoriesComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultFeaturedMemoriesProps, ...userProps };
  
  return (
    <Section style={userStyle} id={id} className={`sec-featured-memories-wrapper ${className}`}>
      <div className="">
        {props.title && <h2 className="sec-featured-memories__title">{props.title}</h2>}
        <div className="sec-featured-memories__grid">
          {props.image1 && <img src={props.image1} alt="Memory 1" className="sec-featured-memories__img" />}
          {props.image2 && <img src={props.image2} alt="Memory 2" className="sec-featured-memories__img sec-featured-memories__img--tall" />}
          {props.image3 && <img src={props.image3} alt="Memory 3" className="sec-featured-memories__img" />}
        </div>
      </div>
    </Section>
  );
};
export default FeaturedMemories;
