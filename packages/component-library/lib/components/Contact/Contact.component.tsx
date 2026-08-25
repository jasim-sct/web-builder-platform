import React, { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';

import { defaultContactActions, defaultContactProps } from './defaultProps';
import { getContactStyles } from './helpers/styleHelper';

import type { ContactComponentProps } from './types';

export const Contact: React.FC<ContactComponentProps> = ({
  id,
  props: userProps,
  style,
  actions: userActions,
  className = '',
  onAction,
}) => {
  const props = { ...defaultContactProps, ...userProps };
  const actions = { ...defaultContactActions, ...userActions };
  const { className: contactStyleClass, style: inlineStyle } = getContactStyles(style);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (actions.submitAction && onAction) {
      onAction('submitAction', {
        ...actions.submitAction,
        payload: { ...formData },
      });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <section
      id={id}
      className={`sec-contact-wrapper ${className}`}
      style={inlineStyle}
      role="region"
      aria-label="Contact Section"
    >
      <div className={`sec-container ${contactStyleClass}`}>
        <div className="sec-contact__grid">
          {/* Left Column: Information */}
          <div className="sec-contact__info">
            {props.badge && <div className="sec-badge">{props.badge}</div>}
            <h2 className="sec-heading-2 sec-contact__title">{props.title}</h2>
            {props.description && (
              <p className="sec-body-lg sec-contact__description">{props.description}</p>
            )}

            {props.contactInfo && (
              <div className="sec-contact__details">
                {props.contactInfo.email && (
                  <div className="sec-contact__detail-item">
                    <div className="sec-contact__detail-icon">
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="sec-contact__detail-label">Email Us</div>
                      <a
                        href={`mailto:${props.contactInfo.email}`}
                        className="sec-contact__detail-value"
                      >
                        {props.contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}

                {props.contactInfo.phone && (
                  <div className="sec-contact__detail-item">
                    <div className="sec-contact__detail-icon">
                      <Phone size={20} />
                    </div>
                    <div>
                      <div className="sec-contact__detail-label">Call Us</div>
                      <a
                        href={`tel:${props.contactInfo.phone}`}
                        className="sec-contact__detail-value"
                      >
                        {props.contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}

                {props.contactInfo.address && (
                  <div className="sec-contact__detail-item">
                    <div className="sec-contact__detail-icon">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="sec-contact__detail-label">Visit Headquarters</div>
                      <span className="sec-contact__detail-value">{props.contactInfo.address}</span>
                    </div>
                  </div>
                )}

                {props.contactInfo.businessHours && (
                  <div className="sec-contact__detail-item">
                    <div className="sec-contact__detail-icon">
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="sec-contact__detail-label">Working Hours</div>
                      <span className="sec-contact__detail-value">
                        {props.contactInfo.businessHours}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Contact Form */}
          <div className="sec-contact__form-card">
            {isSubmitted ? (
              <div className="sec-contact__success-state">
                <CheckCircle2 size={48} className="sec-contact__success-icon" />
                <h3 className="sec-heading-3">Message Received</h3>
                <p className="sec-body-md">{props.successMessage}</p>
                <button
                  type="button"
                  className="sec-btn sec-btn--outline sec-btn--md"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="sec-contact__form" onSubmit={handleSubmit}>
                <div className="sec-contact__form-group">
                  <label htmlFor="contact-name" className="sec-contact__label">
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="sec-contact__input"
                  />
                </div>

                <div className="sec-contact__form-group">
                  <label htmlFor="contact-email" className="sec-contact__label">
                    Work Email *
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="sec-contact__input"
                  />
                </div>

                {props.showPhoneField && (
                  <div className="sec-contact__form-group">
                    <label htmlFor="contact-phone" className="sec-contact__label">
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="sec-contact__input"
                    />
                  </div>
                )}

                <div className="sec-contact__form-group">
                  <label htmlFor="contact-message" className="sec-contact__label">
                    Project Details & Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    placeholder="Tell us about your project requirements..."
                    value={formData.message}
                    onChange={handleChange}
                    className="sec-contact__textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sec-btn sec-btn--primary sec-btn--lg sec-contact__submit-btn"
                >
                  <span>{isSubmitting ? 'Sending...' : props.submitButtonLabel}</span>
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
