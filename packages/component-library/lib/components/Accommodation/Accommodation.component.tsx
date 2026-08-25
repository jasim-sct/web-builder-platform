
import React from 'react';
import { Section } from '../common/Section';
import { defaultAccommodationProps } from './defaultProps';
import type { AccommodationComponentProps } from './types';

export const Accommodation: React.FC<AccommodationComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultAccommodationProps, ...userProps };
  const compKebab = "accommodation";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-logistics-card">
        <h2 className="sec-logistics-card__title">{props.title}</h2>
        <p className="sec-logistics-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default Accommodation;
