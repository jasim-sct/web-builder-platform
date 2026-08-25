
import React from 'react';
import { Section } from '../common/Section';
import { defaultInteractiveMapProps } from './defaultProps';
import type { InteractiveMapComponentProps } from './types';

export const InteractiveMap: React.FC<InteractiveMapComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultInteractiveMapProps, ...userProps };
  const compKebab = "interactive-map";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-logistics-card">
        <h2 className="sec-logistics-card__title">{props.title}</h2>
        <p className="sec-logistics-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default InteractiveMap;
