import type React from 'react';
import type { ResponsiveSectionStyle } from '../types';

export function resolveSectionStyles(style?: ResponsiveSectionStyle): React.CSSProperties {
  if (!style) return {};

  const desktop = style.desktop || {};
  const inlineStyles: Record<string, string | number | undefined> = {};

  if (desktop.backgroundColor) {
    inlineStyles.backgroundColor = desktop.backgroundColor;
  }
  if (desktop.backgroundImage) {
    inlineStyles.backgroundImage = `url(${desktop.backgroundImage})`;
    inlineStyles.backgroundSize = desktop.backgroundSize || 'cover';
    inlineStyles.backgroundPosition = desktop.backgroundPosition || 'center';
    inlineStyles.backgroundRepeat = desktop.backgroundRepeat || 'no-repeat';
  }
  if (desktop.paddingTop !== undefined) {
    inlineStyles.paddingTop = desktop.paddingTop;
  }
  if (desktop.paddingBottom !== undefined) {
    inlineStyles.paddingBottom = desktop.paddingBottom;
  }
  if (desktop.paddingLeft !== undefined) {
    inlineStyles.paddingLeft = desktop.paddingLeft;
  }
  if (desktop.paddingRight !== undefined) {
    inlineStyles.paddingRight = desktop.paddingRight;
  }
  if (desktop.marginTop !== undefined) {
    inlineStyles.marginTop = desktop.marginTop;
  }
  if (desktop.marginBottom !== undefined) {
    inlineStyles.marginBottom = desktop.marginBottom;
  }
  if (desktop.minHeight !== undefined) {
    inlineStyles.minHeight = desktop.minHeight;
  }
  if (desktop.maxHeight !== undefined) {
    inlineStyles.maxHeight = desktop.maxHeight;
  }
  if (desktop.width !== undefined) {
    inlineStyles.width = desktop.width;
  }
  if (desktop.maxWidth !== undefined) {
    inlineStyles.maxWidth = desktop.maxWidth;
  }
  if (desktop.headingColor) {
    // Custom CSS variable for children to inherit
    inlineStyles['--sec-heading-color'] = desktop.headingColor;
  }
  if (desktop.bodyColor) {
    inlineStyles['--sec-body-color'] = desktop.bodyColor;
    inlineStyles.color = desktop.bodyColor;
  }
  if (desktop.accentColor) {
    inlineStyles['--sec-accent-color'] = desktop.accentColor;
  }
  if (desktop.textAlign) {
    inlineStyles.textAlign = desktop.textAlign;
  }
  if (desktop.borderWidth) {
    inlineStyles.borderWidth = desktop.borderWidth;
    inlineStyles.borderStyle = desktop.borderStyle || 'solid';
    inlineStyles.borderColor = desktop.borderColor || '#e2e8f0';
  }
  if (desktop.borderRadius) {
    inlineStyles.borderRadius = desktop.borderRadius;
  }
  if (desktop.boxShadow && desktop.boxShadow !== 'none') {
    inlineStyles.boxShadow =
      desktop.boxShadow === 'sm'
        ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        : desktop.boxShadow === 'md'
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          : desktop.boxShadow === 'lg'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            : desktop.boxShadow === 'xl'
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              : desktop.boxShadow;
  }
  if (desktop.opacity !== undefined) {
    inlineStyles.opacity = desktop.opacity;
  }

  return inlineStyles as React.CSSProperties;
}

export function getContentWidthClass(style?: ResponsiveSectionStyle): string {
  const contentWidth = style?.desktop?.contentWidth || 'contained';
  return `sec-container--${contentWidth}`;
}
