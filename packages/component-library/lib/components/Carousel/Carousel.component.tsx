import React from 'react';
import { Section } from '../common/Section';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { defaultCarouselActions, defaultCarouselProps } from './defaultProps';

import type { CarouselComponentProps } from './types';

export const Carousel: React.FC<CarouselComponentProps> = ({
  id,
  props: userProps,
  style: userStyle,
  actions: userActions,
  className = '',
  onAction,
}) => {
  const props = { ...defaultCarouselProps, ...userProps };
  const actions = { ...defaultCarouselActions, ...userActions };
  

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = props.items || [];
  const slideCount = slides.length;

  useEffect(() => {
    if (!props.autoplay || isPaused || slideCount <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideCount);
    }, props.interval || 5000);

    return () => clearInterval(timer);
  }, [props.autoplay, isPaused, slideCount, props.interval]);

  const handlePrev = () => {
    const nextIndex = (currentIndex - 1 + slideCount) % slideCount;
    setCurrentIndex(nextIndex);
    if (actions.slideChangeAction && onAction) {
      onAction('slideChangeAction', {
        ...actions.slideChangeAction,
        payload: { slideIndex: nextIndex },
      });
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % slideCount;
    setCurrentIndex(nextIndex);
    if (actions.slideChangeAction && onAction) {
      onAction('slideChangeAction', {
        ...actions.slideChangeAction,
        payload: { slideIndex: nextIndex },
      });
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    if (actions.slideChangeAction && onAction) {
      onAction('slideChangeAction', {
        ...actions.slideChangeAction,
        payload: { slideIndex: index },
      });
    }
  };

  const handleSlideCta = (e: React.MouseEvent, ctaUrl?: string) => {
    if (actions.slideCtaAction) {
      if (onAction) {
        e.preventDefault();
        onAction('slideCtaAction', {
          ...actions.slideCtaAction,
          target: ctaUrl || undefined,
          payload: { slideIndex: currentIndex },
        });
      } else if (ctaUrl) {
        window.location.href = ctaUrl;
      }
    }
  };

  if (slideCount === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <Section
      id={id}
      className={`sec-carousel-wrapper ${className}`}
      style={userStyle}
      role="region"
      aria-roledescription="carousel"
      aria-label={props.title || 'Carousel Showcase'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="sec-carousel">
        {/* Section Header */}
        {(props.badge || props.title || props.description) && (
          <div className="sec-carousel__header">
            {props.badge && <div className="sec-badge">{props.badge}</div>}
            {props.title && <h2 className="sec-heading-2 sec-carousel__title">{props.title}</h2>}
            {props.description && (
              <p className="sec-body-lg sec-carousel__description">{props.description}</p>
            )}
          </div>
        )}

        {/* Carousel Frame */}
        <div className="sec-carousel__stage">
          {currentSlide && (
            <div className="sec-carousel__slide" key={currentSlide.id}>
              <div className="sec-carousel__slide-image-wrapper">
                <img
                  src={currentSlide.image}
                  alt={currentSlide.imageAlt || currentSlide.title}
                  className="sec-carousel__slide-image"
                />
                <div className="sec-carousel__slide-overlay" />
              </div>

              <div className="sec-carousel__slide-content">
                <h3 className="sec-heading-2 sec-carousel__slide-title">{currentSlide.title}</h3>
                {currentSlide.subtitle && (
                  <p className="sec-body-lg sec-carousel__slide-subtitle">
                    {currentSlide.subtitle}
                  </p>
                )}
                {currentSlide.ctaText && (
                  <button
                    type="button"
                    className="sec-btn sec-btn--primary sec-btn--md sec-carousel__slide-btn"
                    onClick={(e) => handleSlideCta(e, currentSlide.ctaUrl)}
                  >
                    <span>{currentSlide.ctaText}</span>
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          {slideCount > 1 && (
            <>
              <button
                type="button"
                className="sec-carousel__arrow sec-carousel__arrow--prev"
                onClick={handlePrev}
                aria-label="Previous Slide"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                className="sec-carousel__arrow sec-carousel__arrow--next"
                onClick={handleNext}
                aria-label="Next Slide"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Dot Indicators */}
        {slideCount > 1 && (
          <div className="sec-carousel__dots" role="tablist">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`sec-carousel__dot ${index === currentIndex ? 'sec-carousel__dot--active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={index === currentIndex}
                role="tab"
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
};

export default Carousel;
