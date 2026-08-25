
import React from 'react';
import { Section } from '../common/Section';
import { defaultInvitationHeroProps, defaultInvitationHeroActions } from './defaultProps';
import type { InvitationHeroComponentProps } from './types';

export const InvitationHero: React.FC<InvitationHeroComponentProps> = ({ id, props: userProps, style: userStyle, actions: userActions, className = '', onAction }) => {
  const props = { ...defaultInvitationHeroProps, ...userProps };
  const actions = { ...defaultInvitationHeroActions, ...userActions };
  
  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAction && actions.primaryAction) {
      onAction('primaryAction', actions.primaryAction);
    }
  };

  if (props.layout === 'background') {
    const bgStyle = {
      ...userStyle,
      desktop: { ...userStyle?.desktop, backgroundImage: props.image }
    };
    return (
      <Section id={id} style={bgStyle} className={`sec-invitation-hero-wrapper sec-invitation-hero-wrapper--bg ${className}`}>
        <div className="sec-invitation-hero__overlay"></div>
        <div className="sec-invitation-hero__content-bg">
          {props.subtitle && <p className="sec-invitation-hero__subtitle">{props.subtitle}</p>}
          <h1 className="sec-invitation-hero__title">{props.title}</h1>
          <div className="sec-invitation-hero__meta">
            {props.date && <span>{props.date}</span>}
            {props.date && props.location && <span className="sec-invitation-hero__dot">•</span>}
            {props.location && <span>{props.location}</span>}
          </div>
          {props.primaryButtonLabel && (
            <button className="sec-btn sec-btn--primary sec-invitation-hero__btn" onClick={handleAction}>{props.primaryButtonLabel}</button>
          )}
        </div>
      </Section>
    );
  }

  return (
    <Section id={id} style={userStyle} className={`sec-invitation-hero-wrapper sec-invitation-hero-wrapper--split ${className}`}>
      <div className="sec-invitation-hero__split-grid">
        <div className="sec-invitation-hero__content-split">
          <div className="sec-invitation-hero__content-inner">
            {props.subtitle && <p className="sec-invitation-hero__subtitle">{props.subtitle}</p>}
            <h1 className="sec-invitation-hero__title">{props.title}</h1>
            <div className="sec-invitation-hero__meta">
              {props.date && <div>{props.date}</div>}
              {props.location && <div>{props.location}</div>}
            </div>
            {props.primaryButtonLabel && (
              <button className="sec-btn sec-btn--primary sec-invitation-hero__btn" onClick={handleAction}>{props.primaryButtonLabel}</button>
            )}
          </div>
        </div>
        <div className="sec-invitation-hero__media">
          <img src={props.image} alt="Event Hero" className="sec-invitation-hero__image" />
        </div>
      </div>
    </Section>
  );
};
export default InvitationHero;
