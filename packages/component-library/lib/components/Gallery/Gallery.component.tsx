
import React from 'react';
import { Section } from '../common/Section';
import { defaultGalleryProps } from './defaultProps';
import type { GalleryComponentProps } from './types';

export const Gallery: React.FC<GalleryComponentProps> = ({ id, props: userProps, style: userStyle, className = '' }) => {
  const props = { ...defaultGalleryProps, ...userProps };
  const compKebab = "gallery";
  return (
    <Section style={userStyle} id={id} className={`sec-${compKebab}-wrapper ${className}`}>
      <div className="sec-generic-card">
        <h2 className="sec-generic-card__title">{props.title}</h2>
        <p className="sec-generic-card__text">{props.text}</p>
      </div>
    </Section>
  );
};
export default Gallery;
