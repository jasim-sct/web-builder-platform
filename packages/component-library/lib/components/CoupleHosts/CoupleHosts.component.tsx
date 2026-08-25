
import React from 'react';
import { Section } from '../common/Section';
import { defaultCoupleHostsProps } from './defaultProps';
import type { CoupleHostsComponentProps } from './types';

export const CoupleHosts: React.FC<CoupleHostsComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultCoupleHostsProps, ...userProps };
  
  return (
    <Section style={userStyle} id={id} className={`sec-couple-hosts-wrapper ${className}`}>
      <div className="sec-couple-hosts__container">
        {props.title && <h2 className="sec-couple-hosts__title">{props.title}</h2>}
        <div className="sec-couple-hosts__grid">
          <div className="sec-couple-hosts__profile">
            {props.host1Image && <img src={props.host1Image} alt={props.host1Name} className="sec-couple-hosts__img" />}
            <h3 className="sec-couple-hosts__name">{props.host1Name}</h3>
            <p className="sec-couple-hosts__bio">{props.host1Bio}</p>
          </div>
          <div className="sec-couple-hosts__profile">
            {props.host2Image && <img src={props.host2Image} alt={props.host2Name} className="sec-couple-hosts__img" />}
            <h3 className="sec-couple-hosts__name">{props.host2Name}</h3>
            <p className="sec-couple-hosts__bio">{props.host2Bio}</p>
          </div>
        </div>
      </div>
    </Section>
  );
};
export default CoupleHosts;
