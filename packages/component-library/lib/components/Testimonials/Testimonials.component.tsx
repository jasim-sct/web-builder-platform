import React from 'react';
import { Quote, Star } from 'lucide-react';

import { defaultTestimonialsActions, defaultTestimonialsProps } from './defaultProps';
import { getTestimonialsStyles } from './helpers/styleHelper';

import type { TestimonialItem, TestimonialsComponentProps } from './types';

export const Testimonials: React.FC<TestimonialsComponentProps> = ({
  id,
  props: userProps,
  style,
  actions: userActions,
  className = '',
  onAction,
}) => {
  const props = { ...defaultTestimonialsProps, ...userProps };
  const actions = { ...defaultTestimonialsActions, ...userActions };
  const { className: testimonialsStyleClass, style: inlineStyle } = getTestimonialsStyles(style);

  const handleCardClick = (item: TestimonialItem, e: React.MouseEvent) => {
    if (actions.testimonialClickAction) {
      if (onAction) {
        e.preventDefault();
        onAction('testimonialClickAction', {
          ...actions.testimonialClickAction,
          payload: { testimonialId: item.id, author: item.authorName },
        });
      }
    }
  };

  return (
    <section
      id={id}
      className={`sec-testimonials-wrapper ${className}`}
      style={inlineStyle}
      role="region"
      aria-label="Testimonials Section"
    >
      <div className={`sec-container ${testimonialsStyleClass}`}>
        {/* Section Header */}
        <div className="sec-testimonials__header">
          {props.badge && <div className="sec-badge">{props.badge}</div>}
          <h2 className="sec-heading-2 sec-testimonials__title">{props.title}</h2>
          {props.description && (
            <p className="sec-body-lg sec-testimonials__description">{props.description}</p>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className="sec-testimonials__grid">
          {props.items?.map((item) => {
            const rating = item.rating || 5;

            return (
              <div
                key={item.id}
                className="sec-testimonials__card"
                onClick={(e) => handleCardClick(item, e)}
              >
                {/* Rating Stars */}
                <div className="sec-testimonials__stars">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={18}
                      className={
                        idx < rating
                          ? 'sec-testimonials__star--filled'
                          : 'sec-testimonials__star--empty'
                      }
                    />
                  ))}
                </div>

                <Quote size={32} className="sec-testimonials__quote-icon" />

                <blockquote className="sec-body-md sec-testimonials__quote">
                  "{item.quote}"
                </blockquote>

                <div className="sec-testimonials__author">
                  {item.authorAvatar ? (
                    <img
                      src={item.authorAvatar}
                      alt={item.authorName}
                      className="sec-testimonials__avatar"
                    />
                  ) : (
                    <div className="sec-testimonials__avatar-placeholder">
                      {item.authorName.charAt(0)}
                    </div>
                  )}

                  <div className="sec-testimonials__author-info">
                    <div className="sec-testimonials__author-name">{item.authorName}</div>
                    <div className="sec-testimonials__author-role">{item.authorRole}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
