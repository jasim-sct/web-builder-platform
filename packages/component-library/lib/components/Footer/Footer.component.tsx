import React, { useState } from 'react';
import { ArrowRight, Disc as Discord, Github, Linkedin, Twitter, Youtube } from 'lucide-react';

import { defaultFooterActions, defaultFooterProps } from './defaultProps';
import { getFooterStyles } from './helpers/styleHelper';

import type { FooterComponentProps, FooterSocialLink } from './types';

const renderSocialIcon = (platform: FooterSocialLink['platform']) => {
  switch (platform) {
    case 'twitter':
      return <Twitter size={18} />;
    case 'github':
      return <Github size={18} />;
    case 'linkedin':
      return <Linkedin size={18} />;
    case 'discord':
      return <Discord size={18} />;
    case 'youtube':
      return <Youtube size={18} />;
    default:
      return null;
  }
};

export const Footer: React.FC<FooterComponentProps> = ({
  id,
  props: userProps,
  style,
  actions: userActions,
  className = '',
  onAction,
}) => {
  const props = { ...defaultFooterProps, ...userProps };
  const actions = { ...defaultFooterActions, ...userActions };
  const { className: footerStyleClass, style: inlineStyle } = getFooterStyles(style);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    if (actions.newsletterSubmitAction && onAction) {
      onAction('newsletterSubmitAction', {
        ...actions.newsletterSubmitAction,
        payload: { email: newsletterEmail },
      });
    }

    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  const handleLinkClick = (href: string, label: string, e: React.MouseEvent) => {
    if (actions.footerLinkAction) {
      if (onAction) {
        e.preventDefault();
        onAction('footerLinkAction', {
          ...actions.footerLinkAction,
          target: href,
          payload: { label },
        });
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <footer
      id={id}
      className={`sec-footer-wrapper ${className}`}
      style={inlineStyle}
      role="contentinfo"
    >
      <div className={`sec-container ${footerStyleClass}`}>
        {/* Newsletter Row (if enabled) */}
        {props.showNewsletter && (
          <div className="sec-footer__newsletter-block">
            <div className="sec-footer__newsletter-content">
              <h3 className="sec-heading-3 sec-footer__newsletter-title">
                {props.newsletterTitle}
              </h3>
              <p className="sec-body-sm sec-footer__newsletter-desc">
                Get monthly digests with our latest sections, guides, and engineering updates.
              </p>
            </div>

            {newsletterSubscribed ? (
              <div className="sec-footer__newsletter-success">
                <span>✓ Thank you for subscribing!</span>
              </div>
            ) : (
              <form className="sec-footer__newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  required
                  placeholder="Enter your work email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="sec-footer__newsletter-input"
                />
                <button
                  type="submit"
                  className="sec-btn sec-btn--primary sec-btn--md sec-footer__newsletter-btn"
                >
                  <span>{props.newsletterButtonText || 'Subscribe'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Main Footer Links & Info Grid */}
        <div className="sec-footer__main-grid">
          {/* Brand Info Column */}
          <div className="sec-footer__brand-col">
            <div className="sec-footer__logo">
              {props.logoImage ? (
                <img src={props.logoImage} alt={props.logoText} className="sec-footer__logo-img" />
              ) : (
                <span className="sec-footer__logo-text">{props.logoText}</span>
              )}
            </div>

            <p className="sec-body-sm sec-footer__description">{props.description}</p>

            {/* Social Icons */}
            {props.socialLinks && props.socialLinks.length > 0 && (
              <div className="sec-footer__social-links">
                {props.socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sec-footer__social-btn"
                    aria-label={`Visit our ${social.platform} profile`}
                  >
                    {renderSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link Groups */}
          <div className="sec-footer__links-grid">
            {props.linkGroups?.map((group) => (
              <div key={group.id} className="sec-footer__link-group">
                <h4 className="sec-footer__group-title">{group.title}</h4>
                <ul className="sec-footer__group-list">
                  {group.links?.map((link) => (
                    <li key={link.id} className="sec-footer__link-item">
                      <a
                        href={link.href}
                        className="sec-footer__link"
                        onClick={(e) => handleLinkClick(link.href, link.label, e)}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="sec-footer__bottom">
          <p className="sec-body-xs sec-footer__copyright">{props.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
