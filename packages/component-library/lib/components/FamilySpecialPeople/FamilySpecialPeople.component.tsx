
import React from 'react';
import { Section } from '../common/Section';
import { defaultFamilySpecialPeopleProps } from './defaultProps';
import type { FamilySpecialPeopleComponentProps } from './types';

export const FamilySpecialPeople: React.FC<FamilySpecialPeopleComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultFamilySpecialPeopleProps, ...userProps };
  
  return (
    <Section style={userStyle} id={id} className={`sec-family-wrapper ${className}`}>
      <div className="sec-family__container">
        {props.title && <h2 className="sec-family__title">{props.title}</h2>}
        {props.familyText && <p className="sec-family__text">{props.familyText}</p>}
      </div>
    </Section>
  );
};
export default FamilySpecialPeople;
