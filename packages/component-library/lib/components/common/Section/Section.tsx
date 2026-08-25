import React from 'react';
import { resolveSectionStyles, getContentWidthClass } from '../../../helpers/styleResolver';
import type { ResponsiveSectionStyle } from '../../../types';

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style' | 'id' | 'className'> {
  id?: string | undefined;
  style?: ResponsiveSectionStyle | undefined;
  className?: string | undefined;
  as?: 'section' | 'header' | 'footer' | 'div' | undefined;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ id, style, className = '', as: Component = 'section', children, ...rest }) => {
  const inlineStyles = resolveSectionStyles(style);
  const contentWidthClass = getContentWidthClass(style);

  return (
    <Component id={id} className={`sec-wrapper ${className}`} style={inlineStyles} role={Component === 'header' ? 'banner' : Component === 'footer' ? 'contentinfo' : 'region'} {...rest}>
      <div className={`sec-container ${contentWidthClass}`}>
        {children}
      </div>
    </Component>
  );
};
