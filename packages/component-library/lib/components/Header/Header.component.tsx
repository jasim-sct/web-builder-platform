import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

import { defaultHeaderActions, defaultHeaderProps } from './defaultProps';
import { getHeaderStyles } from './helpers/styleHelper';

import type { HeaderComponentProps } from './types';

export const Header: React.FC<HeaderComponentProps> = ({
  id,
  props: userProps,
  style,
  actions: userActions,
  className = '',
  onAction,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const props = { ...defaultHeaderProps, ...userProps };
  const actions = { ...defaultHeaderActions, ...userActions };
  const { className: headerStyleClass, style: inlineStyle } = getHeaderStyles(style);

  const handleCtaClick = (e: React.MouseEvent) => {
    if (actions.ctaAction) {
      if (onAction) {
        e.preventDefault();
        onAction('ctaAction', actions.ctaAction);
      } else if (actions.ctaAction.url) {
        // Standard browser fallback
        window.location.href = actions.ctaAction.url;
      }
    }
  };

  return (
    <header
      id={id}
      className={`sec-header-wrapper ${props.sticky ? 'sec-header--sticky' : ''} ${className}`}
      style={inlineStyle}
      role="banner"
    >
      <div className={`sec-container ${headerStyleClass}`}>
        <div className="sec-header__inner">
          {/* Logo */}
          <div className="sec-header__logo">
            {props.logoImage ? (
              <img src={props.logoImage} alt={props.logoText} className="sec-header__logo-img" />
            ) : (
              <span className="sec-header__logo-text">{props.logoText}</span>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="sec-header__nav" aria-label="Main Navigation">
            <ul className="sec-header__nav-list">
              {props.links?.map((link) => (
                <li key={link.id} className="sec-header__nav-item">
                  <a
                    href={link.href}
                    target={link.target || '_self'}
                    className="sec-header__nav-link"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions & CTA */}
          <div className="sec-header__actions">
            {props.showCta && props.ctaLabel && (
              <button
                type="button"
                className="sec-btn sec-btn--primary sec-btn--sm sec-header__cta"
                onClick={handleCtaClick}
              >
                {props.ctaLabel}
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="sec-header__hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sec-header__mobile-drawer" aria-label="Mobile Navigation">
            <ul className="sec-header__mobile-nav-list">
              {props.links?.map((link) => (
                <li key={link.id} className="sec-header__mobile-nav-item">
                  <a
                    href={link.href}
                    target={link.target || '_self'}
                    className="sec-header__mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            {props.showCta && props.ctaLabel && (
              <button
                type="button"
                className="sec-btn sec-btn--primary sec-btn--md sec-header__mobile-cta"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleCtaClick(e);
                }}
              >
                {props.ctaLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
