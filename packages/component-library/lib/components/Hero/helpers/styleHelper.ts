import { getContentWidthClass, resolveSectionStyles } from '../../../helpers/styleResolver';

import type React from 'react';
import type { ResponsiveSectionStyle } from '../../../types';
import type { HeroVariant } from '../types';

export function getHeroStyles(
  style?: ResponsiveSectionStyle,
  variant: HeroVariant = 'split',
): {
  className: string;
  style: React.CSSProperties;
} {
  return {
    className: `sec-hero sec-hero--${variant} ${getContentWidthClass(style)}`,
    style: resolveSectionStyles(style),
  };
}
