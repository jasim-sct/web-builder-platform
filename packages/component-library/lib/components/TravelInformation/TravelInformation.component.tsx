
import React from 'react';
import { Section } from '../common/Section';
import { defaultTravelInformationProps } from './defaultProps';
import type { TravelInformationComponentProps } from './types';

export const TravelInformation: React.FC<TravelInformationComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultTravelInformationProps, ...userProps };
  const compKebab = "travel-information";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-logistics-card">
        <h2 className="sec-logistics-card__title">{props.title}</h2>
        <p className="sec-logistics-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default TravelInformation;
