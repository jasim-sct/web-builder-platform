
import React from 'react';
import { Section } from '../common/Section';
import { defaultVenueInformationProps } from './defaultProps';
import type { VenueInformationComponentProps } from './types';

export const VenueInformation: React.FC<VenueInformationComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultVenueInformationProps, ...userProps };
  const compKebab = "venue-information";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-logistics-card">
        <h2 className="sec-logistics-card__title">{props.title}</h2>
        <p className="sec-logistics-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default VenueInformation;
