import React from 'react';
import { ArrowRight } from 'lucide-react';

import { defaultHeroActions, defaultHeroProps } from './defaultProps';
import { getHeroStyles } from './helpers/styleHelper';

import type { HeroComponentProps } from './types';

export const Hero: React.FC<HeroComponentProps> = ({
  id,
  props: userProps,
  style,
  actions: userActions,
  className = '',
  onAction,
}) => {
  const props = { ...defaultHeroProps, ...userProps };
  const actions = { ...defaultHeroActions, ...userActions };
  const { className: heroStyleClass, style: inlineStyle } = getHeroStyles(style, props.variant);

  const handlePrimaryClick = (e: React.MouseEvent) => {
    if (actions.primaryButtonAction) {
      if (onAction) {
        e.preventDefault();
        onAction('primaryButtonAction', actions.primaryButtonAction);
      } else if (actions.primaryButtonAction.url) {
        window.location.href = actions.primaryButtonAction.url;
      }
    }
  };

  const handleSecondaryClick = (e: React.MouseEvent) => {
    if (actions.secondaryButtonAction) {
      if (onAction) {
        e.preventDefault();
        onAction('secondaryButtonAction', actions.secondaryButtonAction);
      } else if (actions.secondaryButtonAction.url) {
        window.location.href = actions.secondaryButtonAction.url;
      }
    }
  };

  return (
    <section
      id={id}
      className={`sec-hero-wrapper ${className}`}
      style={inlineStyle}
      role="region"
      aria-label="Hero Section"
    >
      <div className={`sec-container ${heroStyleClass}`}>
        <div className="sec-hero__grid">
          {/* Content Column */}
          <div className="sec-hero__content">
            {props.badge && <div className="sec-badge">{props.badge}</div>}

            <h1 className="sec-heading-1 sec-hero__title">{props.title}</h1>

            <p className="sec-body-lg sec-hero__description">{props.description}</p>

            <div className="sec-hero__button-group">
              {props.primaryButtonLabel && (
                <button
                  type="button"
                  className="sec-btn sec-btn--primary sec-btn--lg sec-hero__primary-btn"
                  onClick={handlePrimaryClick}
                >
                  <span>{props.primaryButtonLabel}</span>
                  <ArrowRight size={18} />
                </button>
              )}

              {props.showSecondaryButton && props.secondaryButtonLabel && (
                <button
                  type="button"
                  className="sec-btn sec-btn--outline sec-btn--lg sec-hero__secondary-btn"
                  onClick={handleSecondaryClick}
                >
                  {props.secondaryButtonLabel}
                </button>
              )}
            </div>
          </div>

          {/* Media Column / Visual Preview */}
          {props.image && props.variant !== 'background' && (
            <div className="sec-hero__media">
              <img
                src={props.image}
                alt={props.imageAlt || props.title}
                className="sec-hero__image"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
