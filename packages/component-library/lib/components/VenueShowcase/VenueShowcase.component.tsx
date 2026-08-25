
import React from 'react';
import { Section } from '../common/Section';
import { defaultVenueShowcaseProps } from './defaultProps';
import type { VenueShowcaseComponentProps } from './types';

export const VenueShowcase: React.FC<VenueShowcaseComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultVenueShowcaseProps, ...userProps };
  const compKebab = "venue-showcase";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-logistics-card">
        <h2 className="sec-logistics-card__title">{props.title}</h2>
        <p className="sec-logistics-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default VenueShowcase;
